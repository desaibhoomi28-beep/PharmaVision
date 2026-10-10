import { useState } from "react";
import "./Medicine.css";
import { addMedicine } from "../../services/medicineService";

function AddMedicineModal({ closeModal, refreshMedicines }) {
  const [medicine, setMedicine] = useState({
    name: "",
    category: "",
    batch: "",
    stock: "",
    expiry: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const medicineData = {
        name: medicine.name.trim(),
        category: medicine.category.trim(),
        batch: medicine.batch.trim(),
        stock: Number(medicine.stock),
        expiry: medicine.expiry,
      };

      console.log("Sending medicine:", medicineData);

      const response = await addMedicine(medicineData);

      console.log("Medicine added successfully:", response.data);

      alert("Medicine Added Successfully ✅");

      if (refreshMedicines) {
        await refreshMedicines();
      }

      closeModal();

    } catch (error) {
      console.error("FULL ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Error adding medicine";

      alert(`❌ ${message}`);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modal">

        <h2>Add Medicine</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Medicine Name"
            name="name"
            value={medicine.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            placeholder="Category"
            name="category"
            value={medicine.category}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            placeholder="Batch Number"
            name="batch"
            value={medicine.batch}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            placeholder="Stock"
            name="stock"
            min="0"
            value={medicine.stock}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="expiry"
            value={medicine.expiry}
            onChange={handleChange}
            required
          />

          <div className="modalButtons">

            <button
              type="button"
              className="cancelBtn"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="saveBtn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Medicine"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AddMedicineModal;