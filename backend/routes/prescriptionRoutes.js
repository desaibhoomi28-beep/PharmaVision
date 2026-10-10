const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");

const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

router.use(auth);

// =====================================================
// DOCTOR CREATE PRESCRIPTION
// =====================================================

router.post(
  "/",
  requireRole("Doctor"),
  async (req, res) => {
    try {
      const {
        patientName,
        patientAge,
        items,
        notes,
      } = req.body;

      if (!patientName) {
        return res.status(400).json({
          success: false,
          message: "Patient name is required",
        });
      }

      if (
        patientAge === undefined ||
        patientAge === null ||
        patientAge === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Patient age is required",
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one medicine is required",
        });
      }

      const processedItems = [];

      for (const item of items) {
        if (
          !mongoose.Types.ObjectId.isValid(
            item.medicineId
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid medicine selected",
          });
        }

        const medicine = await Medicine.findById(
          item.medicineId
        );

        if (!medicine) {
          return res.status(404).json({
            success: false,
            message: "Medicine not found",
          });
        }

        const dose = Number(item.dose);
        const timesPerDay = Number(item.timesPerDay);
        const days = Number(item.days);

        if (
          !Number.isFinite(dose) ||
          !Number.isFinite(timesPerDay) ||
          !Number.isFinite(days) ||
          dose <= 0 ||
          timesPerDay <= 0 ||
          days <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Dose, times per day and days must be greater than zero",
          });
        }

        const totalQuantity =
          dose * timesPerDay * days;

        processedItems.push({
          medicine: medicine._id,
          medicineName: medicine.name,
          dose,
          timesPerDay,
          days,
          totalQuantity,
        });
      }

      const prescription =
        await Prescription.create({
          doctor: req.user.id,
          doctorName: req.user.name,
          patientName: patientName.trim(),
          patientAge: Number(patientAge),
          items: processedItems,
          notes: notes || "",
        });

      const populated =
        await Prescription.findById(
          prescription._id
        ).populate("doctor", "name email");

      res.status(201).json({
        success: true,
        message:
          "Prescription sent to pharmacist successfully",
        prescription: populated,
      });
    } catch (error) {
      console.error(
        "Create prescription error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// DOCTOR — OWN PRESCRIPTIONS
// =====================================================

router.get(
  "/my",
  requireRole("Doctor"),
  async (req, res) => {
    try {
      const prescriptions =
        await Prescription.find({
          doctor: req.user.id,
        })
          .sort({ createdAt: -1 })
          .populate("items.medicine", "name category");

      res.json({
        success: true,
        prescriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// PHARMACIST — ALL PRESCRIPTIONS
// =====================================================

router.get(
  "/",
  requireRole("Pharmacist"),
  async (req, res) => {
    try {
      const prescriptions =
        await Prescription.find()
          .sort({
            createdAt: -1,
          })
          .populate(
            "doctor",
            "name email registrationNo"
          )
          .populate(
            "items.medicine",
            "name category stock batch expiry"
          );

      res.json({
        success: true,
        prescriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// PHARMACIST — CHECK STOCK
// =====================================================

router.get(
  "/:id/check-stock",
  requireRole("Pharmacist"),
  async (req, res) => {
    try {
      const prescription =
        await Prescription.findById(
          req.params.id
        ).populate(
          "items.medicine",
          "name stock batch expiry"
        );

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      const stockCheck =
        prescription.items.map((item) => {
          const medicine = item.medicine;

          const available =
            medicine?.stock || 0;

          return {
            medicineId: medicine?._id,
            medicineName:
              item.medicineName,
            required: item.totalQuantity,
            available,
            enough:
              available >= item.totalQuantity,
          };
        });

      const allAvailable =
        stockCheck.every(
          (item) => item.enough
        );

      res.json({
        success: true,
        allAvailable,
        items: stockCheck,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// PHARMACIST — APPROVE
// =====================================================

router.put(
  "/:id/approve",
  requireRole("Pharmacist"),
  async (req, res) => {
    try {
      const prescription =
        await Prescription.findById(
          req.params.id
        );

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      if (
        prescription.status !== "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending prescriptions can be approved",
        });
      }

      prescription.status = "Approved";
      prescription.pharmacistName =
        req.user.name;

      prescription.pharmacistNote =
        req.body.note || "";

      await prescription.save();

      res.json({
        success: true,
        message:
          "Prescription approved successfully",
        prescription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// PHARMACIST — DISPENSE
// =====================================================

router.put(
  "/:id/dispense",
  requireRole("Pharmacist"),
  async (req, res) => {
    try {
      const prescription =
        await Prescription.findById(
          req.params.id
        );

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      if (
        prescription.status !== "Pending" &&
        prescription.status !== "Approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This prescription cannot be dispensed",
        });
      }

      // Check ALL stock first
      for (const item of prescription.items) {
        const medicine =
          await Medicine.findById(
            item.medicine
          );

        if (!medicine) {
          return res.status(404).json({
            success: false,
            message:
              `Medicine not found: ${item.medicineName}`,
          });
        }

        if (
          medicine.stock <
          item.totalQuantity
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Insufficient stock for ${medicine.name}`,
          });
        }
      }

      // Deduct stock
      for (const item of prescription.items) {
        await Medicine.findByIdAndUpdate(
          item.medicine,
          {
            $inc: {
              stock: -item.totalQuantity,
            },
          }
        );
      }

      prescription.status = "Dispensed";
      prescription.pharmacistName =
        req.user.name;
      prescription.dispensedAt = new Date();

      await prescription.save();

      res.json({
        success: true,
        message:
          "Prescription dispensed successfully",
        prescription,
      });
    } catch (error) {
      console.error(
        "Dispense prescription error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// PHARMACIST — REJECT
// =====================================================

router.put(
  "/:id/reject",
  requireRole("Pharmacist"),
  async (req, res) => {
    try {
      const prescription =
        await Prescription.findById(
          req.params.id
        );

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      if (
        prescription.status !== "Pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending prescriptions can be rejected",
        });
      }

      prescription.status = "Rejected";
      prescription.pharmacistName =
        req.user.name;
      prescription.pharmacistNote =
        req.body.note || "";

      await prescription.save();

      res.json({
        success: true,
        message:
          "Prescription rejected",
        prescription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;