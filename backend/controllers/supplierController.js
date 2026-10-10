const Supplier = require("../models/Supplier");

// GET ALL SUPPLIERS
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get Suppliers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
    });
  }
};


// CREATE SUPPLIER
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      address,
      status,
    } = req.body;

    if (!name || !company || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, company and phone are required",
      });
    }

    const supplier = await Supplier.create({
      name,
      company,
      email,
      phone,
      address,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      supplier,
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add supplier",
    });
  }
};


// UPDATE SUPPLIER
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update Supplier Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
    });
  }
};


// DELETE SUPPLIER
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete Supplier Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
    });
  }
};


module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};