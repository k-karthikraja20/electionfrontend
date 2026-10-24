import React, { useEffect, useState } from "react";
import api from "../Services/api";
import {
  FaUserGraduate,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import Loader from "../card/Loader";

const emptyStudent = {
  name: "",
  regNo: "",
  email: "",
  department: "",
  year: "1st Year",
  phone: "",
  academicPercentage: "",
  password: "",
};

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students", {
        params: { search, department: departmentFilter },
      });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, departmentFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.regNo || !form.email || !form.department) {
      setError("Please fill in name, register number, email, and department.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/students/${editingId}`, form);
        setSuccess("Student details updated successfully.");
      } else {
        await api.post("/admin/students", form);
        setSuccess("Student registered successfully.");
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyStudent);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student.");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      regNo: student.regNo || "",
      email: student.email,
      department: student.department || "",
      year: student.year || "1st Year",
      phone: student.phone || "",
      academicPercentage: student.academicPercentage || "",
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student record for ${name}?`)) return;
    try {
      await api.delete(`/admin/students/${id}`);
      setSuccess("Student deleted successfully.");
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-box">
        <div>
          <h1 className="page-title">
            <FaUserGraduate /> Manage Enrolled Students
          </h1>
          <p className="page-subtitle">
            View, search, create, and update verified student voter records and academic percentages
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyStudent);
            setShowModal(true);
          }}
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
        >
          <FaPlus /> Add Student
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

      {/* Search and Filters */}
      <div className="modern-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-8">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name, register number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="BCA">BCA</option>
              <option value="B.Sc Computer Science">B.Sc Computer Science</option>
              <option value="B.Com">B.Com</option>
              <option value="BBA">BBA</option>
              <option value="BA English">BA English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="modern-card">
        <div className="modern-card-header">
          <h5 className="modern-card-title">Enrolled Student Registry ({students.length})</h5>
        </div>
        <div className="modern-card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <Loader text="Fetching Students..." />
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Department & Year</th>
                    <th>Academic Score</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="fw-bold font-monospace text-primary">
                        {student.regNo || "—"}
                      </td>
                      <td className="fw-semibold">{student.name}</td>
                      <td className="text-muted small">{student.email}</td>
                      <td>
                        {student.department || "General"}
                        <small className="text-muted d-block">{student.year}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-bold">
                          {student.academicPercentage}%
                        </span>
                      </td>
                      <td className="small text-muted">
                        {student.phone || "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => handleEdit(student)}
                            className="btn btn-sm btn-outline-primary py-1 px-2"
                            title="Edit Student"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id, student.name)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Delete Student"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingId ? "Edit Student Details" : "Add Enrolled Student"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Student name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Register Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. BCA2026001"
                        value={form.regNo}
                        onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="student@campus.edu"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Department *</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        required
                      >
                        <option value="">Select Dept</option>
                        <option value="BCA">BCA</option>
                        <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                        <option value="B.Com">B.Com</option>
                        <option value="BBA">BBA</option>
                        <option value="BA English">BA English</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Year</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="Final Year">Final Year</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Academic Percentage *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 85.5"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.academicPercentage}
                        onChange={(e) => setForm({ ...form, academicPercentage: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Phone</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">
                        {editingId ? "Reset Password (leave blank to keep current)" : "Password"}
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        placeholder={editingId ? "••••••••" : "Student password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
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
                    {editingId ? "Save Changes" : "Create Student"}
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

export default ManageStudents;