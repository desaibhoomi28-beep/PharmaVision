import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  FaEnvelope,
  FaLock,
  FaPills,
} from "react-icons/fa";

import {
  useAuth,
} from "../../context/AuthContext";

export default function Login() {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    e
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        !form.email ||
        !form.password
      ) {
        setError(
          "Please enter email and password"
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await axios.post(
            "http://localhost:5000/api/auth/login",
            form
          );

        const data =
          response.data;

        login(
          data.user,
          data.token
        );

        if (
          data.user.role ===
          "Doctor"
        ) {
          navigate(
            "/doctor-prescriptions"
          );
        } else {
          navigate(
            "/dashboard"
          );
        }
      } catch (err) {
        setError(
          err.response
            ?.data?.message ||
            "Login failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">
          <div className="authLogoIcon">
            <FaPills />
          </div>

          <div>
            <h1>
              PharmaVision
            </h1>

            <p>
              Pharmacy
              Management
              System
            </p>
          </div>
        </div>

        <div className="authHeader">
          <h2>
            Welcome Back
          </h2>

          <p>
            Login to your
            PharmaVision
            account
          </p>
        </div>

        {error && (
          <div className="authError">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Email
          </label>

          <div className="inputBox">
            <FaEnvelope />

            <input
              type="email"
              name="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
            />
          </div>

          <label>
            Password
          </label>

          <div className="inputBox">
            <FaLock />

            <input
              type="password"
              name="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="authButton"
            disabled={
              loading
            }
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="authSwitch">
          Don't have an
          account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}