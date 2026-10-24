import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../Services/api";
import { FaVoteYea, FaEnvelope, FaLock, FaSignInAlt, FaInfoCircle } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // 1. Admin login -> Admin Dashboard
      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // 2. Supervisor login -> Supervisor Dashboard
      if (user.role === "supervisor") {
        navigate("/supervisor/dashboard");
        return;
      }

      // 3. Student / Candidate login -> Check nomination application status
      try {
        const statusRes = await api.get("/candidates/status");
        if (statusRes.data?.hasApplication) {
          const status = statusRes.data.approvalStatus;
          if (status === "approved") {
            navigate("/candidate/dashboard");
            return;
          } else {
            // Application is pending or rejected -> Candidate Application Status
            navigate("/candidate/application-status");
            return;
          }
        }
      } catch (checkErr) {
        console.warn("[Login] Could not verify candidate application status:", checkErr.message);
      }

      // 4. Normal student without candidate application -> Student Dashboard
      navigate("/student/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)" }}>
      <div className="container" style={{ maxWidth: "480px" }}>
        <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 border border-white border-opacity-25">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center shadow-sm mb-3"
              style={{ width: 68, height: 68, fontSize: 32 }}
            >
              🗳️
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "#0F172A" }}>
              Campus Election Portal
            </h3>
            <p className="text-muted small">
              Secure Democratic Voting & Election Management System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3" role="alert">
              <FaInfoCircle className="flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="emailInput">
                College Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <FaEnvelope />
                </span>
                <input
                  id="emailInput"
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label" htmlFor="passwordInput">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <FaLock />
                </span>
                <input
                  id="passwordInput"
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Sign In
                </>
              )}
            </button>

            {/* Candidate Eligibility Entry Button */}
            <div className="text-center mt-3 pt-3 border-top">
              <span className="text-muted small d-block mb-2">Want to become a candidate?</span>
              <button
                type="button"
                id="btn-candidate-eligibility-form"
                className="btn btn-outline-warning w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate("/candidate/eligibility")}
              >
                <span>🗳️</span> Candidate Eligibility Form
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase text-muted fw-bold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                Quick Demo Accounts
              </span>
            </div>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => fillQuickLogin("admin@campus.edu", "Admin@123")}
              >
                👨‍💼 Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => fillQuickLogin("supervisor@campus.edu", "Supervisor@123")}
              >
                🛡️ Supervisor
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => fillQuickLogin("karthik@campus.edu", "Student@123")}
              >
                🗳️ Candidate (94%)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => fillQuickLogin("sneha@campus.edu", "Student@123")}
              >
                🎓 Student (65%)
              </button>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center text-muted small mt-4 mb-0">
            Enrolled student without an account?{" "}
            <Link to="/register" className="fw-semibold text-decoration-none">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
