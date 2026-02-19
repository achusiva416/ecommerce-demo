import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  User,
  ShoppingBag,
  CreditCard,
  Star,
  Coins,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  LayoutDashboard,
  Pencil,
  TrendingUp,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

// Sub-components
import UserOverview from './components/UserOverview';
import UserOrderHistory from './components/UserOrderHistory';
import UserPaymentHistory from './components/UserPaymentHistory';
import UserReviews from './components/UserReviews';
import UserCoinHistory from './components/UserCoinHistory';
import useUsers from '../../hooks/useUsers';
import { IMAGE_PATH } from '../../utils/constants';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { userData: userQuery } = useUsers({ userId: id });
  const { data: user, isLoading } = userQuery;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h3>User not found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/users')}>Back to Users</button>
      </div>
    );
  }

  const mappedUser = {
    ...user,
    super_coins: parseInt(user.total_coins || 0),
    orders_count: user.orders?.length || 0,
    total_spent: user.orders?.reduce((acc, o) => acc + parseFloat(o.total || 0), 0) || 0,
    location: `${user.city || ''}, ${user.state || ''}, ${user.country || ''}`.replace(/^, /, '')
  };

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="card border-0 shadow-sm mb-4 overflow-hidden position-relative">
        <div className="card-body p-4 pt-5 position-relative">
          <div className="row align-items-end g-4">
            <div className="col-auto">
              <div 
                className="rounded-circle border border-4 border-white d-flex align-items-center justify-content-center bg-primary text-white fw-bold position-relative overflow-hidden"
                style={{ width: '100px', height: '100px', fontSize: '36px', marginTop: '-20px' }}
              >
                {user.photo ? (
                  <img src={IMAGE_PATH + user.photo} alt={user.name} className="w-100 h-100 object-fit-cover" />
                ) : (
                  (user.name || "U").charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="col">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h2 className="fw-bold text-dark mb-0">{user.name}</h2>
                    {user.is_active ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">Active</span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill small">Inactive</span>
                    )}
                  </div>
                  <div className="text-muted d-flex flex-wrap gap-x-4 gap-y-1 small">
                    <span className="d-flex align-items-center gap-1"><Mail size={14} /> {user.email}</span>
                    <span className="d-flex align-items-center gap-1"><Phone size={14} /> {user.phone}</span>
                    <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {mappedUser.location || 'N/A'}</span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          <ul className="nav nav-tabs border-0 px-3 pt-2">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
              { id: 'orders', label: 'Buy History', icon: <ShoppingBag size={16} /> },
              { id: 'payments', label: 'Payment History', icon: <CreditCard size={16} /> },
              { id: 'reviews', label: 'Product Reviews', icon: <Star size={16} /> },
              { id: 'coins', label: 'Super Coins', icon: <Coins size={16} /> },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link border-0 px-4 py-3 d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active text-primary fw-bold' : 'text-muted'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary) !important' : 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <UserOverview userData={mappedUser} />}
        {activeTab === 'orders' && <UserOrderHistory userId={id} ordersData={user.orders} />}
        {activeTab === 'payments' && <UserPaymentHistory userId={id} ordersData={user.orders} />}
        {activeTab === 'reviews' && <UserReviews userId={id} reviewsData={user.reviews} />}
        {activeTab === 'coins' && <UserCoinHistory userId={id} currentCoins={mappedUser.super_coins} ordersData={user.orders} />}
      </div>
    </div>
  );
};

export default UserView;
