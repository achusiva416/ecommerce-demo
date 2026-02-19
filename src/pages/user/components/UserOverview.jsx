import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Coins, 
  ArrowRight,
  Shield,
  TrendingUp,
  CoinsIcon,
  CreativeCommons
} from 'lucide-react';
import useUsers from '../../../hooks/useUsers';

const UserOverview = ({ userData }) => {
  const { getInsightScore } = useUsers({});
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="row g-4">
      {/* Left Column: Core Profile & Stats */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <User size={20} className="text-primary" /> Profile Details
            </h5>
            
            <div className="vstack gap-4">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-light p-2 rounded-3 border">
                  <Mail size={18} className="text-muted" />
                </div>
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Email Address</small>
                  <span className="fw-semibold text-dark">{userData.email}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-light p-2 rounded-3 border">
                  <Phone size={18} className="text-muted" />
                </div>
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Mobile</small>
                  <span className="fw-semibold text-dark">{userData.phone}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-light p-2 rounded-3 border">
                  <Calendar size={18} className="text-muted" />
                </div>
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Join Date</small>
                  <span className="fw-semibold text-dark">{formatDate(userData.created_at)}</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-light p-2 rounded-3 border">
                  <MapPin size={18} className="text-muted" />
                </div>
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold ls-1" style={{ fontSize: '10px' }}>Primary Address</small>
                  <span className="fw-semibold text-dark small">{userData.address}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-5 p-3 bg-primary-light rounded-4 border border-primary border-opacity-10 text-center">
              <div className="text-primary small fw-bold mb-1 uppercase ls-1">Super Coin Balance</div>
              <h3 className="fw-bold text-primary mb-0"> <Coins size={32} /> {userData.total_coins.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Orders', value: userData.orders_count, icon: <ShoppingBag size={20}/>, color: 'primary' },
            { label: 'Avg Order Value', value: '₹' + (userData.orders_count > 0 ? (userData.total_spent / userData.orders_count).toFixed(0) : 0), icon: <TrendingUp size={20}/>, color: 'primary' },
            { label: 'Total Spending', value: '₹' + userData.total_spent.toLocaleString(), icon: <Shield size={20}/>, color: 'primary' }
          ].map((stat, i) => (
            <div className="col-md-4" key={i}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className={`text-${stat.color} mb-2`}>{stat.icon}</div>
                  <h4 className="fw-bold mb-0 text-dark">{stat.value}</h4>
                  <small className="text-muted fw-semibold">{stat.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-4">Customer Insights</h5>
            <div className="row g-4">
              <div className="col-md-6 border-end border-light">
                <div className="mb-4">
                  <h6 className="small fw-bold text-muted text-uppercase mb-3">Engagement Score</h6>
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '8px' }}>
                      <div className="bg-success h-100" style={{ width: getInsightScore(userData.orders_count, userData.review_count, userData.total_coins) }}></div>
                    </div>
                    <span className="fw-bold text-success">{getInsightScore(userData.orders_count, userData.review_count, userData.total_coins)}</span>
                  </div>
                  <small className="text-muted mt-2 d-inline-block">
                    {userData.orders_count > 0 ? 'Active customer with multiple purchases.' : 'New user, yet to make first purchase.'}
                  </small>
                </div>
                <div>
                  <h6 className="small fw-bold text-muted text-uppercase mb-3">Account Status</h6>
                  <span className={`badge bg-${userData.is_active ? 'success' : 'danger'}-subtle text-${userData.is_active ? 'success' : 'danger'} border border-${userData.is_active ? 'success' : 'danger'}-subtle px-3 py-2 rounded-pill text-capitalize`}>
                    {userData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="col-md-6 ps-md-4">
                <h6 className="small fw-bold text-muted text-uppercase mb-4">Recent Activity Timeline</h6>
                <div className="timeline small">
                  {(userData.orders || []).slice(0, 3).map((order, idx) => (
                    <div className="d-flex gap-3 mb-3" key={order.id}>
                      <div className={`bg-${idx === 0 ? 'primary' : 'light'} p-1 rounded-circle ${idx !== 0 ? 'border' : ''}`} style={{ width: '10px', height: '10px', marginTop: '6px' }}></div>
                      <div>
                        <div className="fw-bold text-dark">Placed order #{order.razorpay_order_id || order.id}</div>
                        <div className="text-muted">{formatDate(order.created_at)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="d-flex gap-3 mb-3">
                    <div className="bg-light p-1 rounded-circle border" style={{ width: '10px', height: '10px', marginTop: '6px' }}></div>
                    <div>
                      <div className="fw-bold text-dark">Account Created</div>
                      <div className="text-muted">{formatDate(userData.created_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
