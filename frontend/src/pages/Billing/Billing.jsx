import { useEffect, useMemo, useState } from "react";

import {
  FaCashRegister,
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaPrint,
  FaCreditCard,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaPills,
  FaReceipt,
  FaArrowRight,
} from "react-icons/fa";

import api from "../../api/axios";

import "./Billing.css";


export default function Billing() {

  // =====================================================
  // STATE
  // =====================================================

  const [search, setSearch] = useState("");

  const [medicines, setMedicines] = useState([]);

  const [cart, setCart] = useState([]);

  const [customer, setCustomer] = useState("");

  const [payment, setPayment] = useState("Cash");

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [completedSale, setCompletedSale] = useState(null);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");


  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  useEffect(() => {
    loadMedicines();
  }, []);


  async function loadMedicines() {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get("/billing/medicines");

      const medicineList =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data ||
            response.data?.medicines ||
            [];

      const medicinesWithStock =
        await Promise.all(

          medicineList.map(
            async (medicine) => {

              try {

                const stockResponse =
                  await api.get(
                    `/billing/stock/${medicine._id}`
                  );

                return {
                  ...medicine,

                  availableStock:
                    Number(
                      stockResponse.data?.totalStock || 0
                    ),
                };

              } catch (stockError) {

                console.warn(
                  `Stock unavailable for ${medicine.name}`,
                  stockError
                );

                return {
                  ...medicine,

                  availableStock:
                    Number(
                      medicine.stock || 0
                    ),
                };

              }

            }
          )
        );


      setMedicines(
        medicinesWithStock
      );

    } catch (err) {

      console.error(
        "Billing medicine loading error:",
        err
      );

      setMedicines([]);

      setError(
        err.response?.data?.message ||
        "Unable to load medicines from billing API."
      );

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // PRICE
  // =====================================================

  function getPrice(medicine) {

    return Number(
      medicine?.sellingPrice ??
      medicine?.unitPrice ??
      medicine?.price ??
      0
    );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredMedicines =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return medicines;
      }

      return medicines.filter(
        (medicine) =>
          medicine.name
            ?.toLowerCase()
            .includes(value) ||

          medicine.category
            ?.toLowerCase()
            .includes(value) ||

          medicine.salt
            ?.toLowerCase()
            .includes(value) ||

          medicine.manufacturer
            ?.toLowerCase()
            .includes(value)
      );

    }, [medicines, search]);


  // =====================================================
  // ADD TO CART
  // =====================================================

  function addToCart(medicine) {

    setCompletedSale(null);
    setMessage("");
    setError("");

    const medicineId =
      medicine._id;

    const stock =
      Number(
        medicine.availableStock || 0
      );


    if (stock <= 0) {

      setError(
        `${medicine.name} is currently out of stock.`
      );

      return;

    }


    const price =
      getPrice(medicine);


    setCart((current) => {

      const existing =
        current.find(
          (item) =>
            item.medicineId ===
            medicineId
        );


      if (existing) {

        return current.map(
          (item) => {

            if (
              item.medicineId !==
              medicineId
            ) {
              return item;
            }


            return {

              ...item,

              quantity:
                Math.min(
                  item.quantity + 1,
                  stock
                ),

            };

          }
        );

      }


      return [

        ...current,

        {

          medicineId,

          name:
            medicine.name,

          category:
            medicine.category,

          salt:
            medicine.salt,

          price,

          availableStock:
            stock,

          quantity: 1,

        },

      ];

    });

  }


  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  function changeQuantity(
    medicineId,
    amount
  ) {

    setCart(
      (current) =>

        current
          .map((item) => {

            if (
              item.medicineId !==
              medicineId
            ) {
              return item;
            }


            const nextQuantity =
              item.quantity + amount;


            return {

              ...item,

              quantity:
                Math.min(
                  item.availableStock,
                  Math.max(
                    0,
                    nextQuantity
                  )
                ),

            };

          })

          .filter(
            (item) =>
              item.quantity > 0
          )
    );

  }


  // =====================================================
  // REMOVE
  // =====================================================

  function removeItem(
    medicineId
  ) {

    setCart(
      (current) =>
        current.filter(
          (item) =>
            item.medicineId !==
            medicineId
        )
    );

  }


  // =====================================================
  // BILL CALCULATION
  // =====================================================

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),

      0
    );


  const tax =
    subtotal * 0.05;


  const total =
    subtotal + tax;


  const totalItems =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),

      0
    );


  // =====================================================
  // COMPLETE SALE
  // =====================================================

  async function completeSale() {

    if (cart.length === 0) {

      setError(
        "Please add at least one medicine."
      );

      return;

    }


    try {

      setProcessing(true);

      setError("");

      setMessage("");

      setCompletedSale(null);


      const payload = {

        items:
          cart.map(
            (item) => ({

              medicineId:
                item.medicineId,

              quantity:
                Number(
                  item.quantity
                ),

            })
          ),

        discount: 0,

        tax:
          Number(
            tax.toFixed(2)
          ),

        paymentMethod:
          payment,

        customerName:
          customer.trim() ||
          "Walk-in Customer",

        customerPhone:
          "",

      };


      const response =
        await api.post(
          "/billing/sale",
          payload
        );


      const sale =
        response.data?.sale ||
        response.data;


      setCompletedSale(
        sale
      );


      setMessage(
        "Sale completed successfully."
      );


      setCart([]);

      setCustomer("");


      await loadMedicines();


    } catch (err) {

      console.error(
        "Sale completion error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Could not complete the sale."
      );

    } finally {

      setProcessing(false);

    }

  }


  // =====================================================
  // PRINT
  // =====================================================

  function printReceipt() {

    window.print();

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="billingPage">


      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="billingHeader">

        <div className="billingHeaderLeft">

          <div className="billingIcon">
            <FaCashRegister />
          </div>


          <div>

            <div className="billingEyebrow">
              PHARMAVISION POS
            </div>

            <h1>
              Billing & Point of Sale
            </h1>

            <p>
              Fast, stock-aware pharmacy billing
              powered by your inventory system.
            </p>

          </div>

        </div>


        <div className="billingHeaderRight">

          <div className="terminalBadge">

            <span className="terminalDot" />

            <div>

              <strong>
                POS Terminal
              </strong>

              <small>
                Online & Ready
              </small>

            </div>

          </div>


          <div className="headerDate">

            <FaReceipt />

            <span>
              New Sale
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (

        <div className="billingAlert errorAlert">

          <div className="alertIcon">
            !
          </div>

          <div>

            <strong>
              Something went wrong
            </strong>

            <span>
              {error}
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {completedSale && (

        <div className="billingAlert successAlert">

          <div className="alertIcon">
            <FaCheckCircle />
          </div>

          <div>

            <strong>
              Sale completed successfully
            </strong>

            <span>

              Invoice
              {" "}
              {completedSale.invoiceNumber ||
                "Generated"}

              {" · "}

              ₹
              {Number(
                completedSale.grandTotal ??
                total
              ).toFixed(2)}

            </span>

          </div>

          <button
            type="button"
            onClick={
              printReceipt
            }
          >
            <FaPrint />
            Print
          </button>

        </div>

      )}


      {/* =================================================
          QUICK STATS
      ================================================= */}

      <div className="billingStats">

        <div className="billingStatCard">

          <div className="statIcon purple">
            <FaPills />
          </div>

          <div>

            <span>
              Medicine Catalog
            </span>

            <strong>
              {medicines.length}
            </strong>

            <small>
              medicines available
            </small>

          </div>

        </div>


        <div className="billingStatCard">

          <div className="statIcon blue">
            <FaShoppingCart />
          </div>

          <div>

            <span>
              Current Cart
            </span>

            <strong>
              {totalItems}
            </strong>

            <small>
              items selected
            </small>

          </div>

        </div>


        <div className="billingStatCard">

          <div className="statIcon green">
            <FaReceipt />
          </div>

          <div>

            <span>
              Current Total
            </span>

            <strong>
              ₹{total.toFixed(2)}
            </strong>

            <small>
              including GST
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN POS
      ================================================= */}

      <main className="billingLayout">


        {/* =================================================
            LEFT — MEDICINES
        ================================================= */}

        <section className="medicinePanel">


          <div className="panelTop">

            <div>

              <div className="panelEyebrow">
                MEDICINE CATALOG
              </div>

              <h2>
                Select Medicines
              </h2>

              <p>
                Search and add medicines to
                the current customer bill.
              </p>

            </div>


            <div className="catalogCount">

              <FaPills />

              <span>
                {medicines.length}
              </span>

              medicines

            </div>

          </div>


          {/* SEARCH */}

          <div className="billingSearch">

            <FaSearch />

            <input
              type="text"
              placeholder="Search by medicine, category, salt or manufacturer..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>

            )}

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="catalogState">

              <div className="loadingCircle">
                <FaSpinner />
              </div>

              <h3>
                Loading medicine catalog
              </h3>

              <p>
                Checking medicines and
                available stock...
              </p>

            </div>

          ) : filteredMedicines.length === 0 ? (

            <div className="catalogState">

              <div className="emptyIcon">
                <FaSearch />
              </div>

              <h3>
                No medicines found
              </h3>

              <p>
                Try searching with another
                medicine name or category.
              </p>

            </div>

          ) : (

            <div className="medicineGrid">

              {filteredMedicines.map(
                (medicine) => {

                  const stock =
                    Number(
                      medicine.availableStock ||
                      0
                    );

                  const price =
                    getPrice(medicine);

                  const medicineId =
                    medicine._id;


                  return (

                    <article
                      className={
                        stock > 0
                          ? "medicinePOSCard"
                          : "medicinePOSCard outOfStock"
                      }
                      key={
                        medicineId
                      }
                    >


                      <div className="medicineCardTop">

                        <div className="medicinePOSIcon">
                          <FaPills />
                        </div>


                        {stock > 0 ? (

                          <span className="stockBadge available">
                            In Stock
                          </span>

                        ) : (

                          <span className="stockBadge unavailable">
                            Out of Stock
                          </span>

                        )}

                      </div>


                      <div className="medicineCardInfo">

                        <span className="medicineCategory">

                          {medicine.category ||
                            "Medicine"}

                        </span>


                        <h3>
                          {medicine.name}
                        </h3>


                        {medicine.salt && (

                          <p className="medicineSalt">

                            {medicine.salt}

                          </p>

                        )}

                      </div>


                      <div className="medicineCardDetails">

                        <div>

                          <span>
                            Available
                          </span>

                          <strong>
                            {stock}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Unit Price
                          </span>

                          <strong>
                            ₹
                            {price.toFixed(2)}
                          </strong>

                        </div>

                      </div>


                      <button
                        type="button"
                        className="addMedicineButton"
                        disabled={
                          stock <= 0
                        }
                        onClick={() =>
                          addToCart(
                            medicine
                          )
                        }
                      >

                        <FaPlus />

                        {stock > 0
                          ? "Add to Bill"
                          : "Unavailable"}

                        {stock > 0 && (
                          <FaArrowRight />
                        )}

                      </button>

                    </article>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            RIGHT — CART
        ================================================= */}

        <aside className="cartPanel">


          {/* CART HEADER */}

          <div className="cartPanelHeader">

            <div>

              <div className="panelEyebrow">
                CURRENT ORDER
              </div>

              <h2>
                Customer Bill
              </h2>

            </div>


            <div className="cartCount">

              <FaShoppingCart />

              <span>
                {totalItems}
              </span>

            </div>

          </div>


          {/* CUSTOMER */}

          <div className="customerSection">

            <label>
              <FaUser />

              Customer

            </label>


            <div className="customerInput">

              <FaUser />

              <input
                type="text"
                placeholder="Walk-in customer"
                value={customer}
                onChange={(e) =>
                  setCustomer(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* CART ITEMS */}

          <div className="cartItemsSection">

            <div className="cartItemsTitle">

              <span>
                Bill Items
              </span>

              <small>
                {totalItems}
                {" "}
                units
              </small>

            </div>


            {cart.length === 0 ? (

              <div className="cartEmpty">

                <div className="cartEmptyIcon">
                  <FaShoppingCart />
                </div>

                <h3>
                  Your bill is empty
                </h3>

                <p>
                  Select medicines from
                  the catalog to start
                  a new sale.
                </p>

              </div>

            ) : (

              <div className="cartItems">

                {cart.map(
                  (item) => (

                    <div
                      className="cartItem"
                      key={
                        item.medicineId
                      }
                    >

                      <div className="cartItemIcon">
                        <FaPills />
                      </div>


                      <div className="cartItemInfo">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          ₹
                          {Number(
                            item.price
                          ).toFixed(2)}
                          {" "} / unit
                        </span>


                        <div className="quantityControls">

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.medicineId,
                                -1
                              )
                            }
                          >
                            <FaMinus />
                          </button>


                          <strong>
                            {item.quantity}
                          </strong>


                          <button
                            type="button"
                            disabled={
                              item.quantity >=
                              item.availableStock
                            }
                            onClick={() =>
                              changeQuantity(
                                item.medicineId,
                                1
                              )
                            }
                          >
                            <FaPlus />
                          </button>

                        </div>

                      </div>


                      <div className="cartItemRight">

                        <strong>
                          ₹
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toFixed(2)}
                        </strong>


                        <button
                          type="button"
                          className="removeCart"
                          onClick={() =>
                            removeItem(
                              item.medicineId
                            )
                          }
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* SUMMARY */}

          <div className="billSummary">

            <div className="summaryRow">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toFixed(2)}
              </strong>

            </div>


            <div className="summaryRow">

              <span>
                GST (5%)
              </span>

              <strong>
                ₹
                {tax.toFixed(2)}
              </strong>

            </div>


            <div className="summaryDivider" />


            <div className="summaryTotal">

              <div>

                <span>
                  Grand Total
                </span>

                <small>
                  Inclusive of GST
                </small>

              </div>


              <strong>
                ₹
                {total.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* PAYMENT */}

          <div className="paymentSection">

            <label>
              Payment Method
            </label>


            <div className="paymentOptions">


              <button
                type="button"
                className={
                  payment === "Cash"
                    ? "paymentOption active"
                    : "paymentOption"
                }
                onClick={() =>
                  setPayment("Cash")
                }
              >

                <FaMoneyBillWave />

                <span>
                  Cash
                </span>

              </button>


              <button
                type="button"
                className={
                  payment === "Card"
                    ? "paymentOption active"
                    : "paymentOption"
                }
                onClick={() =>
                  setPayment("Card")
                }
              >

                <FaCreditCard />

                <span>
                  Card
                </span>

              </button>


              <button
                type="button"
                className={
                  payment === "UPI"
                    ? "paymentOption active"
                    : "paymentOption"
                }
                onClick={() =>
                  setPayment("UPI")
                }
              >

                <span className="upiText">
                  UPI
                </span>

              </button>


            </div>

          </div>


          {/* ACTIONS */}

          <div className="billingActions">

            <button
              type="button"
              className="printButton"
              disabled={
                cart.length === 0
              }
              onClick={
                printReceipt
              }
            >

              <FaPrint />

              Print

            </button>


            <button
              type="button"
              className="completeButton"
              disabled={
                cart.length === 0 ||
                processing
              }
              onClick={
                completeSale
              }
            >

              {processing ? (

                <>

                  <FaSpinner />

                  Processing...

                </>

              ) : (

                <>

                  Complete Sale

                  <FaArrowRight />

                </>

              )}

            </button>

          </div>


          <div className="fefoNotice">

            <FaCheckCircle />

            <span>
              Stock is deducted using
              <strong> FEFO </strong>
              during checkout.
            </span>

          </div>


        </aside>


      </main>

    </div>

  );

}