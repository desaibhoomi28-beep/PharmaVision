import { useEffect, useState } from "react";
import {
  FaSearch,
  FaCapsules,
  FaStethoscope,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaChartLine,
  FaBookMedical,
  FaArrowLeft,
} from "react-icons/fa";

import "./MedicalInstructor.css";


const API_URL =
  "http://localhost:5000";


function MedicalInstructor() {

  const [search, setSearch] =
    useState("");

  const [medicines, setMedicines] =
    useState([]);

  const [selectedMedicine, setSelectedMedicine] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchPerformed, setSearchPerformed] =
    useState(false);


  // ==========================================================
  // LOAD MEDICINES
  // ==========================================================

  useEffect(() => {

    const loadMedicines =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/medical-instructor/medicines`
            );


          const data =
            await response.json();


          if (!response.ok) {
            throw new Error(
              data.message ||
              "Failed to load medicines"
            );
          }


          setMedicines(
            data.medicines || []
          );

        } catch (error) {

          console.error(error);

          setError(
            error.message ||
            "Failed to load medicine information"
          );

        } finally {

          setLoading(false);

        }
      };


    loadMedicines();

  }, []);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch =
    async (event) => {

      event.preventDefault();

      const query =
        search.trim();


      if (!query) {
        setSearchPerformed(false);
        return;
      }


      try {

        setLoading(true);
        setError("");
        setSelectedMedicine(null);
        setSearchPerformed(true);


        const response =
          await fetch(
            `${API_URL}/api/medical-instructor/search?q=${encodeURIComponent(
              query
            )}`
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.message ||
            "Search failed"
          );
        }


        setMedicines(
          data.medicines || []
        );

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Search failed"
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // SELECT MEDICINE
  // ==========================================================

  const handleSelectMedicine =
    async (medicineName) => {

      try {

        setDetailsLoading(true);
        setError("");


        const response =
          await fetch(
            `${API_URL}/api/medical-instructor/medicine/${encodeURIComponent(
              medicineName
            )}`
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load medicine details"
          );
        }


        setSelectedMedicine(
          data.medicine
        );

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Failed to load medicine details"
        );

      } finally {

        setDetailsLoading(false);

      }
    };


  // ==========================================================
  // BACK TO LIST
  // ==========================================================

  const handleBack =
    () => {

      setSelectedMedicine(null);
      setError("");

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="medicalInstructorPage">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="medicalInstructorHeader">

        <div className="medicalInstructorTitle">

          <div className="medicalInstructorIcon">
            <FaBookMedical />
          </div>

          <div>

            <span className="medicalEyebrow">
              PHARMAVISION KNOWLEDGE CENTER
            </span>

            <h1>
              Medical Instructor
            </h1>

            <p>
              Explore medicine information,
              associated conditions,
              possible side effects and
              medicine usage statistics.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <form
        className="medicalSearchBox"
        onSubmit={handleSearch}
      >

        <div className="medicalSearchInput">

          <FaSearch />

          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <button type="submit">
          Search
        </button>

      </form>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="medicalError">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}


      {/* =====================================================
          DETAILS VIEW
      ====================================================== */}

      {selectedMedicine ? (

        <div className="medicalDetails">

          <button
            className="backMedicineBtn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Back to medicines
          </button>


          {detailsLoading ? (

            <div className="medicalLoading">
              Loading medicine information...
            </div>

          ) : (

            <>

              {/* Main information */}

              <div className="medicineHeroCard">

                <div className="medicineHeroIcon">
                  <FaCapsules />
                </div>

                <div>

                  <span>
                    MEDICINE INFORMATION
                  </span>

                  <h2>
                    {selectedMedicine.medicineName}
                  </h2>

                  <p>
                    {selectedMedicine.category}
                  </p>

                </div>

              </div>


              {/* Information cards */}

              <div className="medicalInfoGrid">

                <div className="medicalInfoCard">

                  <div className="infoCardIcon">
                    <FaStethoscope />
                  </div>

                  <div>

                    <h3>
                      Associated Conditions
                    </h3>

                    {selectedMedicine.diseases?.length >
                    0 ? (

                      <ul>
                        {selectedMedicine.diseases.map(
                          (disease, index) => (
                            <li key={index}>
                              {disease}
                            </li>
                          )
                        )}
                      </ul>

                    ) : (

                      <p>
                        Information not available
                      </p>

                    )}

                  </div>

                </div>


                <div className="medicalInfoCard warning">

                  <div className="infoCardIcon">
                    <FaExclamationTriangle />
                  </div>

                  <div>

                    <h3>
                      Possible Side Effects
                    </h3>

                    {selectedMedicine.sideEffects?.length >
                    0 ? (

                      <ul>
                        {selectedMedicine.sideEffects.map(
                          (effect, index) => (
                            <li key={index}>
                              {effect}
                            </li>
                          )
                        )}
                      </ul>

                    ) : (

                      <p>
                        Information not available
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* Statistics */}

              <div className="medicalStats">

                <div className="medicalStatCard">

                  <div className="statIcon">
                    <FaMoneyBillWave />
                  </div>

                  <div>

                    <span>
                      Average Unit Price
                    </span>

                    <strong>
                      ₹
                      {selectedMedicine.averageUnitPrice}
                    </strong>

                  </div>

                </div>


                <div className="medicalStatCard">

                  <div className="statIcon">
                    <FaChartLine />
                  </div>

                  <div>

                    <span>
                      Average Daily Usage
                    </span>

                    <strong>
                      {selectedMedicine.averageDailyUsage}
                    </strong>

                  </div>

                </div>


                <div className="medicalStatCard">

                  <div className="statIcon">
                    <FaCapsules />
                  </div>

                  <div>

                    <span>
                      Latest Stock
                    </span>

                    <strong>
                      {selectedMedicine.latestStockAfter}
                    </strong>

                  </div>

                </div>


                <div className="medicalStatCard">

                  <div className="statIcon">
                    <FaBookMedical />
                  </div>

                  <div>

                    <span>
                      Dataset Records
                    </span>

                    <strong>
                      {selectedMedicine.dataRecords}
                    </strong>

                  </div>

                </div>

              </div>


              {/* Usage information */}

              <div className="medicalUsageCard">

                <div className="sectionTitle">

                  <div>
                    <FaChartLine />
                  </div>

                  <div>

                    <h3>
                      Medicine Usage Overview
                    </h3>

                    <p>
                      Statistics derived from
                      the PharmaVision medicine
                      dataset.
                    </p>

                  </div>

                </div>


                <div className="usageGrid">

                  <div>
                    <span>
                      Total Usage
                    </span>

                    <strong>
                      {selectedMedicine.totalUsage}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Average Prescription Count
                    </span>

                    <strong>
                      {selectedMedicine.averagePrescriptionCount}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Latest Stock Before Usage
                    </span>

                    <strong>
                      {selectedMedicine.latestStockBefore}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Latest Stock After Usage
                    </span>

                    <strong>
                      {selectedMedicine.latestStockAfter}
                    </strong>
                  </div>

                </div>

              </div>


              {/* Data source */}

              <div className="medicalSourceCard">

                <FaBookMedical />

                <div>

                  <strong>
                    Information Source
                  </strong>

                  <p>
                    The information displayed
                    here is retrieved from the
                    PharmaVision medicine dataset.
                    It is intended for medicine
                    information and educational
                    support.
                  </p>

                </div>

              </div>

            </>

          )}

        </div>

      ) : (

        /* ==================================================
           MEDICINE LIST
        =================================================== */

        <div className="medicineKnowledgeSection">

          <div className="medicineSectionHeader">

            <div>

              <span>
                {searchPerformed
                  ? "SEARCH RESULTS"
                  : "MEDICINE KNOWLEDGE BASE"}
              </span>

              <h2>
                {searchPerformed
                  ? `${medicines.length} medicines found`
                  : "Explore Medicines"}
              </h2>

            </div>

            {!searchPerformed && (
              <span className="medicineCount">
                {medicines.length} medicines
              </span>
            )}

          </div>


          {loading ? (

            <div className="medicalLoading">
              Loading medicine information...
            </div>

          ) : medicines.length === 0 ? (

            <div className="medicalEmpty">

              <FaCapsules />

              <h3>
                No medicines found
              </h3>

              <p>
                Try another medicine name.
              </p>

            </div>

          ) : (

            <div className="medicineCards">

              {medicines.map(
                (medicine) => (

                  <button
                    className="medicineKnowledgeCard"
                    key={medicine}
                    onClick={() =>
                      handleSelectMedicine(
                        medicine
                      )
                    }
                  >

                    <div className="medicineCardIcon">
                      <FaCapsules />
                    </div>

                    <div className="medicineCardContent">

                      <h3>
                        {medicine}
                      </h3>

                      <p>
                        View medicine
                        information
                      </p>

                    </div>

                    <span className="viewArrow">
                      →
                    </span>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
}


export default MedicalInstructor;