const express = require("express");

const router = express.Router();

const Medicine = require("../models/Medicine");


// ======================================================
// TEST BACKEND
// ======================================================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Test route working",
  });
});


// ======================================================
// MEDICINE COUNT
// ======================================================
router.get("/medicine-count", async (req, res) => {
  try {
    const count = await Medicine.countDocuments();

    const medicines = await Medicine.find({})
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      count,
      medicines,
    });
  } catch (err) {
    console.error("Medicine count error:", err);

    res.status(500).json({
      success: false,
      message: "Could not count medicines",
      error: err.message,
    });
  }
});


module.exports = router;