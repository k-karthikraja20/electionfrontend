import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaLock,
  FaPhone,
  FaGraduationCap,
  FaCalendarAlt,
  FaPercent,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

function Register() {
  const [form, setForm] = useState({
    name: "",
    regNo: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    academicPercentage: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (
      !form.name ||
      !form.regNo ||
      !form.email ||
      !form.department ||
      !form.year ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all required registration fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const percentage = Number(form.academicPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError("Academic percentage must be a valid number between 0 and 100.");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = form;
      await api.post("/auth/register", payload);

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)",
      }}
    >
      <div className="container" style={{ maxWidth: "620px" }}>
        <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 border border-white border-opacity-25">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center shadow-sm mb-3"
              style={{ width: 62, height: 62, fontSize: 26 }}
            >
              🎓
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#0F172A" }}>
              Student Voter Registration
            </h3>
            <p className="text-muted small">
              Register with your verified college credentials to participate in campus elections
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <FaInfoCircle className="flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <FaCheckCircle className="flex-shrink-0 text-success" />
              <div>Registration successful! Redirecting to login portal...</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Full Student Name *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaUser /></span>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Ananya Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Registration Number */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Register Number *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaIdCard /></span>
                  <input
                    type="text"
                    name="regNo"
                    className="form-control"
                    placeholder="e.g. BCA2026101"
                    value={form.regNo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* College Email */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">College Email Address *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaEnvelope /></span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="ananya@campus.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Phone Number</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaPhone /></span>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Department */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Department *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaGraduationCap /></span>
                  <select
                    name="department"
                    className="form-select"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="BCA">BCA</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="B.Com">B.Com</option>
                    <option value="BBA">BBA</option>
                    <option value="BA English">BA English</option>
                    <option value="B.Sc Mathematics">B.Sc Mathematics</option>
                  </select>
                </div>
              </div>

              {/* Year */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Academic Year *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaCalendarAlt /></span>
                  <select
                    name="year"
                    className="form-select"
                    value={form.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>

              {/* Academic Percentage */}
              <div className="col-12">
                <label className="form-label small fw-bold d-flex justify-content-between">
                  <span>Academic Percentage (0 - 100%) *</span>
                  <span className="text-muted fw-normal" style={{ fontSize: "11px" }}>Used for candidate eligibility</span>
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaPercent /></span>
                  <input
                    type="number"
                    name="academicPercentage"
                    className="form-control"
                    placeholder="e.g. 88.5"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.academicPercentage}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Create Password *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaLock /></span>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="col-md-6">
                <label className="form-label small fw-bold">Confirm Password *</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light"><FaLock /></span>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Registering Voter Account...
                </>
              ) : (
                <>
                  <FaUserPlus /> Complete Voter Registration
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-muted small mt-4 mb-0">
            Already registered?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Sign in to vote
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
