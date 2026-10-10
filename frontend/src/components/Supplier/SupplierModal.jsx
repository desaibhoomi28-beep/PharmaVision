import { useEffect, useState } from "react";

import {
  FaTimes,
  FaTruck,
} from "react-icons/fa";

import "./Supplier.css";


export default function SupplierModal({
  closeModal,
  editingSupplier,
  refreshSuppliers,
}) {

  const [loading, setLoading] =
    useState(false);


  const [supplier, setSupplier] =
    useState({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      medicinesSupplied: "",
      status: "Active",
    });


  // ===============================
  // LOAD DATA FOR EDIT
  // ===============================

  useEffect(() => {

    if (editingSupplier) {

      setSupplier({
        name:
          editingSupplier.name || "",

        company:
          editingSupplier.company || "",

        email:
          editingSupplier.email || "",

        phone:
          editingSupplier.phone || "",

        address:
          editingSupplier.address || "",

        medicinesSupplied:
          editingSupplier.medicinesSupplied ||
          "",

        status:
          editingSupplier.status ||
          "Active",
      });

    }

  }, [editingSupplier]);


  // ===============================
  // HANDLE CHANGE
  // ===============================

  const handleChange = (e) => {

    setSupplier({
      ...supplier,

      [e.target.name]:
        e.target.value,
    });

  };


  // ===============================
  // HANDLE SUBMIT
  // ===============================

  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      setLoading(true);


      const supplierData = {

        ...supplier,

        medicinesSupplied:
          Number(
            supplier.medicinesSupplied
          ) || 0,

      };


      let url =
        "http://localhost:5000/api/suppliers";

      let method = "POST";


      if (editingSupplier) {

        url =
          `http://localhost:5000/api/suppliers/${editingSupplier._id}`;

        method = "PUT";

      }


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
              JSON.stringify(
                supplierData
              ),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Something went wrong"
        );

      }


      await refreshSuppliers();


      alert(
        editingSupplier
          ? "Supplier updated successfully ✅"
          : "Supplier added successfully ✅"
      );


      closeModal();


    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Backend connection failed"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div
      className="supplierModalOverlay"
      onClick={closeModal}
    >

      <div
        className="supplierModal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >


        {/* ================= HEADER ================= */}

        <div className="supplierModalHeader">


          <div>

            <div className="modalTitleIcon">

              <FaTruck />

            </div>


            <div>

              <h2>

                {editingSupplier
                  ? "Edit Supplier"
                  : "Add New Supplier"}

              </h2>


              <p>

                {editingSupplier
                  ? "Update supplier information"
                  : "Add a supplier to your PharmaVision network"}

              </p>

            </div>

          </div>


          <button
            className="closeModalBtn"
            type="button"
            onClick={closeModal}
          >

            <FaTimes />

          </button>


        </div>


        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
        >


          <div className="supplierFormGrid">


            {/* NAME */}

            <div className="formGroup">

              <label>
                Contact Person
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter supplier name"
                value={supplier.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* COMPANY */}

            <div className="formGroup">

              <label>
                Company Name
              </label>

              <input
                type="text"
                name="company"
                placeholder="Enter company name"
                value={supplier.company}
                onChange={handleChange}
                required
              />

            </div>


            {/* EMAIL */}

            <div className="formGroup">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="supplier@email.com"
                value={supplier.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PHONE */}

            <div className="formGroup">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                value={supplier.phone}
                onChange={handleChange}
                required
              />

            </div>


            {/* MEDICINES */}

            <div className="formGroup">

              <label>
                Medicines Supplied
              </label>

              <input
                type="number"
                name="medicinesSupplied"
                placeholder="Enter quantity"
                value={
                  supplier.medicinesSupplied
                }
                onChange={handleChange}
                min="0"
              />

            </div>


            {/* STATUS */}

            <div className="formGroup">

              <label>
                Supplier Status
              </label>

              <select
                name="status"
                value={supplier.status}
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


          {/* ADDRESS */}

          <div className="formGroup fullWidth">

            <label>
              Address
            </label>

            <textarea
              name="address"
              placeholder="Enter supplier address"
              value={supplier.address}
              onChange={handleChange}
              required
            />

          </div>


          {/* ACTIONS */}

          <div className="supplierModalActions">


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
                : editingSupplier
                ? "Update Supplier"
                : "Add Supplier"}

            </button>


          </div>


        </form>

      </div>

    </div>

  );
}