import { useEffect, useState } from "react";

import {
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
  FaSyncAlt,
  FaSearch,
} from "react-icons/fa";

import "./Expiry.css";

export default function Expiry() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState("all");


  const getDaysRemaining = (expiry) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(expiry);
    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      expiryDate.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };


  const getExpiryStatus = (expiry) => {
    const days = getDaysRemaining(expiry);

    if (days < 0) {
      return "expired";
    }

    if (days <= 30) {
      return "soon";
    }

    if (days <= 60) {
      return "warning";
    }

    return "safe";
  };


  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/medicines"
      );

      const data = await response.json();

      if (data.success) {
        setMedicines(data.medicines || []);
        setFilteredMedicines(
          data.medicines || []
        );
      }

    } catch (error) {
      console.error(
        "Medicine fetch error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMedicines();
  }, []);


  useEffect(() => {
    let result = [...medicines];

    if (search.trim()) {
      result = result.filter((medicine) =>
        medicine.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (filter !== "all") {
      result = result.filter(
        (medicine) =>
          getExpiryStatus(
            medicine.expiry
          ) === filter
      );
    }

    setFilteredMedicines(result);

  }, [search, filter, medicines]);


  const expiredCount =
    medicines.filter(
      (medicine) =>
        getExpiryStatus(
          medicine.expiry
        ) === "expired"
    ).length;


  const expiringSoonCount =
    medicines.filter(
      (medicine) =>
        getExpiryStatus(
          medicine.expiry
        ) === "soon"
    ).length;


  const warningCount =
    medicines.filter(
      (medicine) =>
        getExpiryStatus(
          medicine.expiry
        ) === "warning"
    ).length;


  const safeCount =
    medicines.filter(
      (medicine) =>
        getExpiryStatus(
          medicine.expiry
        ) === "safe"
    ).length;


  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB"
    );
  };


  return (
    <div className="expiryPage">

      {/* HEADER */}

      <div className="expiryHeader">

        <div className="expiryHeading">

          <div className="expiryHeadingIcon">
            <FaCalendarAlt />
          </div>

          <div>
            <h1>
              Expiry Management
            </h1>

            <p>
              Monitor medicine expiry dates and
              prevent expired inventory usage.
            </p>
          </div>

        </div>


        <button
          className="expiryRefreshBtn"
          onClick={fetchMedicines}
        >
          <FaSyncAlt />

          Refresh
        </button>

      </div>


      {/* SUMMARY CARDS */}

      <div className="expiryStats">

        <div className="expiryStatCard expired">

          <div className="expiryStatIcon">
            <FaTimesCircle />
          </div>

          <div>
            <span>
              Expired
            </span>

            <strong>
              {expiredCount}
            </strong>
          </div>

        </div>


        <div className="expiryStatCard soon">

          <div className="expiryStatIcon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>
              Expiring Soon
            </span>

            <strong>
              {expiringSoonCount}
            </strong>

            <small>
              Within 30 days
            </small>
          </div>

        </div>


        <div className="expiryStatCard warning">

          <div className="expiryStatIcon">
            <FaCalendarAlt />
          </div>

          <div>
            <span>
              Upcoming Expiry
            </span>

            <strong>
              {warningCount}
            </strong>

            <small>
              Within 60 days
            </small>
          </div>

        </div>


        <div className="expiryStatCard safe">

          <div className="expiryStatIcon">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Safe Medicines
            </span>

            <strong>
              {safeCount}
            </strong>
          </div>

        </div>

      </div>


      {/* TABLE AREA */}

      <div className="expiryTableContainer">

        <div className="expiryTableTop">

          <div>

            <h2>
              Medicine Expiry Overview
            </h2>

            <p>
              Track all medicine expiry information
              in one place.
            </p>

          </div>


          <div className="expiryFilters">

            <div className="expirySearch">

              <FaSearch />

              <input
                type="text"
                placeholder="Search medicine..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >

              <option value="all">
                All Medicines
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="soon">
                Expiring Within 30 Days
              </option>

              <option value="warning">
                Expiring Within 60 Days
              </option>

              <option value="safe">
                Safe
              </option>

            </select>

          </div>

        </div>


        {loading ? (

          <div className="expiryLoading">
            Loading medicines...
          </div>

        ) : filteredMedicines.length === 0 ? (

          <div className="expiryEmpty">

            <FaCheckCircle />

            <h3>
              No medicines found
            </h3>

            <p>
              Try changing your search or filter.
            </p>

          </div>

        ) : (

          <div className="expiryTableWrapper">

            <table className="expiryTable">

              <thead>

                <tr>
                  <th>
                    Medicine
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Batch
                  </th>

                  <th>
                    Expiry Date
                  </th>

                  <th>
                    Days Remaining
                  </th>

                  <th>
                    Status
                  </th>
                </tr>

              </thead>


              <tbody>

                {filteredMedicines.map(
                  (medicine) => {

                    const days =
                      getDaysRemaining(
                        medicine.expiry
                      );

                    const status =
                      getExpiryStatus(
                        medicine.expiry
                      );

                    return (

                      <tr
                        key={medicine._id}
                      >

                        <td>
                          <strong>
                            💊 {medicine.name}
                          </strong>
                        </td>


                        <td>
                          {medicine.category}
                        </td>


                        <td>
                          {medicine.batch}
                        </td>


                        <td>
                          {formatDate(
                            medicine.expiry
                          )}
                        </td>


                        <td>

                          <span
                            className={
                              `daysRemaining ${status}`
                            }
                          >

                            {days < 0
                              ? `${Math.abs(days)} days ago`
                              : `${days} days`}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              `expiryStatus ${status}`
                            }
                          >

                            {status === "expired"
                              ? "Expired"
                              : status === "soon"
                              ? "Expiring Soon"
                              : status === "warning"
                              ? "Upcoming"
                              : "Safe"}

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}