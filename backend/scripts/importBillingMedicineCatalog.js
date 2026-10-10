const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Medicine = require("../models/Medicine");

dotenv.config();

const DATASET_PATH = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);

function parseCSVLine(line) {
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

      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function parseCSV(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function importMedicineCatalog() {
  try {
    console.log("\n======================================");
    console.log("PHARMAVISION MEDICINE CATALOG IMPORT");
    console.log("======================================\n");

    if (!fs.existsSync(DATASET_PATH)) {
      throw new Error(
        `Dataset not found:\n${DATASET_PATH}`
      );
    }

    console.log("Dataset:");
    console.log(DATASET_PATH);
    console.log("");

    const file = fs.readFileSync(
      DATASET_PATH,
      "utf8"
    );

    const rows = parseCSV(file);

    console.log(
      `Dataset rows found: ${rows.length}`
    );

    const medicineMap = new Map();

    for (const row of rows) {
      const name =
        String(row.medicine_name || "").trim();

      if (!name) {
        continue;
      }

      const date = new Date(row.date);

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const existing =
        medicineMap.get(name);

      if (
        !existing ||
        date > existing.date
      ) {
        medicineMap.set(name, {
          name,
          category:
            row.category || "Medicine",

          disease:
            row.disease || "",

          possibleSideEffects:
            row.possible_side_effects || "",

          stock:
            Number(row.stock_after || 0),

          unitPrice:
            Number(row.unit_price || 0),

          date,
        });
      }
    }

    const medicines =
      Array.from(medicineMap.values());

    console.log(
      `Unique medicines found: ${medicines.length}`
    );

    console.log("");

    await mongoose.connect(
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/pharmavision"
    );

    console.log(
      "MongoDB connected successfully.\n"
    );

    let inserted = 0;
    let updated = 0;

    for (const item of medicines) {
      const existing =
        await Medicine.findOne({
          name: item.name,
        });

      if (!existing) {
        await Medicine.create({
          name: item.name,

          category:
            item.category,

          disease:
            item.disease,

          possibleSideEffects:
            item.possibleSideEffects,

          stock:
            item.stock,

          unitPrice:
            item.unitPrice,

          lastDatasetDate:
            item.date,

          source:
            "combined_medicine_demand_dataset",
        });

        inserted++;

        console.log(
          `INSERTED: ${item.name}`
        );

        continue;
      }

      /*
       * IMPORTANT:
       * Do not overwrite live stock if it
       * already exists.
       *
       * This protects Billing / Forecast
       * after the initial dataset import.
       */

      const update = {
        category:
          item.category,

        disease:
          item.disease,

        possibleSideEffects:
          item.possibleSideEffects,

        lastDatasetDate:
          item.date,

        source:
          "combined_medicine_demand_dataset",
      };

      /*
       * Fill stock/price only when they
       * are missing or zero.
       */
      if (
        existing.stock === undefined ||
        existing.stock === null ||
        Number(existing.stock) === 0
      ) {
        update.stock = item.stock;
      }

      if (
        existing.unitPrice === undefined ||
        existing.unitPrice === null ||
        Number(existing.unitPrice) === 0
      ) {
        update.unitPrice =
          item.unitPrice;
      }

      await Medicine.updateOne(
        {
          _id: existing._id,
        },
        {
          $set: update,
        }
      );

      updated++;

      console.log(
        `UPDATED: ${item.name}`
      );
    }

    console.log("\n======================================");
    console.log("IMPORT COMPLETED");
    console.log("======================================");
    console.log(
      `Total medicines: ${medicines.length}`
    );
    console.log(
      `Inserted: ${inserted}`
    );
    console.log(
      `Updated: ${updated}`
    );
    console.log("======================================\n");

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      "\nIMPORT ERROR:",
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
}

importMedicineCatalog();