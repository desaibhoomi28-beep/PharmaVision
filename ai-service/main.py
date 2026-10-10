from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path

import pandas as pd
import numpy as np
import joblib


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="PharmaVision AI Forecast Service",
    version="2.0"
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = (
    BASE_DIR.parent
    / "dataset"
    / "combined_medicine_demand_dataset.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "model"
    / "demand_forecast_model.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

try:

    model = joblib.load(MODEL_PATH)

    print("✅ ML model loaded successfully")

except Exception as error:

    model = None

    print(
        "❌ MODEL LOAD ERROR:",
        error
    )


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    if not DATASET_PATH.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "Demand dataset not found at "
                f"{DATASET_PATH}"
            )
        )

    try:

        df = pd.read_csv(
            DATASET_PATH
        )

        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )

        numeric_columns = [
            "quantity_used",
            "stock_before",
            "stock_after",
            "prescription_count",
            "unit_price",
            "is_weekend"
        ]

        for column in numeric_columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        df = df.dropna(
            subset=[
                "medicine_name",
                "date",
                "quantity_used"
            ]
        )

        df = df.sort_values(
            [
                "medicine_name",
                "date"
            ]
        ).reset_index(drop=True)

        return df

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Dataset loading failed: {error}"
        )


# ============================================================
# REQUEST MODELS
# ============================================================

class UsageRecord(BaseModel):

    date: str

    quantityUsed: float


class ForecastRequest(BaseModel):

    medicineName: str

    forecastDays: int = 7

    currentStock: float = 0

    usageHistory: Optional[
        List[UsageRecord]
    ] = None


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "PharmaVision AI Forecast Service Running",
        "modelLoaded": model is not None,
        "dataset": "combined_medicine_demand_dataset.csv"
    }


# ============================================================
# DATASET MEDICINES
# ============================================================

@app.get("/medicines")
def get_medicines():

    df = load_dataset()

    medicines = sorted(
        df["medicine_name"]
        .dropna()
        .unique()
        .tolist()
    )

    return {
        "success": True,
        "count": len(medicines),
        "medicines": medicines
    }


# ============================================================
# DATASET SUMMARY
# ============================================================

@app.get("/dataset-summary")
def dataset_summary():

    df = load_dataset()

    return {
        "success": True,
        "rows": int(len(df)),
        "medicines": int(
            df["medicine_name"].nunique()
        ),
        "startDate": str(
            df["date"].min().date()
        ),
        "endDate": str(
            df["date"].max().date()
        ),
        "columns": df.columns.tolist()
    }


# ============================================================
# FORECAST
# ============================================================

@app.post("/forecast")
def forecast(request: ForecastRequest):

    if model is None:

        raise HTTPException(
            status_code=500,
            detail=(
                "Trained ML model is not loaded. "
                "Run train_model.py first."
            )
        )

    forecast_days = max(
        1,
        min(
            int(request.forecastDays),
            30
        )
    )

    medicine_name = (
        request.medicineName.strip()
    )

    if not medicine_name:

        raise HTTPException(
            status_code=400,
            detail="Medicine name is required"
        )

    df = load_dataset()

    # --------------------------------------------------------
    # Find medicine
    # --------------------------------------------------------

    medicine_data = df[
        df["medicine_name"].str.lower()
        == medicine_name.lower()
    ].copy()

    if medicine_data.empty:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No dataset history found for "
                f"{medicine_name}"
            )
        )

    medicine_name = (
        medicine_data.iloc[0]["medicine_name"]
    )

    medicine_data = medicine_data.sort_values(
        "date"
    ).reset_index(drop=True)

    # --------------------------------------------------------
    # Use supplied live usage history if enough data exists.
    # Otherwise use the project's trained dataset history.
    # --------------------------------------------------------

    data_source = "CSV Dataset"

    if (
        request.usageHistory
        and len(request.usageHistory) >= 30
    ):

        live_history = []

        for record in request.usageHistory:

            live_history.append({
                "date": pd.to_datetime(
                    record.date
                ),
                "quantity_used":
                    float(
                        record.quantityUsed
                    )
            })

        history_df = pd.DataFrame(
            live_history
        )

        history_df = (
            history_df
            .sort_values("date")
            .reset_index(drop=True)
        )

        data_source = (
            "Live Pharmacy Usage Data"
        )

    else:

        history_df = medicine_data[
            [
                "date",
                "quantity_used"
            ]
        ].copy()

    # --------------------------------------------------------
    # Need at least 30 historical observations
    # --------------------------------------------------------

    if len(history_df) < 30:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least 30 historical usage "
                "records are required for forecasting."
            )
        )

    # --------------------------------------------------------
    # Get additional known values from dataset
    # --------------------------------------------------------

    recent_dataset = medicine_data.tail(30)

    prescription_mean = float(
        recent_dataset[
            "prescription_count"
        ].mean()
    )

    price_mean = float(
        recent_dataset[
            "unit_price"
        ].mean()
    )

    # --------------------------------------------------------
    # Current stock
    # --------------------------------------------------------

    current_stock = max(
        0,
        float(request.currentStock)
    )

    # --------------------------------------------------------
    # Build historical demand list
    # --------------------------------------------------------

    demand_history = (
        history_df[
            "quantity_used"
        ]
        .astype(float)
        .tolist()
    )

    last_date = pd.to_datetime(
        history_df["date"].iloc[-1]
    )

    predictions = []

    # --------------------------------------------------------
    # Recursive multi-day forecasting
    # --------------------------------------------------------

    for step in range(1, forecast_days + 1):

        future_date = (
            last_date
            + pd.Timedelta(days=step)
        )

        # Need previous demand values
        lag_1 = (
            demand_history[-1]
        )

        lag_7 = (
            demand_history[-7]
            if len(demand_history) >= 7
            else np.mean(demand_history)
        )

        lag_14 = (
            demand_history[-14]
            if len(demand_history) >= 14
            else np.mean(demand_history)
        )

        lag_30 = (
            demand_history[-30]
            if len(demand_history) >= 30
            else np.mean(demand_history)
        )

        rolling_mean_7 = float(
            np.mean(
                demand_history[-7:]
            )
        )

        rolling_mean_14 = float(
            np.mean(
                demand_history[-14:]
            )
        )

        rolling_mean_30 = float(
            np.mean(
                demand_history[-30:]
            )
        )

        day_of_week = (
            future_date.dayofweek
        )

        day_of_month = (
            future_date.day
        )

        month = (
            future_date.month
        )

        day_of_year = (
            future_date.dayofyear
        )

        week_of_year = int(
            future_date.isocalendar().week
        )

        is_weekend = (
            1
            if day_of_week >= 5
            else 0
        )

        # ----------------------------------------------------
        # Stock available before future usage
        # ----------------------------------------------------

        projected_stock_before = max(
            0,
            current_stock
            -
            sum(predictions)
        )

        # ----------------------------------------------------
        # Create model input
        # ----------------------------------------------------

        input_row = pd.DataFrame(
            [
                {
                    "medicine_name":
                        medicine_name,

                    "day_of_week":
                        day_of_week,

                    "day_of_month":
                        day_of_month,

                    "month":
                        month,

                    "day_of_year":
                        day_of_year,

                    "week_of_year":
                        week_of_year,

                    "lag_1":
                        lag_1,

                    "lag_7":
                        lag_7,

                    "lag_14":
                        lag_14,

                    "lag_30":
                        lag_30,

                    "rolling_mean_7":
                        rolling_mean_7,

                    "rolling_mean_14":
                        rolling_mean_14,

                    "rolling_mean_30":
                        rolling_mean_30,

                    "prescription_count":
                        prescription_mean,

                    "stock_before":
                        projected_stock_before,

                    "unit_price":
                        price_mean,

                    "is_weekend":
                        is_weekend
                }
            ]
        )

        # ----------------------------------------------------
        # Predict
        # ----------------------------------------------------

        prediction = model.predict(
            input_row
        )[0]

        prediction = max(
            0,
            round(
                float(prediction),
                2
            )
        )

        predictions.append(
            prediction
        )

        # ----------------------------------------------------
        # Add prediction to history for next day
        # ----------------------------------------------------

        demand_history.append(
            prediction
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    total_demand = round(
        sum(predictions),
        2
    )

    average_daily_demand = round(
        total_demand
        /
        forecast_days,
        2
    )

    remaining_stock = round(
        current_stock
        -
        total_demand,
        2
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "success": True,

        "model":
            "Random Forest Regression",

        "dataSource":
            data_source,

        "medicineName":
            medicine_name,

        "usageRecordsUsed":
            len(history_df),

        "forecastDays":
            forecast_days,

        "dailyPredictions":
            predictions,

        "totalPredictedDemand":
            total_demand,

        "averageDailyDemand":
            average_daily_demand,

        "currentStock":
            current_stock,

        "remainingStock":
            remaining_stock
    }