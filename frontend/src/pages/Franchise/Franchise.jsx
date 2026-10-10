import { useMemo, useState } from "react";

import {
  FaExchangeAlt,
  FaTruck,
  FaWarehouse,
  FaBoxes,
  FaSearch,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaTimes,
  FaMapMarkerAlt,
  FaCapsules,
} from "react-icons/fa";

import "./Franchise.css";


const initialTransfers = [
  {
    id: "TRF-2026-001",
    medicine: "Paracetamol 500mg",
    quantity: 250,
    from: "Central Pharmacy",
    to: "Andheri Franchise",
    requestedBy: "PharmaVision",
    date: "06 Sep 2026",
    status: "Received",
  },
  {
    id: "TRF-2026-002",
    medicine: "Amlodipine 5mg",
    quantity: 120,
    from: "Central Pharmacy",
    to: "Bandra Franchise",
    requestedBy: "PharmaVision",
    date: "07 Sep 2026",
    status: "In Transit",
  },
  {
    id: "TRF-2026-003",
    medicine: "Montelukast 10mg",
    quantity: 180,
    from: "Central Pharmacy",
    to: "Thane Franchise",
    requestedBy: "PharmaVision",
    date: "07 Sep 2026",
    status: "Pending",
  },
  {
    id: "TRF-2026-004",
    medicine: "Azithromycin 500mg",
    quantity: 90,
    from: "Central Pharmacy",
    to: "Powai Franchise",
    requestedBy: "PharmaVision",
    date: "05 Sep 2026",
    status: "Received",
  },
];


const franchiseStock = [
  {
    branch: "Andheri Franchise",
    location: "Andheri West",
    medicines: 142,
    units: 4820,
    status: "Healthy",
  },
  {
    branch: "Bandra Franchise",
    location: "Bandra West",
    medicines: 128,
    units: 3960,
    status: "Healthy",
  },
  {
    branch: "Thane Franchise",
    location: "Thane",
    medicines: 104,
    units: 2680,
    status: "Low",
  },
  {
    branch: "Powai Franchise",
    location: "Powai",
    medicines: 136,
    units: 4210,
    status: "Healthy",
  },
];


const medicines = [
  "Paracetamol 500mg",
  "Amlodipine 5mg",
  "Montelukast 10mg",
  "Azithromycin 500mg",
  "Amoxicillin 500mg",
  "Cetirizine 10mg",
  "Metformin 500mg",
  "Omeprazole 20mg",
];


const franchises = [
  "Andheri Franchise",
  "Bandra Franchise",
  "Thane Franchise",
  "Powai Franchise",
];


export default function Franchise() {

  const [transfers, setTransfers] =
    useState(initialTransfers);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [medicine, setMedicine] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [notes, setNotes] =
    useState("");


  const filteredTransfers =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return transfers;
      }

      return transfers.filter(
        (transfer) =>
          transfer.id
            .toLowerCase()
            .includes(value) ||
          transfer.medicine
            .toLowerCase()
            .includes(value) ||
          transfer.to
            .toLowerCase()
            .includes(value) ||
          transfer.status
            .toLowerCase()
            .includes(value)
      );

    }, [transfers, search]);


  const pendingCount =
    transfers.filter(
      (item) =>
        item.status === "Pending"
    ).length;


  const transitCount =
    transfers.filter(
      (item) =>
        item.status === "In Transit"
    ).length;


  const distributedUnits =
    transfers.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );


  const createTransfer = () => {

    if (
      !medicine ||
      !destination ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      alert(
        "Please select a medicine, destination and valid quantity."
      );

      return;
    }


    const newTransfer = {

      id:
        `TRF-2026-${String(
          transfers.length + 5
        ).padStart(3, "0")}`,

      medicine,

      quantity:
        Number(quantity),

      from:
        "Central Pharmacy",

      to:
        destination,

      requestedBy:
        "PharmaVision",

      date:
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      status:
        "Pending",

    };


    setTransfers([
      newTransfer,
      ...transfers,
    ]);


    setMedicine("");
    setDestination("");
    setQuantity("");
    setNotes("");

    setShowModal(false);

  };


  const statusIcon = (
    status
  ) => {

    if (
      status === "Received"
    ) {
      return <FaCheckCircle />;
    }

    if (
      status === "In Transit"
    ) {
      return <FaShippingFast />;
    }

    return <FaClock />;

  };


  return (

    <div className="franchisePage">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="franchiseHeader">

        <div className="franchiseHeading">

          <div className="franchiseHeroIcon">
            <FaExchangeAlt />
          </div>

          <div>

            <span className="franchiseEyebrow">
              PHARMAVISION OPERATIONS
            </span>

            <h1>
              Franchise Distribution
            </h1>

            <p>
              Transfer medicines between the central
              pharmacy and franchise locations while
              keeping stock movement organized.
            </p>

          </div>

        </div>


        <button
          className="createTransferButton"
          onClick={() =>
            setShowModal(true)
          }
        >
          <FaPlus />
          New Distribution
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="franchiseStats">

        <div className="franchiseStat">

          <div className="franchiseStatIcon purple">
            <FaWarehouse />
          </div>

          <div>
            <span>
              Active Franchises
            </span>

            <strong>
              {franchiseStock.length}
            </strong>

            <small>
              Connected locations
            </small>
          </div>

        </div>


        <div className="franchiseStat">

          <div className="franchiseStatIcon orange">
            <FaClock />
          </div>

          <div>
            <span>
              Pending Transfers
            </span>

            <strong>
              {pendingCount}
            </strong>

            <small>
              Awaiting dispatch
            </small>
          </div>

        </div>


        <div className="franchiseStat">

          <div className="franchiseStatIcon blue">
            <FaTruck />
          </div>

          <div>
            <span>
              In Transit
            </span>

            <strong>
              {transitCount}
            </strong>

            <small>
              Currently moving
            </small>
          </div>

        </div>


        <div className="franchiseStat">

          <div className="franchiseStatIcon green">
            <FaBoxes />
          </div>

          <div>
            <span>
              Units Distributed
            </span>

            <strong>
              {distributedUnits.toLocaleString()}
            </strong>

            <small>
              Recorded transfers
            </small>
          </div>

        </div>

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="franchiseMainGrid">


        {/* ===============================================
            DISTRIBUTION FLOW
        =============================================== */}

        <div className="distributionCard">

          <div className="sectionHeader">

            <div>

              <span>
                DISTRIBUTION WORKFLOW
              </span>

              <h2>
                Move stock to a franchise
              </h2>

            </div>

            <FaExchangeAlt />

          </div>


          <div className="distributionFlow">


            <div className="locationBox">

              <div className="locationIcon source">
                <FaWarehouse />
              </div>

              <div>
                <span>
                  SOURCE
                </span>

                <strong>
                  Central Pharmacy
                </strong>

                <small>
                  Main inventory
                </small>
              </div>

            </div>


            <div className="flowArrow">
              <FaArrowRight />
            </div>


            <div className="locationBox">

              <div className="locationIcon destination">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>
                  DESTINATION
                </span>

                <strong>
                  Franchise Branch
                </strong>

                <small>
                  Selected location
                </small>
              </div>

            </div>

          </div>


          <button
            className="distributionAction"
            onClick={() =>
              setShowModal(true)
            }
          >

            <FaPlus />

            Create Stock Distribution

          </button>

        </div>


        {/* ===============================================
            STOCK OVERVIEW
        =============================================== */}

        <div className="stockOverviewCard">

          <div className="sectionHeader">

            <div>

              <span>
                FRANCHISE NETWORK
              </span>

              <h2>
                Stock overview
              </h2>

            </div>

            <FaCapsules />

          </div>


          <div className="stockMiniList">

            {franchiseStock
              .slice(0, 3)
              .map(
                (branch) => (

                  <div
                    className="stockMiniItem"
                    key={branch.branch}
                  >

                    <div className="branchAvatar">
                      {branch.branch
                        .charAt(0)}
                    </div>


                    <div className="branchInfo">

                      <strong>
                        {branch.branch}
                      </strong>

                      <span>
                        {branch.location}
                      </span>

                    </div>


                    <div className="branchUnits">

                      <strong>
                        {branch.units.toLocaleString()}
                      </strong>

                      <span>
                        units
                      </span>

                    </div>

                  </div>

                )
              )}

          </div>


          <div className="stockFooter">

            <span>
              {franchiseStock.length} locations
              connected
            </span>

            <span className="healthyText">
              ● Network healthy
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          TRANSFER HISTORY
      ================================================= */}

      <div className="transferCard">

        <div className="transferHeader">

          <div>

            <span>
              STOCK MOVEMENT
            </span>

            <h2>
              Recent Distributions
            </h2>

            <p>
              Track medicine transfers between
              your central pharmacy and franchise
              locations.
            </p>

          </div>


          <div className="searchWrapper">

            <FaSearch />

            <input
              type="text"
              placeholder="Search transfer, medicine or branch..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        <div className="transferTableWrapper">

          <table className="transferTable">

            <thead>

              <tr>

                <th>
                  Transfer ID
                </th>

                <th>
                  Medicine
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Source
                </th>

                <th>
                  Destination
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredTransfers.map(
                (transfer) => (

                  <tr
                    key={transfer.id}
                  >

                    <td>

                      <span className="transferId">
                        {transfer.id}
                      </span>

                    </td>


                    <td>

                      <div className="medicineCell">

                        <div className="medicineIcon">
                          <FaCapsules />
                        </div>

                        <strong>
                          {transfer.medicine}
                        </strong>

                      </div>

                    </td>


                    <td>

                      <strong className="quantityValue">
                        {transfer.quantity}
                      </strong>

                      <span className="unitText">
                        units
                      </span>

                    </td>


                    <td>
                      {transfer.from}
                    </td>


                    <td>

                      <div className="destinationCell">

                        <FaMapMarkerAlt />

                        {transfer.to}

                      </div>

                    </td>


                    <td>
                      {transfer.date}
                    </td>


                    <td>

                      <span
                        className={`transferStatus ${
                          transfer.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )
                        }`}
                      >

                        {statusIcon(
                          transfer.status
                        )}

                        {transfer.status}

                      </span>

                    </td>

                  </tr>

                )
              )}


              {filteredTransfers.length ===
                0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="emptyTable"
                  >

                    No distribution records
                    found.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          FRANCHISE STOCK TABLE
      ================================================= */}

      <div className="branchStockCard">

        <div className="sectionHeader">

          <div>

            <span>
              INVENTORY NETWORK
            </span>

            <h2>
              Franchise Stock Status
            </h2>

          </div>

          <FaWarehouse />

        </div>


        <div className="branchGrid">

          {franchiseStock.map(
            (branch) => (

              <div
                className="branchCard"
                key={branch.branch}
              >

                <div className="branchCardTop">

                  <div className="largeBranchAvatar">
                    {branch.branch
                      .charAt(0)}
                  </div>


                  <span
                    className={`stockStatus ${
                      branch.status
                        .toLowerCase()
                    }`}
                  >
                    {branch.status}
                  </span>

                </div>


                <h3>
                  {branch.branch}
                </h3>


                <p>
                  <FaMapMarkerAlt />
                  {branch.location}
                </p>


                <div className="branchMetrics">

                  <div>

                    <strong>
                      {branch.medicines}
                    </strong>

                    <span>
                      Medicines
                    </span>

                  </div>


                  <div>

                    <strong>
                      {branch.units.toLocaleString()}
                    </strong>

                    <span>
                      Units
                    </span>

                  </div>

                </div>


                <button
                  className="viewBranchButton"
                  onClick={() =>
                    alert(
                      `Viewing stock for ${branch.branch}`
                    )
                  }
                >
                  View Stock
                  <FaArrowRight />
                </button>

              </div>

            )
          )}

        </div>

      </div>


      {/* =================================================
          NEW DISTRIBUTION MODAL
      ================================================= */}

      {showModal && (

        <div
          className="franchiseModalOverlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="franchiseModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modalHeader">

              <div>

                <span>
                  NEW STOCK MOVEMENT
                </span>

                <h2>
                  Create Distribution
                </h2>

              </div>


              <button
                className="modalClose"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>


            <div className="modalRoute">

              <div>
                <span>
                  FROM
                </span>

                <strong>
                  Central Pharmacy
                </strong>
              </div>

              <FaArrowRight />

              <div>
                <span>
                  TO
                </span>

                <strong>
                  Franchise
                </strong>
              </div>

            </div>


            <div className="formGroup">

              <label>
                Medicine
              </label>

              <select
                value={medicine}
                onChange={(e) =>
                  setMedicine(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select medicine
                </option>

                {medicines.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="formGroup">

              <label>
                Destination Franchise
              </label>

              <select
                value={destination}
                onChange={(e) =>
                  setDestination(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select franchise
                </option>

                {franchises.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="formGroup">

              <label>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />

              <small>
                Quantity will be checked against
                available central stock.
              </small>

            </div>


            <div className="formGroup">

              <label>
                Distribution Notes
              </label>

              <textarea
                placeholder="Optional note for the receiving franchise..."
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows="3"
              />

            </div>


            <div className="modalActions">

              <button
                className="cancelButton"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>


              <button
                className="submitTransferButton"
                onClick={
                  createTransfer
                }
              >

                <FaTruck />

                Create Distribution

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}