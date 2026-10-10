const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const router = express.Router();


// ==================================================
// DATASET PATH
// ==================================================

const datasetPath = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);


// ==================================================
// NORMALIZE MEDICINE NAME
// ==================================================

function normalizeMedicineName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


// ==================================================
// READ DATASET
// ==================================================

async function readDataset() {

  if (!fs.existsSync(datasetPath)) {

    throw new Error(
      `Dataset not found at: ${datasetPath}`
    );

  }

  const rows = [];

  await new Promise(
    (resolve, reject) => {

      fs.createReadStream(datasetPath)
        .pipe(csv())
        .on("data", (row) => {

          rows.push(row);

        })
        .on("end", resolve)
        .on("error", reject);

    }
  );

  return rows;
}


// ==================================================
// GET MEDICINES FROM DATASET
// ==================================================

router.get(
  "/medicines",
  async (req, res) => {

    try {

      const rows =
        await readDataset();

      const medicineNames =
        new Set();

      rows.forEach((row) => {

        const name =
          String(
            row.medicine_name || ""
          ).trim();

        if (name) {

          medicineNames.add(name);

        }

      });

      const medicines = [
        ...medicineNames,
      ].sort((a, b) =>
        a.localeCompare(b)
      );

      res.json({

        success: true,

        medicines,

        count:
          medicines.length,

      });

    } catch (error) {

      console.error(
        "Dataset medicine error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to load medicines from ML dataset.",

        error:
          error.message,

      });

    }

  }
);


// ==================================================
// GENERATE FORECAST FROM HISTORICAL DATA
// ==================================================

router.get(
  "/:medicineName",
  async (req, res) => {

    try {

      const medicineName =
        decodeURIComponent(
          req.params.medicineName
        );

      const forecastDays =
        Math.min(
          Math.max(
            Number(req.query.days) || 7,
            1
          ),
          30
        );


      console.log(
        "Forecast request:",
        medicineName,
        "Days:",
        forecastDays
      );


      // ----------------------------------------------
      // READ DATASET
      // ----------------------------------------------

      const rows =
        await readDataset();


      // ----------------------------------------------
      // FILTER SELECTED MEDICINE
      // ----------------------------------------------

      const selectedRows =
        rows.filter((row) => {

          return (
            normalizeMedicineName(
              row.medicine_name
            ) ===
            normalizeMedicineName(
              medicineName
            )
          );

        });


      if (
        selectedRows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            `No historical data found for ${medicineName}`,

        });

      }


      // ----------------------------------------------
      // PREPARE HISTORICAL DATA
      // ----------------------------------------------

      const historicalData =
        selectedRows
          .map((row) => {

            const date =
              new Date(
                row.date
              );

            const quantity =
              Number(
                row.quantity_used
              );

            return {

              date,

              quantity:
                Number.isFinite(
                  quantity
                )
                  ? quantity
                  : 0,

            };

          })
          .filter(
            (item) =>
              !Number.isNaN(
                item.date.getTime()
              )
          )
          .sort(
            (a, b) =>
              a.date - b.date
          );


      if (
        historicalData.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "No valid historical usage data found.",

        });

      }


      // ----------------------------------------------
      // TOTAL HISTORICAL USAGE
      // ----------------------------------------------

      const totalHistoricalUsage =
        historicalData.reduce(
          (total, item) =>
            total + item.quantity,
          0
        );


      // ----------------------------------------------
      // AVERAGE DAILY DEMAND
      // ----------------------------------------------

      const averageDailyDemand =
        totalHistoricalUsage /
        historicalData.length;


      // ----------------------------------------------
      // RECENT DEMAND
      //
      // Use the most recent 30 records
      // so the forecast reacts to recent
      // consumption patterns.
      // ----------------------------------------------

      const recentCount =
        Math.min(
          historicalData.length,
          30
        );


      const recentData =
        historicalData.slice(
          -recentCount
        );


      const recentTotal =
        recentData.reduce(
          (total, item) =>
            total + item.quantity,
          0
        );


      const recentAverage =
        recentTotal /
        recentData.length;


      // ----------------------------------------------
      // SIMPLE TREND
      //
      // Compare recent demand with
      // overall historical demand.
      // ----------------------------------------------

      let trendFactor = 1;


      if (
        averageDailyDemand > 0
      ) {

        trendFactor =
          recentAverage /
          averageDailyDemand;

      }


      // Prevent extreme values.

      trendFactor =
        Math.min(
          Math.max(
            trendFactor,
            0.70
          ),
          1.30
        );


      // ----------------------------------------------
      // DAILY PREDICTIONS
      // ----------------------------------------------

      const dailyPredictions = [];


      for (
        let day = 0;
        day < forecastDays;
        day++
      ) {

        /*
          Small gradual trend adjustment.

          This means the forecast is based
          on the actual historical usage
          in your dataset.
        */

        const progress =
          forecastDays > 1
            ? day /
              (forecastDays - 1)
            : 0;


        const gradualTrend =
          1 +
          (
            (trendFactor - 1) *
            progress
          );


        const prediction =
          Math.max(
            0,
            Math.round(
              recentAverage *
              gradualTrend
            )
          );


        dailyPredictions.push(
          prediction
        );

      }


      // ----------------------------------------------
      // TOTAL PREDICTED DEMAND
      // ----------------------------------------------

      const totalPredictedDemand =
        dailyPredictions.reduce(
          (total, value) =>
            total + value,
          0
        );


      // ----------------------------------------------
      // CURRENT STOCK
      //
      // Dataset contains usage, not stock.
      // Therefore we use 0 here until
      // inventory stock is connected.
      // ----------------------------------------------

      let currentStock = 0;


      // ----------------------------------------------
      // INVENTORY RECOMMENDATION
      // ----------------------------------------------

      const recommendedOrder =
        Math.max(
          0,
          totalPredictedDemand -
          currentStock
        );


      let inventoryStatus =
        "SAFE";


      let recommendation =
        "Current inventory appears sufficient for predicted demand.";


      if (
        currentStock === 0
      ) {

        inventoryStatus =
          "LOW";

        recommendation =
          "Stock data is not available. Review procurement based on predicted demand.";

      } else if (
        currentStock <
        totalPredictedDemand
      ) {

        inventoryStatus =
          "LOW";

        recommendation =
          "Increase stock to meet predicted demand.";

      }


      // ----------------------------------------------
      // RESPONSE
      // ----------------------------------------------

      res.json({

        success: true,

        medicine: {

          name:
            medicineName,

          currentStock,

        },

        ai: {

          model:
            "Historical Demand Forecast",

          forecastDays,

          totalPredictedDemand,

          averageDailyDemand:
            Number(
              recentAverage.toFixed(2)
            ),

          dailyPredictions,

        },

        inventoryAnalysis: {

          status:
            inventoryStatus,

          recommendation,

          recommendedOrder,

        },

        usageRecordsUsed:
          historicalData.length,

        historicalUsage:
          totalHistoricalUsage,

        recentUsageRecords:
          recentData.length,

      });

    } catch (error) {

      console.error(
        "Forecast generation error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to generate forecast.",

        error:
          error.message,

      });

    }

  }
);


// ==================================================
// EXISTING POST FORECAST ENDPOINT
// ==================================================

router.post(
  "/generate",
  async (req, res) => {

    try {

      const {
        medicineId,
        period = 7,
      } = req.body;


      if (!medicineId) {

        return res.status(400).json({

          success: false,

          message:
            "Medicine is required",

        });

      }


      res.json({

        success: true,

        medicine:
          medicineId,

        period:
          Number(period),

        message:
          "Forecast request received successfully",

      });

    } catch (error) {

      console.error(
        "Forecast generation error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to generate forecast",

      });

    }

  }
);


module.exports = router;