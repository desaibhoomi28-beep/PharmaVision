const express = require("express");

const router = express.Router();

const {
  getMedicalInstructorMedicines,
  searchMedicalInstructor,
  getMedicalInstructorMedicine,
} = require(
  "../controllers/medicalInstructorController"
);


// ============================================================
// GET ALL MEDICINES
// ============================================================

router.get(
  "/medicines",
  getMedicalInstructorMedicines
);


// ============================================================
// SEARCH MEDICINES
// ============================================================

router.get(
  "/search",
  searchMedicalInstructor
);


// ============================================================
// GET MEDICINE DETAILS
// ============================================================

router.get(
  "/medicine/:medicineName",
  getMedicalInstructorMedicine
);


module.exports = router;