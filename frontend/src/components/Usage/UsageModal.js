import { useState } from "react";

export default function UsageModal({
  medicine,
  onClose,
  onSuccess,
}) {
  const [quantityUsed, setQuantityUsed] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/usage",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            medicine: medicine._id,
            quantityUsed: Number(quantityUsed),
            date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error adding usage");
        return;
      }

      alert("Usage record added successfully!");

      onSuccess?.();

      onClose();

    } catch (error) {

      console.error(error);

      alert("Cannot connect to backend");

    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#fff",
          padding: "28px",
          borderRadius: "16px",
        }}
      >
        <h2>📊 Record Medicine Usage</h2>

        <p>
          Medicine: <b>{medicine.name}</b>
        </p>

        <form onSubmit={handleSubmit}>

          <label>Quantity Used</label>

          <input
            type="number"
            min="1"
            value={quantityUsed}
            onChange={(e) =>
              setQuantityUsed(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              boxSizing: "border-box",
            }}
          />

          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 20px",
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit">
              Add Usage
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}