import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import {
  FaVoteYea,
  FaUserGraduate,
  FaCheckCircle,
  FaHourglassHalf,
  FaCalendarAlt,
  FaReceipt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import Loader from "../card/Loader";
import { useAuth } from "../Context/AuthContext";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeElections, setActiveElections] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [elRes, receiptRes, candRes] = await Promise.all([
        api.get("/elections"),
        api.get("/votes/my-receipts"),
        api.get("/candidates"),
      ]);

      if (elRes.data.success) {
        setActiveElections(elRes.data.data.filter((e) => e.status === "active"));
      }
      if (receiptRes.data.success) {
        setReceipts(receiptRes.data.data);
      }
      if (candRes.data.success) {
        setCandidatesCount(candRes.data.data.length);
      }
    } catch (err) {
      console.warn("Failed to load student dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Loader text="Loading Student Portal..." />
      </div>
    );
  }

  const primaryElection = activeElections.length > 0 ? activeElections[0] : null;

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUserGraduate className="text-primary" /> Student Voter Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong> ({user?.regNo}) • Department of {user?.department || "General Studies"}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate("/student/vote")}
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
          >
            <FaVoteYea /> Cast Your Vote
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Elections</span>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <FaVoteYea />
            </div>
          </div>
          <div className="stat-value">{activeElections.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Approved Candidates</span>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <FaUsers />
            </div>
          </div>
          <div className="stat-value">{candidatesCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Ballots Cast by You</span>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <FaReceipt />
            </div>
          </div>
          <div className="stat-value">{receipts.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Academic Percentage</span>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <FaCheckCircle />
            </div>
          </div>
          <div className="stat-value">{user?.academicPercentage ?? 0}%</div>
        </div>
      </div>

      {/* Active Election Banner */}
      {primaryElection ? (
        <div className="modern-card mb-4 border border-primary border-opacity-25 shadow-sm">
          <div className="modern-card-body p-4">
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-success text-white py-1 px-2">● VOTING IS ACTIVE</span>
                  <span className="text-muted small">Campus Election 2026</span>
                </div>
                <h3 className="fw-bold text-dark mb-2">{primaryElection.title}</h3>
                <p className="text-muted small mb-3">
                  {primaryElection.description || "Cast your vote for your student council representatives."}
                </p>
                <div className="d-flex align-items-center gap-3 text-secondary small">
                  <div>
                    <FaCalendarAlt className="me-1" />
                    Voting Closes: {new Date(primaryElection.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    <FaUsers className="me-1" />
                    {primaryElection.positions?.length || 0} Executive Positions
                  </div>
                </div>
              </div>

              <div className="col-lg-4 text-lg-end">
                <button
                  onClick={() => navigate("/student/vote")}
                  className="btn btn-primary btn-lg px-4 py-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <FaVoteYea /> Vote Now <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-light border p-4 text-center mb-4 rounded-3">
          <FaVoteYea size={36} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-bold text-dark">No Elections Open for Voting Right Now</h5>
          <p className="text-muted small mb-0">
            Please check back when voting windows open. You can browse candidate profiles below.
          </p>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="row g-4">
        <div className="col-md-3 col-sm-6">
          <div className="modern-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3 d-inline-block mb-3">
                <FaUsers size={22} />
              </div>
              <h6 className="fw-bold text-dark">Meet the Candidates</h6>
              <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
                Explore candidate profiles, official election symbols, manifestos, and planned commitments.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/candidates")}
              className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-between"
            >
              <span>Candidates</span>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="modern-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="rounded-3 bg-success bg-opacity-10 text-success p-3 d-inline-block mb-3">
                <FaVoteYea size={22} />
              </div>
              <h6 className="fw-bold text-dark">Cast Official Ballot</h6>
              <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
                Select your approved candidate for each contested position. One confidential ballot per position.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/vote")}
              className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-between"
            >
              <span>Voting Booth</span>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="modern-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-3 d-inline-block mb-3">
                <FaReceipt size={22} />
              </div>
              <h6 className="fw-bold text-dark">My Vote Receipts</h6>
              <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
                Verify your voting record and view anonymous participation receipts for past ballots.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/history")}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-between"
            >
              <span>{receipts.length} Receipts</span>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="modern-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="rounded-3 bg-info bg-opacity-10 text-info p-3 d-inline-block mb-3">
                <span role="img" aria-label="trophy" style={{ fontSize: 22 }}>🏆</span>
              </div>
              <h6 className="fw-bold text-dark">Election Results</h6>
              <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
                Check published election outcomes, vote tallies, percentage distributions, and certified winners.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/results")}
              className="btn btn-outline-info btn-sm d-flex align-items-center justify-content-between"
            >
              <span>View Results</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
