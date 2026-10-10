import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Medicines from "./pages/Medicines/Medicines";
import Forecast from "./pages/Forecast/Forecast";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import Procurement from "./pages/Procurement/Procurement";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Redistribution from "./pages/Redistribution/Redistribution";
import Franchise from "./pages/Franchise/Franchise";
import "./styles/global.css";
import Billing from "./pages/Billing/Billing";

function Layout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/reports" element={<Reports />} />
          <Route
  path="/billing"
  element={<Billing />}
/>

<Route
  path="/procurement"
  element={<Procurement />}
/>
          <Route path="/settings" element={<Settings />} />
          <Route
  path="/redistribution"
  element={<Redistribution />}
/>
          <Route
  path="/franchise"
  element={<Franchise />}
/>
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Main application */}
        <Route
          path="/*"
          element={<Layout />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;