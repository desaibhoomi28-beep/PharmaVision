const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    salt: {
      type: String,
      default: "",
      trim: true,
    },

    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },

    disease: {
      type: String,
      default: "",
      trim: true,
    },

    possibleSideEffects: {
      type: String,
      default: "",
      trim: true,
    },

    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 20,
      min: 0,
    },

    tabletsPerStrip: {
      type: Number,
      default: 1,
      min: 1,
    },

    stripsPerBox: {
      type: Number,
      default: 1,
      min: 1,
    },

    lastDatasetDate: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      default: "dataset",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Medicine",
  medicineSchema
);