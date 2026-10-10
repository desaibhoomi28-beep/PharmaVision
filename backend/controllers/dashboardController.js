const Medicine = require("../models/Medicine");
const MedicineUsage = require("../models/MedicineUsage");


// ==========================================
// GET DASHBOARD DATA
// ==========================================

const getDashboardData = async (req, res) => {
  try {
    const LOW_STOCK_LIMIT = 20;

    const today = new Date();

    // ------------------------------------------
    // EXPIRY DATE RANGE
    // Next 30 days
    // ------------------------------------------

    const next30Days = new Date();

    next30Days.setDate(
      today.getDate() + 30
    );


    // ==========================================
    // 1. GET ALL MEDICINES
    // ==========================================

    const medicines =
      await Medicine.find()
        .sort({
          createdAt: -1,
        });


    // ==========================================
    // 2. TOTAL MEDICINES
    // ==========================================

    const totalMedicines =
      medicines.length;


    // ==========================================
    // 3. TOTAL STOCK
    // ==========================================

    const totalStock =
      medicines.reduce(
        (total, medicine) => {
          return (
            total +
            (Number(medicine.stock) || 0)
          );
        },
        0
      );


    // ==========================================
    // 4. LOW STOCK
    // ==========================================

    const lowStockMedicines =
      medicines.filter(
        (medicine) => {
          const stock =
            Number(medicine.stock) || 0;

          return (
            stock > 0 &&
            stock <= LOW_STOCK_LIMIT
          );
        }
      );


    // ==========================================
    // 5. OUT OF STOCK
    // ==========================================

    const outOfStockMedicines =
      medicines.filter(
        (medicine) => {
          return (
            Number(medicine.stock) || 0
          ) <= 0;
        }
      );


    // ==========================================
    // 6. EXPIRED MEDICINES
    // ==========================================

    const expiredMedicines =
      medicines.filter(
        (medicine) => {
          if (!medicine.expiry) {
            return false;
          }

          const expiryDate =
            new Date(
              medicine.expiry
            );

          return (
            expiryDate <
            today
          );
        }
      );


    // ==========================================
    // 7. EXPIRING SOON
    // ==========================================

    const expiringSoonMedicines =
      medicines.filter(
        (medicine) => {
          if (!medicine.expiry) {
            return false;
          }

          const expiryDate =
            new Date(
              medicine.expiry
            );

          return (
            expiryDate >= today &&
            expiryDate <= next30Days
          );
        }
      );


    // ==========================================
    // 8. RECENT MEDICINES
    // ==========================================

    const recentMedicines =
      medicines
        .slice(0, 6)
        .map(
          (medicine) => {

            const stock =
              Number(
                medicine.stock
              ) || 0;


            let status =
              "In Stock";


            if (stock <= 0) {
              status =
                "Out of Stock";
            }

            else if (
              stock <= LOW_STOCK_LIMIT
            ) {
              status =
                "Low Stock";
            }


            return {
              _id:
                medicine._id,

              name:
                medicine.name,

              category:
                medicine.category,

              stock:
                stock,

              expiry:
                medicine.expiry,

              status:
                status,
            };
          }
        );


    // ==========================================
    // 9. LAST 7 DAYS USAGE
    // ==========================================

    const sevenDaysAgo =
      new Date();

    sevenDaysAgo.setDate(
      today.getDate() - 6
    );

    sevenDaysAgo.setHours(
      0,
      0,
      0,
      0
    );


    const usageRecords =
      await MedicineUsage.find({
        date: {
          $gte:
            sevenDaysAgo,
        },
      });


    // ==========================================
    // 10. CREATE 7 DAY USAGE DATA
    // ==========================================

    const usageMap = {};


    // Create default days

    for (
      let i = 0;
      i < 7;
      i++
    ) {

      const day =
        new Date();

      day.setDate(
        today.getDate() - 6 + i
      );

      const key =
        day
          .toISOString()
          .split("T")[0];


      usageMap[key] = 0;

    }


    // Add actual usage

    usageRecords.forEach(
      (record) => {

        if (!record.date) {
          return;
        }


        const key =
          new Date(
            record.date
          )
            .toISOString()
            .split("T")[0];


        if (
          usageMap[key] !== undefined
        ) {

          usageMap[key] +=
            Number(
              record.quantityUsed
            ) || 0;

        }

      }
    );


    const weeklyUsage =
      Object.entries(
        usageMap
      ).map(
        ([date, quantity]) => ({

          date,

          quantity,

          day:
            new Date(
              date
            ).toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            ),

        })
      );


    // ==========================================
    // 11. TOTAL WEEKLY USAGE
    // ==========================================

    const totalWeeklyUsage =
      weeklyUsage.reduce(
        (
          total,
          item
        ) => {

          return (
            total +
            item.quantity
          );

        },
        0
      );


    // ==========================================
    // 12. INVENTORY HEALTH SCORE
    // ==========================================

    let healthScore = 100;


    healthScore -=
      lowStockMedicines.length * 5;


    healthScore -=
      outOfStockMedicines.length * 15;


    healthScore -=
      expiredMedicines.length * 10;


    healthScore -=
      expiringSoonMedicines.length * 3;


    if (healthScore < 0) {
      healthScore = 0;
    }


    let healthStatus =
      "Excellent";


    if (
      healthScore < 50
    ) {

      healthStatus =
        "Critical";

    }

    else if (
      healthScore < 70
    ) {

      healthStatus =
        "Needs Attention";

    }

    else if (
      healthScore < 85
    ) {

      healthStatus =
        "Good";

    }


    // ==========================================
    // 13. CREATE PRIORITY ALERTS
    // ==========================================

    const alerts = [];


    outOfStockMedicines.forEach(
      (medicine) => {

        alerts.push({

          type:
            "OUT_OF_STOCK",

          priority:
            "HIGH",

          medicineId:
            medicine._id,

          medicineName:
            medicine.name,

          message:
            `${medicine.name} is out of stock`,

        });

      }
    );


    lowStockMedicines.forEach(
      (medicine) => {

        alerts.push({

          type:
            "LOW_STOCK",

          priority:
            "MEDIUM",

          medicineId:
            medicine._id,

          medicineName:
            medicine.name,

          message:
            `${medicine.name} has low stock (${medicine.stock} units remaining)`,

        });

      }
    );


    expiredMedicines.forEach(
      (medicine) => {

        alerts.push({

          type:
            "EXPIRED",

          priority:
            "HIGH",

          medicineId:
            medicine._id,

          medicineName:
            medicine.name,

          message:
            `${medicine.name} has expired`,

        });

      }
    );


    expiringSoonMedicines.forEach(
      (medicine) => {

        alerts.push({

          type:
            "EXPIRING_SOON",

          priority:
            "MEDIUM",

          medicineId:
            medicine._id,

          medicineName:
            medicine.name,

          message:
            `${medicine.name} is expiring within 30 days`,

        });

      }
    );


    // ==========================================
    // 14. SEND DASHBOARD DATA
    // ==========================================

    return res.status(200).json({

      success:
        true,


      statistics: {

        totalMedicines,

        totalStock,

        lowStock:
          lowStockMedicines.length,

        outOfStock:
          outOfStockMedicines.length,

        expired:
          expiredMedicines.length,

        expiringSoon:
          expiringSoonMedicines.length,

        weeklyUsage:
          totalWeeklyUsage,

      },


      inventoryHealth: {

        score:
          healthScore,

        status:
          healthStatus,

      },


      weeklyUsage,


      recentMedicines,


      alerts:
        alerts.slice(
          0,
          8
        ),


      alertCount:
        alerts.length,


      lastUpdated:
        new Date(),

    });


  } catch (error) {

    console.error(
      "DASHBOARD ERROR:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to load dashboard data",

      error:
        error.message,

    });

  }
};


module.exports = {
  getDashboardData,
};