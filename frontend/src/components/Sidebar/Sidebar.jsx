import "./Sidebar.css";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FaHome,
  FaCapsules,
  FaFilePrescription,
  FaExchangeAlt,
  FaShoppingCart,
  FaUndo,
  FaTrashAlt,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { BsStars } from "react-icons/bs";

import {
  useAuth,
} from "../../context/AuthContext";

export default function Sidebar() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const pharmacistMenus = [
    {
      icon: <FaHome />,
      title: "Dashboard",
      path: "/dashboard",
    },

    {
      icon: <FaCapsules />,
      title: "Medicines",
      path: "/medicines",
    },

    {
      icon: <FaShoppingCart />,
      title: "Billing / POS",
      path: "/billing",
    },

    {
      icon: (
        <FaFilePrescription />
      ),
      title:
        "Doctor Prescriptions",
      path:
        "/doctor-prescriptions",
    },

    {
      icon: <FaExchangeAlt />,
      title:
        "Franchise Redistribution",
      path:
        "/redistribution",
    },

    {
      icon: <FaShoppingCart />,
      title: "Procurement",
      path: "/procurement",
    },

    {
      icon: <FaUndo />,
      title: "Returns",
      path: "/returns",
    },

    {
      icon: <FaTrashAlt />,
      title:
        "Waste Analytics",
      path:
        "/waste-analytics",
    },

    {
      icon: <BsStars />,
      title: "ML Forecast",
      path: "/forecast",
    },

    {
      icon: <FaFileAlt />,
      title: "Reports",
      path: "/reports",
    },

    {
      icon: <FaCog />,
      title: "Settings",
      path: "/settings",
    },
  ];

  const doctorMenus = [
    {
      icon: (
        <FaFilePrescription />
      ),
      title:
        "Prescription / Medicine Suggestions",
      path:
        "/doctor-prescriptions",
    },
  ];

  const menus =
    user?.role ===
    "Doctor"
      ? doctorMenus
      : pharmacistMenus;

  const handleLogout =
    () => {
      logout();
      navigate("/login");
    };

  return (
    <div className="sidebar">
      <div>
        <div className="logo">
          <div className="logoCircle">
            💊
          </div>

          <div>
            <h2>
              PharmaVision
            </h2>

            <p>
              Pharmacy
              Intelligence
            </p>
          </div>
        </div>

        <div className="userRoleCard">
          <div className="roleAvatar">
            {user?.role ===
            "Doctor"
              ? "🩺"
              : "💊"}
          </div>

          <div>
            <strong>
              {user?.name ||
                "User"}
            </strong>

            <span>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="menu">
          {menus.map(
            (
              item,
              index
            ) => (
              <NavLink
                key={index}
                to={item.path}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? "menuItem active"
                    : "menuItem"
                }
              >
                <span className="icon">
                  {item.icon}
                </span>

                <span>
                  {item.title}
                </span>
              </NavLink>
            )
          )}
        </div>
      </div>

      <div>
        {user?.role ===
          "Pharmacist" && (
          <div className="sidebarBottom">
            <h3>
              🤖 ML Intelligence
            </h3>

            <p>
              Forecast and
              inventory
              intelligence
              available.
            </p>

            <NavLink
              to="/forecast"
              className="insightBtn"
            >
              View Forecast
            </NavLink>
          </div>
        )}

        <button
          className="logoutButton"
          onClick={
            handleLogout
          }
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}