import { useEffect, useMemo, useState } from "react";
import {
  FaCapsules,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBoxes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLayerGroup,
  FaTimes,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
} from "../../services/medicineService";

import "./Medicines.css";

const emptyForm = {
  name: "",
  category: "",
  salt: "",
  manufacturer: "",
  disease: "",
  possibleSideEffects: "",
  unitPrice: "",
  stock: "",
  reorderLevel: "",
  tabletsPerStrip: "",
  stripsPerBox: "",
};

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [medicineResponse, statsResponse] = await Promise.all([
        getMedicines(),
        getMedicineStats(),
      ]);

      const medicineData = Array.isArray(medicineResponse?.data)
        ? medicineResponse.data
        : medicineResponse?.data?.medicines || [];

      setMedicines(medicineData);

      const statsData = statsResponse?.data || {};

      setStats({
        totalMedicines:
          statsData.totalMedicines ??
          statsData.total ??
          medicineData.length,

        totalStock:
          statsData.totalStock ??
          medicineData.reduce(
            (sum, medicine) => sum + Number(medicine.stock || 0),
            0
          ),

        lowStock:
          statsData.lowStock ??
          medicineData.filter(
            (medicine) =>
              Number(medicine.stock || 0) > 0 &&
              Number(medicine.stock || 0) <=
                Number(medicine.reorderLevel || 0)
          ).length,

        outOfStock:
          statsData.outOfStock ??
          medicineData.filter(
            (medicine) => Number(medicine.stock || 0) <= 0
          ).length,
      });
    } catch (err) {
      console.error("Medicine loading error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load medicines from the database."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        medicines
          .map((medicine) => medicine.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...unique];
  }, [medicines]);

  const getStockStatus = (medicine) => {
    const stock = Number(medicine.stock || 0);
    const reorder = Number(medicine.reorderLevel || 0);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "out",
        icon: <FaExclamationTriangle />,
      };
    }

    if (stock <= reorder) {
      return {
        label: "Low Stock",
        className: "low",
        icon: <FaExclamationTriangle />,
      };
    }

    return {
      label: "In Stock",
      className: "good",
      icon: <FaCheckCircle />,
    };
  };

  const filteredMedicines = useMemo(() => {
    const value = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !value ||
        medicine.name?.toLowerCase().includes(value) ||
        medicine.salt?.toLowerCase().includes(value) ||
        medicine.manufacturer?.toLowerCase().includes(value) ||
        medicine.disease?.toLowerCase().includes(value);

      const matchesCategory =
        category === "All" ||
        medicine.category?.toLowerCase() === category.toLowerCase();

      const stock = Number(medicine.stock || 0);
      const reorder = Number(medicine.reorderLevel || 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && stock > reorder) ||
        (stockFilter === "Low Stock" &&
          stock > 0 &&
          stock <= reorder) ||
        (stockFilter === "Out of Stock" && stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [medicines, search, category, stockFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedicines.length / itemsPerPage)
  );

  const visibleMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingId(medicine._id);

    setForm({
      name: medicine.name || "",
      category: medicine.category || "",
      salt: medicine.salt || "",
      manufacturer: medicine.manufacturer || "",
      disease: medicine.disease || "",
      possibleSideEffects: medicine.possibleSideEffects || "",
      unitPrice: medicine.unitPrice ?? "",
      stock: medicine.stock ?? "",
      reorderLevel: medicine.reorderLevel ?? "",
      tabletsPerStrip: medicine.tabletsPerStrip ?? "",
      stripsPerBox: medicine.stripsPerBox ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Medicine name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        unitPrice:
          form.unitPrice === "" ? 0 : Number(form.unitPrice),
        stock:
          form.stock === "" ? 0 : Number(form.stock),
        reorderLevel:
          form.reorderLevel === "" ? 0 : Number(form.reorderLevel),
        tabletsPerStrip:
          form.tabletsPerStrip === ""
            ? 0
            : Number(form.tabletsPerStrip),
        stripsPerBox:
          form.stripsPerBox === ""
            ? 0
            : Number(form.stripsPerBox),
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
      } else {
        await addMedicine(payload);
      }

      closeModal();
      await loadData();
    } catch (err) {
      console.error("Medicine save error:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to save medicine."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine) => {
    const confirmed = window.confirm(
      `Delete "${medicine.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteMedicine(medicine._id);
      await loadData();
    } catch (err) {
      console.error("Medicine delete error:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to delete medicine."
      );
    }
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="medicinesPage">
      {/* HEADER */}
      <div className="medicinesHeader">
        <div className="medicinesHeading">
          <div className="pageIcon">
            <FaCapsules />
          </div>

          <div>
            <h1>Medicine Inventory</h1>
            <p>
              Manage medicines, stock levels and inventory information
            </p>
          </div>
        </div>

        <button className="addMedicineBtn" onClick={openAddModal}>
          <FaPlus />
          Add Medicine
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="medicineError">
          <FaExclamationTriangle />
          <span>{error}</span>

          <button onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="medicineStats">
        <div className="medicineStatCard">
          <div className="statIcon blue">
            <FaCapsules />
          </div>

          <div>
            <span>Total Medicines</span>
            <strong>{stats.totalMedicines}</strong>
            <small>Active medicine types</small>
          </div>
        </div>

        <div className="medicineStatCard">
          <div className="statIcon purple">
            <FaBoxes />
          </div>

          <div>
            <span>Total Stock</span>
            <strong>
              {Number(stats.totalStock || 0).toLocaleString("en-IN")}
            </strong>
            <small>Available units</small>
          </div>
        </div>

        <div className="medicineStatCard">
          <div className="statIcon orange">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{stats.lowStock}</strong>
            <small>Need attention</small>
          </div>
        </div>

        <div className="medicineStatCard">
          <div className="statIcon red">
            <FaLayerGroup />
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{stats.outOfStock}</strong>
            <small>Unavailable medicines</small>
          </div>
        </div>
      </div>

      {/* INVENTORY CARD */}
      <div className="inventoryCard">
        <div className="inventoryTop">
          <div>
            <h2>Medicine List</h2>
            <p>
              {filteredMedicines.length} medicine
              {filteredMedicines.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="inventoryCount">
            <FaCapsules />
            {medicines.length} total
          </div>
        </div>

        {/* FILTERS */}
        <div className="medicineFilters">
          <div className="medicineSearch">
            <FaSearch />

            <input
              type="text"
              placeholder="Search medicine, salt, manufacturer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                className="clearSearch"
                onClick={() => setSearch("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All Categories"
                  : item}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value)
            }
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="medicineTableWrapper">
          {loading ? (
            <div className="medicineLoading">
              <div className="loadingSpinner"></div>
              <p>Loading medicines...</p>
            </div>
          ) : visibleMedicines.length === 0 ? (
            <div className="medicineEmpty">
              <div className="emptyIcon">
                <FaCapsules />
              </div>

              <h3>No medicines found</h3>

              <p>
                Try changing your search or filters,
                or add a new medicine.
              </p>

              <button
                className="emptyAddBtn"
                onClick={openAddModal}
              >
                <FaPlus />
                Add Medicine
              </button>
            </div>
          ) : (
            <table className="medicineTable">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="actionHeader">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleMedicines.map((medicine) => {
                  const status = getStockStatus(medicine);

                  return (
                    <tr key={medicine._id}>
                      <td>
                        <div className="medicineNameCell">
                          <div className="medicineAvatar">
                            <FaCapsules />
                          </div>

                          <div>
                            <strong>{medicine.name}</strong>

                            <span>
                              {medicine.salt ||
                                "Salt information unavailable"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="categoryBadge">
                          {medicine.category || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="manufacturer">
                          {medicine.manufacturer || "—"}
                        </span>
                      </td>

                      <td>
                        <strong className="medicinePrice">
                          {formatCurrency(medicine.unitPrice)}
                        </strong>
                      </td>

                      <td>
                        <div className="stockCell">
                          <strong>
                            {Number(
                              medicine.stock || 0
                            ).toLocaleString("en-IN")}
                          </strong>

                          <span>
                            Reorder:{" "}
                            {Number(
                              medicine.reorderLevel || 0
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`stockBadge ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="medicineActions">
                          <button
                            className="actionBtn edit"
                            title="Edit medicine"
                            onClick={() =>
                              openEditModal(medicine)
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="actionBtn delete"
                            title="Delete medicine"
                            onClick={() =>
                              handleDelete(medicine)
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && filteredMedicines.length > 0 && (
          <div className="medicinePagination">
            <span>
              Showing{" "}
              <strong>
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredMedicines.length
                )}
              </strong>{" "}
              of{" "}
              <strong>{filteredMedicines.length}</strong>
            </span>

            <div className="paginationButtons">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                <FaChevronLeft />
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 1)
                )
                .map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="medicineModalOverlay">
          <div className="medicineModal">
            <div className="modalHeader">
              <div>
                <div className="modalTitleIcon">
                  <FaCapsules />
                </div>

                <div>
                  <h2>
                    {editingId
                      ? "Edit Medicine"
                      : "Add New Medicine"}
                  </h2>

                  <p>
                    {editingId
                      ? "Update medicine inventory information"
                      : "Enter medicine details to add it to inventory"}
                  </p>
                </div>
              </div>

              <button
                className="modalClose"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="medicineForm"
              onSubmit={handleSubmit}
            >
              <div className="formSection">
                <h3>Basic Information</h3>

                <div className="formGrid">
                  <div className="formGroup full">
                    <label>
                      Medicine Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Paracetamol"
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label>Category</label>

                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g. Tablet"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Salt / Composition</label>

                    <input
                      name="salt"
                      value={form.salt}
                      onChange={handleChange}
                      placeholder="e.g. Paracetamol 500mg"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Manufacturer</label>

                    <input
                      name="manufacturer"
                      value={form.manufacturer}
                      onChange={handleChange}
                      placeholder="Manufacturer name"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Used For / Disease</label>

                    <input
                      name="disease"
                      value={form.disease}
                      onChange={handleChange}
                      placeholder="e.g. Fever"
                    />
                  </div>

                  <div className="formGroup full">
                    <label>
                      Possible Side Effects
                    </label>

                    <input
                      name="possibleSideEffects"
                      value={form.possibleSideEffects}
                      onChange={handleChange}
                      placeholder="e.g. Nausea, dizziness"
                    />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h3>Inventory & Pricing</h3>

                <div className="formGrid">
                  <div className="formGroup">
                    <label>Unit Price (₹)</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="unitPrice"
                      value={form.unitPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Current Stock</label>

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Reorder Level</label>

                    <input
                      type="number"
                      min="0"
                      name="reorderLevel"
                      value={form.reorderLevel}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Tablets / Strip</label>

                    <input
                      type="number"
                      min="0"
                      name="tabletsPerStrip"
                      value={form.tabletsPerStrip}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Strips / Box</label>

                    <input
                      type="number"
                      min="0"
                      name="stripsPerBox"
                      value={form.stripsPerBox}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modalFooter">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="saveMedicineBtn"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaSave />
                      {editingId
                        ? "Update Medicine"
                        : "Add Medicine"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}