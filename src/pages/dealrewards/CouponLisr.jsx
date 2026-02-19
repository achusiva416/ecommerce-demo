import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import CouponModal from "./CouponModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ViewCouponModal from "./ViewCouponModal";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";


// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const CouponList = () => {
  const navigate = useNavigate();  
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/coupons", {
        params: {
          page: page,
          per_page: perPage,
          with_items: true // Include product details
        },
      });
      setCoupons(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch coupons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, perPage]);

  // Copy coupon code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success("Coupon code copied to clipboard");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy coupon code");
      });
  };

  const handleViewClick = (coupon) => {
    setSelectedCoupon(coupon);
    setViewOpen(true);
  };

  const handleEditClick = (coupon) => {
    setSelectedCoupon(coupon);
    setOpen(true);
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCoupon(null);
    setOpen(true);
  };

  const handleCouponSaved = () => {
    setOpen(false);
    setSelectedCoupon(null);
    fetchCoupons();
  };

  const handleCouponDeleted = () => {
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
    fetchCoupons();
  };

  const getStatusBadge = (isActive, expiryDate) => {
    if (!isActive) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) {
      return <span className="badge bg-danger">Expired</span>;
    }
    
    return <span className="badge bg-success">Active</span>;
  };

  const getDiscountTypeText = (type) => {
    return type === 'percentage' ? 'Percentage' : 'Fixed Amount';
  };

  const getApplicableForText = (applicableFor) => {
    switch (applicableFor) {
      case 'all_products':
        return 'All Products';
      case 'selected_products':
        return 'Selected Products';
      default:
        return 'All Products';
    }
  };

  // Format product display in table
  const formatSelectedProducts = (coupon) => {
    if (coupon.applicable_for !== "selected_products" || !coupon.items || coupon.items.length === 0) {
      return '-';
    }
    
    const count = coupon.items.length;
    return `${count} product${count !== 1 ? 's' : ''}`;
  };

  // Format datetime for display in DD/MM/YYYY HH:mm AM/PM format
  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return '-';
    
    try {
      return dayjs.utc(datetimeString).local().format('DD/MM/YYYY hh:mm A');
    } catch (error) {
      console.error('Error formatting datetime:', datetimeString, error);
      return '-';
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage;

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4">
        <div className="col-12 px-0 col-md-6 d-flex justify-content-md-start">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>
                  Dashboard
                </Link>
                
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <Link to="/deals" className="text-decoration-none">
                  <i className="bi bi-percent me-1"></i>
                  Deals & Rewards
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i class="bi bi-card-list me-1"></i>
                  Coupons
              </li>
            </ol>
          </nav>
        </div>
        
        <div className="col-12 px-0 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleAddClick}
          >
            <i className="bi bi-plus me-2"></i>
            Add Coupon
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading coupons...</p>
            </div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-ticket-perforated display-4 text-muted"></i>
              <p className="text-muted mt-3">No coupons found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={handleAddClick}
              >
                Add Your First Coupon
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Coupon Code</th>
                      <th>Coupon Name</th>
                      <th>Discount</th>
                      <th>Applicable For</th>
                      <th>Min Order</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, index) => (
                      <tr key={coupon.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2 font-monospace">{coupon.coupon_code}</span>
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '24px', height: '24px' }}
                              onClick={() => copyToClipboard(coupon.coupon_code)}
                              title="Copy coupon code"
                            >
                              <i className="bi bi-clipboard" style={{ fontSize: '0.7rem' }}></i>
                            </button>
                          </div>
                        </td>
                        <td>{coupon.coupon_name}</td>
                        <td>
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%` 
                            : `₹${coupon.discount_value}`
                          }
                          <br />
                          <small className="text-muted">{getDiscountTypeText(coupon.discount_type)}</small>
                        </td>
                        <td>
                          {getApplicableForText(coupon.applicable_for)}
                          <br/>
                          {coupon.applicable_for === "selected_products" && (
                            // <br />
                            <small className="text-muted">{formatSelectedProducts(coupon)}</small>
                          )}
                        </td>
                        <td>
                          {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : 'No minimum'}
                        </td>
                        <td>
                          {new Date(coupon.expiry_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                          })}
                        </td>
                        <td>{getStatusBadge(coupon.is_active, coupon.expiry_date)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleViewClick(coupon)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleEditClick(coupon)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleDeleteClick(coupon)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    <span className="text-muted">
                      Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalItems)} of {totalItems} entries
                    </span>
                  </div>
                  
                  <div className="d-flex gap-2 align-items-center">
                    <select 
                      className="form-select form-select-sm"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      style={{ width: 'auto' }}
                    >
                      {[5, 10, 20, 50].map(option => (
                        <option key={option} value={option}>{option} per page</option>
                      ))}
                    </select>
                    
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <CouponModal
        open={open}
        onClose={() => setOpen(false)}
        coupon={selectedCoupon}
        onSave={handleCouponSaved}
      />

      {/* View Details Modal */}
      <ViewCouponModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        coupon={selectedCoupon}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        item={couponToDelete}
        onDelete={handleCouponDeleted}
      />
    </div>
  );
};

export default CouponList;