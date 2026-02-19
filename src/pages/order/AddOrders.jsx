import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from 'react-select';
import apiClient from "../../services/apiClient";
import { Link } from "react-router-dom";

const ManualOrderAdd = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Delivery partner states
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedDeliverPartner, setSelectedDeliverPartner] = useState("");
  const [showDeliveryPartnerDropDown, setShowDeliveryPartnerDropDown] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    secondary_phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_country: "India",
    billing_pincode: "",
    shipping_fee: 0,
    coupon_code: "",
    payment_type: "online",
    total: 0,
    delivery_partner: "",
  });

  useEffect(() => {
    fetchAllProductsUnified();
  }, []);

  // Calculate shipping fee when subtotal or delivery partner changes
  useEffect(() => {
    calculateShippingFee();
  }, [selectedPartner, cartItems]);

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
        type: item.is_combo ? 'combo' : 'normal',
        is_combo: item.is_combo,
        price: item.is_combo ? item.combo_price : item.sale_price ,
        image: item.image_url || item.image
      }));

      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDelivery = (value) => {
    if(value == 'ecart'){
      setSelectedDeliverPartner('E-Kart');
    }else if(value == 'speed&fast'){
      setSelectedDeliverPartner('Speed And Safe');
    }else if(value == 'dtdc'){
      setSelectedDeliverPartner('DTDC');
    }else if(value == 'indianpost'){
      setSelectedDeliverPartner('Indian Speed Post');
    }
    setSelectedPartner(value);
    setFormData(prev => ({ ...prev, delivery_partner: value }));
    setShowDeliveryPartnerDropDown(false);
  }

  const calculateShippingFee = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (!selectedPartner) {
      setShippingFee(0);
      setDeliveryComment("Please select a delivery partner");
      return;
    }

    if (selectedPartner === 'indianpost' || selectedPartner === 'ecart') {
      if (subtotal < 850) {
        setShippingFee(50);
        setDeliveryComment("A shipment fee of ₹50 has been added. Home delivery available");
      } else {
        setShippingFee(0);
        setDeliveryComment("Home delivery available");
      }
    } else {
      const isDTDC = selectedPartner === 'dtdc';
      const belowLimit = subtotal < 2050;

      if (belowLimit) {
        setShippingFee(50);
        setDeliveryComment(
          isDTDC
            ? "Express delivery ₹50 applied. Home delivery unavailable for this partner."
            : "A shipment fee of ₹50 has been added. Home delivery unavailable"
        );
      } else {
        setShippingFee(0);
        setDeliveryComment(
          isDTDC
            ? "Home delivery unavailable for this partner."
            : "Home delivery unavailable"
        );
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    if (!selectedProduct || quantity < 1) {
      toast.error("Please select a product and quantity");
      return;
    }

    const product = selectedProduct;
    if (!product) return;

    const existingItemIndex = cartItems.findIndex(item => item.id === product.value);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      // Add new product to cart
      setCartItems(prev => [
        ...prev,
        {
          id: product.value,
          name: product.label,
          price: product.price,
          quantity: quantity,
          image: product.image,
          type: product.type,
          is_combo: product.is_combo
        }
      ]);
    }

    // Reset selection
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const formatOptionLabel = ({ value, label, type, is_combo, price }) => (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-medium">{label}</div>
        <div className="text-muted small">₹{price}</div>
      </div>
      <span className={`badge ${is_combo ? 'bg-warning' : 'bg-info'} ms-2`}>
        {is_combo ? 'Combo' : 'Product'}
      </span>
    </div>
  );

  // Calculate subtotal and total
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingFee;

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      total: total,
      shipping_fee: shippingFee 
    }));
  }, [total, shippingFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    if (!selectedPartner) {
      toast.error("Please select a delivery partner");
      return;
    }

    try {
      setSaving(true);
      
      // First check stock availability
      const isAvailable = await handleCheckout();
      if (!isAvailable) {
        setSaving(false);
        return; // Stop if items are out of stock
      }
      
      // If stock is available, proceed with order creation
      const orderData = {
        ...formData,
        cart: cartItems,
        total: total,
        shipping_fee: shippingFee,
        delivery_partner: selectedPartner,
        delivery_partner_name: selectedDeliverPartner
      };

      await apiClient.post("/manual-order", orderData);
      
      toast.success("Order created successfully!");
      navigate('/orders');
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await apiClient.post('/checkout-check', {
        items: cartItems,
      });
      
      const data = response.data;
      if (data.status) {
        return true;
      } else {
        toast.error("Out Of Stock: " + data.message);
        return false;
      }
    } catch (err) {
      console.log(err);
      toast.error("Error checking stock availability");
      return false;
    }
  };


  

  const copyShippingToBilling = () => {
    setFormData(prev => ({
      ...prev,
      billing_address: prev.address,
      billing_city: prev.city,
      billing_state: prev.state,
      billing_country: prev.country,
      billing_pincode: prev.pincode
    }));
  };

  if (productsLoading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-2">
      <div className="col-12 px-0 col-md-6 d-flex justify-content-md-start py-2">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
              
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <Link to="/orders" className="text-decoration-none">
                <i className="bi bi-cart me-1"></i>
                Orders
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i class="bi bi-folder-plus me-1"></i>
                Add Order
            </li>
          </ol>
        </nav>
      </div>
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Customer Information Section */}
              <div className="col-12">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Customer Information</h6>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    required
                  />
                  <label htmlFor="name">Full Name *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                  />
                  <label htmlFor="email">Email Address *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    required
                  />
                  <label htmlFor="phone">Phone Number *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="tel"
                    className="form-control"
                    id="secondary_phone"
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleInputChange}
                    placeholder="Secondary Phone"
                  />
                  <label htmlFor="secondary_phone">Secondary Phone</label>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Shipping Address</h6>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Shipping Address"
                    style={{ height: '100px' }}
                    required
                  />
                  <label htmlFor="address">Shipping Address *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                  <label htmlFor="city">City *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                  <label htmlFor="state">State *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    required
                  />
                  <label htmlFor="pincode">Pincode *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    required
                  />
                  <label htmlFor="country">Country *</label>
                </div>
              </div>

              {/* Delivery Partner Section */}
              <div className="col-md-6">
                {/* <label htmlFor="deliveryPartner" className="form-label">Delivery Partner *</label> */}
                <div className="dropdown">
                  <button
                    className="form-select text-start"
                    type="button"
                    id="deliveryPartner"
                    onClick={() => setShowDeliveryPartnerDropDown(!showDeliveryPartnerDropDown)}
                  >
                    {selectedDeliverPartner || "Select Delivery Partner"}
                  </button>
                  {showDeliveryPartnerDropDown && (
                    <div className="dropdown-menu show w-100" style={{display: 'block'}}>
                      <button 
                        type="button" 
                        className="dropdown-item" 
                        onClick={() => handleDelivery('ecart')}
                      >
                        E-Kart
                      </button>
                      <button 
                        type="button" 
                        className="dropdown-item" 
                        onClick={() => handleDelivery('speed&fast')}
                      >
                        Speed And Safe
                      </button>
                      <button 
                        type="button" 
                        className="dropdown-item" 
                        onClick={() => handleDelivery('dtdc')}
                      >
                        DTDC
                      </button>
                      <button 
                        type="button" 
                        className="dropdown-item" 
                        onClick={() => handleDelivery('indianpost')}
                      >
                        Indian Speed Post
                      </button>
                    </div>
                  )}
                </div>
                {deliveryComment && (
                  <div className={`form-text text-success`}>
                    {deliveryComment}
                  </div>
                )}
              </div>

              {/* Billing Address Section */}
              <div className="col-12 mt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Billing Address</h6>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={copyShippingToBilling}
                  >
                    Same as Shipping
                  </button>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    id="billing_address"
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleInputChange}
                    placeholder="Billing Address"
                    style={{ height: '100px' }}
                    required
                  />
                  <label htmlFor="billing_address">Billing Address *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing_city"
                    name="billing_city"
                    value={formData.billing_city}
                    onChange={handleInputChange}
                    placeholder="Billing City"
                    required
                  />
                  <label htmlFor="billing_city">Billing City *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing_state"
                    name="billing_state"
                    value={formData.billing_state}
                    onChange={handleInputChange}
                    placeholder="Billing State"
                    required
                  />
                  <label htmlFor="billing_state">Billing State *</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing_pincode"
                    name="billing_pincode"
                    value={formData.billing_pincode}
                    onChange={handleInputChange}
                    placeholder="Billing Pincode"
                    required
                  />
                  <label htmlFor="billing_pincode">Billing Pincode *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing_country"
                    name="billing_country"
                    value={formData.billing_country}
                    onChange={handleInputChange}
                    placeholder="Billing Country"
                    required
                  />
                  <label htmlFor="billing_country">Billing Country *</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="coupon_code"
                    name="coupon_code"
                    value={formData.coupon_code}
                    onChange={handleInputChange}
                    placeholder="Coupon Code"
                  />
                  <label htmlFor="coupon_code">Coupon Code</label>
                </div>
              </div>

              {/* Product Selection Section */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Product Selection</h6>
              </div>

              <div className="col-md-6">
                {/* <label htmlFor="productSelect" className="form-label">Select Product</label> */}
                <Select
                  id="productSelect"
                  options={products}
                  value={selectedProduct}
                  onChange={setSelectedProduct}
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

              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Quantity"
                    min="1"
                  />
                  <label htmlFor="quantity">Quantity</label>
                </div>
              </div>

              <div className="col-md-3 d-flex align-items-center">
                <button 
                  type="button" 
                  className="btn btn-primary w-100"
                  onClick={handleAddToCart}
                  disabled={!selectedProduct}
                >
                  Add to Cart
                </button>
              </div>

              {/* Cart Items */}
              {cartItems.length > 0 && (
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Type</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                              <span className={`badge ${item.is_combo ? 'bg-warning' : 'bg-info'}`}>
                                {item.is_combo ? 'Combo' : 'Product'}
                              </span>
                            </td>
                            <td>₹{item.price}</td>
                            <td>
                              <div className="input-group input-group-sm" style={{width: '100px'}}>
                                <button 
                                  className="btn btn-outline-secondary" 
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >-</button>
                                <input 
                                  type="number" 
                                  className="form-control text-center" 
                                  value={item.quantity} 
                                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                  min="1"
                                />
                                <button 
                                  className="btn btn-outline-secondary" 
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >+</button>
                              </div>
                            </td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Order Summary</h6>
                
                <div className="row justify-content-end">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping Fee:</span>
                          <span className={shippingFee > 0 ? 'text-warning' : 'text-success'}>
                            ₹{shippingFee.toFixed(2)}
                          </span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                        {selectedDeliverPartner && (
                          <div className="mt-2 small text-muted">
                            Delivery Partner: <strong>{selectedDeliverPartner}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">Payment Method</h6>
                
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="payment_type"
                    id="paymentCod"
                    value="cod"
                    checked={formData.payment_type === 'cod'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="paymentCod">
                    Cash on Delivery (COD)
                  </label>
                </div>
                
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="payment_type"
                    id="paymentOnline"
                    value="online"
                    checked={formData.payment_type === 'online'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="paymentOnline">
                    Online Payment
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-12 mt-4 pt-2">
                <div className="d-flex justify-content-end gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4" 
                    onClick={() => navigate('/orders')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={saving || cartItems.length === 0 || !selectedPartner}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Order...
                      </>
                    ) : (
                      "Create Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualOrderAdd;