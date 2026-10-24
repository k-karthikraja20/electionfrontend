import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaUserTie,
  FaSave,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaAward,
} from "react-icons/fa";
import Loader from "../card/Loader";
import { useAuth } from "../Context/AuthContext";

function CandidateProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [manifesto, setManifesto] = useState("");
  const [plannedWork, setPlannedWork] = useState([""]);
  const [photoUrl, setPhotoUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Also support applying for nomination if no profile exists
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [preferredSymbol, setPreferredSymbol] = useState("");
  const [applying, setApplying] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/candidates/me");
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        setProfile(p);
        setManifesto(p.manifesto || "");
        setPlannedWork(p.plannedWork && p.plannedWork.length > 0 ? p.plannedWork : [""]);
        setPhotoUrl(p.photoUrl || "");
      } else {
        // Load available elections to allow candidate to apply
        const elRes = await api.get("/elections");
        if (elRes.data.success) {
          setElections(elRes.data.data);
          if (elRes.data.data.length > 0) {
            setSelectedElectionId(elRes.data.data[0]._id);
            setPositions(elRes.data.data[0].positions || []);
            if (elRes.data.data[0].positions?.length > 0) {
              setSelectedPositionId(elRes.data.data[0].positions[0]._id);
            }
          }
        }
      }
    } catch (err) {
      setError("Failed to load candidate profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleElectionChange = (e) => {
    const elId = e.target.value;
    setSelectedElectionId(elId);
    const chosen = elections.find((el) => el._id === elId);
    if (chosen && chosen.positions) {
      setPositions(chosen.positions);
      if (chosen.positions.length > 0) {
        setSelectedPositionId(chosen.positions[0]._id);
      } else {
        setSelectedPositionId("");
      }
    }
  };

  const handleAddPromise = () => {
    setPlannedWork([...plannedWork, ""]);
  };

  const handleRemovePromise = (idx) => {
    setPlannedWork(plannedWork.filter((_, i) => i !== idx));
  };

  const handlePromiseChange = (idx, val) => {
    const updated = [...plannedWork];
    updated[idx] = val;
    setPlannedWork(updated);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      const cleanPromises = plannedWork.map((p) => p.trim()).filter((p) => p !== "");
      await api.put("/candidates/profile", {
        manifesto,
        plannedWork: cleanPromises,
        photoUrl,
      });

      setSuccess("Manifesto and candidate profile updated successfully.");
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedElectionId || !selectedPositionId) {
      setError("Please select an election and position to contest.");
      return;
    }

    try {
      setApplying(true);
      const cleanPromises = plannedWork.map((p) => p.trim()).filter((p) => p !== "");
      await api.post("/candidate-applications", {
        electionId: selectedElectionId,
        positionId: selectedPositionId,
        manifesto,
        plannedWork: cleanPromises,
        preferredSymbol,
      });

      setSuccess("Nomination application submitted! It is now pending supervisor review.");
      setTimeout(() => {
        loadProfile();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit nomination.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Profile Details..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUserTie className="text-warning" /> Candidate Profile & Manifesto Editor
          </h1>
          <p className="page-subtitle">
            Craft your election promises, manifesto statements, and campaign profile visible to student voters
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <FaInfoCircle /> {error}
          </div>
          <button className="btn-close btn-sm" onClick={() => setError("")}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <FaCheckCircle /> {success}
          </div>
          <button className="btn-close btn-sm" onClick={() => setSuccess("")}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left: Verified Academic Credentials & Symbol */}
        <div className="col-lg-4">
          <div className="modern-card mb-4">
            <div className="modern-card-header">
              <h5 className="modern-card-title">Verified Student Information</h5>
            </div>
            <div className="modern-card-body">
              <div className="text-center mb-4">
                <img
                  src={
                    photoUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
                  }
                  alt={user?.name}
                  className="rounded-circle border border-3 border-primary shadow-sm mb-3"
                  style={{ width: 110, height: 110, objectFit: "cover" }}
                />
                <h5 className="fw-bold mb-0 text-dark">{user?.name}</h5>
                <small className="text-muted">{user?.regNo}</small>
              </div>

              <div className="border-top pt-3 small">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Department:</span>
                  <span className="fw-semibold">{user?.department}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Academic Year:</span>
                  <span className="fw-semibold">{user?.year}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Academic Percentage:</span>
                  <span className="fw-bold text-success">{user?.academicPercentage}%</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">College Email:</span>
                  <span className="fw-semibold text-truncate ms-2">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Symbol Card */}
          {profile?.assignedSymbol && (
            <div className="modern-card">
              <div className="modern-card-header">
                <h5 className="modern-card-title">Assigned Election Symbol</h5>
              </div>
              <div className="modern-card-body text-center p-4">
                <div className="candidate-symbol-badge mx-auto mb-3" style={{ width: 72, height: 72, fontSize: 36 }}>
                  {profile.assignedSymbol.icon || "🗳️"}
                </div>
                <h5 className="fw-bold text-dark mb-1">{profile.assignedSymbol.name}</h5>
                <p className="text-muted small mb-0">{profile.assignedSymbol.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Manifesto & Promises Editor / Application Form */}
        <div className="col-lg-8">
          <div className="modern-card">
            <div className="modern-card-header">
              <h5 className="modern-card-title">
                {profile ? "Campaign Manifesto & Planned Initiatives" : "Submit Nomination Application"}
              </h5>
            </div>
            <div className="modern-card-body p-4">
              {profile ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Candidate Photo URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                    />
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Direct image link to be displayed on student voter ballots
                    </small>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Campaign Manifesto Statement *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe your vision, core values, and goals for the student council..."
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label small fw-bold mb-0">Key Promises & Planned Work</label>
                      <button
                        type="button"
                        onClick={handleAddPromise}
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        style={{ fontSize: "12px" }}
                      >
                        <FaPlus /> Add Item
                      </button>
                    </div>

                    {plannedWork.map((item, idx) => (
                      <div key={idx} className="input-group mb-2">
                        <span className="input-group-text bg-light small fw-bold">#{idx + 1}</span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Free peer-tutoring network across departments"
                          value={item}
                          onChange={(e) => handlePromiseChange(idx, e.target.value)}
                        />
                        {plannedWork.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemovePromise(idx)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                    disabled={saving}
                  >
                    <FaSave /> {saving ? "Saving Changes..." : "Save Manifesto Updates"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleApplySubmit}>
                  <p className="text-muted small mb-3">
                    Select an open election and position to submit your nomination. Your academic percentage ({user?.academicPercentage}%) will be validated server-side against the position threshold.
                  </p>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Select Election *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedElectionId}
                        onChange={handleElectionChange}
                        required
                      >
                        {elections.map((el) => (
                          <option key={el._id} value={el._id}>
                            {el.title} ({el.status.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Select Position to Contest *</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedPositionId}
                        onChange={(e) => setSelectedPositionId(e.target.value)}
                        required
                      >
                        {positions.map((pos) => (
                          <option key={pos._id} value={pos._id}>
                            {pos.title} (Requires {pos.minAcademicPercentage}%+)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Preferred Election Symbol</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Book, Lamp, Tree, Star"
                      value={preferredSymbol}
                      onChange={(e) => setPreferredSymbol(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Your Campaign Manifesto *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Outline why student voters should choose you..."
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label small fw-bold mb-0">Key Promises</label>
                      <button
                        type="button"
                        onClick={handleAddPromise}
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        style={{ fontSize: "12px" }}
                      >
                        <FaPlus /> Add Item
                      </button>
                    </div>

                    {plannedWork.map((item, idx) => (
                      <div key={idx} className="input-group mb-2">
                        <span className="input-group-text bg-light small fw-bold">#{idx + 1}</span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Expand library tech facilities"
                          value={item}
                          onChange={(e) => handlePromiseChange(idx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                    disabled={applying}
                  >
                    {applying ? "Submitting Application..." : "Submit Nomination Application"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;