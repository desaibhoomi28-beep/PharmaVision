import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaTruck,
  FaSearch,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import AddSupplierModal from "./AddSupplierModal";
import "./Suppliers.css";

const API_URL = "http://localhost:5000/api/suppliers";

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================
  // FETCH SUPPLIERS
  // =========================

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      const data = await response.json();

      if (data.success) {
        setSuppliers(data.suppliers);
        setFilteredSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // =========================
  // SEARCH + FILTER
  // =========================

  useEffect(() => {
    let result = [...suppliers];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((supplier) =>
        supplier.name?.toLowerCase().includes(query) ||
        supplier.company?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (supplier) => supplier.status === statusFilter
      );
    }

    setFilteredSuppliers(result);
  }, [search, statusFilter, suppliers]);

  // =========================
  // DELETE SUPPLIER
  // =========================

  const deleteSupplier = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Supplier deleted successfully");

        fetchSuppliers();

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error(error);

      setMessage("Unable to delete supplier");
    }
  };

  // =========================
  // VIEW SUPPLIER
  // =========================

  const viewSupplier = (supplier) => {
    alert(
      `Supplier Details\n\n` +
      `Name: ${supplier.name}\n` +
      `Company: ${supplier.company}\n` +
      `Email: ${supplier.email}\n` +
      `Phone: ${supplier.phone}\n` +
      `Address: ${supplier.address}\n` +
      `Medicines Supplied: ${supplier.medicinesSupplied}`
    );
  };

  // =========================
  // EDIT SUPPLIER
  // =========================

  const editSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  // =========================
  // STATISTICS
  // =========================

  const totalSuppliers = suppliers.length;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const inactiveSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Inactive"
  ).length;

  return (
    <>
      {/* ================= HEADER ================= */}

      <div className="supplierHeader">

        <div>
          <div className="supplierPageBadge">
            <FaTruck />
            SUPPLY NETWORK
          </div>

          <h1>
            Supplier Management
          </h1>

          <p>
            Manage your pharmaceutical suppliers and
            supply network in one place.
          </p>
        </div>

        <button
          className="addSupplierBtn"
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
        >
          <span>+</span>
          Add Supplier
        </button>

      </div>


      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="supplierMessage">
          <FaCheckCircle />
          {message}
        </div>
      )}


      {/* ================= STATS ================= */}

      <div className="supplierStatsGrid">

        <div className="supplierStatCard">

          <div className="supplierStatIcon totalIcon">
            <FaUsers />
          </div>

          <div>
            <span>Total Suppliers</span>

            <strong>
              {totalSuppliers}
            </strong>
          </div>

        </div>


        <div className="supplierStatCard">

          <div className="supplierStatIcon activeIcon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Active Suppliers</span>

            <strong>
              {activeSuppliers}
            </strong>
          </div>

        </div>


        <div className="supplierStatCard">

          <div className="supplierStatIcon inactiveIcon">
            <FaTimesCircle />
          </div>

          <div>
            <span>Inactive Suppliers</span>

            <strong>
              {inactiveSuppliers}
            </strong>
          </div>

        </div>

      </div>


      {/* ================= TABLE CARD ================= */}

      <div className="supplierTableCard">

        {/* FILTERS */}

        <div className="supplierToolbar">

          <div className="supplierSearch">

            <FaSearch />

            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>


        {/* TABLE */}

        <div className="supplierTableWrapper">

          <table className="supplierTable">

            <thead>

              <tr>
                <th>Supplier</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Medicines</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="supplierEmpty"
                  >
                    Loading suppliers...
                  </td>

                </tr>

              ) : filteredSuppliers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="supplierEmpty"
                  >
                    <FaTruck />

                    <strong>
                      No suppliers found
                    </strong>

                    <span>
                      Add your first supplier to begin.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredSuppliers.map(
                  (supplier) => (

                    <tr
                      key={supplier._id}
                    >

                      <td>

                        <div className="supplierName">

                          <div className="supplierAvatar">
                            {supplier.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {supplier.name}
                            </strong>

                            <small>
                              {supplier.address}
                            </small>

                          </div>

                        </div>

                      </td>


                      <td>
                        {supplier.company}
                      </td>


                      <td>

                        <div className="supplierContact">

                          <strong>
                            {supplier.email}
                          </strong>

                          <small>
                            {supplier.phone}
                          </small>

                        </div>

                      </td>


                      <td>

                        <span className="medicineCount">

                          {supplier.medicinesSupplied}

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            supplier.status === "Active"
                              ? "supplierStatus active"
                              : "supplierStatus inactive"
                          }
                        >

                          <span></span>

                          {supplier.status}

                        </span>

                      </td>


                      <td>

                        <div className="supplierActions">

                          <button
                            className="supplierAction view"
                            onClick={() =>
                              viewSupplier(supplier)
                            }
                          >
                            <FaEye />
                          </button>


                          <button
                            className="supplierAction edit"
                            onClick={() =>
                              editSupplier(supplier)
                            }
                          >
                            <FaEdit />
                          </button>


                          <button
                            className="supplierAction delete"
                            onClick={() =>
                              deleteSupplier(
                                supplier._id
                              )
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================= MODAL ================= */}

      {showModal && (

        <AddSupplierModal
          closeModal={closeModal}
          supplier={editingSupplier}
          refreshSuppliers={fetchSuppliers}
        />

      )}

    </>
  );
}