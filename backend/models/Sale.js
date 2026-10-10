const mongoose = require("mongoose");

const saleItemSchema =
  new mongoose.Schema(
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },

      medicineName: {
        type: String,
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const saleSchema =
  new mongoose.Schema(
    {
      invoiceNumber: {
        type: String,
        required: true,
        unique: true,
      },

      customerName: {
        type: String,
        default: "Walk-in Customer",
      },

      customerPhone: {
        type: String,
        default: "",
      },

      items: {
        type: [saleItemSchema],
        required: true,
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentMethod: {
        type: String,
        enum: [
          "Cash",
          "Card",
          "UPI",
        ],
        default: "Cash",
      },

      soldBy: {
        type: String,
        default: "Pharmacist",
      },

      status: {
        type: String,
        enum: [
          "Completed",
          "Cancelled",
        ],
        default: "Completed",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Sale",
    saleSchema
  );