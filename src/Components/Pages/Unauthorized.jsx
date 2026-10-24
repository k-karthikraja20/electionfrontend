import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft, FaHome } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-4">
      <div className="bg-white rounded-4 shadow-sm p-5 text-center border" style={{ maxWidth: "480px" }}>
        <div
          className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: 72, height: 72, fontSize: 32 }}
        >
          <FaLock />
        </div>
        <h2 className="fw-bold mb-2 text-danger">Access Restricted</h2>
        <p className="text-muted mb-4">
          You do not have the required administrative or role permissions to access this campus election section.
        </p>
        <button
          onClick={handleReturn}
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold"
        >
          <FaHome /> Return to Your Dashboard
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
