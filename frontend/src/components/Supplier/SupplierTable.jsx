import { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTruck,
  FaBuilding,
  FaBoxOpen,
} from "react-icons/fa";

import SupplierModal from "./SupplierModal";
import "./Supplier.css";

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);

  // ===============================
  // FETCH SUPPLIERS
  // ===============================

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/suppliers"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch suppliers"
        );
      }

      setSuppliers(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to supplier backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ===============================
  // DELETE SUPPLIER
  // ===============================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete supplier"
        );
      }

      setSuppliers((prev) =>
        prev.filter(
          (supplier) => supplier._id !== id
        )
      );

      alert("Supplier deleted successfully");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ===============================
  // EDIT SUPPLIER
  // ===============================

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  // ===============================
  // MODAL CLOSE
  // ===============================

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  // ===============================
  // FILTER SUPPLIERS
  // ===============================

  const filteredSuppliers = suppliers.filter(
    (supplier) => {
      const searchText =
        search.toLowerCase();

      return (
        supplier.name
          ?.toLowerCase()
          .includes(searchText) ||
        supplier.company
          ?.toLowerCase()
          .includes(searchText) ||
        supplier.email
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // ===============================
  // STATISTICS
  // ===============================

  const activeSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier.status === "Active"
    ).length;

  const totalMedicines =
    suppliers.reduce(
      (total, supplier) =>
        total +
        Number(
          supplier.medicinesSupplied || 0
        ),
      0
    );

  return (
    <div className="supplierPage">

      {/* ================= HEADER ================= */}

      <div className="supplierHeader">

        <div>

          <div className="supplierBadge">

            <FaTruck />

            SUPPLY NETWORK

          </div>

          <h1>
            Supplier Management
          </h1>

          <p>
            Manage pharmaceutical suppliers and
            maintain your supply network.
          </p>

        </div>


        <button
          className="addSupplierBtn"
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
        >

          <FaPlus />

          Add Supplier

        </button>

      </div>


      {/* ================= STATS ================= */}

      <div className="supplierStats">

        <div className="supplierStatCard">

          <div className="supplierStatIcon">

            <FaTruck />

          </div>

          <div>

            <span>
              Total Suppliers
            </span>

            <strong>
              {suppliers.length}
            </strong>

          </div>

        </div>


        <div className="supplierStatCard">

          <div className="supplierStatIcon">

            <FaBuilding />

          </div>

          <div>

            <span>
              Active Suppliers
            </span>

            <strong>
              {activeSuppliers}
            </strong>

          </div>

        </div>


        <div className="supplierStatCard">

          <div className="supplierStatIcon">

            <FaBoxOpen />

          </div>

          <div>

            <span>
              Medicines Supplied
            </span>

            <strong>
              {totalMedicines}
            </strong>

          </div>

        </div>

      </div>


      {/* ================= TOOLBAR ================= */}

      <div className="supplierToolbar">

        <div className="supplierSearch">

          <FaSearch />

          <input
            type="text"
            placeholder="Search supplier, company or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <div className="supplierCount">

          {filteredSuppliers.length} Supplier
          {filteredSuppliers.length !== 1
            ? "s"
            : ""}

        </div>

      </div>


      {/* ================= TABLE ================= */}

      <div className="supplierTableCard">

        {loading ? (

          <div className="supplierLoading">
            Loading suppliers...
          </div>

        ) : filteredSuppliers.length === 0 ? (

          <div className="emptySupplier">

            <FaTruck />

            <h3>
              No Suppliers Found
            </h3>

            <p>
              Add your first supplier to begin
              managing your supply network.
            </p>

          </div>

        ) : (

          <div className="supplierTableWrapper">

            <table className="supplierTable">

              <thead>

                <tr>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Medicines
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredSuppliers.map(
                  (supplier) => (

                    <tr
                      key={supplier._id}
                    >

                      <td>

                        <div className="supplierPerson">

                          <div className="supplierAvatar">

                            {supplier.name
                              ?.charAt(0)
                              .toUpperCase()}

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

                        <strong>
                          {supplier.company}
                        </strong>

                      </td>


                      <td>

                        <div className="contactInfo">

                          <span>
                            {supplier.email}
                          </span>

                          <small>
                            {supplier.phone}
                          </small>

                        </div>

                      </td>


                      <td>

                        <span className="medicineCount">

                          {
                            supplier.medicinesSupplied ||
                            0
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            supplier.status ===
                            "Active"
                              ? "supplierStatus active"
                              : "supplierStatus inactive"
                          }
                        >

                          {supplier.status}

                        </span>

                      </td>


                      <td>

                        <div className="supplierActions">

                          <button
                            className="supplierEdit"
                            title="Edit Supplier"
                            onClick={() =>
                              handleEdit(supplier)
                            }
                          >

                            <FaEdit />

                          </button>


                          <button
                            className="supplierDelete"
                            title="Delete Supplier"
                            onClick={() =>
                              handleDelete(
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
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= MODAL ================= */}

      {showModal && (

        <SupplierModal

          closeModal={closeModal}

          editingSupplier={
            editingSupplier
          }

          refreshSuppliers={
            fetchSuppliers
          }

        />

      )}

    </div>
  );
}