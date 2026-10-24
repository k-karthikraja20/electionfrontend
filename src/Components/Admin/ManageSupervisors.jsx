import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import Loader from "../card/Loader";

const emptySupervisor = {
  name: "",
  email: "",
  password: "",
  department: "",
  phone: "",
};

function ManageSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptySupervisor);
  const [editingId, setEditingId] = useState(null);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/supervisors");
      if (res.data.success) {
        setSupervisors(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load supervisors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email) {
      setError("Please enter supervisor name and email.");
      return;
    }

    if (!editingId && !form.password) {
      setError("Please provide an initial password for the supervisor.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/supervisors/${editingId}`, form);
        setSuccess("Supervisor updated successfully.");
      } else {
        await api.post("/admin/supervisors", form);
        setSuccess("Supervisor account created successfully.");
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptySupervisor);
      fetchSupervisors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save supervisor.");
    }
  };

  const handleEdit = (sup) => {
    setEditingId(sup._id);
    setForm({
      name: sup.name,
      email: sup.email,
      department: sup.department || "",
      phone: sup.phone || "",
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supervisor account for ${name}?`)) return;
    try {
      await api.delete(`/admin/supervisors/${id}`);
      setSuccess("Supervisor deleted.");
      fetchSupervisors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete supervisor.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUserShield /> Manage Election Supervisors
          </h1>
          <p className="page-subtitle">
            Create and maintain supervisor accounts authorized to oversee candidate nominations and election integrity
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptySupervisor);
            setShowModal(true);
          }}
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
        >
          <FaPlus /> Create Supervisor
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

      {/* Table */}
      <div className="modern-card">
        <div className="modern-card-header">
          <h5 className="modern-card-title">Authorized Faculty Supervisors ({supervisors.length})</h5>
        </div>
        <div className="modern-card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <Loader text="Loading Supervisors..." />
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Supervisor Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((sup) => (
                    <tr key={sup._id}>
                      <td className="fw-semibold">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 32, height: 32, fontSize: 13 }}
                          >
                            {sup.name.charAt(0)}
                          </div>
                          <span>{sup.name}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{sup.email}</td>
                      <td>{sup.department || "General Faculty"}</td>
                      <td className="small">{sup.phone || "—"}</td>
                      <td className="small text-muted">
                        {new Date(sup.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => handleEdit(sup)}
                            className="btn btn-sm btn-outline-primary py-1 px-2"
                            title="Edit Supervisor"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(sup._id, sup.name)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Delete Supervisor"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {supervisors.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No supervisors created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingId ? "Edit Supervisor" : "Add Faculty Supervisor"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Prof. Rajesh Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="supervisor@campus.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Faculty Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Faculty of Computer Applications"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label small fw-bold">
                      {editingId ? "Reset Password (leave blank to keep)" : "Initial Password *"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required={!editingId}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3">
                    {editingId ? "Save Changes" : "Create Account"}
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

export default ManageSupervisors;
