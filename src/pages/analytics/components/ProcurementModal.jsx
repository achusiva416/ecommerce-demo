import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  X, 
  ShoppingCart, 
  Trash2, 
  Calculator, 
  Package, 
  Save, 
  Printer, 
  TrendingUp,
  User 
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectProcurementItems, 
  updateProcurementQty, 
  updateProcurementPrice,
  removeFromProcurement, 
  clearProcurement 
} from "../../../features/procurement/procurementSlice";
import { toast } from "react-toastify";
import apiClient from "../../../services/apiClient";
import Select from "react-select";
import { printPurchaseOrder } from "../../../utils/printPurchaseOrder";
import YogifyPrintLogo from "../../../assets/Yogifyr-Print.png";
import useStocks from "../../../hooks/useStocks";

export default function ProcurementModal({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectProcurementItems);
  
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { getProductRate } = useStocks({ productIds: items.map(i => i.id), dealerId: selectedDealer?.value });

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    if (getProductRate.data) {
      dispatch(updateProcurementPrice({ productIds: items.map(i => i.id), price: getProductRate.data }));
    }
  }, [getProductRate.data]);

  const fetchDealers = async () => {
    setLoadingDealers(true);
    try {
      const res = await apiClient.get("/dealers");
      setDealers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoadingDealers(false);
    }
  };

  const grandTotal = items.reduce((acc, i) => acc + (i.orderQty || 0) * (i.price || 0), 0);

  const handleCreateOrder = async () => {
    if (!selectedDealer) {
      toast.error("Please select a dealer first");
      return;
    }
    if (items.length === 0) return;

    setIsSaving(true);
    try {
      const promises = items.map(item => 
        apiClient.post(`/dealers/${selectedDealer.value}/purchases`, {
          product_id: item.id,
          quantity: item.orderQty,
          rate: item.price || 0,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: 'Procurement list conversion'
        })
      );
      
      await Promise.all(promises);
      toast.success("Purchase orders created successfully");
      
      // Automatic print after creation
      handlePrint();
      
      dispatch(clearProcurement());
      onClose();
    } catch (error) {
      console.error("Error creating orders:", error);
      toast.error("Failed to create all purchase orders");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (!selectedDealer) {
      toast.error("Please select a dealer to generate a professional print");
      return;
    }
    const printItems = items.map(i => ({
      name: i.name,
      quantity: i.orderQty,
      rate: i.price || 0
    }));
    printPurchaseOrder(printItems, selectedDealer.label, YogifyPrintLogo);
  };

  const dealerOptions = dealers.map(d => ({
    value: d.id,
    label: d.name
  }));




  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered h-100 my-0">
        <div className="modal-content border-0 shadow-2xl overflow-hidden d-flex flex-column rounded-2" style={{ maxHeight: '90vh' }}>
          
          {/* Header */}
          <div className="modal-header border-0 bg-white px-4 py-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary-light p-2 rounded-2 me-3 text-primary" style={{ backgroundColor: '#eef2ff' }}>
                <ClipboardList size={24} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Procurement & Order Creation</h5>
                <p className="text-muted small mb-0">Review needed stock and assign to a dealer</p>
              </div>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          {/* Sub-Header: Dealer Selection */}
          <div className="px-4 py-3 bg-light border-bottom border-top">
            <div className="row align-items-center">
              <div className="col-md-6 mb-2 mb-md-0">
                <div className="d-flex align-items-center text-secondary small mb-2">
                  <User size={16} className="me-2 text-primary" />
                  <span className="fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Specify Dealer for this Batch</span>
                </div>
                <Select
                  options={dealerOptions}
                  value={selectedDealer}
                  onChange={setSelectedDealer}
                  placeholder="Choose a dealer to place order..."
                  isLoading={loadingDealers}
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      padding: '4px',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#cbd5e1' }
                    })
                  }}
                />
              </div>
              <div className="col-md-6 text-md-end">
                <div className="d-inline-flex align-items-center bg-white border rounded-pill px-3 py-2 shadow-sm">
                  <TrendingUp size={16} className="text-success me-2" />
                  <span className="small text-muted fw-medium">Items to order: <span className="text-dark fw-bold">{items.length}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="modal-body p-0 overflow-hidden d-flex flex-column bg-white">
            <div className="flex-grow-1 overflow-y-auto px-4 py-3" style={{ scrollBehavior: 'smooth' }}>
              
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <div className="bg-light p-4 rounded-circle d-inline-flex mb-3">
                    <Package size={48} className="text-muted opacity-50" />
                  </div>
                  <h6 className="fw-bold text-dark">Procurement list is empty</h6>
                  <p className="text-muted small">Items added from stock alerts will appear here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-borderless align-middle mb-0">
                    <thead>
                      <tr className="border-bottom">
                        <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '45%' }}>Item Details</th>
                        <th className="text-uppercase text-secondary xsmall fw-bold py-3 text-center" style={{ width: '15%' }}>Order Qty</th>
                        <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '15%' }}>Unit Price</th>
                        <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '15%' }}>Total</th>
                        <th className="text-uppercase text-secondary xsmall fw-bold py-3 text-center" style={{ width: '10%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="group border-bottom-subtle">
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light p-2 rounded-3 me-3 text-secondary">
                                <Package size={20} />
                              </div>
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{item.name}</div>
                                <div className="text-muted xsmall" style={{ fontSize: '0.75rem' }}>Code: {item.code || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              className="form-control form-control-sm bg-light-subtle border-light text-center fw-bold rounded-2 mx-auto"
                              value={item.orderQty}
                              min={1}
                              onChange={(e) =>
                                dispatch(updateProcurementQty({ id: item.id, qty: parseInt(e.target.value) || 0 }))
                              }
                              style={{ maxWidth: '80px' }}
                            />
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-transparent border-0 text-muted pe-1">₹</span>
                              <input
                                type="number"
                                className="form-control bg-light-subtle border-light fw-medium rounded-2"
                                value={item.price || 0}
                                min={0}
                                step="0.01"
                                onChange={(e) =>
                                  dispatch(updateProcurementPrice({ id: item.id, price: parseFloat(e.target.value) || 0 }))
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold text-dark">₹{((item.orderQty || 0) * (item.price || 0)).toLocaleString()}</span>
                          </td>
                          <td className="text-center">
                            <button 
                              className="btn btn-link text-danger p-2 rounded-circle hover-bg-danger"
                              onClick={() => {
                                dispatch(removeFromProcurement(item.id));
                                toast.info("Removed from list");
                              }}
                              title="Remove"
                              style={{ color: '#dc2626' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="modal-footer border-0 px-4 py-3 bg-white shadow-lg-top" style={{ boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
            <div className="container-fluid px-0">
              <div className="row align-items-center">
                <div className="col-md-6 d-flex align-items-center">
                  <div className="bg-primary p-3 rounded-2 text-white d-flex align-items-center shadow-sm w-100" style={{ backgroundColor: '#0d6efd' }}>
                    <Calculator className="me-3" size={24} />
                    <div className="pe-4 border-end border-white border-opacity-25 me-4">
                      <p className="xsmall text-white text-opacity-75 mb-0 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Estimated Total</p>
                      <h4 className="mb-0 fw-black" style={{ fontWeight: '900' }}>₹{grandTotal.toLocaleString()}</h4>
                    </div>
                    <div className="text-white text-opacity-75">
                      <p className="xsmall mb-0 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Summary</p>
                      <h6 className="mb-0 fw-bold">{items.length} Products</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-end gap-3 mt-3 mt-md-0">
                  <button 
                    className="btn btn-light px-3 py-2 fw-bold text-danger border-0" 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to clear the entire list?")) {
                        dispatch(clearProcurement());
                        toast.info("Procurement list cleared");
                      }
                    }}
                    style={{ borderRadius: '12px', backgroundColor: '#fff5f5' }}
                  >
                    Clear All
                  </button>
                  
                  <button 
                    className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center shadow-sm gap-2 rounded-2"
                    onClick={handlePrint}
                    disabled={items.length === 0}
                  >
                    <Printer size={18} />
                    <span className="fw-bold">Print</span>
                  </button>

                  <button 
                    className="btn btn-primary px-5 py-2 d-flex align-items-center shadow-lg gap-2 rounded-2"
                    onClick={handleCreateOrder}
                    disabled={items.length === 0 || isSaving || !selectedDealer}
                    style={{ backgroundColor: '#0d6efd' }}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span className="fw-bold">Create PO Batch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .xsmall { font-size: 0.75rem; }
        .group:hover { background-color: #f8fafc; }
        .border-bottom-subtle { border-bottom: 1px solid #f1f5f9; }
        .hover-bg-danger:hover { background-color: #fee2e2; color: #dc2626 !important; }
        .react-select__control { border-radius: 10px !important; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
      `}</style>
    </div>
  );
}
