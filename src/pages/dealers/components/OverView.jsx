import React from "react";
import { 
  FaArrowLeft, 
  FaPencilAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaRupeeSign,
  FaClock,
  FaCalendarAlt,
  FaImage,
  FaCheck,
  FaCircle
} from 'react-icons/fa';

const Overview = ({ dealer,summary }) => {
    console.log(dealer)
    return (
        <>
            <div className="row mb-4 dealer-overview">
              {/* Dealer Information */}
              <div className="col-md-6 mb-4">
                <div className="border-0 dealer-card">
                  <div className="dealer-card-body" >
                    <h5 className="mb-4" style={{ fontWeight: '600', fontSize: '18px' }}>Dealer Information</h5>
                    <div className="mb-3">
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Name</div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{dealer.name}</div>
                    </div>
                    <div className="mb-3">
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Location</div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{dealer.location}</div>
                    </div>
                    <div className="mb-3">
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Address</div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{dealer.address}</div>
                    </div>
                    <div className="mb-3">
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Phone</div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{dealer.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Alternate Phone</div>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>{dealer.alternate_phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="col-md-6 mb-4">
                <h5 className="mb-3" style={{ fontWeight: '600', fontSize: '18px' }}>Quick Summary</h5>
                
                <div className="card border-0 shadow-sm mb-3" style={{ backgroundColor: '#e7f1ff' }}>
                  <div className="card-body" style={{ padding: '15px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Total Purchases</div>
                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0d6efd' }}>{summary.totalPurchases}</div>
                      </div>
                      <div style={{ fontSize: '28px', color: '#0d6efd', opacity: '0.3' }}>
                        <FaRupeeSign />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm mb-3" style={{ backgroundColor: '#fff8e1' }}>
                  <div className="card-body" style={{ padding: '15px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Outstanding Orders</div>
                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#ffc107' }}>{summary.outstandingOrders}</div>
                      </div>
                      <div style={{ fontSize: '28px', color: '#ffc107', opacity: '0.3' }}>
                        <FaClock />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm" style={{ backgroundColor: '#e8f5e9' }}>
                  <div className="card-body" style={{ padding: '15px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontSize: '13px', color: '#495057', marginBottom: '4px' }}>Last Purchase Date</div>
                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745' }}>{
                        new Date(summary.lastPurchaseDate).toLocaleDateString(
                            'en-IN',
                            { day: '2-digit', month: 'short', year: 'numeric' }
                        )}</div>
                      </div>
                      <div style={{ fontSize: '28px', color: '#28a745', opacity: '0.3' }}>
                        <FaCalendarAlt />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
    );
};
export default Overview;