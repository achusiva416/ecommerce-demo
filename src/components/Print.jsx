import React from 'react'
import ImageLogo from '../assets/Yogify.png';

const BusinessCard = ({ order, isPreview = false }) => {
  if (!order) return null;

  // Extract order data with fallbacks
  const customerName = order.name || 'Customer Name';
  const customerAddress = order.address || 'Address not available';
  const customerCity = order.city || 'City not available';
  const customerState = order.state || 'State not available';
  const customerPincode = order.pincode || 'Pincode not available';
  const customerPhone = order.phone || 'Phone not available';
  
  // Get product info from order items
  const getProductInfo = () => {
    if (!order.order_items || order.order_items.length === 0) {
      return 'Product information not available';
    }
    
    const firstItem = order.order_items[0];
    if (firstItem.product_type === 'combo') {
      return firstItem.combo?.title || 'Combo Product';
    } else {
      return firstItem.product?.name || 'Single Product';
    }
  };

  const productName = getProductInfo();

  return (
    <div className={`business-card ${isPreview ? 'preview-mode' : 'print-mode'}`}>
      <div className="card-content">
        <div className="left-section">
          <div className="logo-section">
            <div className="logo">
                <img src={ImageLogo} alt="Logo" width="100" />
            </div>
            <div className="brand-name">Yogify</div>
          </div>
          
          <div className="company-info">
            <div className="company-name">Yogify</div>
            <div className="company-subtitle">(Yogi And Yathra)</div>
            <div className="location">Angamaly</div>
            <div className="contact-info">
              <div>Pin: 683572</div>
              <div>Ph: 7994219909</div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="address-block">
            <div>{customerName}</div>
            <div>{customerAddress}</div>
            <div>{customerCity}</div>
            <div>{customerState}</div>
            <div>Pin: {customerPincode}</div>
            <div>Ph: {customerPhone}</div>
          </div>
          
          <div className="product-info">
            <div>{productName}</div>
            <div>Order #: {order.id}</div>
            <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;