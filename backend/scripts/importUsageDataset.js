const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../database/db");
const Medicine = require("../models/Medicine");
const MedicineUsage = require("../models/MedicineUsage");
const csvPath = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);

function normalizeMedicineName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

async function importUsageData() {
  try {
    console.log("======================================");
    console.log(" PharmaVision Usage Data Import");
    console.log("======================================");

    if (!fs.existsSync(csvPath)) {
      throw new Error(
        `CSV file not found at:\n${csvPath}`
      );
    }

    await connectDB();

    console.log("MongoDB connected.");

    const medicines = await Medicine.find();

    console.log(
      `Medicines currently in MongoDB: ${medicines.length}`
    );

    if (medicines.length === 0) {
      throw new Error(
        "No medicines found in MongoDB. Add/import the medicine master data first."
      );
    }

    const medicineMap = new Map();

    medicines.forEach((medicine) => {
      medicineMap.set(
        normalizeMedicineName(medicine.name),
        medicine
      );
    });

    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(
      `CSV usage records found: ${rows.length}`
    );

    let inserted = 0;
    let skipped = 0;
    let unmatched = 0;

    const unmatchedMedicines = new Set();

    for (const row of rows) {
      const csvMedicineName =
        String(row.medicine_name || "").trim();

      const dateValue =
        String(row.date || "").trim();

      const quantityUsed =
        Number(row.quantity_used);

      if (
        !csvMedicineName ||
        !dateValue ||
        Number.isNaN(quantityUsed)
      ) {
        skipped++;
        continue;
      }

      const normalizedName =
        normalizeMedicineName(csvMedicineName);

      let medicine =
        medicineMap.get(normalizedName);

      /*
       * Some CSV names contain strength while
       * the current MongoDB medicine may have
       * a slightly different name.
       *
       * Example:
       * Crocin 500 -> Crocin
       */

      if (!medicine) {
        const possibleMatches =
          medicines.filter((item) => {
            const dbName =
              normalizeMedicineName(item.name);

            return (
              normalizedName.startsWith(dbName) ||
              dbName.startsWith(normalizedName)
            );
          });

        if (possibleMatches.length === 1) {
          medicine = possibleMatches[0];
        }
      }

      if (!medicine) {
        unmatched++;

        unmatchedMedicines.add(
          csvMedicineName
        );

        continue;
      }

      const parsedDate =
        new Date(`${dateValue}T00:00:00.000Z`);

      if (Number.isNaN(parsedDate.getTime())) {
        skipped++;
        continue;
      }

      try {
        await MedicineUsage.updateOne(
          {
            medicineId: medicine._id,
            date: parsedDate,
          },
          {
            $set: {
              medicineId: medicine._id,
              medicineName: medicine.name,
              date: parsedDate,
              quantityUsed,
            },
          },
          {
            upsert: true,
          }
        );

        inserted++;
      } catch (error) {
        console.error(
          "Failed to import row:",
          row
        );

        console.error(error.message);

        skipped++;
      }
    }

    console.log("");
    console.log("======================================");
    console.log(" Import Completed");
    console.log("======================================");

    console.log(
      `Processed CSV rows : ${rows.length}`
    );

    console.log(
      `Imported/updated   : ${inserted}`
    );

    console.log(
      `Skipped             : ${skipped}`
    );

    console.log(
      `Unmatched medicines : ${unmatched}`
    );

    if (unmatchedMedicines.size > 0) {
      console.log("");
      console.log(
        "Medicines not found in MongoDB:"
      );

      [...unmatchedMedicines]
        .sort()
        .forEach((name) => {
          console.log(` - ${name}`);
        });
    }

    const totalUsageRecords =
      await MedicineUsage.countDocuments();

    console.log("");
    console.log(
      `Total MedicineUsage records in MongoDB: ${totalUsageRecords}`
    );

    await mongoose.connection.close();

    console.log("");
    console.log("MongoDB connection closed.");
    console.log("Done.");
  } catch (error) {
    console.error("");
    console.error("IMPORT FAILED");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

importUsageData();