import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaVoteYea,
  FaCheckCircle,
  FaCalendarAlt,
  FaPercent,
  FaInfoCircle,
  FaTimes,
  FaBullhorn,
} from "react-icons/fa";
import Loader from "../card/Loader";

const emptyElection = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "draft",
  isSelfVotingAllowed: false,
};

const emptyPosition = {
  title: "",
  description: "",
  minAcademicPercentage: 70,
  order: 1,
};

function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Election form modal state
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [electionForm, setElectionForm] = useState(emptyElection);
  const [editingElectionId, setEditingElectionId] = useState(null);

  // Position modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedElectionForPos, setSelectedElectionForPos] = useState(null);
  const [positionForm, setPositionForm] = useState(emptyPosition);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/elections");
      if (res.data.success) {
        setElections(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load elections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleElectionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!electionForm.title || !electionForm.startDate || !electionForm.endDate) {
      setError("Please fill in title, start date, and end date.");
      return;
    }

    try {
      if (editingElectionId) {
        await api.put(`/elections/${editingElectionId}`, electionForm);
        setSuccess("Election updated successfully.");
      } else {
        await api.post("/elections", electionForm);
        setSuccess("Election created successfully.");
      }
      setShowElectionModal(false);
      setEditingElectionId(null);
      setElectionForm(emptyElection);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save election.");
    }
  };

  const handleEditElection = (el) => {
    setEditingElectionId(el._id);
    setElectionForm({
      title: el.title,
      description: el.description || "",
      startDate: el.startDate ? el.startDate.slice(0, 16) : "",
      endDate: el.endDate ? el.endDate.slice(0, 16) : "",
      status: el.status,
      isSelfVotingAllowed: Boolean(el.isSelfVotingAllowed),
    });
    setShowElectionModal(true);
  };

  const handleDeleteElection = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete election '${title}' and all its positions?`)) {
      return;
    }
    try {
      await api.delete(`/elections/${id}`);
      setSuccess("Election deleted.");
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete election.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/elections/${id}/status`, { status: newStatus });
      setSuccess(`Election status changed to '${newStatus}'.`);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change status.");
    }
  };

  const handlePublishResults = async (id) => {
    if (!window.confirm("Publishing results makes them visible to all candidates and students. Proceed?")) {
      return;
    }
    try {
      await api.post(`/elections/${id}/publish-results`);
      setSuccess("Election results published successfully!");
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish results.");
    }
  };

  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedElectionForPos || !positionForm.title) {
      setError("Position title is required.");
      return;
    }

    try {
      await api.post(`/elections/${selectedElectionForPos}/positions`, positionForm);
      setSuccess("Position added with eligibility threshold.");
      setShowPositionModal(false);
      setPositionForm(emptyPosition);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add position.");
    }
  };

  const handleDeletePosition = async (electionId, positionId) => {
    if (!window.confirm("Remove this position from the election?")) return;
    try {
      await api.delete(`/elections/${electionId}/positions/${positionId}`);
      setSuccess("Position removed.");
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove position.");
    }
  };

  if (loading && elections.length === 0) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Elections..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaVoteYea /> Manage Elections & Positions
          </h1>
          <p className="page-subtitle">
            Configure elections, academic eligibility thresholds (Chairman 90%, Vice Chairman 80%, etc.), and voting lifecycle
          </p>
        </div>
        <button
          onClick={() => {
            setEditingElectionId(null);
            setElectionForm(emptyElection);
            setShowElectionModal(true);
          }}
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
        >
          <FaPlus /> Create New Election
        </button>
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

      {/* Elections List */}
      <div className="d-flex flex-column gap-4">
        {elections.map((el) => (
          <div key={el._id} className="modern-card">
            <div className="modern-card-header">
              <div className="d-flex align-items-center gap-3">
                <h5 className="modern-card-title">{el.title}</h5>
                <span className={`badge-custom badge-${el.status}`}>
                  ● {el.status.toUpperCase()}
                </span>
                {el.isResultsPublished && (
                  <span className="badge bg-success text-white">Results Published</span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Status transitions */}
                {el.status === "draft" && (
                  <button
                    onClick={() => handleStatusChange(el._id, "upcoming")}
                    className="btn btn-sm btn-outline-warning"
                  >
                    Mark Upcoming
                  </button>
                )}
                {el.status === "upcoming" && (
                  <button
                    onClick={() => handleStatusChange(el._id, "active")}
                    className="btn btn-sm btn-success"
                  >
                    Activate Voting
                  </button>
                )}
                {el.status === "active" && (
                  <button
                    onClick={() => handleStatusChange(el._id, "closed")}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Close Voting
                  </button>
                )}
                {el.status === "closed" && !el.isResultsPublished && (
                  <button
                    onClick={() => handlePublishResults(el._id)}
                    className="btn btn-sm btn-primary"
                  >
                    <FaBullhorn /> Publish Results
                  </button>
                )}

                <button
                  onClick={() => handleEditElection(el)}
                  className="btn btn-sm btn-outline-primary"
                  title="Edit Election Details"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteElection(el._id, el.title)}
                  className="btn btn-sm btn-outline-danger"
                  title="Delete Election"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="modern-card-body">
              <p className="text-muted small mb-3">{el.description || "No description provided."}</p>

              <div className="row g-2 mb-3 small text-secondary">
                <div className="col-sm-6">
                  <FaCalendarAlt className="me-2" />
                  <strong>Voting Window:</strong>{" "}
                  {new Date(el.startDate).toLocaleString()} – {new Date(el.endDate).toLocaleString()}
                </div>
                <div className="col-sm-6">
                  <strong>Self-Voting Allowed:</strong> {el.isSelfVotingAllowed ? "Yes" : "No (Blocked)"}
                </div>
              </div>

              {/* Positions within this election */}
              <div className="border rounded-3 p-3 bg-light">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold mb-0 text-dark">Configured Positions & Eligibility Thresholds</h6>
                  <button
                    onClick={() => {
                      setSelectedElectionForPos(el._id);
                      setPositionForm(emptyPosition);
                      setShowPositionModal(true);
                    }}
                    className="btn btn-sm btn-outline-primary py-1 px-2"
                    style={{ fontSize: "12px" }}
                  >
                    <FaPlus /> Add Position
                  </button>
                </div>

                {el.positions && el.positions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered bg-white mb-0" style={{ fontSize: "13px" }}>
                      <thead className="table-light">
                        <tr>
                          <th>Position Title</th>
                          <th>Min Academic Percentage</th>
                          <th>Description</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {el.positions.map((pos) => (
                          <tr key={pos._id}>
                            <td className="fw-semibold">{pos.title}</td>
                            <td>
                              <span className="badge bg-primary text-white">
                                {pos.minAcademicPercentage}% or higher
                              </span>
                            </td>
                            <td className="text-muted">{pos.description || "—"}</td>
                            <td>
                              <button
                                onClick={() => handleDeletePosition(el._id, pos._id)}
                                className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted small py-2">
                    No positions configured yet. Add positions (e.g. Chairman 90%, Vice Chairman 80%, Secretary 70%).
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {elections.length === 0 && (
          <div className="modern-card p-5 text-center text-muted">
            <FaVoteYea size={48} className="mb-3 text-secondary opacity-50" />
            <h5>No Elections Created Yet</h5>
            <p className="small mb-3">Get started by creating your first campus council or club election.</p>
            <button
              onClick={() => {
                setEditingElectionId(null);
                setElectionForm(emptyElection);
                setShowElectionModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <FaPlus /> Create Election
            </button>
          </div>
        )}
      </div>

      {/* Election Modal */}
      {showElectionModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingElectionId ? "Edit Election" : "Create New Election"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowElectionModal(false)}
                ></button>
              </div>
              <form onSubmit={handleElectionSubmit}>
                <div className="modal-body p-4">
                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Election Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Student Council Election 2026"
                      value={electionForm.title}
                      onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Overview or election purpose"
                      value={electionForm.description}
                      onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Start Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={electionForm.startDate}
                        onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">End Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={electionForm.endDate}
                        onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Initial Status</label>
                    <select
                      className="form-select"
                      value={electionForm.status}
                      onChange={(e) => setElectionForm({ ...electionForm, status: e.target.value })}
                    >
                      <option value="draft">Draft (Admin setup only)</option>
                      <option value="upcoming">Upcoming (Visible, voting locked)</option>
                      <option value="active">Active (Voting enabled)</option>
                      <option value="closed">Closed (Voting blocked)</option>
                    </select>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selfVoteCheck"
                      checked={electionForm.isSelfVotingAllowed}
                      onChange={(e) =>
                        setElectionForm({ ...electionForm, isSelfVotingAllowed: e.target.checked })
                      }
                    />
                    <label className="form-check-label small" htmlFor="selfVoteCheck">
                      Allow candidates to vote for themselves (Default: Disallowed)
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowElectionModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3">
                    {editingElectionId ? "Update Election" : "Create Election"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {showPositionModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h6 className="modal-title fw-bold">Add Position & Threshold</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPositionModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddPositionSubmit}>
                <div className="modal-body p-3">
                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Position Title *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Chairman, Secretary"
                      value={positionForm.title}
                      onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">
                      Min Academic Percentage *
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="e.g. 90"
                      min="0"
                      max="100"
                      step="0.5"
                      value={positionForm.minAcademicPercentage}
                      onChange={(e) =>
                        setPositionForm({ ...positionForm, minAcademicPercentage: e.target.value })
                      }
                      required
                    />
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Example: Chairman 90%, Vice Chairman 80%, Secretary 70%
                    </small>
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label small fw-bold">Brief Description</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Role description"
                      value={positionForm.description}
                      onChange={(e) =>
                        setPositionForm({ ...positionForm, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowPositionModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add Position
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageElections;
