const Medicine = require("../models/Medicine");
const MedicineUsage = require("../models/MedicineUsage");

// ============================================================
// GET MEDICINES FROM AI DATASET
// ============================================================

const getForecastMedicines = async (req, res) => {
  try {
    const aiResponse = await fetch(
      "http://127.0.0.1:8000/medicines"
    );

    if (!aiResponse.ok) {
      let errorData = {};

      try {
        errorData = await aiResponse.json();
      } catch (error) {
        // Ignore JSON parsing error
      }

      return res.status(503).json({
        success: false,
        message:
          errorData.detail ||
          errorData.message ||
          "AI service returned an error",
      });
    }

    const aiData = await aiResponse.json();

    const medicines = Array.isArray(aiData.medicines)
      ? aiData.medicines
      : [];

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error(
      "GET FORECAST MEDICINES ERROR:",
      error.message
    );

    return res.status(503).json({
      success: false,
      message:
        "Unable to connect to AI service. Make sure FastAPI is running on port 8000.",
      error: error.message,
    });
  }
};


// ============================================================
// GET AI FORECAST
// ============================================================

const getForecast = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const forecastDays =
      Number(req.query.days) || 7;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    if (
      !Number.isInteger(forecastDays) ||
      forecastDays < 1 ||
      forecastDays > 30
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Forecast days must be between 1 and 30",
      });
    }

    // --------------------------------------------------------
    // FIND MEDICINE
    // --------------------------------------------------------

    const medicine =
      await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    // --------------------------------------------------------
    // GET USAGE HISTORY
    // --------------------------------------------------------

    const usageHistory =
      await MedicineUsage.find({
        medicine: medicineId,
      }).sort({
        date: 1,
      });

    // --------------------------------------------------------
    // FORMAT USAGE HISTORY
    // --------------------------------------------------------

    const formattedHistory =
      usageHistory.map((record) => ({
        date: new Date(record.date)
          .toISOString()
          .split("T")[0],

        quantityUsed:
          Number(record.quantityUsed) || 0,
      }));

    // --------------------------------------------------------
    // CALL FASTAPI
    // --------------------------------------------------------

    let aiResponse;

    try {
      aiResponse = await fetch(
        "http://127.0.0.1:8000/forecast",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            medicineName:
              medicine.name,

            forecastDays:
              forecastDays,

            currentStock:
              Number(medicine.stock) || 0,

            usageHistory:
              formattedHistory,
          }),
        }
      );
    } catch (error) {
      console.error(
        "AI CONNECTION ERROR:",
        error.message
      );

      return res.status(503).json({
        success: false,

        message:
          "Unable to connect to AI service. Start FastAPI on port 8000.",

        error:
          error.message,
      });
    }

    // --------------------------------------------------------
    // READ AI RESPONSE
    // --------------------------------------------------------

    let aiData;

    try {
      aiData =
        await aiResponse.json();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "AI service returned invalid JSON",
      });
    }

    // --------------------------------------------------------
    // AI ERROR
    // --------------------------------------------------------

    if (!aiResponse.ok) {
      return res.status(
        aiResponse.status
      ).json({
        success: false,

        message:
          aiData.detail ||
          aiData.message ||
          "AI forecasting failed",

        error:
          aiData.error || null,
      });
    }

    // --------------------------------------------------------
    // AI VALUES
    // --------------------------------------------------------

    const predictedDemand =
      Number(
        aiData.totalPredictedDemand
      ) || 0;

    const averageDailyDemand =
      Number(
        aiData.averageDailyDemand
      ) || 0;

    const currentStock =
      Number(
        medicine.stock
      ) || 0;

    const stockDifference =
      currentStock -
      predictedDemand;

    // --------------------------------------------------------
    // INVENTORY STATUS
    // --------------------------------------------------------

    let status = "GOOD";

    let recommendation =
      "Current stock is sufficient for the predicted demand.";

    if (currentStock <= 0) {
      status = "OUT_OF_STOCK";

      recommendation =
        "Medicine is out of stock. Reorder immediately.";
    } else if (
      currentStock <
      predictedDemand
    ) {
      status = "LOW";

      recommendation =
        "Current stock may not meet predicted demand. Reorder medicine.";
    }

    // --------------------------------------------------------
    // RECOMMENDED ORDER
    // --------------------------------------------------------

    let recommendedOrder = 0;

    if (
      currentStock <
      predictedDemand
    ) {
      recommendedOrder =
        Math.ceil(
          (
            predictedDemand -
            currentStock
          ) * 1.20
        );
    }

    // --------------------------------------------------------
    // ESTIMATED DAYS OF STOCK
    // --------------------------------------------------------

    let estimatedDaysOfStock = null;

    if (
      averageDailyDemand > 0
    ) {
      estimatedDaysOfStock =
        Math.floor(
          currentStock /
          averageDailyDemand
        );
    }

    // --------------------------------------------------------
    // FINAL RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      medicine: {
        id:
          medicine._id,

        name:
          medicine.name,

        category:
          medicine.category,

        currentStock:
          currentStock,
      },

      ai: {
        model:
          aiData.model || "Random Forest",

        dataSource:
          aiData.dataSource || "Dataset",

        forecastDays:
          aiData.forecastDays ||
          forecastDays,

        dailyPredictions:
          aiData.dailyPredictions ||
          [],

        totalPredictedDemand:
          predictedDemand,

        averageDailyDemand:
          averageDailyDemand,

        usageRecordsUsed:
          aiData.usageRecordsUsed ||
          0,
      },

      inventoryAnalysis: {
        status:

          status,

        stockDifference:
          Number(
            stockDifference.toFixed(2)
          ),

        recommendedOrder:
          recommendedOrder,

        estimatedDaysOfStock:
          estimatedDaysOfStock,

        recommendation:
          recommendation,
      },

      message:
        "AI demand forecast generated successfully",
    });
  } catch (error) {
    console.error(
      "FORECAST CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to generate medicine forecast",

      error:
        error.message,
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getForecast,
  getForecastMedicines,
};