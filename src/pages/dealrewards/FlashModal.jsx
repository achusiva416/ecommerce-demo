import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Select from "react-select";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const FlashSaleModal = ({ open, onClose, sale, onSave }) => {
  const [saleName, setSaleName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [isActive, setIsActive] = useState(false);
  const [applicableFor, setApplicableFor] = useState("selected_products");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);



  
  /* ---------------- Fetch Products & Combos ---------------- */
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await apiClient.get("/products-list", {
        params: { page: 1, per_page: 200, include_combos: true }
      });
      console.log(res);

      setProducts(
        res.data.data.map(item => ({
          value: item.id,
          label: item.is_combo ? item.title : item.name,
          type: item.is_combo ? "combo" : "product",
          is_combo: item.is_combo
        }))
      );
    } catch {
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- Reset / Load ---------------- */
  useEffect(() => {
    if (!open) return;
    if (sale) {
        const res =  apiClient.get(`/flash-sales/${sale.id}`);
        res.then((res) => {
          console.log(res);
          const sale = res.data.data;
          setSaleName(sale.flash_sale_name);
          setDiscountType(sale.discount_type);
          setDiscountValue(sale.discount_value);
          setIsActive(sale.is_active);
          setApplicableFor(sale.applicable_for || "all_products");
          setMinOrderAmount(sale.min_order_amount || "");

          const s = dayjs.utc(sale.start_date);
          const e = dayjs.utc(sale.end_date);
          setStartDate(s.format("YYYY-MM-DD"));
          setStartTime(s.format("HH:mm"));
          setEndDate(e.format("YYYY-MM-DD"));
          setEndTime(e.format("HH:mm"));
        
          if (sale.applicable_for === "selected_products") {
            fetchProducts().then(() => {
              setSelectedProducts(
                sale.sale_products.map(item => ({
                  value: item.itemable.id,
                  label: item.is_combo ? item.itemable.title : item.itemable.name,
                  type: item.is_combo ? "combo" : "product",
                  is_combo: item.is_combo
                }))
              );
            });
          }
        });
    } else {
      resetForm();
    }
    

  }, [open]);

  const resetForm = () => {
    setSaleName("");
    setDiscountType("percentage");
    setDiscountValue("");
    setStartDate("");
    setStartTime("00:00");
    setEndDate("");
    setEndTime("23:59");
    setIsActive(false);
    setApplicableFor("all_products");
    setSelectedProducts([]);
    setMinOrderAmount("");
  };

  /* ---------------- Date Combine ---------------- */
  const combineDateTime = (date, time) =>
    dayjs.tz(`${date} ${time}`, "Asia/Kolkata")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");


  /* ---------------- Save ---------------- */
  const saveFlashSale = async () => {
    try {
      setSaving(true);

      const payload = {
        flash_sale_name: saleName,
        discount_type: discountType,
        discount_value: Number(discountValue),
        start_date: combineDateTime(startDate, startTime),
        end_date: combineDateTime(endDate, endTime),
        is_active: isActive ? 1 : 0,
        applicable_for: "selected_products",

        product_ids: selectedProducts.length
            ? selectedProducts.map(p => Number(p.value))
            : [],

        product_types: selectedProducts.length
            ? selectedProducts.reduce((acc, p) => {
                acc[p.value] = p.type;
                return acc;
            }, {})
            : {},

        min_order_amount: minOrderAmount ? Number(minOrderAmount) : null
    };


      if (sale) {
        try {
            await apiClient.put(`/flash-sales/${sale.id}`, payload);
            toast.success("Flash sale updated");
            onSave();
            onClose();
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to update flash sale");
        }
      } else {
        try {
            await apiClient.post("/flash-sales", payload);
            toast.success("Flash sale created");
            onSave();
      onClose();
        } catch(error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to create flash sale");
        }
      }

      
    } catch (error) {
      console.log(error);
      toast.error("Failed to save flash sale");
    } finally {
      setSaving(false);
    }
  };

  const formatOptionLabel = ({ label, is_combo }) => (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <span className={`badge ${is_combo ? "bg-warning" : "bg-info"}`}>
        {is_combo ? "Combo" : "Product"}
      </span>
    </div>
  );

  if (!open) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>{sale ? "Edit Flash Sale" : "Add Flash Sale"}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Flash Sale Name</label>
                <input className="form-control" value={saleName}
                  onChange={e => setSaleName(e.target.value)} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Discount Type</label>
                <select className="form-select"
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value)}>
                  <option value="percentage">Percentage</option>
                  <option value="amount">Fixed Amount</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Discount Value</label>
                <div className="input-group">
                  <input type="number" className="form-control"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)} />
                  <span className="input-group-text">
                    {discountType === "percentage" ? "%" : "₹"}
                  </span>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Minimum Order Amount</label>
                <input className="form-control" type="number"
                  value={minOrderAmount}
                  onChange={e => setMinOrderAmount(e.target.value)} />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Applicable Products</label>
                <Select
                  isMulti
                  options={products}
                  value={selectedProducts}
                  onChange={setSelectedProducts}
                  isLoading={productsLoading}
                  formatOptionLabel={formatOptionLabel}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Start Date & Time</label>
                <input type="date" className="form-control mb-1"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)} />
                <input type="time" className="form-control"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">End Date & Time</label>
                <input type="date" className="form-control mb-1"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)} />
                <input type="time" className="form-control"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)} />
              </div>

              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)} />
                  <label className="form-check-label">Active</label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary"
              onClick={saveFlashSale}
              disabled={!saleName || !discountValue || !startDate || !endDate || saving}>
              {saving ? "Saving..." : sale ? "Update Flash Sale" : "Create Flash Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleModal;
