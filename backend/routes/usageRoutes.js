const express = require("express");

const router = express.Router();

const {
  addUsage,
  getMedicineUsage,
} = require("../controllers/usageController");


router.post("/", addUsage);

router.get("/:medicineId", getMedicineUsage);


module.exports = router;