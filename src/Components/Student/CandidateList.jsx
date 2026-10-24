import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaUsers,
  FaSearch,
  FaVoteYea,
  FaUserGraduate,
  FaBookOpen,
  FaTasks,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";
import Loader from "../card/Loader";

function CandidateList() {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load elections on mount
  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/elections");
      if (res.data.success) {
        const elList = res.data.data;
        setElections(elList);

        // Pick active election first, or first available
        const active = elList.find((e) => e.status === "active");
        const defaultId = active ? active._id : elList[0]?._id || "";
        setSelectedElectionId(defaultId);

        if (defaultId) {
          await loadElectionDetailsAndCandidates(defaultId);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load elections roster.");
    } finally {
      setLoading(false);
    }
  };

  const loadElectionDetailsAndCandidates = async (electionId) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch positions for this election
      const posRes = await api.get(`/elections/${electionId}/positions`);
      if (posRes.data.success) {
        setPositions(posRes.data.data);
      }

      // 2. Fetch candidates for this election
      const candRes = await api.get(`/candidates?electionId=${electionId}`);
      if (candRes.data.success) {
        setCandidates(candRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidate profiles.");
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (e) => {
    const newId = e.target.value;
    setSelectedElectionId(newId);
    setSelectedPositionId("all");
    if (newId) {
      loadElectionDetailsAndCandidates(newId);
    } else {
      setCandidates([]);
      setPositions([]);
    }
  };

  // Filter candidates based on position and search text
  const filteredCandidates = candidates.filter((c) => {
    const matchesPosition =
      selectedPositionId === "all" ||
      c.positionId?._id === selectedPositionId ||
      c.positionId === selectedPositionId;

    const query = searchTerm.toLowerCase().trim();
    const student = c.studentId || {};
    const matchesSearch =
      !query ||
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.regNo && student.regNo.toLowerCase().includes(query)) ||
      (student.department && student.department.toLowerCase().includes(query)) ||
      (c.manifesto && c.manifesto.toLowerCase().includes(query));

    return matchesPosition && matchesSearch;
  });

  const selectedElection = elections.find((e) => e._id === selectedElectionId);

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUsers className="text-primary" /> Candidate Directory & Manifestos
          </h1>
          <p className="page-subtitle">
            Review approved nominees, campaign symbols, agendas, and qualifications before casting your vote.
          </p>
        </div>
        <div>
          {selectedElection?.status === "active" && (
            <button
              onClick={() => navigate("/student/vote")}
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold"
            >
              <FaVoteYea /> Proceed to Vote
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Filters Card */}
      <div className="modern-card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          {/* Election Selector */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">
              Select Election
            </label>
            <select
              className="form-select"
              value={selectedElectionId}
              onChange={handleElectionChange}
            >
              {elections.map((el) => (
                <option key={el._id} value={el._id}>
                  {el.title} ({el.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">
              Filter by Position
            </label>
            <select
              className="form-select"
              value={selectedPositionId}
              onChange={(e) => setSelectedPositionId(e.target.value)}
            >
              <option value="all">All Positions ({positions.length})</option>
              {positions.map((pos) => (
                <option key={pos._id} value={pos._id}>
                  {pos.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">
              Search Candidates
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, reg no, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-5 text-center">
          <Loader text="Loading Candidate Profiles..." />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="modern-card p-5 text-center shadow-sm">
          <FaUsers size={48} className="text-muted opacity-50 mb-3" />
          <h4 className="fw-bold text-dark">No Candidates Found</h4>
          <p className="text-muted small mb-0">
            {searchTerm || selectedPositionId !== "all"
              ? "No candidate matches your search or filter criteria. Try resetting the filters."
              : "No approved candidates have been registered for this election yet."}
          </p>
        </div>
      ) : (
        /* Candidate Cards Grid */
        <div className="row g-4">
          {filteredCandidates.map((cand) => {
            const student = cand.studentId || {};
            const pos = cand.positionId || {};
            const symbol = cand.assignedSymbol || {};

            return (
              <div key={cand._id} className="col-lg-6">
                <div className="modern-card h-100 p-4 border shadow-sm d-flex flex-column justify-content-between">
                  <div>
                    {/* Top row: Avatar, Info, and Official Symbol */}
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: 56, height: 56, fontSize: "22px" }}
                        >
                          {student.name ? student.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <h5 className="fw-bold text-dark mb-1">{student.name || "Candidate"}</h5>
                          <div className="d-flex flex-wrap align-items-center gap-2 text-secondary small">
                            <span className="badge bg-light text-dark border">
                              {student.regNo || "N/A"}
                            </span>
                            <span>•</span>
                            <span>{student.department || "Dept"}</span>
                            <span>•</span>
                            <span>{student.year || "Year"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Symbol Badge */}
                      <div
                        className="text-center p-2 rounded-3 border bg-light flex-shrink-0"
                        style={{ minWidth: 72 }}
                        title={`Symbol: ${symbol.name || "Official Symbol"}`}
                      >
                        <div style={{ fontSize: "28px", lineHeight: 1 }}>
                          {symbol.icon || "🗳️"}
                        </div>
                        <small className="fw-bold d-block text-dark text-truncate mt-1" style={{ fontSize: "11px", maxWidth: 75 }}>
                          {symbol.name || "Symbol"}
                        </small>
                      </div>
                    </div>

                    {/* Position & Eligibility Badges */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fw-semibold fs-6">
                          Running for: {pos.title || "Executive Role"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-success fw-semibold small">
                        <FaCheckCircle /> Academic: {student.academicPercentage ?? "N/A"}%
                      </div>
                    </div>

                    {/* Manifesto */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 text-secondary small fw-bold mb-1">
                        <FaBookOpen className="text-primary" /> Campaign Manifesto
                      </div>
                      <p
                        className="p-3 bg-light rounded-3 text-dark small mb-0 fst-italic border"
                        style={{ minHeight: "65px" }}
                      >
                        "{cand.manifesto || "Dedicated to serving the student body and elevating campus life."}"
                      </p>
                    </div>

                    {/* Planned Work / Agenda */}
                    {cand.plannedWork && cand.plannedWork.length > 0 && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 text-secondary small fw-bold mb-1">
                          <FaTasks className="text-success" /> Key Commitments & Initiatives
                        </div>
                        <ul className="list-unstyled mb-0 small ps-2">
                          {cand.plannedWork.map((work, idx) => (
                            <li key={idx} className="d-flex align-items-start gap-2 mb-1 text-muted">
                              <span className="text-success fw-bold">✓</span>
                              <span>{work}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  {selectedElection?.status === "active" && (
                    <div className="pt-3 border-top mt-2">
                      <button
                        onClick={() => navigate("/student/vote", { state: { preselectedPosition: pos._id } })}
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                      >
                        <FaVoteYea /> Vote for this Position
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CandidateList;