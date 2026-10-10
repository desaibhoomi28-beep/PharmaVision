import { Link, useNavigate } from "react-router-dom";

import {
  FaCapsules,
  FaTruck,
  FaChartLine,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";

import "./Home.css";


export default function Home() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");


  const handleDashboard = () => {

    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }

  };


  return (

    <div className="homePage">

      {/* ================= NAVBAR ================= */}

      <header className="homeNavbar">

        <div className="homeLogo">

          <div className="homeLogoIcon">
            💊
          </div>

          <span>
            Pharma<span>Vision</span>
          </span>

        </div>


        <nav className="homeNavLinks">

          <a href="#features">
            Features
          </a>

          <a href="#about">
            About
          </a>

          <button
            className="dashboardNavButton"
            onClick={handleDashboard}
          >
            Dashboard
          </button>

        </nav>


        <div className="homeAuthButtons">

          <Link
            to="/login"
            className="homeLogin"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="homeRegister"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section className="heroSection">

        <div className="heroContent">

          <div className="heroBadge">
            ✨ SMART PHARMACEUTICAL MANAGEMENT
          </div>


          <h1>

            Manage Your Pharmacy

            <span>
              Smarter.
            </span>

          </h1>


          <p>
            PharmaVision brings medicines, suppliers,
            inventory tracking and AI-powered forecasting
            together in one elegant platform.
          </p>


          <div className="heroButtons">

            <Link
              to="/register"
              className="heroPrimary"
            >

              Get Started

              <FaArrowRight />

            </Link>


            <Link
              to="/login"
              className="heroSecondary"
            >
              Login to Account
            </Link>

          </div>


          <div className="heroTrust">

            <div>
              <FaCheckCircle />
              Easy inventory management
            </div>

            <div>
              <FaCheckCircle />
              AI-powered insights
            </div>

          </div>

        </div>


        {/* ================= HERO CARD ================= */}

        <div className="heroVisual">

          <div className="floatingCircle circle1"></div>

          <div className="floatingCircle circle2"></div>


          <div className="dashboardPreview">

            <div className="previewTop">

              <div>

                <small>
                  PharmaVision
                </small>

                <h3>
                  Inventory Overview
                </h3>

              </div>


              <div className="previewAvatar">
                👤
              </div>

            </div>


            {/* STAT CARDS */}

            <div className="previewStats">


              <div className="previewCard">

                <div className="previewIcon blue">
                  💊
                </div>

                <small>
                  Total Medicines
                </small>

                <strong>
                  248
                </strong>

                <span>
                  +12% this month
                </span>

              </div>


              <div className="previewCard">

                <div className="previewIcon green">
                  📦
                </div>

                <small>
                  Stock Available
                </small>

                <strong>
                  1,284
                </strong>

                <span>
                  Healthy stock
                </span>

              </div>


            </div>


            {/* CHART */}

            <div className="previewChart">

              <div className="chartHeader">

                <span>
                  Stock Activity
                </span>

                <small>
                  This Month
                </small>

              </div>


              <div className="fakeChart">

                <div style={{ height: "35%" }}></div>

                <div style={{ height: "50%" }}></div>

                <div style={{ height: "42%" }}></div>

                <div style={{ height: "65%" }}></div>

                <div style={{ height: "58%" }}></div>

                <div style={{ height: "78%" }}></div>

                <div style={{ height: "90%" }}></div>

              </div>

            </div>


          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        className="featuresSection"
        id="features"
      >

        <div className="sectionHeading">

          <span>
            EVERYTHING IN ONE PLACE
          </span>

          <h2>
            Built for modern pharmaceutical operations
          </h2>

          <p>
            Everything your pharmacy or supply business
            needs to stay organized and efficient.
          </p>

        </div>


        <div className="featureGrid">


          {/* MEDICINES */}

          <div className="featureCard">

            <div className="featureIcon">
              <FaCapsules />
            </div>

            <h3>
              Medicine Management
            </h3>

            <p>
              Track medicine stock, batches, expiry
              dates and availability from one dashboard.
            </p>

          </div>


          {/* SUPPLIERS */}

          <div className="featureCard">

            <div className="featureIcon">
              <FaTruck />
            </div>

            <h3>
              Supplier Management
            </h3>

            <p>
              Manage suppliers and keep your
              pharmaceutical supply chain organized.
            </p>

          </div>


          {/* AI */}

          <div className="featureCard">

            <div className="featureIcon">
              <FaChartLine />
            </div>

            <h3>
              AI Forecasting
            </h3>

            <p>
              Predict future medicine demand and
              make smarter inventory decisions.
            </p>

          </div>


          {/* SECURITY */}

          <div className="featureCard">

            <div className="featureIcon">
              <FaShieldAlt />
            </div>

            <h3>
              Secure Access
            </h3>

            <p>
              Separate access for pharmacists and
              suppliers with secure authentication.
            </p>

          </div>


        </div>

      </section>


      {/* ================= ABOUT ================= */}

      <section
        className="aboutSection"
        id="about"
      >

        <div>

          <span>
            PHARMAVISION
          </span>

          <h2>

            One platform.

            <br />

            Smarter decisions.

          </h2>

        </div>


        <p>

          From medicine inventory to supplier coordination
          and AI forecasting, PharmaVision gives your team
          the visibility needed to make better decisions
          every day.

        </p>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="homeFooter">

        <div className="homeLogo">

          <div className="homeLogoIcon">
            💊
          </div>

          <span>
            Pharma<span>Vision</span>
          </span>

        </div>


        <p>
          Smart pharmaceutical inventory management.
        </p>

      </footer>


    </div>

  );

}