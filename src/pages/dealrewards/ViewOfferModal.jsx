import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ViewOfferModal = ({ open, onClose, offer }) => {
  if (!open || !offer) return null;

  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return 'Not set';
    try {
      return dayjs.utc(datetimeString).format('DD/MM/YYYY hh:mm A');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (isActive, endDate) => {
    if (!isActive) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    
    const today = new Date();
    const end = new Date(endDate);
    
    if (end < today) {
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
      case 'selected_categories':
        return 'Selected Categories';
      default:
        return 'All Products';
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = dayjs();
    const end = dayjs(endDate);
    const days = end.diff(today, 'day');
    return days;
  };

  const daysRemaining = getDaysRemaining(offer.end_date);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Compact Header */}
          <div className="modal-header bg-light py-3">
            <div className="d-flex align-items-center w-100">
              <div className="bg-primary rounded p-2 me-3">
                <i className="bi bi-tag text-white fs-5"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="modal-title mb-0 fw-bold">{offer.offer_name}</h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  {getStatusBadge(offer.is_active, offer.end_date)}
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
                    {offer.discount_type === 'percentage' 
                      ? `${offer.discount_value}%` 
                      : `₹${offer.discount_value}`
                    }
                  </div>
                  <small className="text-muted">Discount</small>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  
                  <div className="fw-bold fs-6">
                    {getApplicableForText(offer.applicable_for)}
                  </div>
                  <small className="text-muted">Applicable For</small>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  
                  <div className="fw-bold fs-6">
                    {offer.min_order_amount ? `₹${offer.min_order_amount}` : 'No min'}
                  </div>
                  <small className="text-muted">Min Order Price</small>
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
                      <small className="text-muted d-block">Offer Name</small>
                      <span className="fw-medium">{offer.offer_name}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Discount Type</small>
                      <span className="fw-medium">{getDiscountTypeText(offer.discount_type)}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Applicable For</small>
                      <span className="fw-medium">{getApplicableForText(offer.applicable_for)}</span>
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
                      <small className="text-muted d-block">Starts On</small>
                      <span className="fw-medium"> 
                        {new Date(offer.start_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                        })}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Ends On</small>
                      <span className="fw-medium">
                        {new Date(offer.end_date).toLocaleString('en-US', {
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
                        <small className={`d-block mt-1 ${daysRemaining < 3 ? 'text-danger' : 'text-warning'}`}>
                          {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? 'Ends today' : 'Ended'}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Items */}
            {(offer.applicable_for === "selected_products" || offer.applicable_for === "selected_categories") && 
             offer.items && offer.items.length > 0 && (
              <div className="mt-3">
                <div className="border rounded">
                  <div className="p-3 border-bottom bg-light">
                    <h6 className="mb-0 fw-semibold text-primary">
                      <i className="bi bi-grid-3x3-gap me-2"></i>
                      {offer.applicable_for === "selected_products" ? "Selected Products" : "Selected Categories"} 
                      ({offer.items.length})
                    </h6>
                  </div>
                  <div className="p-2">
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {offer.items.map((item, index) => (
                        <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                          <div className="d-flex align-items-center flex-grow-1">
                            <span className={`badge ${offer.applicable_for === "selected_products" ? (item.is_combo ? 'bg-warning' : 'bg-info') : 'bg-success'} me-2`}>
                              <i className={`bi ${offer.applicable_for === "selected_products" ? (item.is_combo ? 'bi-box-seam' : 'bi-box') : 'bi-tags'} text-white`}></i>
                            </span>
                            <div className="flex-grow-1">
                              <small className="fw-medium">{item.is_combo ? item.title : item.name}</small>
                            </div>
                          </div>
                          <div>
                            <small className={`badge ${offer.applicable_for === "selected_products" ? (item.is_combo ? 'bg-warning' : 'bg-info') : 'bg-success'} text-white`}>
                              {offer.applicable_for === "selected_products" ? (item.is_combo ? 'Combo' : 'Product') : 'Category'}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="modal-footer py-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferModal;  