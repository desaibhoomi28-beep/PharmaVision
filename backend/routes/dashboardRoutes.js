const express = require("express");

const router =
  express.Router();


const {
  getDashboardData,
} = require(
  "../controllers/dashboardController"
);


// GET DASHBOARD DATA

router.get(
  "/",
  getDashboardData
);


module.exports =
  router;