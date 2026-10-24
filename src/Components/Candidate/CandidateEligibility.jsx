import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUserTie,
  FaVoteYea,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaAward,
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaLock,
} from "react-icons/fa";
import Loader from "../card/Loader";
import { useAuth } from "../Context/AuthContext";

function CandidateEligibility() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbolCode, setSelectedSymbolCode] = useState("");

  const [manifesto, setManifesto] = useState("");
  const [plannedWorkItems, setPlannedWorkItems] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // In-place student authentication if user is not logged in yet
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Check if candidate already has an application and load elections
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Check existing nomination status if logged in
        if (user) {
          try {
            const statusRes = await api.get("/candidates/status");
            if (!isMounted) return;

            if (statusRes.data?.hasApplication) {
              const status = statusRes.data.approvalStatus;
              if (status === "approved") {
                navigate("/candidate/dashboard", { replace: true });
                return;
              } else {
                navigate("/candidate/application-status", { replace: true });
                return;
              }
            }
          } catch (statusErr) {
            console.warn("[Eligibility] Could not check status:", statusErr.message);
          }
        }

        // 2. Fetch active elections with positions
        const elRes = await api.get("/elections/active");
        if (!isMounted) return;

        const activeList = elRes.data?.data || (Array.isArray(elRes.data) ? elRes.data : []);
        setElections(activeList);

        if (activeList.length > 0) {
          const initialElection = activeList[0];
          setSelectedElectionId(initialElection._id);
          
          // Populate initial positions for the first active election (works on page refresh)
          if (Array.isArray(initialElection.positions) && initialElection.positions.length > 0) {
            setPositions(initialElection.positions);
            setSelectedPositionId(initialElection.positions[0]._id);
          } else {
            // Fallback fetch if not embedded
            try {
              const posRes = await api.get(`/elections/${initialElection._id}/positions`);
              if (!isMounted) return;
              if (posRes.data?.success && posRes.data.data.length > 0) {
                setPositions(posRes.data.data);
                setSelectedPositionId(posRes.data.data[0]._id);
              }
            } catch (pErr) {
              console.warn("[Eligibility] Error loading initial positions:", pErr.message);
            }
          }
        } else {
          setError("No active elections are currently available for candidacy nominations.");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load active elections. Please verify your server connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [user?._id, navigate]);

  // Handle Target Election dropdown onChange to dynamically load and filter positions
  const handleElectionChange = async (e) => {
    const electionId = e.target.value;
    setSelectedElectionId(electionId);
    setSelectedPositionId("");

    if (!electionId) {
      setPositions([]);
      return;
    }

    // Filter positions from selected election
    const foundElection = elections.find((el) => el._id === electionId);
    if (foundElection && Array.isArray(foundElection.positions) && foundElection.positions.length > 0) {
      setPositions(foundElection.positions);
      setSelectedPositionId(foundElection.positions[0]._id);
    } else {
      // Fetch dynamically from endpoint if not pre-populated
      try {
        const posRes = await api.get(`/elections/${electionId}/positions`);
        if (posRes.data?.success && posRes.data.data.length > 0) {
          setPositions(posRes.data.data);
          setSelectedPositionId(posRes.data.data[0]._id);
        } else {
          setPositions([]);
        }
      } catch (err) {
        console.warn("Failed to load positions for election:", err.message);
        setPositions([]);
      }
    }
  };

  // Load supported symbols when selected election changes
  useEffect(() => {
    if (!selectedElectionId) return;

    let isMounted = true;

    const loadSymbols = async () => {
      try {
        const symRes = await api
          .get(`/candidate-applications/supported-symbols?electionId=${selectedElectionId}`)
          .catch(() => ({ data: { success: false } }));

        if (!isMounted) return;

        if (symRes.data?.success && Array.isArray(symRes.data.data)) {
          setSymbols(symRes.data.data);
          const available = symRes.data.data.find((s) => !s.isTaken);
          if (available) {
            setSelectedSymbolCode(available.code);
          }
        }
      } catch (err) {
        console.warn("Failed to load symbols:", err.message);
      }
    };

    loadSymbols();

    return () => {
      isMounted = false;
    };
  }, [selectedElectionId]);

  const selectedPosition = positions.find((p) => p._id === selectedPositionId);
  const studentPercentage = Number(user?.academicPercentage) || 0;
  const minRequiredPercentage = Number(selectedPosition?.minAcademicPercentage) || 70;
  const isAcademicallyEligible = user ? studentPercentage >= minRequiredPercentage : false;

  const handleStudentAuth = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!studentEmail || !studentPassword) {
      setAuthError("Please provide both college email and password.");
      return;
    }

    try {
      setAuthLoading(true);
      await login(studentEmail, studentPassword);
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || "Failed to authenticate student record.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddPlannedWork = () => {
    if (plannedWorkItems.length < 6) {
      setPlannedWorkItems([...plannedWorkItems, ""]);
    }
  };

  const handleWorkItemChange = (index, value) => {
    const updated = [...plannedWorkItems];
    updated[index] = value;
    setPlannedWorkItems(updated);
  };

  const handleRemoveWorkItem = (index) => {
    if (plannedWorkItems.length > 1) {
      setPlannedWorkItems(plannedWorkItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please authenticate with your student account first before submitting.");
      return;
    }

    if (!selectedElectionId) {
      setError("Please select an election.");
      return;
    }

    if (!selectedPositionId) {
      setError("Please select a position to contest for.");
      return;
    }

    if (!isAcademicallyEligible) {
      setError(
        `Academic percentage requirement not met. Required: ${minRequiredPercentage}%, Your Score: ${studentPercentage}%.`
      );
      return;
    }

    if (!manifesto.trim()) {
      setError("Please provide a campaign manifesto statement.");
      return;
    }

    const validPlannedWork = plannedWorkItems.map((item) => item.trim()).filter(Boolean);

    try {
      setSubmitting(true);
      const chosenSymbol = symbols.find((s) => s.code === selectedSymbolCode);

      const payload = {
        electionId: selectedElectionId,
        positionId: selectedPositionId,
        manifesto: manifesto.trim(),
        plannedWork: validPlannedWork,
        preferredSymbol: chosenSymbol?.name || selectedSymbolCode,
      };

      const res = await api.post("/candidates", payload);

      if (res.data.success) {
        setSuccess("Eligibility application submitted successfully. Redirecting to Application Status...");
        setTimeout(() => {
          navigate("/candidate/application-status");
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit candidate application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Verifying Student Eligibility & Election Positions..." />
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "880px" }}>
      {/* Header */}
      <div className="page-header-box mb-4">
        <div>
          <h1 className="page-title">
            <FaUserTie className="text-warning" /> Candidate Nomination & Eligibility Form
          </h1>
          <p className="page-subtitle">
            Apply to contest in campus elections. Review institutional criteria, submit campaign commitments, and select an election symbol.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-4">
          <FaTimesCircle className="flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-4">
          <FaCheckCircle className="flex-shrink-0" />
          <div>{success}</div>
        </div>
      )}

      {/* In-place Authentication Card if user is not logged in */}
      {!user ? (
        <div className="modern-card mb-4 border-warning shadow-sm">
          <div className="modern-card-header bg-warning-subtle text-dark">
            <h5 className="modern-card-title d-flex align-items-center gap-2">
              <FaLock className="text-warning" /> Student Authentication Required
            </h5>
          </div>
          <div className="modern-card-body">
            <p className="text-muted small mb-3">
              To verify your academic percentage and institutional standing, please sign in with your official college credentials.
            </p>
            {authError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
                <FaInfoCircle /> {authError}
              </div>
            )}
            <form onSubmit={handleStudentAuth}>
              <div className="row g-2 mb-3">
                <div className="col-md-5">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="College Email (e.g. karthik@campus.edu)"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-semibold"
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing In..." : "Authenticate Student"}
                  </button>
                </div>
              </div>
            </form>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Quick Eligible Account:</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => {
                  setStudentEmail("karthik@campus.edu");
                  setStudentPassword("Student@123");
                }}
              >
                Karthik (94% Score)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ fontSize: "11px" }}
                onClick={() => {
                  setStudentEmail("sneha@campus.edu");
                  setStudentPassword("Student@123");
                }}
              >
                Sneha (65% Score)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Section 1: Read-Only Student Verification */
        <div className="modern-card mb-4">
          <div className="modern-card-header bg-light">
            <h5 className="modern-card-title">
              <FaCheckCircle className="text-success" /> 1. Verified Student Identity (Read-Only)
            </h5>
          </div>
          <div className="modern-card-body">
            <p className="text-muted small mb-3">
              Official identity details are retrieved from your authenticated institutional record and cannot be modified.
            </p>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">Student Full Name</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={user?.name || ""}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">Registration / Roll No</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={user?.regNo || ""}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted mb-1">Department / Branch</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={user?.department || "General"}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted mb-1">Academic Year</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={user?.year || "3rd Year"}
                  readOnly
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted mb-1">Academic Percentage</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control bg-light fw-bold text-primary"
                    value={`${studentPercentage}%`}
                    readOnly
                    disabled
                  />
                  <span className="input-group-text bg-light">
                    {studentPercentage >= 70 ? "✓ Above 70%" : "⚠️ Low"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 2: Election & Position Selection */}
        <div className="modern-card mb-4">
          <div className="modern-card-header bg-light">
            <h5 className="modern-card-title">
              <FaVoteYea className="text-primary" /> 2. Select Election & Contested Position
            </h5>
          </div>
          <div className="modern-card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Target Election *</label>
                <select
                  className="form-select"
                  value={selectedElectionId}
                  onChange={handleElectionChange}
                  required
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading active elections..." : "-- Select Target Election --"}
                  </option>
                  {elections.map((el) => (
                    <option key={el._id} value={el._id}>
                      {el.title || el.name} ({el.status ? el.status.toUpperCase() : "ACTIVE"})
                    </option>
                  ))}
                </select>
                {elections.length === 0 && !loading && (
                  <small className="text-muted mt-1 d-block">
                    No active elections found. Please activate an election first.
                  </small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Target Position *</label>
                <select
                  className="form-select"
                  value={selectedPositionId}
                  onChange={(e) => setSelectedPositionId(e.target.value)}
                  required
                  disabled={!selectedElectionId || positions.length === 0}
                >
                  <option value="">
                    {!selectedElectionId
                      ? "-- Select Target Election First --"
                      : positions.length === 0
                      ? "-- No Positions Available --"
                      : "-- Select Target Position --"}
                  </option>
                  {positions.map((pos) => (
                    <option key={pos._id} value={pos._id}>
                      {pos.title || pos.name} (Min Req: {pos.minAcademicPercentage ?? 70}%)
                    </option>
                  ))}
                </select>
                {selectedElectionId && positions.length === 0 && (
                  <small className="text-muted mt-1 d-block">
                    No positions currently registered for this election.
                  </small>
                )}
              </div>
            </div>

            {/* Eligibility Banner for Selected Position */}
            {selectedPosition && user && (
              <div
                className={`p-3 rounded-3 border small d-flex align-items-center justify-content-between ${
                  isAcademicallyEligible
                    ? "bg-success-subtle border-success text-success-emphasis"
                    : "bg-danger-subtle border-danger text-danger-emphasis"
                }`}
              >
                <div>
                  <strong>Academic Criterion Check:</strong> Position '{selectedPosition.title}' requires a minimum of{" "}
                  <strong>{minRequiredPercentage}%</strong> academic score. Your current verified score is{" "}
                  <strong>{studentPercentage}%</strong>.
                </div>
                <span className="badge fs-6 py-1 px-3 bg-white border text-dark">
                  {isAcademicallyEligible ? "✓ Criteria Met" : "✗ Ineligible"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Campaign Manifesto & Initiatives */}
        <div className="modern-card mb-4">
          <div className="modern-card-header bg-light">
            <h5 className="modern-card-title">
              <FaAward className="text-warning" /> 3. Campaign Manifesto & Planned Initiatives
            </h5>
          </div>
          <div className="modern-card-body">
            <div className="form-group mb-3">
              <label className="form-label small fw-bold">Campaign Manifesto Statement *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="State your campaign mission, core philosophy, and what you aim to achieve for the student community..."
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                required
              ></textarea>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                This statement will be officially reviewed by the Administrator and Supervisor.
              </small>
            </div>

            <div className="form-group mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label small fw-bold mb-0">Planned Initiatives / Promises (Max 6)</label>
                {plannedWorkItems.length < 6 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary py-0 px-2 d-flex align-items-center gap-1"
                    onClick={handleAddPlannedWork}
                  >
                    <FaPlus size={10} /> Add Promise
                  </button>
                )}
              </div>

              {plannedWorkItems.map((item, index) => (
                <div key={index} className="input-group input-group-sm mb-2">
                  <span className="input-group-text bg-light text-muted">#{index + 1}</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`e.g. Expand library digital access, organize inter-college hackathons...`}
                    value={item}
                    onChange={(e) => handleWorkItemChange(index, e.target.value)}
                  />
                  {plannedWorkItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveWorkItem(index)}
                      title="Remove initiative"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Preferred Symbol Selection */}
            <div className="form-group mb-2">
              <label className="form-label small fw-bold">Preferred Election Ballot Symbol</label>
              <select
                className="form-select"
                value={selectedSymbolCode}
                onChange={(e) => setSelectedSymbolCode(e.target.value)}
              >
                {symbols.map((sym) => (
                  <option key={sym.code} value={sym.code} disabled={sym.isTaken}>
                    {sym.icon} {sym.name} {sym.isTaken ? "(Taken by another candidate)" : ""}
                  </option>
                ))}
              </select>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Symbol is officially allocated upon dual Admin and Supervisor sign-off.
              </small>
            </div>
          </div>
        </div>

        {/* Submission Buttons */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            disabled={submitting || !user || !isAcademicallyEligible}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submitting Application...
              </>
            ) : (
              <>
                <FaPaperPlane /> Submit Eligibility
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CandidateEligibility;
