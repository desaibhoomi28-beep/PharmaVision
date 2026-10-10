import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = (
    BASE_DIR.parent
    / "dataset"
    / "combined_medicine_demand_dataset.csv"
)

MODEL_DIR = BASE_DIR / "model"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("=" * 70)
print("PHARMAVISION MEDICINE DEMAND FORECASTING")
print("=" * 70)

print("\nDataset:")
print(DATASET_PATH)


# ============================================================
# 2. LOAD DATASET
# ============================================================

if not DATASET_PATH.exists():

    raise FileNotFoundError(
        f"""
Dataset not found.

Expected location:
{DATASET_PATH}
"""
    )


df = pd.read_csv(DATASET_PATH)


print("\nDataset loaded successfully!")

print("Rows:", len(df))

print("Columns:", len(df.columns))

print("\nAvailable columns:")
print(df.columns.tolist())


# ============================================================
# 3. CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "medicine_name",
    "category",
    "disease",
    "possible_side_effects",
    "date",
    "quantity_used",
    "stock_before",
    "stock_after",
    "prescription_count",
    "unit_price",
    "is_weekend"
]


missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]


if missing_columns:

    raise ValueError(
        f"Missing columns: {missing_columns}"
    )


# ============================================================
# 4. DATA CLEANING
# ============================================================

print("\nCleaning data...")


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


df = df[
    df["quantity_used"] >= 0
]


df = df.sort_values(
    ["medicine_name", "date"]
).reset_index(drop=True)


print(
    "Rows after cleaning:",
    len(df)
)


# ============================================================
# 5. TIME FEATURES
# ============================================================

print("\nCreating time features...")


df["day_of_week"] = (
    df["date"].dt.dayofweek
)

df["day_of_month"] = (
    df["date"].dt.day
)

df["month"] = (
    df["date"].dt.month
)

df["day_of_year"] = (
    df["date"].dt.dayofyear
)

df["week_of_year"] = (
    df["date"]
    .dt.isocalendar()
    .week
    .astype(int)
)


# ============================================================
# 6. LAG FEATURES
# ============================================================

print("Creating lag features...")


grouped_usage = (
    df.groupby("medicine_name")
    ["quantity_used"]
)


df["lag_1"] = grouped_usage.shift(1)

df["lag_7"] = grouped_usage.shift(7)

df["lag_14"] = grouped_usage.shift(14)

df["lag_30"] = grouped_usage.shift(30)


# ============================================================
# 7. ROLLING FEATURES
# ============================================================

print("Creating rolling averages...")


df["rolling_mean_7"] = (
    df.groupby("medicine_name")
    ["quantity_used"]
    .transform(
        lambda x:
        x.shift(1)
        .rolling(7)
        .mean()
    )
)


df["rolling_mean_14"] = (
    df.groupby("medicine_name")
    ["quantity_used"]
    .transform(
        lambda x:
        x.shift(1)
        .rolling(14)
        .mean()
    )
)


df["rolling_mean_30"] = (
    df.groupby("medicine_name")
    ["quantity_used"]
    .transform(
        lambda x:
        x.shift(1)
        .rolling(30)
        .mean()
    )
)


# ============================================================
# 8. REMOVE INSUFFICIENT HISTORY
# ============================================================

before = len(df)


df = df.dropna(
    subset=[
        "lag_1",
        "lag_7",
        "lag_14",
        "lag_30",
        "rolling_mean_7",
        "rolling_mean_14",
        "rolling_mean_30"
    ]
).reset_index(drop=True)


print(
    "Rows removed:",
    before - len(df)
)

print(
    "Rows available for training:",
    len(df)
)


# ============================================================
# 9. FEATURES
# ============================================================

feature_columns = [

    "medicine_name",

    "day_of_week",
    "day_of_month",
    "month",
    "day_of_year",
    "week_of_year",

    "lag_1",
    "lag_7",
    "lag_14",
    "lag_30",

    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_mean_30",

    "prescription_count",

    "stock_before",

    "unit_price",

    "is_weekend"
]


target_column = "quantity_used"


X = df[
    feature_columns
].copy()


y = df[
    target_column
].copy()


# ============================================================
# 10. HANDLE MISSING NUMERIC VALUES
# ============================================================

numeric_features = [

    "day_of_week",
    "day_of_month",
    "month",
    "day_of_year",
    "week_of_year",

    "lag_1",
    "lag_7",
    "lag_14",
    "lag_30",

    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_mean_30",

    "prescription_count",

    "stock_before",

    "unit_price",

    "is_weekend"
]


for column in numeric_features:

    X[column] = X[column].fillna(
        X[column].median()
    )


# ============================================================
# 11. TIME-BASED TRAIN / TEST SPLIT
# ============================================================

print("\nCreating train/test split...")


train_indices = []

test_indices = []


for medicine_name, group in df.groupby(
    "medicine_name"
):

    indices = group.index.tolist()

    split = int(
        len(indices) * 0.80
    )

    train_indices.extend(
        indices[:split]
    )

    test_indices.extend(
        indices[split:]
    )


X_train = X.loc[
    train_indices
]

X_test = X.loc[
    test_indices
]


y_train = y.loc[
    train_indices
]

y_test = y.loc[
    test_indices
]


print(
    "Training rows:",
    len(X_train)
)

print(
    "Testing rows:",
    len(X_test)
)


# ============================================================
# 12. MEDICINE ENCODING
# ============================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "medicine",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            ["medicine_name"]
        )

    ],

    remainder="passthrough"
)


# ============================================================
# 13. RANDOM FOREST
# ============================================================

print("\nCreating Random Forest...")


random_forest = RandomForestRegressor(

    n_estimators=300,

    max_depth=18,

    min_samples_leaf=2,

    random_state=42,

    n_jobs=-1
)


# ============================================================
# 14. PIPELINE
# ============================================================

model = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            random_forest
        )

    ]
)


# ============================================================
# 15. TRAIN
# ============================================================

print("\nTraining model...")

print(
    "Please wait..."
)


model.fit(
    X_train,
    y_train
)


print(
    "\nTraining completed!"
)


# ============================================================
# 16. PREDICTIONS
# ============================================================

print(
    "\nGenerating predictions..."
)


predictions = model.predict(
    X_test
)


predictions = np.maximum(
    predictions,
    0
)


# ============================================================
# 17. EVALUATION
# ============================================================

mae = mean_absolute_error(
    y_test,
    predictions
)


rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)


r2 = r2_score(
    y_test,
    predictions
)


non_zero = y_test != 0


if non_zero.sum() > 0:

    mape = (
        np.mean(
            np.abs(
                (
                    y_test[non_zero]
                    -
                    predictions[non_zero]
                )
                /
                y_test[non_zero]
            )
        )
        * 100
    )

else:

    mape = 0


# ============================================================
# 18. DISPLAY PERFORMANCE
# ============================================================

print("\n")
print("=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)


print(
    f"MAE  : {mae:.2f}"
)


print(
    f"RMSE : {rmse:.2f}"
)


print(
    f"R²   : {r2:.4f}"
)


print(
    f"MAPE : {mape:.2f}%"
)


print("=" * 70)


# ============================================================
# 19. SAMPLE PREDICTIONS
# ============================================================

prediction_results = X_test.copy()


prediction_results[
    "actual_quantity"
] = y_test.values


prediction_results[
    "predicted_quantity"
] = predictions


print("\nSample predictions:")


print(
    prediction_results[
        [
            "medicine_name",
            "lag_1",
            "lag_7",
            "rolling_mean_7",
            "actual_quantity",
            "predicted_quantity"
        ]
    ].head(10)
)


# ============================================================
# 20. SAVE MODEL
# ============================================================

model_path = (
    MODEL_DIR
    / "demand_forecast_model.pkl"
)


joblib.dump(
    model,
    model_path
)


print(
    "\nModel saved:"
)

print(
    model_path
)


# ============================================================
# 21. SAVE FEATURE INFORMATION
# ============================================================

feature_info = {

    "feature_columns":
        feature_columns,

    "numeric_features":
        numeric_features,

    "target":
        target_column
}


feature_info_path = (
    MODEL_DIR
    / "feature_info.pkl"
)


joblib.dump(
    feature_info,
    feature_info_path
)


print(
    "\nFeature information saved:"
)

print(
    feature_info_path
)


# ============================================================
# 22. COMPLETE
# ============================================================

print("\n")
print("=" * 70)
print("PHARMAVISION ML TRAINING COMPLETED")
print("=" * 70)

print(
    "\nYour trained model is ready for integration."
)