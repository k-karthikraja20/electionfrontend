import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaVoteYea,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaBullhorn,
  FaInfoCircle,
} from "react-icons/fa";
import Loader from "../card/Loader";

function ElectionStatus() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const res = await api.get("/elections");
        if (res.data.success) {
          setElections(res.data.data);
        }
      } catch (err) {
        setError("Failed to load election timelines.");
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Fetching Election Status..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaVoteYea className="text-primary" /> Campus Election Lifecycle & Status
          </h1>
          <p className="page-subtitle">
            Real-time status tracking for active, upcoming, and published campus elections
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
          <FaInfoCircle className="me-2" /> {error}
        </div>
      )}

      {/* Grid */}
      <div className="row g-4">
        {elections.map((el) => {
          const isVotingNow = el.status === "active";

          return (
            <div key={el._id} className="col-lg-6">
              <div className="modern-card h-100">
                <div className="modern-card-header d-flex align-items-center justify-content-between">
                  <h5 className="modern-card-title mb-0">{el.title}</h5>
                  <span className={`badge-custom badge-${el.status}`}>
                    ● {el.status.toUpperCase()}
                  </span>
                </div>

                <div className="modern-card-body">
                  <p className="text-muted small mb-3">
                    {el.description || "Official campus democratic election."}
                  </p>

                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-primary" />
                      <span className="text-muted">Voting Starts:</span>
                      <span className="fw-semibold">
                        {new Date(el.startDate).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaClock className="text-danger" />
                      <span className="text-muted">Voting Concludes:</span>
                      <span className="fw-semibold">
                        {new Date(el.endDate).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <FaCheckCircle className="text-success" />
                      <span className="text-muted">Candidates On Ballot:</span>
                      <span className="fw-bold">{el.candidateCount ?? 0} Contenders</span>
                    </div>
                  </div>

                  {/* Positions */}
                  <h6 className="fw-bold small text-dark mb-2">Contested Positions:</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {el.positions && el.positions.length > 0 ? (
                      el.positions.map((p) => (
                        <span key={p._id} className="badge bg-white text-dark border py-2 px-3">
                          {p.title} <span className="text-muted">({p.minAcademicPercentage}%+)</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No positions configured</span>
                    )}
                  </div>

                  {/* Status Banner */}
                  {el.status === "active" ? (
                    <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                      <FaCheckCircle /> Voting is currently LIVE and accepting student ballots.
                    </div>
                  ) : el.status === "upcoming" ? (
                    <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                      <FaClock /> Election scheduled. Voting opens on start date.
                    </div>
                  ) : el.status === "closed" ? (
                    <div className="alert alert-secondary py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                      <FaCheckCircle /> Voting concluded. Ballot reconciliation in progress.
                    </div>
                  ) : el.status === "published" ? (
                    <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                      <FaBullhorn /> Official election results have been announced!
                    </div>
                  ) : (
                    <div className="alert alert-light py-2 px-3 small text-muted mb-0">
                      Election setup in progress.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {elections.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <FaVoteYea size={44} className="mb-2 text-secondary opacity-50" />
            <h5>No Elections Currently Active</h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default ElectionStatus;