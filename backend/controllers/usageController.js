const MedicineUsage = require("../models/MedicineUsage");


// ADD MEDICINE USAGE

const addUsage = async (req, res) => {
  try {
    const {
      medicine,
      quantityUsed,
      date,
    } = req.body;

    if (!medicine || quantityUsed === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Medicine, quantity and date are required",
      });
    }

    const usage = await MedicineUsage.create({
      medicine,
      quantityUsed: Number(quantityUsed),
      date,
    });

    res.status(201).json({
      success: true,
      message: "Medicine usage recorded successfully",
      data: usage,
    });

  } catch (error) {
    console.error("USAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record medicine usage",
      error: error.message,
    });
  }
};


// GET USAGE OF ONE MEDICINE

const getMedicineUsage = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const usage = await MedicineUsage.find({
      medicine: medicineId,
    }).sort({
      date: 1,
    });

    res.status(200).json({
      success: true,
      count: usage.length,
      data: usage,
    });

  } catch (error) {
    console.error("GET USAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine usage",
    });
  }
};


module.exports = {
  addUsage,
  getMedicineUsage,
};