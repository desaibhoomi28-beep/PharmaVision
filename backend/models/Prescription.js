const mongoose = require("mongoose");

const prescriptionItemSchema = new mongoose.Schema(
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

    dose: {
      type: Number,
      required: true,
      min: 1,
    },

    timesPerDay: {
      type: Number,
      required: true,
      min: 1,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  }
);

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    patientAge: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },

    items: {
      type: [prescriptionItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one medicine is required",
      },
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Dispensed",
        "Rejected",
      ],
      default: "Pending",
    },

    pharmacistName: {
      type: String,
      default: "",
    },

    pharmacistNote: {
      type: String,
      default: "",
    },

    dispensedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Prescription", prescriptionSchema);