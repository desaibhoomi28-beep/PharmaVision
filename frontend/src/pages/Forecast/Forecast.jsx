import { useEffect, useState } from "react";

import {
  FaBrain,
  FaChartLine,
  FaBoxOpen,
  FaExclamationTriangle,
  FaSyncAlt,
  FaRobot,
  FaArrowUp,
} from "react-icons/fa";

import "./Forecast.css";

const API_URL = "http://localhost:5000";

export default function Forecast() {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [forecastDays, setForecastDays] = useState(7);

  const [forecast, setForecast] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingMedicines, setLoadingMedicines] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD MEDICINES
  ===================================================== */

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoadingMedicines(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/medicines`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load medicines"
          );
        }

        /*
          CURRENT API FORMAT:

          [
            {
              _id: "...",
              name: "Crocin"
            },
            {
              _id: "...",
              name: "Paracetamol"
            }
          ]

          ALSO SUPPORT:

          {
            success: true,
            data: [...]
          }
        */

        let medicineList = [];

        if (Array.isArray(data)) {
          medicineList = data;
        } else if (Array.isArray(data?.data)) {
          medicineList = data.data;
        } else if (
          Array.isArray(data?.medicines)
        ) {
          medicineList = data.medicines;
        }

        if (!Array.isArray(medicineList)) {
          throw new Error(
            "Invalid medicine response from backend"
          );
        }

        /*
          Remove duplicate medicines.
        */

        const uniqueMedicines = Array.from(
          new Map(
            medicineList
              .filter(
                (medicine) =>
                  medicine &&
                  medicine.name
              )
              .map((medicine) => [
                medicine._id ||
                  medicine.name,
                medicine,
              ])
          ).values()
        );

        /*
          Sort medicine names alphabetically.
        */

        uniqueMedicines.sort((a, b) =>
          String(a.name).localeCompare(
            String(b.name)
          )
        );

        console.log(
          "FORECAST MEDICINES:",
          uniqueMedicines
        );

        console.log(
          "FORECAST MEDICINE COUNT:",
          uniqueMedicines.length
        );

        setMedicines(uniqueMedicines);

        if (
          uniqueMedicines.length === 0
        ) {
          setError(
            "No medicines found in database."
          );
        }
      } catch (error) {
        console.error(
          "Medicine loading error:",
          error
        );

        setMedicines([]);

        setError(
          error.message ||
            "Unable to fetch medicines"
        );
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, []);

  /* =====================================================
     GENERATE FORECAST
  ===================================================== */

  const generateForecast = async () => {
    if (!selectedMedicine) {
      setError(
        "Please select a medicine first."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setForecast(null);

      /*
        IMPORTANT:

        selectedMedicine contains the MEDICINE NAME.

        Example:
        Paracetamol 500mg

        NOT MongoDB _id.

        This matches the historical demand dataset
        and existing forecast endpoint.
      */

      const encodedMedicine =
        encodeURIComponent(
          selectedMedicine
        );

      const forecastURL =
        `${API_URL}/api/forecast/${encodedMedicine}?days=${forecastDays}`;

      console.log(
        "FORECAST REQUEST:",
        forecastURL
      );

      const response = await fetch(
        forecastURL
      );

      const data = await response.json();

      console.log(
        "FORECAST RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to generate AI forecast"
        );
      }

      setForecast(data);
    } catch (error) {
      console.error(
        "Forecast generation error:",
        error
      );

      setForecast(null);

      setError(
        error.message ||
          "Unable to connect to forecasting service"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     MAX CHART VALUE
  ===================================================== */

  const getMaxPrediction = () => {
    const predictions =
      forecast?.ai?.dailyPredictions;

    if (
      !Array.isArray(predictions) ||
      predictions.length === 0
    ) {
      return 1;
    }

    return Math.max(
      ...predictions.map(
        (value) => Number(value) || 0
      ),
      1
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="forecastPage">

      {/* HEADER */}

      <div className="forecastHeader">

        <div className="forecastTitleArea">

          <div className="forecastIcon">
            <FaBrain />
          </div>

          <div>

            <span className="forecastEyebrow">
              PHARMAVISION INTELLIGENCE
            </span>

            <h1>
              AI Demand Forecasting
            </h1>

            <p>
              Predict medicine demand using
              historical consumption data and
              machine learning.
            </p>

          </div>

        </div>

        <div className="aiBadge">
          <FaRobot />
          Random Forest AI
        </div>

      </div>


      {/* CONTROLS */}

      <div className="forecastControls">

        <div className="controlGroup">

          <label>
            Select Medicine
          </label>

          <select
            value={selectedMedicine}
            disabled={loadingMedicines}
            onChange={(event) => {

              setSelectedMedicine(
                event.target.value
              );

              setForecast(null);
              setError("");

            }}
          >

            <option value="">

              {loadingMedicines
                ? "Loading medicines..."
                : medicines.length === 0
                ? "No medicines available"
                : `Choose a medicine (${medicines.length} available)`}

            </option>

            {medicines.map(
              (medicine) => (

                <option
                  key={
                    medicine._id ||
                    medicine.name
                  }

                  /*
                    IMPORTANT:
                    VALUE IS MEDICINE NAME,
                    NOT _id.
                  */

                  value={medicine.name}
                >

                  {medicine.name}

                </option>

              )
            )}

          </select>

          {!loadingMedicines &&
            medicines.length > 0 && (

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#667085",
                }}
              >
                {medicines.length} medicines
                loaded from database
              </small>

            )}

        </div>


        <div className="controlGroup daysControl">

          <label>
            Forecast Period
          </label>

          <select
            value={forecastDays}
            onChange={(event) =>
              setForecastDays(
                Number(
                  event.target.value
                )
              )
            }
          >

            <option value={7}>
              Next 7 Days
            </option>

            <option value={14}>
              Next 14 Days
            </option>

            <option value={30}>
              Next 30 Days
            </option>

          </select>

        </div>


        <button
          className="generateForecastBtn"
          onClick={generateForecast}
          disabled={
            loading ||
            loadingMedicines ||
            !selectedMedicine
          }
        >

          {loading ? (

            <>
              <FaSyncAlt
                className="spin"
              />

              Analyzing...
            </>

          ) : (

            <>
              <FaBrain />

              Generate AI Forecast
            </>

          )}

        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="forecastError">

          <FaExclamationTriangle />

          <div>

            <strong>
              Forecast unavailable
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      )}


      {/* EMPTY */}

      {!forecast &&
        !loading &&
        !error && (

          <div className="forecastEmpty">

            <div className="emptyBrain">
              <FaBrain />
            </div>

            <h2>
              Ready for AI Analysis
            </h2>

            <p>
              Select one of the{" "}
              {medicines.length} medicines
              and generate a demand forecast.
            </p>

          </div>

        )}


      {/* LOADING */}

      {loading && (

        <div className="forecastLoading">

          <div className="loadingBrain">
            <FaBrain />
          </div>

          <h2>
            AI is analyzing demand patterns...
          </h2>

          <p>
            Processing historical medicine
            consumption data.
          </p>

        </div>

      )}


      {/* RESULTS */}

      {forecast && !loading && (

        <>

          <div className="forecastStats">

            <div className="forecastStatCard">

              <div className="statIcon demandIcon">
                <FaChartLine />
              </div>

              <div>

                <span>
                  Predicted Demand
                </span>

                <h2>
                  {
                    forecast.ai
                      ?.totalPredictedDemand ??
                    0
                  }
                </h2>

                <small>
                  Next{" "}
                  {
                    forecast.ai
                      ?.forecastDays ??
                    forecastDays
                  } days
                </small>

              </div>

            </div>


            <div className="forecastStatCard">

              <div className="statIcon stockIcon">
                <FaBoxOpen />
              </div>

              <div>

                <span>
                  Current Stock
                </span>

                <h2>
                  {
                    forecast.medicine
                      ?.currentStock ??
                    0
                  }
                </h2>

                <small>
                  Available units
                </small>

              </div>

            </div>


            <div className="forecastStatCard">

              <div className="statIcon avgIcon">
                <FaArrowUp />
              </div>

              <div>

                <span>
                  Average Daily Demand
                </span>

                <h2>
                  {
                    forecast.ai
                      ?.averageDailyDemand ??
                    0
                  }
                </h2>

                <small>
                  Units per day
                </small>

              </div>

            </div>


            <div className="forecastStatCard">

              <div className="statIcon alertIcon">
                <FaExclamationTriangle />
              </div>

              <div>

                <span>
                  Inventory Status
                </span>

                <h2>
                  {
                    forecast
                      .inventoryAnalysis
                      ?.status ||
                    "N/A"
                  }
                </h2>

                <small>
                  {
                    forecast
                      .inventoryAnalysis
                      ?.recommendation ||
                    "No recommendation"
                  }
                </small>

              </div>

            </div>

          </div>


          {/* CHART + INSIGHT */}

          <div className="forecastGrid">

            <div className="forecastChartCard">

              <div className="cardTop">

                <div>

                  <span>
                    AI PREDICTION
                  </span>

                  <h2>
                    Daily Demand Forecast
                  </h2>

                </div>

                <div className="modelTag">

                  {
                    forecast.ai?.model ||
                    "Random Forest AI"
                  }

                </div>

              </div>


              <div className="predictionChart">

                {Array.isArray(
                  forecast.ai
                    ?.dailyPredictions
                ) &&

                  forecast.ai
                    .dailyPredictions
                    .map(
                      (
                        prediction,
                        index
                      ) => (

                        <div
                          className="chartColumn"
                          key={index}
                        >

                          <span>
                            {prediction}
                          </span>

                          <div className="barArea">

                            <div
                              className="chartBar"
                              style={{
                                height:
                                  `${
                                    (
                                      Number(
                                        prediction
                                      ) /
                                      getMaxPrediction()
                                    ) *
                                    100
                                  }%`,
                              }}
                            />

                          </div>

                          <small>
                            Day {index + 1}
                          </small>

                        </div>

                      )
                    )}

              </div>

            </div>


            {/* AI INSIGHT */}

            <div className="aiInsightCard">

              <div className="insightTop">

                <div className="insightRobot">
                  <FaRobot />
                </div>

                <div>

                  <span>
                    AI INVENTORY INSIGHT
                  </span>

                  <h2>
                    Recommended Action
                  </h2>

                </div>

              </div>


              <div className="recommendationBox">

                <strong>

                  {
                    forecast
                      .inventoryAnalysis
                      ?.recommendation ||
                    "No recommendation available"
                  }

                </strong>

                <p>

                  Based on historical
                  medicine consumption and
                  machine learning demand
                  prediction.

                </p>

              </div>


              <div className="insightRow">

                <span>
                  Medicine
                </span>

                <strong>

                  {
                    forecast
                      .medicine
                      ?.name ||
                    selectedMedicine
                  }

                </strong>

              </div>


              <div className="insightRow">

                <span>
                  Current Stock
                </span>

                <strong>

                  {
                    forecast
                      .medicine
                      ?.currentStock ??
                    0
                  }{" "}
                  units

                </strong>

              </div>


              <div className="insightRow">

                <span>
                  Predicted Demand
                </span>

                <strong>

                  {
                    forecast.ai
                      ?.totalPredictedDemand ??
                    0
                  }{" "}
                  units

                </strong>

              </div>


              <div className="insightRow">

                <span>
                  Recommended Order
                </span>

                <strong className="reorderValue">

                  {
                    forecast
                      .inventoryAnalysis
                      ?.recommendedOrder ??
                    0
                  }{" "}
                  units

                </strong>

              </div>


              <div className="usageInfo">

                <FaBrain />

                AI analyzed{" "}
                {
                  forecast
                    .usageRecordsUsed ??
                  0
                } historical usage
                records

              </div>

            </div>

          </div>

        </>

      )}

    </div>
  );
}