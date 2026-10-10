const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB =
  require("../database/db");

const Medicine =
  require("../models/Medicine");

const MedicineUsage =
  require("../models/MedicineUsage");


// ==================================================
// DATASET PATH
// ==================================================

const csvPath = path.join(
  __dirname,
  "../../dataset/combined_medicine_demand_dataset.csv"
);


// ==================================================
// NORMALIZE NAME
// ==================================================

function normalizeMedicineName(
  name
) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


// ==================================================
// PARSE BOOLEAN
// ==================================================

function parseBoolean(value) {

  return (
    String(value)
      .trim() === "1"
  );

}


// ==================================================
// MAIN IMPORT
// ==================================================

async function importDataset() {

  try {

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      " PharmaVision Medicine Dataset Import"
    );

    console.log(
      "=========================================="
    );


    if (
      !fs.existsSync(csvPath)
    ) {

      throw new Error(
        `Dataset not found:\n${csvPath}`
      );

    }


    console.log(
      `Dataset:\n${csvPath}`
    );


    await connectDB();


    console.log(
      "MongoDB connected."
    );


    // ------------------------------------------
    // READ CSV
    // ------------------------------------------

    const rows = [];


    await new Promise(
      (resolve, reject) => {

        fs.createReadStream(
          csvPath
        )
          .pipe(csv())
          .on(
            "data",
            (row) => {

              rows.push(row);

            }
          )
          .on(
            "end",
            resolve
          )
          .on(
            "error",
            reject
          );

      }
    );


    console.log(
      `CSV rows found: ${rows.length}`
    );


    if (
      rows.length === 0
    ) {

      throw new Error(
        "Dataset contains no records."
      );

    }


    // ------------------------------------------
    // GROUP DATA BY MEDICINE
    // ------------------------------------------

    const medicineGroups =
      new Map();


    for (const row of rows) {

      const name =
        String(
          row.medicine_name || ""
        ).trim();


      if (!name) {
        continue;
      }


      const key =
        normalizeMedicineName(
          name
        );


      if (
        !medicineGroups.has(key)
      ) {

        medicineGroups.set(
          key,
          []
        );

      }


      medicineGroups
        .get(key)
        .push(row);

    }


    console.log(
      `Unique medicines found: ${medicineGroups.size}`
    );


    // ------------------------------------------
    // IMPORT MEDICINE MASTER
    // ------------------------------------------

    const medicineMap =
      new Map();


    let medicineCount = 0;


    for (
      const [
        normalizedName,
        medicineRows,
      ]
      of medicineGroups
    ) {

      // Sort by date.

      medicineRows.sort(
        (a, b) => {

          return (
            new Date(a.date) -
            new Date(b.date)
          );

        }
      );


      const firstRow =
        medicineRows[0];

      const latestRow =
        medicineRows[
          medicineRows.length - 1
        ];


      const medicineName =
        String(
          firstRow.medicine_name
        ).trim();


      const latestStock =
        Number(
          latestRow.stock_after
        ) || 0;


      const latestPrice =
        Number(
          latestRow.unit_price
        ) || 0;


      const latestDate =
        new Date(
          latestRow.date
        );


      // Find existing medicine.

      let medicine =
        await Medicine.findOne({
          name: medicineName,
        });


      if (!medicine) {

        medicine =
          await Medicine.create({

            name:
              medicineName,

            category:
              firstRow.category ||
              "",

            disease:
              firstRow.disease ||
              "",

            possibleSideEffects:
              firstRow.possible_side_effects ||
              "",

            unitPrice:
              latestPrice,

            stock:
              latestStock,

            reorderLevel:
              Math.max(
                20,
                Math.round(
                  latestStock *
                  0.25
                )
              ),

            lastDatasetDate:
              latestDate,

            source:
              "dataset",

          });

      } else {

        /*
          Existing medicine is updated with
          dataset information.

          Current stock is initialized from
          the latest dataset stock.

          Later Billing/Procurement/etc.
          will manage live stock.
        */

        medicine.category =
          firstRow.category ||
          medicine.category ||
          "";

        medicine.disease =
          firstRow.disease ||
          medicine.disease ||
          "";

        medicine.possibleSideEffects =
          firstRow.possible_side_effects ||
          medicine.possibleSideEffects ||
          "";

        medicine.unitPrice =
          latestPrice ||
          medicine.unitPrice ||
          0;

        medicine.stock =
          latestStock;

        medicine.lastDatasetDate =
          latestDate;

        medicine.source =
          "dataset";


        await medicine.save();

      }


      medicineMap.set(
        normalizedName,
        medicine
      );


      medicineCount++;

    }


    console.log(
      `Medicine master records imported: ${medicineCount}`
    );


    // ------------------------------------------
    // IMPORT HISTORICAL USAGE
    // ------------------------------------------

    let usageImported = 0;

    let usageSkipped = 0;


    for (const row of rows) {

      const medicineName =
        String(
          row.medicine_name || ""
        ).trim();


      const date =
        new Date(
          row.date
        );


      const quantityUsed =
        Number(
          row.quantity_used
        );


      if (
        !medicineName ||
        Number.isNaN(
          date.getTime()
        ) ||
        !Number.isFinite(
          quantityUsed
        )
      ) {

        usageSkipped++;

        continue;

      }


      const medicine =
        medicineMap.get(
          normalizeMedicineName(
            medicineName
          )
        );


      if (!medicine) {

        usageSkipped++;

        continue;

      }


      const stockBefore =
        Number(
          row.stock_before
        ) || 0;


      const stockAfter =
        Number(
          row.stock_after
        ) || 0;


      const prescriptionCount =
        Number(
          row.prescription_count
        ) || 0;


      const unitPrice =
        Number(
          row.unit_price
        ) || 0;


      await MedicineUsage.updateOne(

        {
          medicineId:
            medicine._id,

          date,
        },

        {
          $set: {

            medicineId:
              medicine._id,

            medicineName:
              medicine.name,

            category:
              row.category ||
              "",

            disease:
              row.disease ||
              "",

            possibleSideEffects:
              row.possible_side_effects ||
              "",

            date,

            quantityUsed,

            stockBefore,

            stockAfter,

            prescriptionCount,

            unitPrice,

            isWeekend:
              parseBoolean(
                row.is_weekend
              ),

          },
        },

        {
          upsert: true,
        }

      );


      usageImported++;

    }


    // ------------------------------------------
    // FINAL COUNTS
    // ------------------------------------------

    const totalMedicines =
      await Medicine.countDocuments();


    const totalUsageRecords =
      await MedicineUsage.countDocuments();


    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      " Import Completed Successfully"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `CSV rows              : ${rows.length}`
    );

    console.log(
      `Unique medicines      : ${medicineCount}`
    );

    console.log(
      `Usage imported        : ${usageImported}`
    );

    console.log(
      `Usage skipped         : ${usageSkipped}`
    );

    console.log(
      `Mongo medicines       : ${totalMedicines}`
    );

    console.log(
      `Mongo usage records   : ${totalUsageRecords}`
    );

    console.log(
      "=========================================="
    );


    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed."
    );


    process.exit(0);

  } catch (error) {

    console.error("");
    console.error(
      "DATASET IMPORT FAILED"
    );

    console.error(
      error
    );


    try {
      await mongoose.connection.close();
    } catch {}


    process.exit(1);

  }

}


importDataset();