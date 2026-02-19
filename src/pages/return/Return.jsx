import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
// import Layout from "../../components/Layout";
import Pagination from "../../components/Pagination";
import { IMAGE_PATH } from "../../utils/constants";
import { Link } from "react-router-dom";


const ReturnsManagement = () => {
  const navigate = useNavigate();
  
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const rowsPerPageOptions = [5, 10, 20, 50, 100];

  // Fetch returns
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/returns", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm
        }
      });
      setReturns(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch return requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [currentPage, itemsPerPage, searchTerm]);

  // Handle status update
  const handleStatusUpdate = async (status) => {
    if (!selectedReturn) return;
    
    try {
      await apiClient.patch(`/returns/${selectedReturn.id}/status`, { status });
      toast.success(`Return request ${status} successfully`);
      fetchReturns();
      setShowReturnModal(false);
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to update return status";
      toast.error(message);
      console.error(error);
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getProductName = (returnItem) => {
    if (returnItem.order_items?.product_type === "combo") {
      return returnItem.order_items?.combo?.title || "N/A";
    }
    return returnItem.order_items?.product?.name || "N/A";
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
      <div className="container-fluid px-0 px-md-3 py-4">
        {/* Header with search */}
        <div className="row mx-0 mb-4">
          <div className="col-12 col-md-6 px-0  d-flex align-items-end mb-3 mb-md-0">
            <nav aria-label="breadcrumb" className="mb-1">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">
                    <i className="bi bi-house-door me-1"></i>
                    Dashboard
                  </Link>
                  
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                 <i class="bi bi-arrow-return-left me-1"></i>
                    Return Management 
                </li>
              </ol>
            </nav>
          </div>
          <div className="col-12 col-md-6 d-flex flex-column flex-sm-row gap-2">
            <div className="flex-grow-1">
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search return requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Returns table */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : returns.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No return requests found</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Return ID</th>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th>Request Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returns.map((returnItem, index) => (
                        <tr key={returnItem.id}>
                          <td>{returnItem.id}</td>
                          <td>{returnItem.order_id}</td>
                          <td>{returnItem.user?.name || "-"}</td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }} 
                              title={getProductName(returnItem)}>
                            {getProductName(returnItem)}
                          </td>
                          <td>₹{returnItem.returned_amount || "0.00"}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(returnItem.status)}`}>
                              {returnItem.status}
                            </span>
                          </td>
                          <td>{new Date(returnItem.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1 gap-sm-2">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={() => {
                                  setSelectedReturn(returnItem);
                                  setShowReturnModal(true);
                                }}
                                title="View Details"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-3 py-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      rowsPerPageOptions={rowsPerPageOptions}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Return Details Modal */}
        {showReturnModal && selectedReturn && (
          <div className={`modal fade show d-block`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-arrow-return-left me-2"></i>
                    Return Request #{selectedReturn.id} (Order #{selectedReturn.order_id})
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowReturnModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {/* Customer Information */}
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-person-circle me-2"></i>
                            Customer Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-2">
                            <small className="text-muted">Name</small>
                            <p className="mb-0">{selectedReturn.user?.name || 'N/A'}</p>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Email</small>
                            <p className="mb-0">{selectedReturn.user?.email || 'N/A'}</p>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Phone</small>
                            <p className="mb-0">{selectedReturn.user?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <small className="text-muted">Address</small>
                            <p className="mb-0">
                              {selectedReturn.order?.address || 'N/A'},<br />
                              {selectedReturn.order?.city}, {selectedReturn.order?.state},<br />
                              {selectedReturn.order?.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-cart me-2"></i>
                            Order Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-2">
                            <small className="text-muted">Order Date</small>
                            <p className="mb-0">
                              {selectedReturn.order?.created_at
                                ? new Date(selectedReturn.order.created_at).toLocaleString()
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Delivered Date</small>
                            <p className="mb-0">
                              {selectedReturn.order?.delivered_date
                                ? new Date(selectedReturn.order.delivered_date).toLocaleString()
                                : "Not available"}
                            </p>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Product</small>
                            <p className="mb-0">{getProductName(selectedReturn)}</p>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Quantity</small>
                            <p className="mb-0">{selectedReturn.order_items?.quantity || 'N/A'}</p>
                          </div>
                          <div>
                            <small className="text-muted">Amount</small>
                            <p className="mb-0">₹{selectedReturn.returned_amount || '0.00'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return Details */}
                    <div className="col-12 mb-4">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Return Details
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <small className="text-muted">Status</small>
                                <div className="mt-1">
                                  <span className={`badge bg-${getStatusColor(selectedReturn.status)}`}>
                                    {selectedReturn.status}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <small className="text-muted">Request Date</small>
                                <p className="mb-0">
                                  {new Date(selectedReturn.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div>
                                <small className="text-muted">Evidence Images</small>
                                <div className="d-flex gap-2 mt-2 flex-wrap">
                                  {selectedReturn.images?.map((image) => (
                                    <img
                                      key={image.id}
                                      src={IMAGE_PATH + image.image_path}
                                      alt="Return evidence"
                                      className="img-thumbnail"
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => handleImageClick(image)}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Section */}
                    {selectedReturn.status === "pending" && (
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">
                              <i className="bi bi-pencil-square me-2"></i>
                              Update Return Status
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex gap-3 justify-content-end">
                              <button
                                className="btn btn-danger"
                                onClick={() => handleStatusUpdate("rejected")}
                              >
                                <i className="bi bi-x-circle me-2"></i>
                                Reject
                              </button>
                              <button
                                className="btn btn-success"
                                onClick={() => handleStatusUpdate("approved")}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal */}
        {showImageModal && selectedImage && (
          <div className={`modal fade show d-block`} style={{backgroundColor: 'rgba(0,0,0,0.8)'}} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content bg-transparent border-0">
                <div className="modal-header border-0">
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowImageModal(false)}></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={IMAGE_PATH + selectedImage.image_path}
                    alt="Return evidence full view"
                    className="img-fluid"
                    style={{
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      borderRadius: '0.5rem'
                    }}
                  />
                </div>
                <div className="modal-footer border-0 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setShowImageModal(false)}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ReturnsManagement;