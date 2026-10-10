import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";

import "./Dashboard.css";

import {
  getDashboardData,
} from "../../services/dashboardService";

import {
  FaCapsules,
  FaBoxOpen,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCalendarTimes,
  FaCalendarAlt,
  FaBrain,
  FaArrowUp,
  FaArrowRight,
  FaBell,
  FaSyncAlt,
  FaChartLine,
  FaDatabase,
} from "react-icons/fa";


function Dashboard() {

  const navigate =
    useNavigate();


  const [dashboardData,
    setDashboardData] =
    useState(null);


  const [loading,
    setLoading] =
    useState(true);


  const [error,
    setError] =
    useState("");


  // ======================================
  // LOAD DASHBOARD
  // ======================================

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setError("");


        const data =
          await getDashboardData();


        setDashboardData(
          data
        );


      } catch (error) {

        console.error(
          "Dashboard Error:",
          error
        );


        setError(
          error.message ||
          "Unable to load dashboard data"
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(
    () => {

      loadDashboard();

    },
    []
  );


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <>

        <Navbar />

        <div className="dashboardPage">

          <div className="dashboardLoading">

            <FaSyncAlt
              className="spin"
            />

            <h2>
              Loading Dashboard
            </h2>

            <p>
              Fetching real-time pharmacy data...
            </p>

          </div>

        </div>

      </>

    );

  }


  // ======================================
  // ERROR
  // ======================================

  if (error) {

    return (

      <>

        <Navbar />

        <div className="dashboardPage">

          <div className="dashboardError">

            <FaExclamationTriangle />

            <div>

              <h3>
                Unable to Load Dashboard
              </h3>

              <p>
                {error}
              </p>

            </div>

            <button
              onClick={
                loadDashboard
              }
            >
              Retry
            </button>

          </div>

        </div>

      </>

    );

  }


  const stats =
    dashboardData?.statistics ||
    {};


  const weeklyUsage =
    dashboardData?.weeklyUsage ||
    [];


  const maxUsage =
    Math.max(
      ...weeklyUsage.map(
        item =>
          item.quantity
      ),
      1
    );


  const alerts =
    dashboardData?.alerts ||
    [];


  const recentMedicines =
    dashboardData?.recentMedicines ||
    [];


  const health =
    dashboardData?.inventoryHealth ||
    {};


  return (

    <>

      <Navbar />


      <div className="dashboardPage">


        {/* =====================
            HEADER
        ===================== */}

        <div className="dashboardHeader">

          <div>

           

            <h1>

              Pharmacy Dashboard

            </h1>


            <p>

              Real-time overview of your pharmacy inventory

            </p>

          </div>


          <div className="dashboardHeaderActions">

            <button
              className="refreshDashboardBtn"
              onClick={
                loadDashboard
              }
            >

              <FaSyncAlt />

              Refresh

            </button>


            <button
              className="viewMedicinesBtn"
              onClick={() =>
                navigate(
                  "/medicines"
                )
              }
            >

              Manage Medicines

              <FaArrowRight />

            </button>

          </div>

        </div>


        {/* =====================
            INVENTORY HEALTH
        ===================== */}

        <div className="healthBanner">

          <div className="healthLeft">

            <div className="healthIcon">

              <FaBrain />

            </div>


            <div>

            

              <h2>

                {health.status ||
                  "Loading"}

              </h2>


              <p>

                Based on live stock,
                low inventory and expiry risks.

              </p>

            </div>

          </div>


          <div className="healthScore">

            <strong>

              {health.score ?? 0}

            </strong>

            <span>

              / 100

            </span>

          </div>

        </div>


        {/* =====================
            STATISTICS
        ===================== */}

        <div className="dashboardStats">


          <div
            className="dashboardStatCard blueStat"
            onClick={() =>
              navigate(
                "/medicines"
              )
            }
          >

            <div className="statIconBox">

              <FaCapsules />

            </div>


            <div>

              <span>

                Total Medicines

              </span>


              <h2>

                {stats.totalMedicines || 0}

              </h2>


              <small>

                Active inventory items

              </small>

            </div>

          </div>


          <div
            className="dashboardStatCard stockStat"
            onClick={() =>
              navigate(
                "/medicines"
              )
            }
          >

            <div className="statIconBox">

              <FaBoxOpen />

            </div>


            <div>

              <span>

                Total Stock

              </span>


              <h2>

                {stats.totalStock || 0}

              </h2>


              <small>

                Total available units

              </small>

            </div>

          </div>


          <div
            className="dashboardStatCard warningStat"
            onClick={() =>
              navigate(
                "/notifications"
              )
            }
          >

            <div className="statIconBox">

              <FaExclamationTriangle />

            </div>


            <div>

              <span>

                Low Stock

              </span>


              <h2>

                {stats.lowStock || 0}

              </h2>


              <small>

                Medicines need attention

              </small>

            </div>

          </div>


          <div
            className="dashboardStatCard dangerStat"
            onClick={() =>
              navigate(
                "/notifications"
              )
            }
          >

            <div className="statIconBox">

              <FaTimesCircle />

            </div>


            <div>

              <span>

                Out of Stock

              </span>


              <h2>

                {stats.outOfStock || 0}

              </h2>


              <small>

                Immediate action needed

              </small>

            </div>

          </div>


        </div>


        {/* =====================
            MAIN GRID
        ===================== */}

        <div className="dashboardGrid">


          {/* =====================
              USAGE CHART
          ===================== */}

          <div className="dashboardCard usageChartCard">


            <div className="dashboardCardHeader">

              <div>

                <span>

                  REAL DATA

                </span>


                <h2>

                  Weekly Medicine Usage

                </h2>

              </div>


              <div className="usageTotal">

                <FaChartLine />

                {stats.weeklyUsage || 0}
                {" "} units

              </div>

            </div>


            <div className="usageChart">

              {

                weeklyUsage.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="usageColumn"
                      key={index}
                    >

                      <span className="usageValue">

                        {item.quantity}

                      </span>


                      <div className="usageBarArea">

                        <div
                          className="usageBar"
                          style={{

                            height:
                              `${(
                                item.quantity /
                                maxUsage
                              ) * 100}%`

                          }}
                        />

                      </div>


                      <small>

                        {item.day}

                      </small>

                    </div>

                  )
                )

              }

            </div>

          </div>


          {/* =====================
              ALERTS
          ===================== */}

          <div className="dashboardCard alertsCard">


            <div className="dashboardCardHeader">

              <div>

                <span>

                  PRIORITY

                </span>


                <h2>

                  Inventory Alerts

                </h2>

              </div>


              <button
                className="viewAllLink"
                onClick={() =>
                  navigate(
                    "/notifications"
                  )
                }
              >

                View All

              </button>

            </div>


            <div className="alertsList">

              {

                alerts.length === 0 ? (

                  <div className="noAlerts">

                    <FaBell />

                    <p>

                      No inventory alerts.
                      Everything looks good!

                    </p>

                  </div>

                ) : (

                  alerts.map(
                    (
                      alert,
                      index
                    ) => (

                      <div
                        key={index}
                        className={
                          `alertItem ${alert.priority}`
                        }
                      >

                        <div className="alertDot" />


                        <div>

                          <strong>

                            {alert.medicineName}

                          </strong>


                          <p>

                            {alert.message}

                          </p>

                        </div>

                      </div>

                    )
                  )

                )

              }

            </div>

          </div>


        </div>


        {/* =====================
            SECONDARY STATS
        ===================== */}

        <div className="secondaryStats">


          <div className="secondaryStat">

            <div>

              <FaCalendarTimes />

            </div>


            <section>

              <span>

                Expired Medicines

              </span>


              <strong>

                {stats.expired || 0}

              </strong>

            </section>

          </div>


          <div className="secondaryStat">

            <div>

              <FaCalendarAlt />

            </div>


            <section>

              <span>

                Expiring Soon

              </span>


              <strong>

                {stats.expiringSoon || 0}

              </strong>

            </section>

          </div>


          <div className="secondaryStat">

            <div>

              <FaArrowUp />

            </div>


            <section>

              <span>

                Last 7 Days Usage

              </span>


              <strong>

                {stats.weeklyUsage || 0}

              </strong>

            </section>

          </div>


          <div className="secondaryStat">

            <div>

              <FaDatabase />

            </div>


            <section>

              <span>

                Backend Status

              </span>


              <strong className="liveStatus">

                Live

              </strong>

            </section>

          </div>


        </div>


        {/* =====================
            RECENT MEDICINES
        ===================== */}

        <div className="dashboardCard recentMedicinesCard">


          <div className="dashboardCardHeader">

            <div>

              <span>

                INVENTORY

              </span>


              <h2>

                Recent Medicines

              </h2>

            </div>


            <button
              className="viewAllLink"
              onClick={() =>
                navigate(
                  "/medicines"
                )
              }
            >

              View Inventory

            </button>

          </div>


          <div className="recentTableWrapper">

            <table className="recentMedicineTable">

              <thead>

                <tr>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Expiry
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {

                  recentMedicines.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="noData"
                      >

                        No medicines available

                      </td>

                    </tr>

                  ) : (

                    recentMedicines.map(
                      medicine => (

                        <tr
                          key={
                            medicine._id
                          }
                        >

                          <td>

                            <strong>

                              💊{" "}

                              {
                                medicine.name
                              }

                            </strong>

                          </td>


                          <td>

                            {
                              medicine.category
                            }

                          </td>


                          <td>

                            {
                              medicine.stock
                            }

                          </td>


                          <td>

                            {
                              medicine.expiry
                                ? new Date(
                                    medicine.expiry
                                  ).toLocaleDateString()
                                : "-"
                            }

                          </td>


                          <td>

                            <span
                              className={
                                `medicineStatus ${medicine.status}`
                              }
                            >

                              {
                                medicine.status
                              }

                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )

                }

              </tbody>

            </table>

          </div>

        </div>


      </div>

    </>

  );

}


export default Dashboard;