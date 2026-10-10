const express = require("express");

const router =
  express.Router();

const Medicine =
  require("../models/Medicine");

const Sale =
  require("../models/Sale");


/*
====================================================
GET ALL MEDICINES FOR BILLING
====================================================
*/

router.get(
  "/medicines",
  async (req, res) => {
    try {
      const medicines =
        await Medicine.find({})
          .sort({
            name: 1,
          })
          .lean();

      res.json({
        success: true,
        count: medicines.length,
        medicines,
      });

    } catch (error) {
      console.error(
        "Billing medicines error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load billing medicines",
      });
    }
  }
);


/*
====================================================
CREATE SALE
====================================================
*/

router.post(
  "/sale",
  async (req, res) => {
    try {
      const {
        items,
        customerName = "",
        customerPhone = "",
        paymentMethod = "Cash",
      } = req.body;

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one medicine is required",
        });
      }


      /*
      ----------------------------------------------
      CHECK ALL STOCK FIRST
      ----------------------------------------------
      */

      const preparedItems = [];

      let subtotal = 0;

      for (const item of items) {
        const medicine =
          await Medicine.findById(
            item.medicineId
          );

        if (!medicine) {
          return res.status(404).json({
            success: false,
            message:
              "Medicine not found",
          });
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Quantity must be a positive whole number",
          });
        }

        const stock =
          Number(medicine.stock || 0);

        if (stock < quantity) {
          return res.status(400).json({
            success: false,
            message:
              `${medicine.name} has only ${stock} units available.`,
          });
        }

        const unitPrice =
          Number(
            medicine.unitPrice ??
            medicine.sellingPrice ??
            medicine.price ??
            0
          );

        const totalPrice =
          unitPrice * quantity;

        subtotal += totalPrice;

        preparedItems.push({
          medicine,
          quantity,
          unitPrice,
          totalPrice,
        });
      }


      /*
      ----------------------------------------------
      GST
      ----------------------------------------------
      */

      const tax =
        Number(
          (subtotal * 0.05).toFixed(2)
        );


      const grandTotal =
        Number(
          (
            subtotal + tax
          ).toFixed(2)
        );


      /*
      ----------------------------------------------
      DEDUCT STOCK
      ----------------------------------------------
      */

      for (
        const item of preparedItems
      ) {
        await Medicine.findOneAndUpdate(
          {
            _id:
              item.medicine._id,

            stock: {
              $gte:
                item.quantity,
            },
          },
          {
            $inc: {
              stock:
                -item.quantity,
            },
          }
        );
      }


      /*
      ----------------------------------------------
      CREATE INVOICE
      ----------------------------------------------
      */

      const invoiceNumber =
        `INV-${Date.now()}`;


      const sale =
        await Sale.create({
          invoiceNumber,

          customerName:
            customerName ||
            "Walk-in Customer",

          customerPhone,

          items:
            preparedItems.map(
              (item) => ({
                medicine:
                  item.medicine._id,

                medicineName:
                  item.medicine.name,

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPrice,

                totalPrice:
                  item.totalPrice,
              })
            ),

          subtotal,

          tax,

          discount: 0,

          grandTotal,

          paymentMethod,

          soldBy:
            "Pharmacist",

          status:
            "Completed",
        });


      res.status(201).json({
        success: true,

        message:
          "Sale completed successfully",

        sale,
      });

    } catch (error) {
      console.error(
        "Billing sale error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to complete sale",
      });
    }
  }
);


/*
====================================================
GET SALES HISTORY
====================================================
*/

router.get(
  "/sales",
  async (req, res) => {
    try {
      const sales =
        await Sale.find({})
          .populate(
            "items.medicine"
          )
          .sort({
            createdAt: -1,
          })
          .limit(100);

      res.json({
        success: true,
        count: sales.length,
        sales,
      });

    } catch (error) {
      console.error(
        "Sales history error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load sales",
      });
    }
  }
);


module.exports = router;