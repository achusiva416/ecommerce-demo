import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useDealer from "../../hooks/useDealer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const AddEditDealer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
    alternate_phone: ""
  });

  const { dealer, isDealerLoading, createDealer, updateDealer } = useDealer(id);

  // Sync form data with dealer data when editing
  useEffect(() => {
    if (id && dealer && Object.keys(dealer).length > 0) {
      setFormData({
        name: dealer.name || "",
        location: dealer.location || "",
        address: dealer.address || "",
        phone: dealer.phone || "",
        alternate_phone: dealer.alternate_phone || ""
      });
    }
  }, [id, dealer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (id) {
        await updateDealer(formData);
        navigate(`/dealers/${id}`);
      } else {
        const response = await createDealer(formData);
        navigate(`/dealers/${response.data.id}`);
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container-fluid px-0 px-md-3 py-2">
      <div className="col-12 px-0 col-md-6 d-flex justify-content-md-start py-2">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
              
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <Link to="/dealers" className="text-decoration-none">
                <i className="bi bi-people me-1"></i>
                Dealers
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i class="bi bi-folder-plus me-1"></i>
                {id ? "Edit" : "Add"} Dealer
            </li>
          </ol>
        </nav>
      </div>
      {/* <div className="row mx-0 mb-4">
        <div className="col-12">
          <h2 className="mb-0">{id ? "Edit" : "Add"} Dealer</h2>
          <p className="text-muted">Fill in the dealer details below</p>
        </div>
      </div> */}

      <div className="card shadow-sm">
        <div className="card-body">
          {id && isDealerLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading dealer details...</span>
              </div>
              <p className="mt-2 text-muted">Loading dealer details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">Dealer Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter dealer name"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="location" className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter location"
                />
              </div>
              <div className="col-12 mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                ></textarea>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="alternate_phone" className="form-label">Alternate Phone</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    className="form-control"
                    id="alternate_phone"
                    name="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                    placeholder="Optional alternate number"
                  />
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dealers')}
              >
                Cancel
              </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {id ? "Update Dealer" : "Create Dealer "}
                    </>
                  )}
                </button>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditDealer;