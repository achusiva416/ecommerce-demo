import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Select from 'react-select';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const CouponModal = ({ open, onClose, coupon, onSave }) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponName, setCouponName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("23:59");
  const [isActive, setIsActive] = useState(false);
  const [applicableFor, setApplicableFor] = useState("all_products");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch products and combos
  const fetchAllProductsUnified = async () => {
    try {
      setProductsLoading(true);
      const response = await apiClient.get("/products-list", {
        params: {
          page: 1,
          per_page: 200,
          include_combos: true
        },
      });

      const productsData = response.data.data.map(item => ({
        value: item.id,
        label: item.is_combo ? item.title : item.name,
        type: item.is_combo ? 'combo' : 'product',
        is_combo: item.is_combo,
      }));

      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Reset form when modal opens/closes or coupon changes
  useEffect(() => {
    if (open) {
      if (coupon) {
        // Editing existing coupon
        setCouponCode(coupon.coupon_code);
        setCouponName(coupon.coupon_name);
        setAllowedUsers(coupon.allowed_users);
        setDiscountType(coupon.discount_type);
        setDiscountValue(coupon.discount_value);
        
        const expiryDateTime = extractDateTime(coupon.expiry_date);
        setExpiryDate(expiryDateTime.date);
        setExpiryTime(expiryDateTime.time);
        
        setIsActive(coupon.is_active);
        setApplicableFor(coupon.applicable_for || "all_products");
        setMinOrderAmount(coupon.min_order_amount || "");

        // Load and set selected products if applicable
        if (coupon.applicable_for === "selected_products" && coupon.items) {
          fetchAllProductsUnified().then(() => {
            const selectedProductsData = coupon.items.map(item => ({
              value: item.id,
              label: item.is_combo ? item.title : item.name,
              type: item.is_combo ? 'combo' : 'product',
              is_combo: item.is_combo
            }));
            setSelectedProducts(selectedProductsData);
          });
        } else {
          setSelectedProducts([]);
        }
      } else {
        // Adding new coupon
        resetForm();
      }

      // Load products if needed
      if (applicableFor === "selected_products" && products.length === 0) {
        fetchAllProductsUnified();
      }
    }
  }, [open, coupon]);

  const resetForm = () => {
    setCouponCode("");
    setCouponName("");
    setAllowedUsers("");
    setDiscountType("percentage");
    setDiscountValue("");
    setExpiryDate("");
    setExpiryTime("23:59");
    setIsActive(false);
    setApplicableFor("all_products");
    setSelectedProducts([]);
    setMinOrderAmount("");
  };

  const extractDateTime = (datetimeString) => {
    if (!datetimeString) return { date: "", time: "23:59" };
    try {
      const localDateTime = dayjs.utc(datetimeString).local();
      return {
        date: localDateTime.format('YYYY-MM-DD'),
        time: localDateTime.format('HH:mm')
      };
    } catch (error) {
      return { date: "", time: "23:59" };
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(result);
  };

  const combineDateTime = (date, time) => {
    if (!date) return "";
    return dayjs.tz(`${date} ${time}`, "Asia/Kolkata").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  };

  const saveCoupon = async () => {
    try {
      setSaving(true);
      const couponData = {
        coupon_code: couponCode,
        coupon_name: couponName,
        allowed_users: parseInt(allowedUsers),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        expiry_date: combineDateTime(expiryDate, expiryTime),
        is_active: isActive,
        applicable_for: applicableFor,
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        product_ids: applicableFor === "selected_products" 
          ? selectedProducts.map(product => product.value) 
          : [],
        product_types: applicableFor === "selected_products"
          ? selectedProducts.reduce((acc, product) => {
              acc[product.value] = product.type;
              return acc;
            }, {})
          : {}
      };
      
      if (coupon) {
        await apiClient.put(`/coupons/${coupon.id}`, couponData);
        toast.success("Coupon updated successfully");
      } else {
        await apiClient.post("/coupons", couponData);
        toast.success("Coupon added successfully");
      }
      onSave();
    } catch (error) {
      toast.error("Failed to save coupon");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatOptionLabel = ({ value, label, type, is_combo }) => (
    <div className="d-flex justify-content-between align-items-center">
      <span>{label}</span>
      <span className={`badge ${is_combo ? 'bg-warning' : 'bg-info'} ms-2`}>
        {is_combo ? 'Combo' : 'Product'}
      </span>
    </div>
  );

  if (!open) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{coupon ? "Edit" : "Add"} Coupon</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="couponCode" className="form-label">Coupon Code</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={generateCouponCode}
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="couponName" className="form-label">Coupon Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="couponName"
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  placeholder="Enter coupon name"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="allowedUsers" className="form-label">Allowed Users Count</label>
                <input
                  type="number"
                  className="form-control"
                  id="allowedUsers"
                  value={allowedUsers}
                  onChange={(e) => setAllowedUsers(e.target.value)}
                  placeholder="Enter number of allowed users"
                  min="1"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="discountType" className="form-label">Discount Type</label>
                <select
                  className="form-select"
                  id="discountType"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="amount">Fixed Amount</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="discountValue" className="form-label">
                  {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="discountValue"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    min="0"
                    step={discountType === 'percentage' ? "0.01" : "1"}
                  />
                  <span className="input-group-text">
                    {discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="applicableFor" className="form-label">Applicable For</label>
                <select
                  className="form-select"
                  id="applicableFor"
                  value={applicableFor}
                  onChange={(e) => {
                    setApplicableFor(e.target.value);
                    if (e.target.value !== "selected_products") {
                      setSelectedProducts([]);
                    } else if (products.length === 0) {
                      fetchAllProductsUnified();
                    }
                  }}
                >
                  <option value="all_products">All Products</option>
                  <option value="selected_products">Selected Products</option>
                </select>
              </div>
              {applicableFor === "selected_products" && (
                <div className="col-12 mb-3">
                  <label htmlFor="selectedProducts" className="form-label">Select Products & Combos</label>
                  <Select
                    id="selectedProducts"
                    isMulti
                    options={products}
                    value={selectedProducts}
                    onChange={setSelectedProducts}
                    isLoading={productsLoading}
                    placeholder="Search and select products or combos..."
                    noOptionsMessage={() => "No products or combos found"}
                    formatOptionLabel={formatOptionLabel}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.value}
                  />
                  {productsLoading && (
                    <div className="form-text">Loading products and combos...</div>
                  )}
                  <div className="form-text">
                    You can select both individual products and combo products
                  </div>
                </div>
              )}
              <div className="col-md-6 mb-3">
                <label htmlFor="minOrderAmount" className="form-label">Minimum Order Amount</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    id="minOrderAmount"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="Enter minimum order amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-text">Leave empty for no minimum order amount</div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="expiryDate" className="form-label">Expiry Date & Time</label>
                <div className="row g-2">
                  <div className="col-8">
                    <input
                      type="date"
                      className="form-control"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="time"
                      className="form-control"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-check form-switch mt-4 pt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active Status
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={saveCoupon}
              disabled={saving || !couponCode || !couponName || !allowedUsers || !discountValue || !expiryDate || (applicableFor === "selected_products" && selectedProducts.length === 0)}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {coupon ? "Updating..." : "Adding..."}
                </>
              ) : (
                coupon ? "Update" : "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponModal;