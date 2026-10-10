const express = require("express");

const router =
  express.Router();

const {
  getMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
} = require(
  "../controllers/medicineController"
);


// ==================================================
// MEDICINE STATISTICS
// ==================================================

router.get(
  "/stats",
  getMedicineStats
);


// ==================================================
// ALL MEDICINES
// ==================================================

router.get(
  "/",
  getMedicines
);


// ==================================================
// SINGLE MEDICINE
// ==================================================

router.get(
  "/:id",
  getMedicineById
);


// ==================================================
// ADD
// ==================================================

router.post(
  "/",
  addMedicine
);


// ==================================================
// UPDATE
// ==================================================

router.put(
  "/:id",
  updateMedicine
);


// ==================================================
// DELETE
// ==================================================

router.delete(
  "/:id",
  deleteMedicine
);


module.exports = router;