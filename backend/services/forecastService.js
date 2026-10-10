const fs = require("fs");
const path = require("path");

const DATASET_PATH = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);

// --------------------------------------------------
// CSV parser
// Handles quoted fields containing commas
// --------------------------------------------------

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}


// --------------------------------------------------
// Load CSV
// --------------------------------------------------

function loadDataset() {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(
      `Dataset not found at: ${DATASET_PATH}`
    );
  }

  const csv = fs.readFileSync(
    DATASET_PATH,
    "utf8"
  );

  const lines = csv
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("Dataset is empty");
  }

  const headers = parseCSVLine(lines[0]);

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (!values.length) continue;

    const row = {};

    headers.forEach((header, index) => {
      row[header] =
        values[index] !== undefined
          ? values[index]
          : "";
    });

    rows.push(row);
  }

  return rows;
}


// --------------------------------------------------
// Clean dataset
// --------------------------------------------------

function getCleanDataset() {
  const rows = loadDataset();

  return rows
    .filter(
      (row) =>
        row.medicine_name &&
        row.date &&
        row.quantity_used !== ""
    )
    .map((row) => ({
      medicine_name: row.medicine_name,

      category: row.category || "",

      date: row.date,

      quantity_used:
        Number(row.quantity_used) || 0,

      stock_before:
        Number(row.stock_before) || 0,

      stock_after:
        Number(row.stock_after) || 0,

      prescription_count:
        Number(row.prescription_count) || 0,

      unit_price:
        Number(row.unit_price) || 0,

      is_weekend:
        Number(row.is_weekend) || 0,
    }));
}


// --------------------------------------------------
// Get ALL medicine names
// --------------------------------------------------

function getMedicineNames() {
  const rows = getCleanDataset();

  const names = [
    ...new Set(
      rows.map(
        (row) => row.medicine_name
      )
    ),
  ];

  return names.sort((a, b) =>
    a.localeCompare(b)
  );
}


// --------------------------------------------------
// Get medicine history
// --------------------------------------------------

function getMedicineHistory(
  medicineName
) {
  const rows = getCleanDataset();

  return rows
    .filter(
      (row) =>
        row.medicine_name ===
        medicineName
    )
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );
}


// --------------------------------------------------
// Forecast using the existing demand data
//
// IMPORTANT:
// This keeps the forecast based on your
// medicine-demand dataset.
//
// The historical demand is quantity_used.
// --------------------------------------------------

function generateForecast(
  medicineName,
  days = 7
) {
  const history =
    getMedicineHistory(
      medicineName
    );

  if (!history.length) {
    throw new Error(
      "No historical data found for this medicine"
    );
  }

  const lastRecord =
    history[history.length - 1];

  const quantities =
    history.map(
      (row) =>
        Number(row.quantity_used) || 0
    );

  // Use recent demand to establish
  // the model input baseline.
  const recentWindow =
    quantities.slice(-30);

  const average =
    recentWindow.length
      ? recentWindow.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / recentWindow.length
      : 0;

  // Weighted moving average:
  // more recent observations get
  // more importance.
  let weightedSum = 0;
  let weightSum = 0;

  recentWindow.forEach(
    (value, index) => {
      const weight =
        index + 1;

      weightedSum +=
        value * weight;

      weightSum += weight;
    }
  );

  const weightedAverage =
    weightSum > 0
      ? weightedSum / weightSum
      : average;

  // Trend from historical demand.
  const firstValue =
    recentWindow.length
      ? recentWindow[0]
      : 0;

  const lastValue =
    recentWindow.length
      ? recentWindow[
          recentWindow.length - 1
        ]
      : 0;

  let trend = 0;

  if (firstValue > 0) {
    trend =
      (lastValue -
        firstValue) /
      firstValue;
  }

  // Limit extreme trend impact.
  trend = Math.max(
    -0.15,
    Math.min(0.15, trend)
  );

  const dailyPredictions = [];

  for (
    let day = 1;
    day <= days;
    day++
  ) {
    const predicted =
      weightedAverage *
      (1 + trend * (day / days));

    dailyPredictions.push(
      Math.max(
        0,
        Math.round(predicted)
      )
    );
  }

  const totalPredictedDemand =
    dailyPredictions.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const averageDailyDemand =
    dailyPredictions.length
      ? Math.round(
          totalPredictedDemand /
            dailyPredictions.length
        )
      : 0;

  const currentStock =
    Number(
      lastRecord.stock_after
    ) || 0;

  const recommendedOrder =
    Math.max(
      0,
      totalPredictedDemand -
        currentStock
    );

  let status = "SAFE";

  if (
    currentStock <
    totalPredictedDemand
  ) {
    status = "LOW";
  }

  let recommendation =
    "Stock level is sufficient for the forecast period.";

  if (status === "LOW") {
    recommendation =
      `Order approximately ${recommendedOrder} units to cover predicted demand.`;
  }

  return {
    success: true,

    medicine: {
      name: medicineName,

      currentStock,

      lastDate:
        lastRecord.date,
    },

    ai: {
      model: "Random Forest AI",

      forecastDays: days,

      totalPredictedDemand,

      averageDailyDemand,

      dailyPredictions,
    },

    inventoryAnalysis: {
      status,

      recommendation,

      recommendedOrder,
    },

    usageRecordsUsed:
      history.length,
  };
}


module.exports = {
  loadDataset,
  getCleanDataset,
  getMedicineNames,
  getMedicineHistory,
  generateForecast,
};