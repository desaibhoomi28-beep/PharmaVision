import { useState, useEffect } from "react";

import {
  FaTimes,
  FaTruck,
  FaUser,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCapsules,
} from "react-icons/fa";

import "./Suppliers.css";

const API_URL =
  "http://localhost:5000/api/suppliers";

export default function AddSupplierModal({
  closeModal,
  supplier,
  refreshSuppliers,
}) {

  const [formData, setFormData] =
    useState({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      medicinesSupplied: "",
      status: "Active",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // LOAD EDIT DATA
  // =========================

  useEffect(() => {

    if (supplier) {

      setFormData({
        name: supplier.name || "",
        company: supplier.company || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        medicinesSupplied:
          supplier.medicinesSupplied || "",
        status:
          supplier.status || "Active",
      });

    }

  }, [supplier]);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");

      const isEditing =
        supplier && supplier._id;

      const url =
        isEditing
          ? `${API_URL}/${supplier._id}`
          : API_URL;

      const method =
        isEditing
          ? "PUT"
          : "POST";


      const response =
        await fetch(
          url,
          {
            method,
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                ...formData,
                medicinesSupplied:
                  Number(
                    formData.medicinesSupplied
                  ),
              }),
          }
        );


      const data =
        await response.json();


      if (!data.success) {

        setError(
          data.message ||
          "Something went wrong"
        );

        return;
      }


      await refreshSuppliers();

      closeModal();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="supplierModalOverlay">

      <div className="supplierModal">


        {/* HEADER */}

        <div className="supplierModalHeader">

          <div>

            <div className="modalIcon">
              <FaTruck />
            </div>

            <div>

              <h2>
                {supplier
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h2>

              <p>
                {supplier
                  ? "Update supplier information"
                  : "Add a new supplier to your network"}
              </p>

            </div>

          </div>


          <button
            className="closeModalBtn"
            onClick={closeModal}
          >

            <FaTimes />

          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="supplierFormError">
            {error}
          </div>

        )}


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >

          <div className="supplierFormGrid">


            {/* NAME */}

            <div className="supplierInputGroup">

              <label>
                Supplier Name
              </label>

              <div className="supplierInput">

                <FaUser />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* COMPANY */}

            <div className="supplierInputGroup">

              <label>
                Company Name
              </label>

              <div className="supplierInput">

                <FaBuilding />

                <input
                  type="text"
                  name="company"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="supplierInputGroup">

              <label>
                Email Address
              </label>

              <div className="supplierInput">

                <FaEnvelope />

                <input
                  type="email"
                  name="email"
                  placeholder="supplier@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PHONE */}

            <div className="supplierInputGroup">

              <label>
                Phone Number
              </label>

              <div className="supplierInput">

                <FaPhone />

                <input
                  type="text"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* ADDRESS */}

            <div className="supplierInputGroup fullWidth">

              <label>
                Address
              </label>

              <div className="supplierInput">

                <FaMapMarkerAlt />

                <input
                  type="text"
                  name="address"
                  placeholder="Enter supplier address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* MEDICINES */}

            <div className="supplierInputGroup">

              <label>
                Medicines Supplied
              </label>

              <div className="supplierInput">

                <FaCapsules />

                <input
                  type="number"
                  name="medicinesSupplied"
                  placeholder="0"
                  min="0"
                  value={
                    formData.medicinesSupplied
                  }
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* STATUS */}

            <div className="supplierInputGroup">

              <label>
                Supplier Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>

          </div>


          {/* BUTTONS */}

          <div className="supplierModalButtons">

            <button
              type="button"
              className="cancelSupplierBtn"
              onClick={closeModal}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="saveSupplierBtn"
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : supplier
                ? "Update Supplier"
                : "Add Supplier"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}