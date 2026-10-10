const Medicine = require("../models/Medicine");
const Supplier = require("../models/Supplier");


// ======================================
// GET COMPLETE REPORT DATA
// ======================================

const getReports = async (req, res) => {
  try {
    // Get all data
    const medicines = await Medicine.find();
    const suppliers = await Supplier.find();

    // ======================================
    // MEDICINE STATISTICS
    // ======================================

    const totalMedicines = medicines.length;

    const totalStock = medicines.reduce(
      (total, medicine) =>
        total + (Number(medicine.stock) || 0),
      0
    );

    const lowStockMedicines = medicines.filter(
      (medicine) =>
        medicine.status === "Low Stock"
    ).length;

    const outOfStockMedicines = medicines.filter(
      (medicine) =>
        medicine.status === "Out of Stock"
    ).length;


    // ======================================
    // SUPPLIER STATISTICS
    // ======================================

    const totalSuppliers = suppliers.length;

    const activeSuppliers = suppliers.filter(
      (supplier) =>
        supplier.status === "Active"
    ).length;


    // ======================================
    // INVENTORY HEALTH
    // ======================================

    let inventoryHealth = 100;

    if (totalMedicines > 0) {
      const problemMedicines =
        lowStockMedicines +
        outOfStockMedicines;

      inventoryHealth = Math.round(
        ((totalMedicines -
          problemMedicines) /
          totalMedicines) *
          100
      );
    }


    // ======================================
    // CATEGORY DISTRIBUTION
    // ======================================

    const categoryMap = {};

    medicines.forEach((medicine) => {
      const category =
        medicine.category ||
        "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category]++;
    });

    const categoryDistribution =
      Object.keys(categoryMap).map(
        (category) => ({
          category,
          count: categoryMap[category],
        })
      );


    // ======================================
    // STOCK STATUS DISTRIBUTION
    // ======================================

    const stockStatus = {
      inStock: medicines.filter(
        (medicine) =>
          medicine.status === "In Stock"
      ).length,

      lowStock:
        lowStockMedicines,

      outOfStock:
        outOfStockMedicines,
    };


    // ======================================
    // RECENT MEDICINES
    // ======================================

    const recentMedicines =
      medicines
        .slice(-5)
        .reverse()
        .map((medicine) => ({
          id: medicine._id,

          name: medicine.name,

          category:
            medicine.category,

          batch:
            medicine.batch,

          stock:
            medicine.stock,

          status:
            medicine.status,

          expiry:
            medicine.expiry,
        }));


    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      success: true,

      data: {

        summary: {
          totalMedicines,
          totalStock,
          lowStockMedicines,
          outOfStockMedicines,
          totalSuppliers,
          activeSuppliers,
          inventoryHealth,
        },

        categoryDistribution,

        stockStatus,

        recentMedicines,
      },
    });

  } catch (error) {

    console.error(
      "Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate reports",
    });

  }
};


module.exports = {
  getReports,
};