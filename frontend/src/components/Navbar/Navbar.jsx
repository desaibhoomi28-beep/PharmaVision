import "./Navbar.css";

import {
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

import { Link } from "react-router-dom";

export default function Navbar() {
  const today = new Date();

  return (
    <div className="navbar">

      {/* LEFT SIDE */}
      <div className="left">

        <h1>Dashboard</h1>

        <p>
          Welcome Back 
        </p>

      </div>


      {/* SEARCH */}
      <div className="middle">

        <FaSearch className="searchIcon" />

        <input
          type="text"
          placeholder="Search medicines..."
        />

      </div>


      {/* RIGHT SIDE */}
      <div className="right">

        

  

        {/* PROFILE */}
        <div className="profile">

          <FaUserCircle className="profileIcon" />

          <div>

            <h4>
              Pharmacist
            </h4>

            

          </div>

        </div>

      </div>

    </div>
  );
}