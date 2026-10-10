import { useState } from "react";
import {
  FaFilePrescription,
  FaPlus,
  FaTrash,
  FaPaperPlane,
  FaUserMd,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "./DoctorPrescriptions.css";

const medicines = [
  "Paracetamol 500mg",
  "Montelukast 10mg",
  "Amlodipine 5mg",
  "Azithromycin 500mg",
  "Metformin 500mg",
  "Cetirizine 10mg",
];

const samplePrescriptions = [
  {
    id: "RX-1001",
    patient: "Rahul Sharma",
    age: 32,
    medicine: "Paracetamol 500mg",
    quantity: 15,
    urgency: "Normal",
    status: "Pending",
  },
  {
    id: "RX-1002",
    patient: "Priya Nair",
    age: 45,
    medicine: "Amlodipine 5mg",
    quantity: 30,
    urgency: "Urgent",
    status: "Dispensed",
  },
];

export default function DoctorPrescriptions() {
  const { user } = useAuth();

  const isDoctor =
    user?.role === "Doctor";

  const [patientName, setPatientName] =
    useState("");

  const [patientAge, setPatientAge] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [urgency, setUrgency] =
    useState("Normal");

  const [items, setItems] = useState([
    {
      medicine: "",
      dose: 1,
      timesPerDay: 1,
      days: 1,
    },
  ]);

  const [prescriptions, setPrescriptions] =
    useState(samplePrescriptions);

  const addMedicine = () => {
    setItems([
      ...items,
      {
        medicine: "",
        dose: 1,
        timesPerDay: 1,
        days: 1,
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (items.length === 1) return;

    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const total = (item) =>
    Number(item.dose || 0) *
    Number(item.timesPerDay || 0) *
    Number(item.days || 0);

  const sendPrescription = (e) => {
    e.preventDefault();

    if (
      !patientName ||
      !patientAge ||
      items.some(
        (item) => !item.medicine
      )
    ) {
      alert(
        "Please complete patient and medicine details."
      );

      return;
    }

    const newPrescription = {
      id: `RX-${1003 + prescriptions.length}`,
      patient: patientName,
      age: patientAge,
      medicine:
        items[0].medicine,
      quantity: total(items[0]),
      urgency,
      status: "Pending",
    };

    setPrescriptions([
      newPrescription,
      ...prescriptions,
    ]);

    setPatientName("");
    setPatientAge("");
    setNotes("");

    setItems([
      {
        medicine: "",
        dose: 1,
        timesPerDay: 1,
        days: 1,
      },
    ]);

    alert(
      "Prescription sent to pharmacist."
    );
  };

  return (
    <div className="prescriptionPage">

      <div className="prescriptionHeader">

        <div className="prescriptionTitle">

          <div className="prescriptionIcon">
            <FaFilePrescription />
          </div>

          <div>

            <span>
              PHARMAVISION CLINICAL
            </span>

            <h1>
              Doctor Prescriptions
            </h1>

            <p>
              Create medicine suggestions and
              securely send them to the pharmacist.
            </p>

          </div>

        </div>

        <div className="roleBadge">
          <FaUserMd />
          {isDoctor
            ? "Doctor Portal"
            : "Pharmacist View"}
        </div>

      </div>


      {isDoctor ? (

        <div className="doctorPrescriptionGrid">

          <form
            className="prescriptionFormCard"
            onSubmit={sendPrescription}
          >

            <div className="cardTop">

              <div>
                <span>
                  NEW SUGGESTION
                </span>

                <h2>
                  Patient & Treatment
                </h2>
              </div>

              <FaFilePrescription />

            </div>


            <div className="formGrid">

              <div className="prescriptionField">

                <label>
                  Patient Name
                </label>

                <input
                  value={patientName}
                  onChange={(e) =>
                    setPatientName(
                      e.target.value
                    )
                  }
                  placeholder="Enter patient name"
                />

              </div>


              <div className="prescriptionField">

                <label>
                  Patient Age
                </label>

                <input
                  type="number"
                  min="1"
                  value={patientAge}
                  onChange={(e) =>
                    setPatientAge(
                      e.target.value
                    )
                  }
                  placeholder="Age"
                />

              </div>

            </div>


            <div className="prescriptionField">

              <label>
                Urgency
              </label>

              <select
                value={urgency}
                onChange={(e) =>
                  setUrgency(
                    e.target.value
                  )
                }
              >
                <option>
                  Normal
                </option>

                <option>
                  Urgent
                </option>
              </select>

            </div>


            <div className="medicineRowsHeader">

              <h3>
                Medicines
              </h3>

              <button
                type="button"
                onClick={addMedicine}
              >
                <FaPlus />
                Add Medicine
              </button>

            </div>


            <div className="medicineRows">

              {items.map(
                (item, index) => (

                  <div
                    className="medicinePrescriptionRow"
                    key={index}
                  >

                    <div>

                      <label>
                        Medicine
                      </label>

                      <select
                        value={item.medicine}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "medicine",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Select medicine
                        </option>

                        {medicines.map(
                          (medicine) => (
                            <option
                              key={medicine}
                            >
                              {medicine}
                            </option>
                          )
                        )}

                      </select>

                    </div>


                    <div>

                      <label>
                        Dose
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.dose}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "dose",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div>

                      <label>
                        Times / Day
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          item.timesPerDay
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "timesPerDay",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div>

                      <label>
                        Days
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.days}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "days",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="calculatedQuantity">

                      <span>
                        Quantity
                      </span>

                      <strong>
                        {total(item)}
                      </strong>

                    </div>


                    <button
                      type="button"
                      className="deleteMedicine"
                      onClick={() =>
                        removeMedicine(index)
                      }
                    >
                      <FaTrash />
                    </button>

                  </div>

                )
              )}

            </div>


            <div className="prescriptionField">

              <label>
                Doctor Notes
              </label>

              <textarea
                rows="4"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Instructions such as after food, before sleep, allergies..."
              />

            </div>


            <button
              className="sendPrescription"
              type="submit"
            >

              <FaPaperPlane />

              Send to Pharmacist

            </button>

          </form>


          <div className="prescriptionHistory">

            <div className="cardTop">

              <div>

                <span>
                  PRESCRIPTION HISTORY
                </span>

                <h2>
                  My Suggestions
                </h2>

              </div>

              <FaClock />

            </div>


            {prescriptions.map(
              (item) => (

                <div
                  className="prescriptionHistoryItem"
                  key={item.id}
                >

                  <div className="rxNumber">
                    {item.id}
                  </div>

                  <div className="rxInfo">

                    <strong>
                      {item.patient}
                    </strong>

                    <span>
                      Age {item.age} ·{" "}
                      {item.medicine}
                    </span>

                  </div>

                  <span
                    className={
                      `rxStatus ${item.status
                        .toLowerCase()}`
                    }
                  >
                    {item.status}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      ) : (

        <div className="pharmacistPrescriptionPage">

          <div className="pharmacistPrescriptionHeader">

            <div>
              <span>
                PHARMACIST INBOX
              </span>

              <h2>
                Doctor Medicine Suggestions
              </h2>

              <p>
                Review prescriptions, check stock,
                and dispense medicines using FEFO.
              </p>
            </div>

            <div className="pendingBadge">
              <FaClock />
              {
                prescriptions.filter(
                  (p) =>
                    p.status === "Pending"
                ).length
              } Pending
            </div>

          </div>


          <div className="pharmacistRxList">

            {prescriptions.map(
              (item) => (

                <div
                  className="pharmacistRxCard"
                  key={item.id}
                >

                  <div className="rxCardTop">

                    <div className="patientAvatar">
                      {item.patient.charAt(0)}
                    </div>

                    <div>

                      <strong>
                        {item.patient}
                      </strong>

                      <span>
                        Prescription {item.id}
                        {" · "}
                        Age {item.age}
                      </span>

                    </div>

                    <span
                      className={
                        `rxStatus ${item.status
                          .toLowerCase()}`
                      }
                    >
                      {item.status}
                    </span>

                  </div>


                  <div className="rxMedicine">

                    <FaFilePrescription />

                    <div>

                      <strong>
                        {item.medicine}
                      </strong>

                      <span>
                        Required quantity:{" "}
                        {item.quantity} units
                      </span>

                    </div>

                  </div>


                  <div className="rxCardActions">

                    <button className="checkStock">
                      Check Stock
                    </button>

                    <button className="dispenseRx">
                      <FaCheckCircle />
                      Dispense
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}