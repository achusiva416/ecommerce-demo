import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { CreditCard, Download, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const UserPaymentHistory = ({ userId, ordersData }) => {
  const [page, setPage] = useState(1);

  // Derive payments from orders
  const payments = (ordersData || [])
    .filter(o => o.razorpay_payment_id || o.payment_status === 1)
    .map(o => ({
      id: o.id,
      txn_id: o.razorpay_payment_id || `PAY-${o.id}`,
      method: o.payment_type || 'Online',
      amount: parseFloat(o.total),
      created_at: o.created_at,
      status: o.payment_status === 1 ? 'completed' : 'pending'
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const isLoading = false;

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'success' || s === 'completed') return <CheckCircle size={14} className="text-success me-1" />;
    if (s === 'pending') return <Clock size={14} className="text-warning me-1" />;
    return <AlertCircle size={14} className="text-danger me-1" />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
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
          <h5 className="fw-bold text-primary mb-0">Payment Transactions</h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input type="text" className="form-control" placeholder="TXN Reference..." />
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-5 p-4 text-muted">
            <CreditCard size={48} className="mx-auto mb-3 opacity-25" />
            <p className="mb-0">No payment transactions recorded.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Txn ID</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((txn) => (
                  <tr key={txn.id} className="align-middle">
                    <td className="ps-4 fw-mono small">{txn.txn_id || txn.razorpay_payment_id || 'TXN_REF_001'}</td>
                    <td>
                      <div className="text-capitalize small">
                        {txn.method || txn.payment_method || 'Online'} 
                        <span className="text-muted ms-1">({txn.network || 'Razorpay'})</span>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">₹{txn.amount?.toLocaleString() || 0}</span>
                    </td>
                    <td className="small">{formatDate(txn.created_at)}</td>
                    <td>
                      <div className="d-flex align-items-center small">
                        {getStatusIcon(txn.status)}
                        <span className="text-capitalize">{txn.status}</span>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-link text-primary p-0">
                        <Download size={16} />
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
  );
};

export default UserPaymentHistory;
