import { useState, useEffect } from "react";
import "./Medicine.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AddMedicineModal from "./AddMedicineModal";
import {
  getMedicines,
  deleteMedicine,
} from "../../services/medicineService";

function MedicineTable() {
  const [showModal, setShowModal] = useState(false);
  const [medicines, setMedicines] = useState([]);

  // Fetch medicines from backend
  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();

setMedicines(response.data.data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Delete medicine
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmDelete) return;

    try {
      await deleteMedicine(id);
      fetchMedicines();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className="medicinePage">

      <div className="medicineTop">
        <div>
          <h1>💊 Medicine Inventory</h1>
          <p>Manage all medicines from one place</p>
        </div>

        <button
          className="addMedicineBtn"
          onClick={() => setShowModal(true)}
        >
          + Add Medicine
        </button>
      </div>

      <div className="filterSection">
        <input
          type="text"
          placeholder="🔍 Search Medicine..."
        />

        <select>
          <option>All Categories</option>
          <option>Tablet</option>
          <option>Syrup</option>
          <option>Injection</option>
        </select>

        <select>
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      <table>

        <thead>
          <tr>
            <th>Medicine</th>
            <th>Category</th>
            <th>Batch</th>
            <th>Stock</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {medicines.length === 0 ? (

            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No Medicines Found
              </td>
            </tr>

          ) : (

            medicines.map((medicine) => (

              <tr key={medicine._id}>

                <td>{medicine.name}</td>

                <td>{medicine.category}</td>

                <td>{medicine.batch}</td>

                <td>{medicine.stock}</td>

                <td>
                  {new Date(medicine.expiry).toLocaleDateString()}
                </td>

                <td>

                  <span
                    className={
                      medicine.stock > 20
                        ? "status green"
                        : medicine.stock > 0
                        ? "status yellow"
                        : "status red"
                    }
                  >
                    {medicine.stock > 20
                      ? "In Stock"
                      : medicine.stock > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                  </span>

                </td>

                <td>

                  <button className="action view">
                    <FaEye />
                  </button>

                  <button className="action edit">
                    <FaEdit />
                  </button>

                  <button
                    className="action delete"
                    onClick={() => handleDelete(medicine._id)}
                  >
                    <FaTrash />
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {showModal && (
        <AddMedicineModal
          closeModal={() => setShowModal(false)}
          refreshMedicines={fetchMedicines}
        />
      )}

    </div>
  );
}

export default MedicineTable;