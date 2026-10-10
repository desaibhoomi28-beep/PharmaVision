import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;