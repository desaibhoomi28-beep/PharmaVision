import { useMemo, useState } from "react";

import {
  FaExchangeAlt,
  FaWarehouse,
  FaMapMarkerAlt,
  FaBoxes,
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaSearch,
  FaCapsules,
  FaArrowRight,
  FaTimes,
  FaShippingFast,
} from "react-icons/fa";

import "./Redistribution.css";


const franchiseData = [
  {
    id: 1,
    name: "Andheri Franchise",
    location: "Andheri West",
    stock: 4820,
    medicines: 142,
    status: "Healthy",
  },
  {
    id: 2,
    name: "Bandra Franchise",
    location: "Bandra West",
    stock: 3960,
    medicines: 128,
    status: "Healthy",
  },
  {
    id: 3,
    name: "Thane Franchise",
    location: "Thane",
    stock: 2680,
    medicines: 104,
    status: "Low",
  },
  {
    id: 4,
    name: "Powai Franchise",
    location: "Powai",
    stock: 4210,
    medicines: 136,
    status: "Healthy",
  },
];


const medicineData = [
  {
    name: "Paracetamol 500mg",
    stock: 1250,
  },
  {
    name: "Montelukast 10mg",
    stock: 820,
  },
  {
    name: "Amlodipine 5mg",
    stock: 640,
  },
  {
    name: "Azithromycin 500mg",
    stock: 530,
  },
  {
    name: "Metformin 500mg",
    stock: 920,
  },
  {
    name: "Cetirizine 10mg",
    stock: 760,
  },
  {
    name: "Amoxicillin 500mg",
    stock: 410,
  },
  {
    name: "Omeprazole 20mg",
    stock: 680,
  },
];


const initialTransfers = [
  {
    id: "TRF-001",
    medicine: "Paracetamol 500mg",
    quantity: 250,
    destination: "Andheri Franchise",
    date: "07 Sep 2026",
    status: "Received",
  },
  {
    id: "TRF-002",
    medicine: "Amlodipine 5mg",
    quantity: 120,
    destination: "Bandra Franchise",
    date: "07 Sep 2026",
    status: "In Transit",
  },
  {
    id: "TRF-003",
    medicine: "Montelukast 10mg",
    quantity: 180,
    destination: "Thane Franchise",
    date: "06 Sep 2026",
    status: "Pending",
  },
  {
    id: "TRF-004",
    medicine: "Azithromycin 500mg",
    quantity: 90,
    destination: "Powai Franchise",
    date: "05 Sep 2026",
    status: "Received",
  },
];


export default function Redistribution() {

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


  const selectedMedicine =
    medicineData.find(
      (item) =>
        item.name === medicine
    );


  const filteredTransfers =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return transfers;
      }

      return transfers.filter(
        (item) =>
          item.id
            .toLowerCase()
            .includes(value) ||
          item.medicine
            .toLowerCase()
            .includes(value) ||
          item.destination
            .toLowerCase()
            .includes(value) ||
          item.status
            .toLowerCase()
            .includes(value)
      );

    }, [transfers, search]);


  const pendingTransfers =
    transfers.filter(
      (item) =>
        item.status === "Pending"
    ).length;


  const inTransitTransfers =
    transfers.filter(
      (item) =>
        item.status === "In Transit"
    ).length;


  const distributedUnits =
    transfers.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );


  const createTransfer = () => {

    if (
      !medicine ||
      !destination ||
      !quantity
    ) {
      alert(
        "Please select medicine, franchise and quantity."
      );

      return;
    }


    const amount =
      Number(quantity);


    if (
      amount <= 0
    ) {
      alert(
        "Quantity must be greater than zero."
      );

      return;
    }


    if (
      selectedMedicine &&
      amount >
        selectedMedicine.stock
    ) {
      alert(
        `Only ${selectedMedicine.stock} units are currently available.`
      );

      return;
    }


    const newTransfer = {

      id:
        `TRF-${String(
          transfers.length + 5
        ).padStart(3, "0")}`,

      medicine,

      quantity:
        amount,

      destination,

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


    setTransfers(
      [
        newTransfer,
        ...transfers,
      ]
    );


    setMedicine("");
    setDestination("");
    setQuantity("");
    setNotes("");

    setShowModal(false);

  };


  const getStatusIcon =
    (status) => {

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

    <div className="redistributionPage">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="redistributionHeader">

        <div className="redistributionTitle">

          <div className="redistributionIcon">
            <FaExchangeAlt />
          </div>

          <div>

            <span className="pageEyebrow">
              PHARMAVISION OPERATIONS
            </span>

            <h1>
              Franchise Redistribution
            </h1>

            <p>
              Distribute medicines from the central
              pharmacy to franchise locations and
              monitor stock movement.
            </p>

          </div>

        </div>


        <button
          className="newTransferButton"
          onClick={() =>
            setShowModal(true)
          }
        >
          <FaPlus />
          New Redistribution
        </button>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="redistributionStats">

        <div className="redistributionStat">

          <div className="statIcon purple">
            <FaWarehouse />
          </div>

          <div>

            <span>
              Franchise Locations
            </span>

            <strong>
              {franchiseData.length}
            </strong>

            <small>
              Active locations
            </small>

          </div>

        </div>


        <div className="redistributionStat">

          <div className="statIcon orange">
            <FaClock />
          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              {pendingTransfers}
            </strong>

            <small>
              Awaiting dispatch
            </small>

          </div>

        </div>


        <div className="redistributionStat">

          <div className="statIcon blue">
            <FaTruck />
          </div>

          <div>

            <span>
              In Transit
            </span>

            <strong>
              {inTransitTransfers}
            </strong>

            <small>
              Currently moving
            </small>

          </div>

        </div>


        <div className="redistributionStat">

          <div className="statIcon green">
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


      {/* =====================================================
          REDISTRIBUTION FLOW
      ===================================================== */}

      <div className="redistributionTopGrid">

        <div className="transferFlowCard">

          <div className="cardHeading">

            <div>

              <span>
                STOCK REDISTRIBUTION
              </span>

              <h2>
                Move medicines to a franchise
              </h2>

            </div>

            <FaExchangeAlt />

          </div>


          <div className="flowContainer">

            <div className="flowLocation">

              <div className="flowLocationIcon source">
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


            <div className="flowLocation">

              <div className="flowLocationIcon destination">
                <FaMapMarkerAlt />
              </div>

              <div>

                <span>
                  DESTINATION
                </span>

                <strong>
                  Franchise Location
                </strong>

                <small>
                  Select destination
                </small>

              </div>

            </div>

          </div>


          <button
            className="startTransferButton"
            onClick={() =>
              setShowModal(true)
            }
          >

            <FaPlus />

            Create Stock Transfer

          </button>

        </div>


        {/* =================================================
            NETWORK STATUS
        ================================================= */}

        <div className="networkCard">

          <div className="cardHeading">

            <div>

              <span>
                FRANCHISE NETWORK
              </span>

              <h2>
                Network Stock
              </h2>

            </div>

            <FaCapsules />

          </div>


          <div className="networkList">

            {franchiseData
              .map(
                (branch) => (

                  <div
                    className="networkItem"
                    key={branch.id}
                  >

                    <div className="branchLetter">
                      {branch.name.charAt(0)}
                    </div>


                    <div className="branchDetails">

                      <strong>
                        {branch.name}
                      </strong>

                      <span>
                        {branch.location}
                      </span>

                    </div>


                    <div className="networkStock">

                      <strong>
                        {branch.stock.toLocaleString()}
                      </strong>

                      <span>
                        units
                      </span>

                    </div>

                  </div>

                )
              )}

          </div>

        </div>

      </div>


      {/* =====================================================
          RECENT TRANSFERS
      ===================================================== */}

      <div className="transferHistoryCard">

        <div className="historyHeader">

          <div>

            <span>
              DISTRIBUTION HISTORY
            </span>

            <h2>
              Recent Stock Transfers
            </h2>

            <p>
              Monitor medicines distributed to
              franchise locations.
            </p>

          </div>


          <div className="searchBox">

            <FaSearch />

            <input
              type="text"
              placeholder="Search transfers..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        <div className="tableWrapper">

          <table>

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

                      <div className="medicineName">

                        <div className="medicineSmallIcon">
                          <FaCapsules />
                        </div>

                        <strong>
                          {transfer.medicine}
                        </strong>

                      </div>

                    </td>


                    <td>

                      <strong>
                        {transfer.quantity}
                      </strong>

                      <span className="unitsText">
                        units
                      </span>

                    </td>


                    <td>

                      <div className="destinationName">

                        <FaMapMarkerAlt />

                        {transfer.destination}

                      </div>

                    </td>


                    <td>
                      {transfer.date}
                    </td>


                    <td>

                      <span
                        className={
                          `transferStatus ${
                            transfer.status
                              .toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )
                          }`
                        }
                      >

                        {getStatusIcon(
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
                    colSpan="6"
                    className="emptyState"
                  >
                    No transfers found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          FRANCHISE STOCK
      ===================================================== */}

      <div className="franchiseStockCard">

        <div className="cardHeading">

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


        <div className="franchiseGrid">

          {franchiseData.map(
            (branch) => (

              <div
                className="franchiseCard"
                key={branch.id}
              >

                <div className="franchiseCardTop">

                  <div className="franchiseAvatar">
                    {branch.name.charAt(0)}
                  </div>

                  <span
                    className={
                      `stockStatus ${
                        branch.status.toLowerCase()
                      }`
                    }
                  >
                    {branch.status}
                  </span>

                </div>


                <h3>
                  {branch.name}
                </h3>


                <p className="branchLocation">
                  <FaMapMarkerAlt />
                  {branch.location}
                </p>


                <div className="stockMetrics">

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
                      {branch.stock.toLocaleString()}
                    </strong>

                    <span>
                      Units
                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* =====================================================
          NEW REDISTRIBUTION MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="modalOverlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="transferModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modalHeader">

              <div>

                <span>
                  NEW REDISTRIBUTION
                </span>

                <h2>
                  Create Stock Transfer
                </h2>

              </div>


              <button
                className="closeModal"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>


            <div className="routePreview">

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


            <div className="formField">

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

                {medicineData.map(
                  (item) => (

                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.name}
                    </option>

                  )
                )}

              </select>

              {selectedMedicine && (

                <small className="stockHint">
                  Available central stock:
                  {" "}
                  <strong>
                    {selectedMedicine.stock}
                  </strong>
                  {" "}units
                </small>

              )}

            </div>


            <div className="formField">

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

                {franchiseData.map(
                  (branch) => (

                    <option
                      key={branch.id}
                      value={branch.name}
                    >
                      {branch.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="formField">

              <label>
                Transfer Quantity
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
                The quantity will be checked
                against central stock.
              </small>

            </div>


            <div className="formField">

              <label>
                Notes
              </label>

              <textarea
                rows="3"
                placeholder="Optional note for this transfer..."
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="modalButtons">

              <button
                className="cancelButton"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>


              <button
                className="confirmButton"
                onClick={
                  createTransfer
                }
              >

                <FaTruck />

                Create Transfer

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}