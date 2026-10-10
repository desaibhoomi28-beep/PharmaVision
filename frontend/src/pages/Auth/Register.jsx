import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaIdCard,
  FaPills,
} from "react-icons/fa";

import {
  useAuth,
} from "../../context/AuthContext";

export default function Register() {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Pharmacist",
      phone: "",
      registrationNo: "",
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

  const handleRoleChange =
    (role) => {
      setForm({
        ...form,
        role,
        registrationNo:
          role === "Doctor"
            ? form.registrationNo
            : "",
      });
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        !form.name ||
        !form.email ||
        !form.password
      ) {
        setError(
          "Please fill all required fields"
        );
        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError(
          "Passwords do not match"
        );
        return;
      }

      if (
        form.role ===
          "Doctor" &&
        !form.registrationNo
      ) {
        setError(
          "Doctor registration number is required"
        );
        return;
      }

      try {
        setLoading(true);

        const payload = {
          name: form.name,
          email: form.email,
          password:
            form.password,
          role: form.role,
          phone: form.phone,
          registrationNo:
            form.registrationNo,
        };

        const response =
          await axios.post(
            "http://localhost:5000/api/auth/register",
            payload
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
            "Registration failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="authPage">
      <div className="authCard registerCard">
        <div className="authLogo">
          <div className="authLogoIcon">
            <FaPills />
          </div>

          <div>
            <h1>
              PharmaVision
            </h1>

            <p>
              Create your
              account
            </p>
          </div>
        </div>

        <div className="authHeader">
          <h2>
            Create Account
          </h2>

          <p>
            Register as
            Pharmacist or
            Doctor
          </p>
        </div>

        {error && (
          <div className="authError">
            {error}
          </div>
        )}

        <div className="roleSelector">
          <button
            type="button"
            className={
              form.role ===
              "Pharmacist"
                ? "roleButton activeRole"
                : "roleButton"
            }
            onClick={() =>
              handleRoleChange(
                "Pharmacist"
              )
            }
          >
            💊 Pharmacist
          </button>

          <button
            type="button"
            className={
              form.role ===
              "Doctor"
                ? "roleButton activeRole"
                : "roleButton"
            }
            onClick={() =>
              handleRoleChange(
                "Doctor"
              )
            }
          >
            🩺 Doctor
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Full Name
          </label>

          <div className="inputBox">
            <FaUser />

            <input
              type="text"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter full name"
            />
          </div>

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
              placeholder="Enter email"
            />
          </div>

          <label>
            Phone
          </label>

          <div className="inputBox">
            <FaPhone />

            <input
              type="text"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              placeholder="Enter phone number"
            />
          </div>

          {form.role ===
            "Doctor" && (
            <>
              <label>
                Doctor Registration
                Number
              </label>

              <div className="inputBox">
                <FaIdCard />

                <input
                  type="text"
                  name="registrationNo"
                  value={
                    form.registrationNo
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter registration number"
                />
              </div>
            </>
          )}

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
              placeholder="Create password"
            />
          </div>

          <label>
            Confirm Password
          </label>

          <div className="inputBox">
            <FaLock />

            <input
              type="password"
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={
                handleChange
              }
              placeholder="Confirm password"
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
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="authSwitch">
          Already have an
          account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}