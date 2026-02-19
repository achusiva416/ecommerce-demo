import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";


const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    photo: null,  
    preview: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/staff');
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('role', formData.role);
    data.append('password', formData.password);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      if (currentStaff) {
        // Update existing staff
        await apiClient.post(`/staff/${currentStaff.id}`, data);
        toast.success('Staff updated successfully');
      } else {
        // Add new staff
        await apiClient.post('/add-staff', data);
        toast.success('Staff added successfully');
      }
      fetchStaff();
      setShowStaffModal(false);
    } catch (error) {
      const message = error.response?.data?.error || 'Operation failed';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setLoading(true);
      try {
        await apiClient.delete(`/staff/${id}`);
        toast.success('Staff deleted successfully');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role || '',
      password: '',
      photo: null,
      preview: staffMember.photo ? `${staffMember.photo}` : ''
    });
    setShowStaffModal(true);
  };

  const handleAddNew = () => {
    setCurrentStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      photo: null,
      preview: ''
    });
    setShowStaffModal(true);
  };

  const filteredStaff = staff.filter(staffMember =>
    staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staffMember.role && staffMember.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
      <div className="container-fluid px-0 px-md-3 py-4">
        {/* Header with search and add button */}
        <div className="row mx-0 mb-4">
          <div className="col-12 px-0 col-md-6 px-0  d-flex align-items-end mb-3 mb-md-0">
            <nav aria-label="breadcrumb" className="mb-1">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">
                    <i className="bi bi-house-door me-1"></i>
                    Dashboard
                  </Link>
                  
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  <i className="bi bi-person-add me-1"></i>
                    Staff Management
                </li>
              </ol>
            </nav>
          </div>
          <div className="col-12 px-0 col-md-6 d-flex flex-column flex-sm-row gap-2">
            <div className="flex-grow-1">
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center justify-content-center"
              onClick={handleAddNew}
            >
              <i className="bi bi-person-plus me-1 me-md-2"></i>
              <span className="d-none d-md-inline">Add Staff</span>
            </button>
          </div>
        </div>

        {/* Staff table */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading && !staff.length ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No staff members found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staffMember) => (
                      <tr key={staffMember.id}>
                        <td>{staffMember.name}</td>
                        <td>{staffMember.email}</td>
                        <td>{staffMember.phone || '-'}</td>
                        <td>
                          <span className="badge bg-secondary">{staffMember.role == 1 ? 'admin' : 'inventory staff'}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 gap-sm-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleEdit(staffMember)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleDelete(staffMember.id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Staff Modal */}
        {showStaffModal && (
          <div className={`modal fade show d-block`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus me-2"></i>
                    {currentStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowStaffModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Password {currentStaff && <span className="text-muted">(leave blank to keep current)</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!currentStaff}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Photo</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {formData.preview && (
                        <div className="mt-2">
                          <img
                            src={formData.preview}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowStaffModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {currentStaff ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        currentStaff ? 'Update Staff' : 'Add Staff'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default StaffManagement;