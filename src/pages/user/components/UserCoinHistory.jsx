import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Coins, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';

const UserCoinHistory = ({ userId, currentCoins, ordersData }) => {
  const [page, setPage] = useState(1);

  // Derive coin activities from orders
  const coins = (ordersData || [])
    .filter(o => parseFloat(o.coins_credited || 0) > 0 || parseFloat(o.coins_debited || 0) > 0)
    .map((o, idx) => {
      const activities = [];
      if (parseFloat(o.coins_credited || 0) > 0) {
        activities.push({
          id: `credit-${o.id}`,
          activity: "Order Reward",
          description: `Earned from Order #${o.razorpay_order_id || o.id}`,
          amount: parseFloat(o.coins_credited),
          type: "credit",
          created_at: o.created_at
        });
      }
      if (parseFloat(o.coins_debited || 0) > 0) {
        activities.push({
          id: `debit-${o.id}`,
          activity: "Redeemed",
          description: `Used on Order #${o.razorpay_order_id || o.id}`,
          amount: parseFloat(o.coins_debited),
          type: "debit",
          created_at: o.created_at
        });
      }
      return activities;
    })
    .flat()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const isLoading = false;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="px-4 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <h5 className="fw-bold text-primary mb-0">Super Coin History</h5>
            <div className="bg-primary-light bg-opacity-10 text-dark px-3 py-1 rounded-pill border border-primary small fw-bold">
              Current Balance: <Coins size={16} className="ms-2"/> {currentCoins || 0}
            </div>
          </div>
          {/* <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input type="text" className="form-control" placeholder="Search activities..." />
            </div>
          </div> */}
        </div>

        {coins.length === 0 ? (
          <div className="text-center py-5 p-4 text-muted">
            <Coins size={48} className="mx-auto mb-3 opacity-25 text-warning" />
            <p className="mb-0">No coin transactions found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Activity</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th className="pe-4">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin) => (
                  <tr key={coin.id} className="align-middle">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        {coin.type === 'credit' ? 
                          <TrendingUp size={16} className="text-success" /> : 
                          <TrendingDown size={16} className="text-danger" />
                        }
                        <span className="fw-semibold">{coin.activity || 'Purchase Reward'}</span>
                      </div>
                    </td>
                    <td><small className="text-muted">{coin.description || 'Order #12345'}</small></td>
                    <td>
                      <span className={`fw-bold ${coin.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                        {coin.type === 'credit' ? '+' : '-'}{coin.amount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${coin.type === 'credit' ? 'success' : 'danger'} bg-opacity-10 text-${coin.type === 'credit' ? 'success' : 'danger'} text-capitalize`}>
                        {coin.type}
                      </span>
                    </td>
                    <td className="small pe-4 text-muted">{formatDate(coin.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCoinHistory;
