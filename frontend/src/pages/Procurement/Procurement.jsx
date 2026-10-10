import { useMemo, useState } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaSearch,
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaBoxOpen,
  FaFileInvoice,
  FaTimes,
  FaTrash,
  FaWarehouse,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./Procurement.css";

const suppliers = [
  {
    id: 1,
    name: "MedPlus Distributors",
    contact: "9876543210",
    location: "Mumbai",
  },
  {
    id: 2,
    name: "Apollo Wholesale",
    contact: "9876501234",
    location: "Thane",
  },
  {
    id: 3,
    name: "CureCare Pharma",
    contact: "9988776655",
    location: "Andheri",
  },
  {
    id: 4,
    name: "LifeLine Medicos",
    contact: "9123456780",
    location: "Bandra",
  },
];

const medicines = [
  {
    name: "Paracetamol 500mg",
    stock: 1250,
    reorder: 500,
    price: 2.5,
  },
  {
    name: "Amlodipine 5mg",
    stock: 640,
    reorder: 300,
    price: 4.2,
  },
  {
    name: "Montelukast 10mg",
    stock: 820,
    reorder: 350,
    price: 8.5,
  },
  {
    name: "Azithromycin 500mg",
    stock: 530,
    reorder: 250,
    price: 12.5,
  },
  {
    name: "Metformin 500mg",
    stock: 920,
    reorder: 400,
    price: 3.8,
  },
  {
    name: "Amoxicillin 500mg",
    stock: 410,
    reorder: 250,
    price: 9.2,
  },
  {
    name: "Omeprazole 20mg",
    stock: 680,
    reorder: 300,
    price: 5.5,
  },
  {
    name: "Cetirizine 10mg",
    stock: 760,
    reorder: 300,
    price: 2.9,
  },
];

const initialOrders = [
  {
    id: "PO-1001",
    supplier: "MedPlus Distributors",
    items: 4,
    units: 850,
    amount: 8420,
    date: "07 Sep 2026",
    status: "Delivered",
  },
  {
    id: "PO-1002",
    supplier: "Apollo Wholesale",
    items: 3,
    units: 620,
    amount: 6280,
    date: "06 Sep 2026",
    status: "In Transit",
  },
  {
    id: "PO-1003",
    supplier: "CureCare Pharma",
    items: 5,
    units: 1120,
    amount: 12450,
    date: "05 Sep 2026",
    status: "Pending",
  },
  {
    id: "PO-1004",
    supplier: "LifeLine Medicos",
    items: 2,
    units: 400,
    amount: 3980,
    date: "03 Sep 2026",
    status: "Delivered",
  },
];

export default function Procurement() {
  const [orders, setOrders] = useState(initialOrders);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [supplier, setSupplier] = useState("");

  const [medicine, setMedicine] = useState("");

  const [quantity, setQuantity] = useState("");

  const [expectedDate, setExpectedDate] = useState("");

  const [notes, setNotes] = useState("");

  const selectedMedicine = medicines.find(
    (item) => item.name === medicine
  );

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(value) ||
        order.supplier.toLowerCase().includes(value) ||
        order.status.toLowerCase().includes(value)
    );
  }, [orders, search]);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const transitOrders = orders.filter(
    (order) => order.status === "In Transit"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalPurchaseValue = orders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  const lowStockMedicines = medicines.filter(
    (medicine) => medicine.stock <= medicine.reorder
  );

  const createPurchaseOrder = () => {
    if (!supplier || !medicine || !quantity) {
      alert("Please select supplier, medicine and quantity.");
      return;
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    const unitPrice = selectedMedicine?.price || 0;

    const newOrder = {
      id: `PO-${1001 + orders.length}`,
      supplier,
      items: 1,
      units: qty,
      amount: qty * unitPrice,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
    };

    setOrders([newOrder, ...orders]);

    setSupplier("");
    setMedicine("");
    setQuantity("");
    setExpectedDate("");
    setNotes("");

    setShowModal(false);
  };

  const getStatusIcon = (status) => {
    if (status === "Delivered") {
      return <FaCheckCircle />;
    }

    if (status === "In Transit") {
      return <FaTruck />;
    }

    return <FaClock />;
  };

  return (
    <div className="procurementPage">

      {/* HEADER */}

      <div className="procurementHeader">
        <div className="procurementTitle">

          <div className="procurementIcon">
            <FaShoppingCart />
          </div>

          <div>
            <span className="procurementEyebrow">
              PHARMAVISION SUPPLY CHAIN
            </span>

            <h1>Procurement</h1>

            <p>
              Manage medicine purchasing, suppliers and
              purchase orders from one place.
            </p>
          </div>
        </div>

        <button
          className="newPurchaseButton"
          onClick={() => setShowModal(true)}
        >
          <FaPlus />
          New Purchase Order
        </button>
      </div>

      {/* STATISTICS */}

      <div className="procurementStats">

        <div className="procurementStat">
          <div className="procurementStatIcon purple">
            <FaFileInvoice />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
            <small>Purchase orders</small>
          </div>
        </div>

        <div className="procurementStat">
          <div className="procurementStatIcon orange">
            <FaClock />
          </div>

          <div>
            <span>Pending Orders</span>
            <strong>{pendingOrders}</strong>
            <small>Awaiting processing</small>
          </div>
        </div>

        <div className="procurementStat">
          <div className="procurementStatIcon blue">
            <FaTruck />
          </div>

          <div>
            <span>In Transit</span>
            <strong>{transitOrders}</strong>
            <small>On the way</small>
          </div>
        </div>

        <div className="procurementStat">
          <div className="procurementStatIcon green">
            <FaCheckCircle />
          </div>

          <div>
            <span>Purchase Value</span>
            <strong>
              ₹{totalPurchaseValue.toLocaleString()}
            </strong>
            <small>
              {deliveredOrders} delivered
            </small>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="procurementMainGrid">

        {/* LOW STOCK */}

        <div className="lowStockCard">

          <div className="procurementCardHeading">
            <div>
              <span>INVENTORY ALERT</span>
              <h2>Low Stock Medicines</h2>
            </div>

            <FaExclamationTriangle />
          </div>

          {lowStockMedicines.length > 0 ? (
            <div className="lowStockList">

              {lowStockMedicines.map((item) => (
                <div
                  className="lowStockItem"
                  key={item.name}
                >
                  <div className="lowStockMedicineIcon">
                    <FaBoxOpen />
                  </div>

                  <div className="lowStockMedicine">
                    <strong>{item.name}</strong>
                    <span>
                      Reorder level: {item.reorder}
                    </span>
                  </div>

                  <div className="lowStockQuantity">
                    <strong>{item.stock}</strong>
                    <span>units</span>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="noLowStock">
              <FaCheckCircle />
              <p>All medicines have sufficient stock.</p>
            </div>
          )}

          <button
            className="orderLowStockButton"
            onClick={() => setShowModal(true)}
          >
            <FaPlus />
            Create Purchase
          </button>

        </div>

        {/* SUPPLIER PORTAL */}

        <div className="supplierCard">

          <div className="procurementCardHeading">
            <div>
              <span>SUPPLIER PORTAL</span>
              <h2>Active Suppliers</h2>
            </div>

            <FaWarehouse />
          </div>

          <div className="supplierList">

            {suppliers.map((item) => (
              <div
                className="supplierItem"
                key={item.id}
              >

                <div className="supplierAvatar">
                  {item.name.charAt(0)}
                </div>

                <div className="supplierDetails">
                  <strong>{item.name}</strong>
                  <span>
                    {item.location} • {item.contact}
                  </span>
                </div>

                <span className="supplierActive">
                  Active
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* PURCHASE ORDERS */}

      <div className="purchaseOrdersCard">

        <div className="purchaseOrdersHeader">

          <div>
            <span>PURCHASE MANAGEMENT</span>

            <h2>Purchase Orders</h2>

            <p>
              Track medicine procurement and supplier
              deliveries.
            </p>
          </div>

          <div className="procurementSearch">
            <FaSearch />

            <input
              type="text"
              placeholder="Search purchase orders..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

        </div>

        <div className="procurementTableWrapper">

          <table>

            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.map((order) => (
                <tr key={order.id}>

                  <td>
                    <span className="purchaseId">
                      {order.id}
                    </span>
                  </td>

                  <td>
                    <strong className="supplierName">
                      {order.supplier}
                    </strong>
                  </td>

                  <td>
                    {order.items}
                  </td>

                  <td>
                    <strong>
                      {order.units.toLocaleString()}
                    </strong>
                  </td>

                  <td>
                    <strong>
                      ₹{order.amount.toLocaleString()}
                    </strong>
                  </td>

                  <td>
                    {order.date}
                  </td>

                  <td>
                    <span
                      className={`purchaseStatus ${
                        order.status
                          .toLowerCase()
                          .replace(" ", "-")
                      }`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>

                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="procurementEmpty"
                  >
                    No purchase orders found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* QUICK PROCUREMENT */}

      <div className="quickProcurement">

        <div className="quickProcurementIcon">
          <FaTruck />
        </div>

        <div>
          <strong>
            Need to restock medicines?
          </strong>

          <p>
            Create a purchase order and send it to
            your preferred supplier.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
        >
          Create Purchase Order
        </button>

      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="procurementModalOverlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="procurementModal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="procurementModalHeader">

              <div>
                <span>PROCUREMENT</span>
                <h2>Create Purchase Order</h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="procurementClose"
              >
                <FaTimes />
              </button>

            </div>

            <div className="purchaseRoute">

              <div>
                <span>BUYING FOR</span>
                <strong>Central Pharmacy</strong>
              </div>

              <FaTruck />

              <div>
                <span>FROM</span>
                <strong>Selected Supplier</strong>
              </div>

            </div>

            <div className="procurementField">

              <label>Supplier</label>

              <select
                value={supplier}
                onChange={(e) =>
                  setSupplier(e.target.value)
                }
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map((item) => (
                  <option
                    key={item.id}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

            </div>

            <div className="procurementField">

              <label>Medicine</label>

              <select
                value={medicine}
                onChange={(e) =>
                  setMedicine(e.target.value)
                }
              >
                <option value="">
                  Select medicine
                </option>

                {medicines.map((item) => (
                  <option
                    key={item.name}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              {selectedMedicine && (
                <small className="medicineProcurementHint">
                  Current stock:
                  {" "}
                  <strong>
                    {selectedMedicine.stock}
                  </strong>
                  {" "}units
                  {" • "}
                  Purchase price:
                  {" "}
                  <strong>
                    ₹{selectedMedicine.price}
                  </strong>
                </small>
              )}

            </div>

            <div className="procurementTwoColumns">

              <div className="procurementField">

                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter units"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />

              </div>

              <div className="procurementField">

                <label>Expected Delivery</label>

                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) =>
                    setExpectedDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="procurementField">

              <label>Notes</label>

              <textarea
                rows="3"
                placeholder="Add purchase instructions..."
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
              />

            </div>

            {selectedMedicine &&
              quantity && (
                <div className="purchaseEstimate">

                  <span>Estimated Purchase Value</span>

                  <strong>
                    ₹
                    {(
                      Number(quantity) *
                      selectedMedicine.price
                    ).toLocaleString()}
                  </strong>

                </div>
              )}

            <div className="procurementModalButtons">

              <button
                className="procurementCancel"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="procurementConfirm"
                onClick={createPurchaseOrder}
              >
                <FaShoppingCart />
                Create Purchase Order
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}