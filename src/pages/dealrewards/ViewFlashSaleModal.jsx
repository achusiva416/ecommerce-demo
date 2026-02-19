import React,{ useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import apiClient from "../../services/apiClient";

dayjs.extend(utc);
dayjs.extend(timezone);

const ViewFlashSaleModal = ({ open, onClose, flashSale }) => {
  if (!open || !flashSale) return null;
  const [flashSaleData, setFlashSaleData] = useState(null);

  useEffect(() => {
    const res = apiClient.get(`/flash-sales/${flashSale.id}`);
    res.then((res) => {
     console.log(res.data.data);
     setFlashSaleData(res.data.data);
    });
  }, []);

  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return "Not set";
    try {
      return dayjs.utc(datetimeString).format("DD/MM/YYYY hh:mm A");
    } catch {
      return "Invalid date";
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

    return <span className="badge bg-success">Live</span>;
  };

  const getDiscountTypeText = (type) =>
    type === "percentage" ? "Percentage" : "Fixed Amount";

  const getApplicableForText = (applicableFor) => {
    switch (applicableFor) {
      case "all_products":
        return "All Products";
      case "selected_products":
        return "Selected Products";
      case "selected_categories":
        return "Selected Categories";
      default:
        return "All Products";
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    return dayjs(endDate).diff(dayjs(), "day");
  };

  const daysRemaining = getDaysRemaining(flashSale.end_date);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          {/* HEADER — EXACT SAME */}
          <div className="modal-header bg-light py-3">
            <div className="d-flex align-items-center w-100">
              <div className="bg-primary rounded p-2 me-3">
                <i className="bi bi-lightning-fill text-white fs-5"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="modal-title mb-0 fw-bold">
                  {flashSale.flash_sale_name}
                </h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  {getStatusBadge(flashSale.is_active, flashSale.end_date)}
                </div>
              </div>
              <button className="btn-close" onClick={onClose} />
            </div>
          </div>

          <div className="modal-body p-3">

            {/* QUICK STATS — SAME */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold fs-6">
                    {flashSale.discount_type === "percentage"
                      ? `${flashSale.discount_value}%`
                      : `₹${flashSale.discount_value}`}
                  </div>
                  <small className="text-muted">Discount</small>
                </div>
              </div>

              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold fs-6">
                    {getApplicableForText(flashSale.applicable_for)}
                  </div>
                  <small className="text-muted">Applicable For</small>
                </div>
              </div>

              <div className="col-4">
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold fs-6">
                    {flashSale.min_order_amount
                      ? `₹${flashSale.min_order_amount}`
                      : "No min"}
                  </div>
                  <small className="text-muted">Min Order Price</small>
                </div>
              </div>
            </div>

            {/* DETAILS GRID — SAME */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <h6 className="fw-semibold mb-3 text-primary">
                    <i className="bi bi-info-circle me-2"></i>
                    Basic Info
                  </h6>
                  <div>
                    <small className="text-muted d-block">Flash Sale Name</small>
                    <span className="fw-medium">
                      {flashSale.flash_sale_name}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted d-block">Discount Type</small>
                    <span className="fw-medium">
                      {getDiscountTypeText(flashSale.discount_type)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted d-block">Applicable For</small>
                    <span className="fw-medium">
                      {getApplicableForText(flashSale.applicable_for)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="border rounded p-3">
                  <h6 className="fw-semibold mb-3 text-primary">
                    <i className="bi bi-calendar-event me-2"></i>
                    Dates
                  </h6>
                  <div>
                    <small className="text-muted d-block">Starts On</small>
                    <span className="fw-medium">
                      {formatDateTime(flashSale.start_date)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted d-block">Ends On</small>
                    <span className="fw-medium">
                      {formatDateTime(flashSale.end_date)}
                    </span>
                    {daysRemaining !== null && (
                      <small
                        className={`d-block mt-1 ${
                          daysRemaining < 3
                            ? "text-danger"
                            : "text-primary"
                        }`}
                      >
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                          ? "Ends today"
                          : "Ended"}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SELECTED PRODUCTS — SAME UI */}
            {console.log(flashSaleData?.sale_products)}
            {flashSaleData?.sale_products &&
              flashSaleData?.sale_products.length > 0 && (
                <div className="mt-3">
                  <div className="border rounded">
                    <div className="p-3 border-bottom bg-light">
                      <h6 className="mb-0 fw-semibold text-primary">
                        Selected Products ({flashSaleData.sale_products.length})
                      </h6>
                    </div>
                    <div className="p-2" style={{ maxHeight: 200, overflowY: "auto" }}>
                      {flashSaleData.sale_products.map((sp) => {
                        const item = sp.itemable;
                        const isCombo =
                          sp.itemable_type === "App\\Models\\ComboProduct";

                        return (
                          <div
                            key={sp.id}
                            className="d-flex justify-content-between py-2 border-bottom"
                          >
                            <small className="fw-medium">
                              {isCombo ? item.title : item.name}
                            </small>
                            <small
                              className={`badge ${
                                isCombo ? "bg-warning" : "bg-info"
                              }`}
                            >
                              {isCombo ? "Combo" : "Product"}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* FOOTER — SAME */}
          <div className="modal-footer py-2">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewFlashSaleModal;
