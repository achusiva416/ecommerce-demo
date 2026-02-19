import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ViewCouponModal = ({ open, onClose, coupon }) => {
  if (!open || !coupon) return null;

  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return 'Not set';
    try {
      return dayjs.utc(datetimeString).local().format('DD/MM/YYYY hh:mm A');
    } catch (error) {
      return 'Invalid date';
    }
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
    return applicableFor === 'all_products' ? 'All Products' : 'Selected Products';
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    const days = expiry.diff(today, 'day');
    return days;
  };

  const daysRemaining = getDaysRemaining(coupon.expiry_date);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Compact Header */}
          <div className="modal-header bg-light py-3">
            <div className="d-flex align-items-center w-100">
              <div className="bg-primary rounded p-2 me-3">
                <i className="bi bi-ticket-perforated text-white fs-5"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="modal-title mb-0 fw-bold">{coupon.coupon_name}</h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <code className="bg-white border px-2 py-1 rounded small font-monospace text-primary">{coupon.coupon_code}</code>
                  {getStatusBadge(coupon.is_active, coupon.expiry_date)}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>
          
          <div className="modal-body p-3">
            {/* Quick Stats Row with Icons */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  
                  <div className="fw-bold fs-6">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `₹${coupon.discount_value}`
                    }
                  </div>
                  <small className="text-muted">Discount</small>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                 
                  <div className="fw-bold fs-6">{coupon.allowed_users}</div>
                  <small className="text-muted">Allowed Users</small>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  
                  <div className="fw-bold fs-6">
                    {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : 'No min'}
                  </div>
                  <small className="text-muted">Min Order</small>
                </div>
              </div>
            </div>

            {/* Details in Compact Grid */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <h6 className="fw-semibold mb-3 text-primary">
                    <i className="bi bi-info-circle me-2"></i>
                    Basic Info
                  </h6>
                  <div className="space-y-2">
                    <div>
                      <small className="text-muted d-block">Applicable For</small>
                      <span className="fw-medium">{getApplicableForText(coupon.applicable_for)}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Discount Type</small>
                      <span className="fw-medium">{getDiscountTypeText(coupon.discount_type)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded p-3">
                  <h6 className="fw-semibold mb-3 text-primary">
                    <i className="bi bi-calendar-event me-2"></i>
                    Dates
                  </h6>
                  <div className="space-y-2">
                    <div>
                      <small className="text-muted d-block">Expires On</small>
                      <span className="fw-medium">
                        {new Date(coupon.expiry_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                        })}
                      </span>
                      {daysRemaining !== null && (
                        <small className={`d-block mt-1 ${daysRemaining < 3 ? 'text-danger' : 'text-success'}`}>
                          {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? 'Expires today' : 'Expired'}
                        </small>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Products - Compact with Full Names */}
            {coupon.applicable_for === "selected_products" && coupon.items && coupon.items.length > 0 && (
              <div className="mt-3">
                <div className="border rounded">
                  <div className="p-3 border-bottom bg-light">
                    <h6 className="mb-0 fw-semibold text-primary">
                      <i className="bi bi-grid-3x3-gap me-2"></i>
                      Selected Products ({coupon.items.length})
                    </h6>
                  </div>
                  <div className="p-2">
                    <div className="table-responsive" style={{ maxHeight: '200px' }}>
                      <table className="table table-sm table-borderless mb-0">
                        <thead>
                          <tr>
                            <th className="small text-muted">Product Name</th>
                            <th className="small text-muted text-center" width="100">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupon.items.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className={`badge ${item.is_combo ? 'bg-warning' : 'bg-info'} me-2`}>
                                    <i className={`bi ${item.is_combo ? 'bi-box-seam' : 'bi-box'} text-white`}></i>
                                  </span>
                                  <small title={item.is_combo ? item.title : item.name}>
                                    {item.is_combo ? item.title : item.name}
                                  </small>
                                </div>
                              </td>
                              <td className="text-center">
                                <small className={`badge ${item.is_combo ? 'bg-warning' : 'bg-info'} text-white`}>
                                  {item.is_combo ? 'Combo' : 'Product'}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            

            {/* Empty State for Selected Products */}
            {coupon.applicable_for === "selected_products" && (!coupon.items || coupon.items.length === 0) && (
              <div className="mt-3 text-center py-3 border rounded">
                <i className="bi bi-inbox text-muted fs-4 mb-2 d-block"></i>
                <small className="text-muted">No products selected for this coupon</small>
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="modal-footer py-2">
            <button 
              type="button" 
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(coupon.coupon_code);
                // Add toast notification here if needed
              }}
            >
              <i className="bi bi-clipboard me-1"></i>
              Copy Code
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCouponModal;