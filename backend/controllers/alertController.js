const Medicine = require("../models/Medicine");

const getAlerts = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    const alerts = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    medicines.forEach((medicine) => {
      const stock = Number(medicine.stock) || 0;

      // =========================
      // STOCK ALERTS
      // =========================

      if (stock === 0) {
        alerts.push({
          id: `stock-${medicine._id}`,
          medicineId: medicine._id,
          type: "critical",
          category: "stock",
          title: "Out of Stock",
          message: `${medicine.name} is currently out of stock.`,
          medicine: medicine.name,
          stock: stock,
          createdAt: new Date(),
        });
      } else if (stock <= 20) {
        alerts.push({
          id: `lowstock-${medicine._id}`,
          medicineId: medicine._id,
          type: "warning",
          category: "stock",
          title: "Low Stock Alert",
          message: `${medicine.name} has only ${stock} units remaining.`,
          medicine: medicine.name,
          stock: stock,
          createdAt: new Date(),
        });
      }

      // =========================
      // EXPIRY ALERTS
      // =========================

      if (medicine.expiry) {
        const expiryDate = new Date(medicine.expiry);

        expiryDate.setHours(0, 0, 0, 0);

        const difference =
          expiryDate.getTime() - today.getTime();

        const daysRemaining = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        // EXPIRED
        if (daysRemaining < 0) {
          alerts.push({
            id: `expired-${medicine._id}`,
            medicineId: medicine._id,
            type: "critical",
            category: "expiry",
            title: "Medicine Expired",
            message: `${medicine.name} has expired and should not be used.`,
            medicine: medicine.name,
            expiry: medicine.expiry,
            daysRemaining,
            createdAt: new Date(),
          });
        }

        // EXPIRING IN 30 DAYS
        else if (daysRemaining <= 30) {
          alerts.push({
            id: `expiry30-${medicine._id}`,
            medicineId: medicine._id,
            type: "warning",
            category: "expiry",
            title: "Expiring Soon",
            message: `${medicine.name} will expire in ${daysRemaining} day(s).`,
            medicine: medicine.name,
            expiry: medicine.expiry,
            daysRemaining,
            createdAt: new Date(),
          });
        }

        // EXPIRING IN 60 DAYS
        else if (daysRemaining <= 60) {
          alerts.push({
            id: `expiry60-${medicine._id}`,
            medicineId: medicine._id,
            type: "info",
            category: "expiry",
            title: "Expiry Reminder",
            message: `${medicine.name} will expire in ${daysRemaining} days.`,
            medicine: medicine.name,
            expiry: medicine.expiry,
            daysRemaining,
            createdAt: new Date(),
          });
        }
      }
    });

    // Critical → Warning → Info
    const priority = {
      critical: 1,
      warning: 2,
      info: 3,
    };

    alerts.sort(
      (a, b) =>
        priority[a.type] - priority[b.type]
    );

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });

  } catch (error) {
    console.error("Alert Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate alerts",
      error: error.message,
    });
  }
};

module.exports = {
  getAlerts,
};