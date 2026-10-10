const fs = require("fs");
const path = require("path");


// ============================================================
// DATASET PATH
// ============================================================

const DATASET_PATH = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);


// ============================================================
// CSV LINE PARSER
// Handles commas inside quoted values
// ============================================================

const parseCSVLine = (line) => {
  const result = [];

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
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result;
};


// ============================================================
// LOAD DATASET
// ============================================================

const loadMedicineDataset = () => {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(
      `Medicine dataset not found at ${DATASET_PATH}`
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
    return [];
  }

  const headers = parseCSVLine(
    lines[0]
  );

  const rows = [];

  for (
    let i = 1;
    i < lines.length;
    i++
  ) {
    const values =
      parseCSVLine(lines[i]);

    if (
      values.length !==
      headers.length
    ) {
      continue;
    }

    const row = {};

    headers.forEach(
      (header, index) => {
        row[header] =
          values[index];
      }
    );

    rows.push(row);
  }

  return rows;
};


// ============================================================
// CLEAN MEDICINE INFORMATION
// ============================================================

const createMedicineInfo = (
  rows,
  medicineName
) => {

  const medicineRows =
    rows.filter(
      (row) =>
        String(
          row.medicine_name
        )
          .trim()
          .toLowerCase() ===
        String(
          medicineName
        )
          .trim()
          .toLowerCase()
    );


  if (
    medicineRows.length === 0
  ) {
    return null;
  }


  const first =
    medicineRows[0];


  // ----------------------------------------------------------
  // Unique diseases
  // ----------------------------------------------------------

  const diseases = [
    ...new Set(
      medicineRows
        .map(
          (row) =>
            row.disease
        )
        .filter(Boolean)
        .map(
          (value) =>
            value.trim()
        )
    ),
  ];


  // ----------------------------------------------------------
  // Unique side effects
  // ----------------------------------------------------------

  const sideEffects = [
    ...new Set(
      medicineRows
        .map(
          (row) =>
            row.possible_side_effects
        )
        .filter(Boolean)
        .map(
          (value) =>
            value.trim()
        )
    ),
  ];


  // ----------------------------------------------------------
  // Category
  // ----------------------------------------------------------

  const categories = [
    ...new Set(
      medicineRows
        .map(
          (row) =>
            row.category
        )
        .filter(Boolean)
        .map(
          (value) =>
            value.trim()
        )
    ),
  ];


  // ----------------------------------------------------------
  // Unit price
  // ----------------------------------------------------------

  const prices =
    medicineRows
      .map(
        (row) =>
          Number(
            row.unit_price
          )
      )
      .filter(
        (price) =>
          Number.isFinite(price)
      );


  const averagePrice =
    prices.length > 0
      ? prices.reduce(
          (sum, price) =>
            sum + price,
          0
        ) / prices.length
      : 0;


  // ----------------------------------------------------------
  // Usage statistics
  // ----------------------------------------------------------

  const usage =
    medicineRows
      .map(
        (row) =>
          Number(
            row.quantity_used
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );


  const totalUsage =
    usage.reduce(
      (sum, value) =>
        sum + value,
      0
    );


  const averageUsage =
    usage.length > 0
      ? totalUsage /
        usage.length
      : 0;


  // ----------------------------------------------------------
  // Prescription statistics
  // ----------------------------------------------------------

  const prescriptions =
    medicineRows
      .map(
        (row) =>
          Number(
            row.prescription_count
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );


  const averagePrescriptionCount =
    prescriptions.length > 0
      ? prescriptions.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        prescriptions.length
      : 0;


  // ----------------------------------------------------------
  // Latest stock
  // ----------------------------------------------------------

  const latestRow =
    medicineRows[
      medicineRows.length - 1
    ];


  return {
    medicineName:
      first.medicine_name,

    category:
      categories.length > 0
        ? categories[0]
        : "Not available",

    diseases:
      diseases,

    sideEffects:
      sideEffects,

    averageUnitPrice:
      Number(
        averagePrice.toFixed(2)
      ),

    totalUsage:
      Number(
        totalUsage.toFixed(2)
      ),

    averageDailyUsage:
      Number(
        averageUsage.toFixed(2)
      ),

    averagePrescriptionCount:
      Number(
        averagePrescriptionCount.toFixed(
          2
        )
      ),

    latestStockBefore:
      Number(
        latestRow.stock_before
      ) || 0,

    latestStockAfter:
      Number(
        latestRow.stock_after
      ) || 0,

    dataRecords:
      medicineRows.length,

    latestDate:
      latestRow.date || null,
  };
};


// ============================================================
// GET ALL MEDICINES
// ============================================================

const getMedicalInstructorMedicines =
  async (req, res) => {

    try {

      const rows =
        loadMedicineDataset();


      const medicineMap =
        new Map();


      rows.forEach(
        (row) => {

          const name =
            String(
              row.medicine_name || ""
            ).trim();


          if (
            name &&
            !medicineMap.has(
              name.toLowerCase()
            )
          ) {
            medicineMap.set(
              name.toLowerCase(),
              name
            );
          }
        }
      );


      const medicines =
        Array.from(
          medicineMap.values()
        ).sort(
          (a, b) =>
            a.localeCompare(b)
        );


      return res.status(200).json({
        success: true,

        count:
          medicines.length,

        medicines,
      });

    } catch (error) {

      console.error(
        "MEDICAL INSTRUCTOR MEDICINES ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to load medicine information",

        error:
          error.message,
      });
    }
  };


// ============================================================
// SEARCH MEDICINES
// ============================================================

const searchMedicalInstructor =
  async (req, res) => {

    try {

      const query =
        String(
          req.query.q || ""
        )
          .trim()
          .toLowerCase();


      if (!query) {
        return res.status(400).json({
          success: false,

          message:
            "Search query is required",
        });
      }


      const rows =
        loadMedicineDataset();


      const medicineMap =
        new Map();


      rows.forEach(
        (row) => {

          const name =
            String(
              row.medicine_name || ""
            ).trim();


          if (
            name &&
            name
              .toLowerCase()
              .includes(query)
          ) {
            medicineMap.set(
              name.toLowerCase(),
              name
            );
          }
        }
      );


      const medicines =
        Array.from(
          medicineMap.values()
        ).sort(
          (a, b) =>
            a.localeCompare(b)
        );


      return res.status(200).json({
        success: true,

        count:
          medicines.length,

        medicines,
      });

    } catch (error) {

      console.error(
        "MEDICAL INSTRUCTOR SEARCH ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Medicine search failed",

        error:
          error.message,
      });
    }
  };


// ============================================================
// GET MEDICINE INFORMATION
// ============================================================

const getMedicalInstructorMedicine =
  async (req, res) => {

    try {

      const medicineName =
        decodeURIComponent(
          req.params.medicineName
        );


      if (!medicineName) {
        return res.status(400).json({
          success: false,

          message:
            "Medicine name is required",
        });
      }


      const rows =
        loadMedicineDataset();


      const medicine =
        createMedicineInfo(
          rows,
          medicineName
        );


      if (!medicine) {
        return res.status(404).json({
          success: false,

          message:
            "Medicine information not found in the dataset",
        });
      }


      return res.status(200).json({
        success: true,

        medicine,
      });

    } catch (error) {

      console.error(
        "MEDICAL INSTRUCTOR DETAILS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to load medicine information",

        error:
          error.message,
      });
    }
  };


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getMedicalInstructorMedicines,
  searchMedicalInstructor,
  getMedicalInstructorMedicine,
};