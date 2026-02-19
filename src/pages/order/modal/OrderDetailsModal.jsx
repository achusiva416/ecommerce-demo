import React, { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { IMAGE_PATH } from "../../../utils/constants";

const OrderDetailsModal = ({ 
  show, 
  onClose, 
  order, 
  onStatusChange, 
  setTrackingId, 
  trackingId,
  onCustomerUpdate,
  handlePrintPDF,
  setSelectedOrder,
  onDeliveryPartner,
  onPaymentType,
  customerData,
  setCustomerData,
}) => {
  const [status, setStatus] = useState(order?.status || "pending");
  const [dPartner, setDPartner] = useState(order?.delivery_partner || "");
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleApprove = async () => {
    if (order.delivery_partner != 'ecart') {
      handleStatusUpdate();
      return;
    }
    try {
      const response = await apiClient.post('/order_approve', {
        order_id: order.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        secondary_phone: customerData.secondary_phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        country: customerData.country,
        pincode: customerData.pincode,
      },
      {headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }}
    );
      
      if (response.data.success) {
        toast.success(response.data.message || 'Order Approved successfully');
        onClose();
      }
    } catch (err) {
      console.log(err);
      if (err.response?.data?.message === 'This pincode is not serviceable for COD orders') {
        toast.error('This pincode is not deliverable for COD orders.');
      } else {
        toast.error('Failed to approve order.');
      }
    }
  };
  
  useEffect(() => {
    if (order) {
      setStatus(order.status || "pending");
      setDPartner(order.delivery_partner || "");
      setCustomerData({
        name:  order.name || "",
        email:  order.email || "",
        phone: order.phone || "",
        secondary_phone: order.secondary_phone || "",
        address: order.address || "",
        city: order.city || "",
        state: order.state || "",
        country: order.country || "",
        pincode: order.pincode || ""
      });
    }
  }, [order]);

  const handleStatusUpdate = () => {
    if (order?.id) {
      onStatusChange(status, dPartner);
    }
    onClose();
  };

  const handlePrint = () => {
    setSelectedOrder(order);
    handlePrintPDF(order);
  };

  const getProductInfo = (item) => {
    if (!item) return { name: "Product", price: 0, products: [], code: '' };
    if (item.product_type === "combo") {
      return {
        name: item.combo?.title || "Combo Product",
        price: item.combo?.combo_price || item.price || 0,
        products: item.combo?.products || [],
        code: '',
        isCombo: true
      };
    }
    return {
      name: item.product?.name || "Product",
      price: item.product?.sale_price,
      products: [],
      code: item.product?.code || '',
      isCombo: false,
      product: item.product
    };
  };

  const getStatusColor = (s) => {
    switch (s?.toLowerCase()) {
      case "pending": return "warning";
      case "processing": return "info";
      case "shipped": case "confirmed": return "primary";
      case "delivered": case "paid": return "success";
      case "cancelled": return "danger";
      default: return "secondary";
    }
  };
  
  const isPaidOrConfirmed = ["paid", "confirmed"].includes(status?.toLowerCase()) && order?.delivery_partner === 'ecart';

  const handleProductView = (item) => {
    if (item.product_type === "combo") {
      setSelectedProduct({ type: "combo", data: item.combo, quantity: item.quantity, price: item.price });
    } else {
      setSelectedProduct({ type: "product", data: item.product, quantity: item.quantity, price: item.price });
    }
    setShowProductModal(true);
  };

  const getMainImage = (product) => {
    if (!product?.media || product.media.length === 0) return '/images/placeholder-product.jpg';
    const mainImage = product.media.find(img => img.orders === 0) || product.media[0];
    return IMAGE_PATH + mainImage.file_path || '/images/placeholder-product.jpg';
  };

  // ─── Product Details Modal ────────────────────────────────────
  const ProductDetailsModal = () => {
    if (!selectedProduct) return null;
    const { type, data, quantity, price } = selectedProduct;

    return (
      <div className={`modal fade ${showProductModal ? 'show d-block' : ''}`} style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${type === 'combo' ? 'bi-collection' : 'bi-box-seam'} me-2 text-primary`}></i>
                {type === 'combo' ? 'Combo Details' : 'Product Details'}
              </h5>
              <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              {type === 'combo' ? (
                <div className="row g-4">
                  <div className="col-md-4 text-center">
                    <img src={IMAGE_PATH + data?.image_path} className="img-fluid rounded" alt={data?.title} style={{ maxHeight: '220px', objectFit: 'cover' }} />
                    <h6 className="fw-bold mt-3 mb-1">{data?.title}</h6>
                    <div className="text-primary fw-bold">₹{parseFloat(price || 0).toFixed(2)}</div>
                    <span className="badge rounded-pill bg-primary mt-2">Qty: {quantity}</span>
                  </div>
                  <div className="col-md-8">
                    <h6 className="fw-bold mb-3 text-primary small text-uppercase">Included Products</h6>
                    <div className="overflow-auto" style={{maxHeight: '350px'}}>
                      {data?.products?.map((product) => (
                        <div key={product.id} className="d-flex align-items-center gap-3 p-2 mb-2 rounded" style={{background: 'var(--bg-primary)'}}>
                          <img src={getMainImage(product)} alt={product.name} className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <div className="flex-grow-1">
                            <div className="fw-bold small">{product.name}</div>
                            <div className="text-muted" style={{fontSize: '0.75rem'}}>{product.code} • {product.size || 'N/A'}</div>
                          </div>
                          <div className="fw-bold text-primary small">₹{parseFloat(product.sale_price || 0).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  <div className="col-md-5 text-center">
                    <img src={getMainImage(data)} className="img-fluid rounded mb-3" alt={data?.name} style={{ maxHeight: '280px', objectFit: 'cover' }} />
                  </div>
                  <div className="col-md-7">
                    <h5 className="fw-bold mb-1">{data?.name}</h5>
                    <span className="badge rounded-pill bg-primary mb-3">Qty: {quantity}</span>
                    
                    <table className="table table-sm table-borderless mt-3">
                      <tbody>
                        <tr><td className="text-muted" style={{width:'120px'}}>Code</td><td className="fw-bold">{data?.code || 'N/A'}</td></tr>
                        <tr><td className="text-muted">Size</td><td className="fw-bold">{data?.size || 'N/A'}</td></tr>
                        <tr><td className="text-muted">Material</td><td className="fw-bold">{data?.material || 'N/A'}</td></tr>
                        <tr><td className="text-muted">Variant</td><td className="fw-bold">{data?.varient || 'N/A'}</td></tr>
                        <tr>
                          <td className="text-muted">Stock</td>
                          <td>
                            <span className={`badge rounded-pill bg-${(data?.stock || 0) > 0 ? 'success' : 'danger'}`}>
                              {data?.stock || 0} in stock
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Price</td>
                          <td>
                            {data?.price && <span className="text-decoration-line-through text-muted small me-2">₹{parseFloat(data.price).toFixed(2)}</span>}
                            <span className="text-primary fw-bold fs-5">₹{parseFloat(data?.sale_price || 0).toFixed(2)}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowProductModal(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!order) return null;

  return (
    <>
      <div className={`modal fade ${show ? 'show d-block' : ''}`} style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            {/* ─── Header ─── */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt me-2 text-primary"></i>
                  Order #{order.id}
                </h5>
                <small className="text-muted">{new Date(order.created_at).toLocaleString()}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className={`badge rounded-pill bg-${getStatusColor(order.status)} px-3 py-2`}>
                  {order.status}
                </span>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
            </div>
            
            {/* ─── Body ─── */}
            <div className="modal-body p-3 p-md-4">
              <div className="row g-3 g-md-4">

                {/* ─── Left Column ─── */}
                <div className="col-lg-8">

                  {/* Order Items Card */}
                  <div className="card shadow-sm mb-3">
                    <div className="card-body p-0">
                      <div className="px-3 pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">
                          <i className="bi bi-cart3 me-2 text-primary"></i>Order Items
                        </h6>
                        <small className="text-muted">{order.order_items?.length || 0} item(s)</small>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th className="text-end">Price</th>
                              <th className="text-center">Qty</th>
                              <th className="text-end">Total</th>
                              <th className="text-center" style={{width: '80px'}}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.order_items?.map((item) => {
                              const productInfo = getProductInfo(item);
                              return (
                                <tr key={item.id}>
                                  <td>
                                    <div className="fw-bold">{productInfo.name}</div>
                                    {productInfo.code && <small className="text-muted">{productInfo.code}</small>}
                                  </td>
                                  <td className="text-end">₹{parseFloat(productInfo.price || 0).toFixed(2)}</td>
                                  <td className="text-center">
                                    <span className="badge bg-light text-dark border">{item.quantity}</span>
                                  </td>
                                  <td className="text-end fw-bold">₹{(parseFloat(productInfo.price || 0) * item.quantity).toFixed(2)}</td>
                                  <td className="text-center">
                                    <button 
                                      onClick={() => handleProductView(item)} 
                                      className="btn btn-sm btn-outline-primary"
                                      title="View product details"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-3 py-3 d-flex justify-content-end align-items-center border-top">
                        <span className="text-muted me-3">Total Amount</span>
                        <span className="fw-bold text-primary fs-5">₹{parseFloat(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Accordion */}
                  <div className="card shadow-sm">
                    <div 
                      className="card-header bg-white d-flex justify-content-between align-items-center" 
                      style={{cursor: 'pointer'}}
                      onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                    >
                      <h6 className="fw-bold mb-0">
                        <i className="bi bi-person me-2 text-primary"></i>Customer Information
                      </h6>
                      <i className={`bi bi-chevron-${isCustomerOpen ? 'up' : 'down'} text-muted`}></i>
                    </div>
                    
                    {isCustomerOpen && (
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Full Name</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.name} onChange={(e) => setCustomerData({...customerData, name: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Email</label>
                            <input type="email" className="form-control form-control-sm" value={customerData.email} onChange={(e) => setCustomerData({...customerData, email: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Phone</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.phone} onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Secondary Phone</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.secondary_phone} onChange={(e) => setCustomerData({...customerData, secondary_phone: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small text-muted">Address</label>
                            <textarea className="form-control form-control-sm" rows="2" value={customerData.address} onChange={(e) => setCustomerData({...customerData, address: e.target.value})}></textarea>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small text-muted">City</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.city} onChange={(e) => setCustomerData({...customerData, city: e.target.value})} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small text-muted">State</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.state} onChange={(e) => setCustomerData({...customerData, state: e.target.value})} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small text-muted">Pincode</label>
                            <input type="text" className="form-control form-control-sm" value={customerData.pincode} onChange={(e) => setCustomerData({...customerData, pincode: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Right Column ─── */}
                <div className="col-lg-4">

                  {/* Status Control Card */}
                  <div className="card shadow-sm mb-3">
                    <div className="card-header bg-white">
                      <h6 className="fw-bold mb-0">
                        <i className="bi bi-gear me-2 text-primary"></i>Status Control
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small text-muted">Status</label>
                        <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                          
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                          
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small text-muted">Delivery Partner</label>
                        <select className="form-select form-select-sm" value={dPartner} onChange={(e) => setDPartner(e.target.value)}>
                          <option value="">Select Partner</option>
                          <option value="dtdc">DTDC</option>
                          <option value="ecart">Ekart</option>
                          <option value="indianpost">Indian Post</option>
                          <option value="speed&fast">Speed & Fast</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small text-muted">Tracking ID</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={trackingId || ""} 
                          onChange={(e) => setTrackingId(e.target.value)} 
                          placeholder="Enter tracking ID" 
                        />
                      </div>

                      {isPaidOrConfirmed && (
                        <button className="btn btn-success w-100 mb-2" onClick={handleApprove}>
                          <i className="bi bi-check2-circle me-2"></i>Approve & Book Shipping
                        </button>
                      )}

                      <button className="btn btn-primary w-100" onClick={handleStatusUpdate} disabled={!order?.id}>
                        <i className="bi bi-arrow-repeat me-2"></i>Update
                      </button>
                    </div>
                  </div>
                  
                  {/* Info Card */}
                  <div className="card shadow-sm">
                    <div className="card-body py-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-truck text-primary"></i>
                        <span className="small fw-bold">{onDeliveryPartner(order.delivery_partner)}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-credit-card text-primary"></i>
                        <span className="small fw-bold">{onPaymentType(order.payment_type)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Footer ─── */}
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-primary" onClick={handlePrint}>
                <i className="bi bi-printer me-2"></i>Print
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailsModal />
    </>
  );
};

export default OrderDetailsModal;