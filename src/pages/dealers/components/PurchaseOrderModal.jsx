import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  ShoppingCart, 
  Calculator, 
  AlertCircle,
  Package,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import useDealer from '../../../hooks/useDealer';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { printPurchaseOrder } from '../../../utils/printPurchaseOrder';
import YogifyPrintLogo from "../../../assets/Yogifyr-Print.png";

const PurchaseOrderModal = ({ isOpen, onClose, dealerId, dealerName, onOrderCreated }) => {
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const { recommendedProducts, isRecommendedLoading, createPurchase } = useDealer(dealerId);

  // Initialize recommended items
  useEffect(() => {
    if (isOpen && recommendedProducts.length > 0 && items.length === 0) {
      const recommended = recommendedProducts.filter(p => (p.stock || 0) < 10);
      const initialItems = recommended.map(p => ({
        product_id: p.id,
        name: p.name,
        quantity: p.recommended_stock || 0,
        rate: Number(p.purchase_rate) > 0 ? Number(p.purchase_rate) : Number(p.sale_price),
        temp_id: Math.random().toString(36).substr(2, 9),
        isRecommended: true,
        currentStock: p.stock || 0
      }));
      setItems(initialItems);
    } else if (!isOpen) {
      setItems([]);
    }
  }, [isOpen, recommendedProducts]);

  const addItem = () => {
    setItems([...items, { 
      product_id: '', 
      name: '', 
      quantity: 1, 
      rate: 0, 
      temp_id: Math.random().toString(36).substr(2, 9),
      isRecommended: false,
      currentStock: 0
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.temp_id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.temp_id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleProductSelect = (id, selectedOption) => {
    if (!selectedOption) return;
    const prod = recommendedProducts.find(p => p.id === selectedOption.value);
    setItems(items.map(item => {
      if (item.temp_id === id) {
        return { 
          ...item, 
          product_id: prod.id, 
          name: prod.name,
          rate: prod.purchase_price || 0,
          currentStock: prod.stock || 0
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const handleSave = async () => {
    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one product with valid quantity");
      return;
    }

    setIsSaving(true);
    try {
      const promises = validItems.map(item => 
        createPurchase({
          product_id: item.product_id,
          quantity: item.quantity,
          rate: item.rate,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: 'Purchase Order created from bulk modal'
        })
      );
      
      await Promise.all(promises);
      
      toast.success(`${validItems.length} Purchase order items created successfully`);
      
      const printItems = validItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        rate: item.rate
      }));
      printPurchaseOrder(printItems, dealerName, YogifyPrintLogo);

      if (onOrderCreated) onOrderCreated();
      onClose();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const productOptions = recommendedProducts.map(p => ({
    value: p.id,
    label: `${p.name} (Stock: ${p.stock || 0})`
  }));

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered h-100 my-0">
        <div className="modal-content border-0 shadow-2xl overflow-hidden d-flex flex-column rounded-2" style={{  maxHeight: '90vh' }}>
          
          {/* Header */}
          <div className="modal-header border-0 bg-white px-4 py-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary-light p-2 rounded-2 me-3 text-primary">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Create Purchase Order</h5>
                <p className="text-muted small mb-0">Restock your inventory from selected dealer</p>
              </div>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          {/* Sub-Header / Recommendations Banner */}
          <div className="px-4 py-2 bg-light border-bottom border-top d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center text-secondary small">
              <TrendingUp size={16} className="me-2 text-primary" />
              <span>Recommended items based on <span className="fw-bold text-primary">Low Stock</span> criteria are auto-filled.</span>
            </div>
            <div className="badge bg-white text-dark border fw-medium px-3 py-2 rounded-pill shadow-sm">
              {items.length} Items Selected
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="modal-body p-0 overflow-hidden d-flex flex-column bg-white">
            <div className="flex-grow-1 overflow-y-auto px-4 py-3" style={{ scrollBehavior: 'smooth' }}>
              
              {isRecommendedLoading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="spinner-grow text-primary mb-3" role="status"></div>
                  <p className="text-muted fw-medium">Analyzing stock levels and pricing...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0">
                      <thead>
                        <tr className="border-bottom">
                          <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '45%' }}>Product Information</th>
                          <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '15%' }}>Quantity</th>
                          <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '15%' }}>Rate (₹)</th>
                          <th className="text-uppercase text-secondary xsmall fw-bold py-3" style={{ width: '15%' }}>Subtotal</th>
                          <th className="text-uppercase text-secondary xsmall fw-bold py-3 text-center" style={{ width: '10%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={item.temp_id} className="group border-bottom-subtle">
                            <td className="py-3">
                              <div className="d-flex flex-column gap-1">
                                <Select
                                  options={productOptions}
                                  value={item.product_id ? { value: item.product_id, label: item.name } : null}
                                  onChange={(opt) => handleProductSelect(item.temp_id, opt)}
                                  placeholder="Select product..."
                                  isSearchable
                                  classNamePrefix="react-select"
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      borderRadius: '10px',
                                      border: '1px solid #e2e8f0',
                                      padding: '3px',
                                      boxShadow: 'none',
                                      '&:hover': { borderColor: '#cbd5e1' }
                                    })
                                  }}
                                />
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  {item.isRecommended && (
                                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2" style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                      Low Stock
                                    </span>
                                  )}
                                  {item.product_id && (
                                    <span className="text-muted xsmall" style={{ fontSize: '0.7rem' }}>
                                      Current Stock: <span className={item.currentStock < 10 ? 'text-danger fw-bold' : 'text-success'}>{item.currentStock}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control bg-light-subtle border-light text-center fw-bold rounded-2"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(item.temp_id, 'quantity', parseFloat(e.target.value) || 0)}
                                  min="1"
                                  style={{ maxWidth: '80px' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <span className="input-group-text bg-transparent border-0 text-muted">₹</span>
                                <input
                                  type="number"
                                  className="form-control bg-light-subtle border-light fw-medium rounded-2"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(item.temp_id, 'rate', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold text-dark">₹{(item.quantity * item.rate).toLocaleString()}</span>
                            </td>
                            <td className="text-center">
                              <button 
                                className="btn btn-link text-danger-emphasis p-2 rounded-circle hover-bg-danger"
                                onClick={() => removeItem(item.temp_id)}
                                title="Remove Order Item"
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

                  {/* Add More Button at Bottom */}
                  <div className="d-flex justify-content-center mt-4 mb-2">
                    <button 
                      className="btn btn-outline-primary border-dashed py-2 px-5 d-flex align-items-center gap-2 rounded-2"
                      onClick={addItem}
                    >
                      <Plus size={20} />
                      <span className="fw-bold">Add More Items</span>
                    </button>
                  </div>

                  {items.length === 0 && (
                    <div className="text-center py-5 border rounded-2 bg-light-subtle my-3">
                      <div className="bg-white p-4 rounded-circle shadow-sm d-inline-flex mb-3">
                        <Package size={48} className="text-primary opacity-50" />
                      </div>
                      <h6 className="fw-bold text-dark">No items in your order</h6>
                      <p className="text-muted small mb-4">Click below to start adding products to your purchase order.</p>
                      <button className="btn btn-primary" onClick={addItem}>Add Your First Item</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="modal-footer border-0 px-4 py-3 bg-white shadow-lg-top" style={{ boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
            <div className="container-fluid px-0">
              <div className="row align-items-center">
                <div className="col-md-7 d-flex align-items-center">
                  <div className="bg-primary p-3 rounded-2 text-white d-flex align-items-center shadow-sm" style={{ backgroundColor: '#0d6efd' }}>
                    <Calculator className="me-3" size={24} />
                    <div className="pe-4 border-end border-white border-opacity-25 me-4">
                      <p className="xsmall text-white text-opacity-75 mb-0 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Grand Total</p>
                      <h4 className="mb-0 fw-black" style={{ fontWeight: '900' }}>₹{calculateTotal().toLocaleString()}</h4>
                    </div>
                    <div className="text-white text-opacity-75">
                      <p className="xsmall mb-0 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Order Breakdown</p>
                      <h6 className="mb-0 fw-bold">{items.length} Products • {items.reduce((a, b) => a + (parseInt(b.quantity) || 0), 0)} Units</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-5 d-flex justify-content-end gap-3 mt-3 mt-md-0 align-items-end">
                  <button className="btn btn-light px-4 py-2 fw-bold text-secondary " onClick={onClose}>
                    Discard
                  </button>
                  <button 
                    className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 rounded-2"
                    onClick={() => printPurchaseOrder(items, dealerName, YogifyPrintLogo)}
                    disabled={items.length === 0 || isRecommendedLoading}
                  >
                    <i className="bi bi-printer"></i>
                    <span className="fw-bold">Print</span>
                  </button>
                  <button 
                    className="btn btn-primary px-5 py-2 d-flex align-items-center shadow-lg gap-2 rounded-2"
                    onClick={handleSave}
                    disabled={items.length === 0 || isSaving || isRecommendedLoading}
                    
                    
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        <span>Saving Order...</span>
                      </>
                    ) : (
                      <>
                        <span className="fw-bold">Create </span>
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
      `}</style>
    </div>
  );
};

export default PurchaseOrderModal;
