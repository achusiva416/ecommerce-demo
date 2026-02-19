import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Select from 'react-select';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const OfferModal = ({ open, onClose, offer, onSave }) => {
  const [offerName, setOfferName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [isActive, setIsActive] = useState(false);
  const [applicableFor, setApplicableFor] = useState("all_products");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch products and combos
  const fetchProducts = async () => {
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiClient.get("/categories", {
        params: {
          page: 1,
          per_page: 100
        },
      });

      const categoriesData = response.data.data.map(category => ({
        value: category.id,
        label: category.name,
      }));

      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Reset form when modal opens/closes or offer changes
  useEffect(() => {
    if (open) {
      if (offer) {
        // Editing existing offer
        setOfferName(offer.offer_name);
        setDiscountType(offer.discount_type);
        setDiscountValue(offer.discount_value);
        
        const startDateTime = extractDateTime(offer.start_date);
        setStartDate(startDateTime.date);
        setStartTime(startDateTime.time);
        
        const endDateTime = extractDateTime(offer.end_date);
        setEndDate(endDateTime.date);
        setEndTime(endDateTime.time);
        
        setIsActive(offer.is_active);
        setApplicableFor(offer.applicable_for || "all_products");
        setMinOrderAmount(offer.min_order_amount || "");

        // Load and set selected items if applicable
        if (offer.applicable_for === "selected_products" && offer.items) {
          fetchProducts().then(() => {
            const selectedProductsData = offer.items.map(item => ({
              value: item.id,
              label: item.is_combo ? item.title : item.name,
              type: item.is_combo ? 'combo' : 'product',
              is_combo: item.is_combo
            }));
            setSelectedProducts(selectedProductsData);
          });
        } else if (offer.applicable_for === "selected_categories" && offer.items) {
          fetchCategories().then(() => {
            const selectedCategoriesData = offer.items.map(item => ({
              value: item.id,
              label: item.name,
            }));
            setSelectedCategories(selectedCategoriesData);
          });
        } else {
          setSelectedProducts([]);
          setSelectedCategories([]);
        }
      } else {
        // Adding new offer
        resetForm();
      }

      // Load data if needed
      if (applicableFor === "selected_products" && products.length === 0) {
        fetchProducts();
      } else if (applicableFor === "selected_categories" && categories.length === 0) {
        fetchCategories();
      }
    }
  }, [open, offer]);

  const resetForm = () => {
    setOfferName("");
    setDiscountType("percentage");
    setDiscountValue("");
    setStartDate("");
    setStartTime("00:00");
    setEndDate("");
    setEndTime("23:59");
    setIsActive(false);
    setApplicableFor("all_products");
    setSelectedProducts([]);
    setSelectedCategories([]);
    setMinOrderAmount("");
  };

  const extractDateTime = (datetimeString) => {
    if (!datetimeString) return { date: "", time: "00:00" };
    try {
      const localDateTime = dayjs.utc(datetimeString);
      return {
        date: localDateTime.format('YYYY-MM-DD'),
        time: localDateTime.format('HH:mm')
      };
    } catch (error) {
      return { date: "", time: "00:00" };
    }
  };

  const combineDateTime = (date, time) => {
    if (!date) return "";
    return dayjs.tz(`${date} ${time}`, "Asia/Kolkata").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  };

  const saveOffer = async () => {
    try {
      setSaving(true);
      const offerData = {
        offer_name: offerName,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        start_date: combineDateTime(startDate, startTime),
        end_date: combineDateTime(endDate, endTime),
        is_active: isActive,
        applicable_for: applicableFor,
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        product_ids: applicableFor === "selected_products" 
          ? selectedProducts.map(product => product.value) 
          : [],
        category_ids: applicableFor === "selected_categories"
          ? selectedCategories.map(category => category.value)
          : [],
        product_types: applicableFor === "selected_products"
          ? selectedProducts.reduce((acc, product) => {
              acc[product.value] = product.type;
              return acc;
            }, {})
          : {}
      };
      
      if (offer) {
        await apiClient.put(`/offers/${offer.id}`, offerData);
        toast.success("Offer updated successfully");
      } else {
        await apiClient.post("/offers", offerData);
        toast.success("Offer added successfully");
      }
      onSave();
    } catch (error) {
      toast.error("Failed to save offer");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatOptionLabel = ({ value, label, type, is_combo }) => (
    <div className="d-flex justify-content-between align-items-center">
      <span>{label}</span>
      {type && (
        <span className={`badge ${is_combo ? 'bg-warning' : 'bg-info'} ms-2`}>
          {is_combo ? 'Combo' : 'Product'}
        </span>
      )}
    </div>
  );

  if (!open) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{offer ? "Edit" : "Add"} Offer</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="offerName" className="form-label">Offer Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="offerName"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  placeholder="Enter offer name"
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
                <label htmlFor="applicableFor" className="form-label">Applicable For</label>
                <select
                  className="form-select"
                  id="applicableFor"
                  value={applicableFor}
                  onChange={(e) => {
                    setApplicableFor(e.target.value);
                    if (e.target.value !== "selected_products") {
                      setSelectedProducts([]);
                    }
                    if (e.target.value !== "selected_categories") {
                      setSelectedCategories([]);
                    }
                    if (e.target.value === "selected_products" && products.length === 0) {
                      fetchProducts();
                    } else if (e.target.value === "selected_categories" && categories.length === 0) {
                      fetchCategories();
                    }
                  }}
                >
                  <option value="all_products">All Products</option>
                  <option value="selected_products">Selected Products</option>
                  {/* <option value="selected_categories">Selected Categories</option> */}
                </select>
              </div>
              
              {/* Selected Products */}
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
                </div>
              )}

              {/* Selected Categories */}
              {applicableFor === "selected_categories" && (
                <div className="col-12 mb-3">
                  <label htmlFor="selectedCategories" className="form-label">Select Categories</label>
                  <Select
                    id="selectedCategories"
                    isMulti
                    options={categories}
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    isLoading={categoriesLoading}
                    placeholder="Search and select categories..."
                    noOptionsMessage={() => "No categories found"}
                  />
                  {categoriesLoading && (
                    <div className="form-text">Loading categories...</div>
                  )}
                </div>
              )}

              <div className="col-md-6 mb-3">
                <label htmlFor="startDate" className="form-label">Start Date & Time</label>
                <div className="row g-2">
                  <div className="col-8">
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="time"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="endDate" className="form-label">End Date & Time</label>
                <div className="row g-2">
                  <div className="col-8">
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="time"
                      className="form-control"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
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
              onClick={saveOffer}
              disabled={saving || !offerName || !discountValue || !startDate || !endDate || 
                (applicableFor === "selected_products" && selectedProducts.length === 0) ||
                (applicableFor === "selected_categories" && selectedCategories.length === 0)}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {offer ? "Updating..." : "Adding..."}
                </>
              ) : (
                offer ? "Update" : "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;