const Medicine = require("../models/Medicine");
const MedicineUsage = require("../models/MedicineUsage");


// ==================================================
// GET ALL MEDICINES
// ==================================================

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .sort({ name: 1 })
      .lean();

    res.json(medicines);

  } catch (error) {

    console.error(
      "Get medicines error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
    });
  }
};


// ==================================================
// GET SINGLE MEDICINE
// ==================================================

exports.getMedicineById = async (
  req,
  res
) => {
  try {

    const medicine =
      await Medicine.findById(
        req.params.id
      ).lean();

    if (!medicine) {

      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });

    }

    res.json(medicine);

  } catch (error) {

    console.error(
      "Get medicine error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine",
    });
  }
};


// ==================================================
// ADD MEDICINE
// ==================================================

exports.addMedicine = async (
  req,
  res
) => {
  try {

    const {
      name,
      category,
      salt,
      manufacturer,
      disease,
      possibleSideEffects,
      unitPrice,
      stock,
      reorderLevel,
      tabletsPerStrip,
      stripsPerBox,
    } = req.body;


    if (!name || !name.trim()) {

      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });

    }


    const existing =
      await Medicine.findOne({
        name: name.trim(),
      });


    if (existing) {

      return res.status(409).json({
        success: false,
        message:
          "Medicine with this name already exists",
      });

    }


    const medicine =
      await Medicine.create({

        name: name.trim(),

        category:
          category || "",

        salt:
          salt || "",

        manufacturer:
          manufacturer || "",

        disease:
          disease || "",

        possibleSideEffects:
          possibleSideEffects || "",

        unitPrice:
          Number(unitPrice) || 0,

        stock:
          Math.max(
            0,
            Number(stock) || 0
          ),

        reorderLevel:
          Math.max(
            0,
            Number(reorderLevel) || 20
          ),

        tabletsPerStrip:
          Math.max(
            1,
            Number(tabletsPerStrip) || 1
          ),

        stripsPerBox:
          Math.max(
            1,
            Number(stripsPerBox) || 1
          ),

        source: "manual",

      });


    res.status(201).json(
      medicine
    );

  } catch (error) {

    console.error(
      "Add medicine error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add medicine",
    });
  }
};


// ==================================================
// UPDATE MEDICINE
// ==================================================

exports.updateMedicine = async (
  req,
  res
) => {
  try {

    const {
      name,
      category,
      salt,
      manufacturer,
      disease,
      possibleSideEffects,
      unitPrice,
      stock,
      reorderLevel,
      tabletsPerStrip,
      stripsPerBox,
    } = req.body;


    const medicine =
      await Medicine.findById(
        req.params.id
      );


    if (!medicine) {

      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });

    }


    if (name !== undefined) {
      medicine.name =
        String(name).trim();
    }

    if (category !== undefined) {
      medicine.category =
        category;
    }

    if (salt !== undefined) {
      medicine.salt =
        salt;
    }

    if (manufacturer !== undefined) {
      medicine.manufacturer =
        manufacturer;
    }

    if (disease !== undefined) {
      medicine.disease =
        disease;
    }

    if (
      possibleSideEffects !==
      undefined
    ) {
      medicine.possibleSideEffects =
        possibleSideEffects;
    }

    if (unitPrice !== undefined) {
      medicine.unitPrice =
        Math.max(
          0,
          Number(unitPrice) || 0
        );
    }

    if (stock !== undefined) {
      medicine.stock =
        Math.max(
          0,
          Number(stock) || 0
        );
    }

    if (
      reorderLevel !== undefined
    ) {
      medicine.reorderLevel =
        Math.max(
          0,
          Number(reorderLevel) || 0
        );
    }

    if (
      tabletsPerStrip !== undefined
    ) {
      medicine.tabletsPerStrip =
        Math.max(
          1,
          Number(tabletsPerStrip) || 1
        );
    }

    if (
      stripsPerBox !== undefined
    ) {
      medicine.stripsPerBox =
        Math.max(
          1,
          Number(stripsPerBox) || 1
        );
    }


    await medicine.save();


    res.json(medicine);

  } catch (error) {

    console.error(
      "Update medicine error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update medicine",
    });
  }
};


// ==================================================
// DELETE MEDICINE
// ==================================================

exports.deleteMedicine = async (
  req,
  res
) => {
  try {

    const medicine =
      await Medicine.findById(
        req.params.id
      );


    if (!medicine) {

      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });

    }


    await MedicineUsage.deleteMany({
      medicineId:
        medicine._id,
    });


    await Medicine.findByIdAndDelete(
      req.params.id
    );


    res.json({
      success: true,
      message:
        "Medicine deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete medicine error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete medicine",
    });
  }
};


// ==================================================
// MEDICINE STATISTICS
// ==================================================

exports.getMedicineStats = async (
  req,
  res
) => {
  try {

    const totalMedicines =
      await Medicine.countDocuments();


    const lowStock =
      await Medicine.countDocuments({
        $expr: {
          $lte: [
            "$stock",
            "$reorderLevel",
          ],
        },
      });


    const outOfStock =
      await Medicine.countDocuments({
        stock: 0,
      });


    const stockResult =
      await Medicine.aggregate([
        {
          $group: {
            _id: null,
            totalStock: {
              $sum: "$stock",
            },
          },
        },
      ]);


    const totalStock =
      stockResult[0]?.totalStock ||
      0;


    res.json({
      success: true,

      stats: {
        totalMedicines,
        lowStock,
        outOfStock,
        totalStock,
      },
    });

  } catch (error) {

    console.error(
      "Medicine stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch medicine statistics",
    });
  }
};