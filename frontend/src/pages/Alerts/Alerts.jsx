import { useEffect, useState } from "react";

import {
  FaBell,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";

import "./Alerts.css";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/alerts"
      );

      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Unable to fetch alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Automatic refresh every 10 seconds
    const interval = setInterval(() => {
      fetchAlerts();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const criticalAlerts = alerts.filter(
    (alert) => alert.type === "critical"
  ).length;

  const warningAlerts = alerts.filter(
    (alert) => alert.type === "warning"
  ).length;

  return (
    <div className="alertsPage">

      {/* HEADER */}

      <div className="alertsHeader">

        <div>

          <div className="alertsTitle">

            <div className="alertsTitleIcon">
              <FaBell />
            </div>

            <div>
              <h1>Notifications & Alerts</h1>

              <p>
                Stay updated about your medicine inventory
              </p>
            </div>

          </div>

        </div>


        <button
          className="refreshAlertsBtn"
          onClick={handleRefresh}
        >

          <FaSyncAlt
            className={refreshing ? "refreshing" : ""}
          />

          Refresh

        </button>

      </div>


      {/* SUMMARY */}

      <div className="alertSummary">

        <div className="alertSummaryCard total">

          <div className="summaryIcon">
            <FaBell />
          </div>

          <div>
            <span>Total Alerts</span>

            <strong>
              {alerts.length}
            </strong>
          </div>

        </div>


        <div className="alertSummaryCard critical">

          <div className="summaryIcon">
            <FaTimesCircle />
          </div>

          <div>
            <span>Critical</span>

            <strong>
              {criticalAlerts}
            </strong>
          </div>

        </div>


        <div className="alertSummaryCard warning">

          <div className="summaryIcon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Low Stock</span>

            <strong>
              {warningAlerts}
            </strong>
          </div>

        </div>

      </div>


      {/* ALERT LIST */}

      <div className="alertsContainer">

        <div className="alertsContainerHeader">

          <div>

            <h2>
              Active Inventory Alerts
            </h2>

            <p>
              Alerts are automatically generated from medicine stock levels.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="alertsLoading">
            Loading alerts...
          </div>

        ) : alerts.length === 0 ? (

          <div className="noAlerts">

            <div className="noAlertsIcon">
              <FaCheckCircle />
            </div>

            <h3>
              Everything looks good!
            </h3>

            <p>
              There are currently no low-stock or out-of-stock medicines.
            </p>

          </div>

        ) : (

          <div className="alertsList">

            {alerts.map((alert) => (

              <div
                className={`alertItem ${alert.type}`}
                key={alert.id}
              >

                <div className="alertIcon">

                  {alert.type === "critical" ? (
                    <FaTimesCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}

                </div>


                <div className="alertContent">

                  <div className="alertContentTop">

                    <h3>
                      {alert.title}
                    </h3>

                    <span
                      className={`alertBadge ${alert.type}`}
                    >
                      {alert.type === "critical"
                        ? "Critical"
                        : "Warning"}
                    </span>

                  </div>


                  <p>
                    {alert.message}
                  </p>


                  <div className="alertMedicineInfo">

                    <span>
                      💊 {alert.medicine}
                    </span>

                    <span>
                      📦 Current Stock: {alert.stock}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}