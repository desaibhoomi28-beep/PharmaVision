const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const connectDB = require("./database/db");

const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const testRoutes = require("./routes/testRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const billingRoutes =
  require("./routes/billingRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());

app.use(morgan("dev"));


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to PharmaVision Backend API",
  });
});


// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/medicines",
  medicineRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);
app.use(
  "/api/billing",
  billingRoutes
);
app.use(
  "/api/forecast",
  forecastRoutes
);



app.use(
  "/api/test",
  testRoutes
);


// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 PharmaVision backend running on port ${PORT}`
  );
});