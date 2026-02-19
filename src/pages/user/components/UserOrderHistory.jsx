import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Eye, Search, Filter, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderDetailsModal from '../../order/modal/OrderDetailsModal';

const UserOrderHistory = ({ userId, ordersData }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Use passed data or fallback to empty array
  const orders = ordersData ? ordersData.map(o => ({
    id: o.id,
    order_id: o.razorpay_order_id || `ORD-${o.id}`,
    created_at: o.created_at,
    items_count: JSON.parse(o.cart_snapshot || '[]').length,
    total_amount: parseFloat(o.total),
    status: o.status
  })) : [];

  const isLoading = false;

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  }

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { class: 'bg-warning', label: 'Pending' },
      shipped: { class: 'bg-info', label: 'Shipped' },
      delivered: { class: 'bg-success', label: 'Delivered' },
      cancelled: { class: 'bg-danger', label: 'Cancelled' },
      processing: { class: 'bg-primary', label: 'Processing' }
    };
    const s = statuses[status?.toLowerCase()] || { class: 'bg-secondary', label: status || 'Unknown' };
    return <span className={`badge ${s.class} bg-opacity-10 text-${s.class.replace('bg-', '')}`}>{s.label}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
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
        <div className="px-4 py-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-1">Buy History</h5>
            <p className="text-muted small mb-0">Track all physical goods ordered by this customer</p>
          </div>
          <div className="d-flex align-items-center gap-3">
             <div className="text-center px-3 border-end">
                <div className="fw-bold text-dark">{orders.length}</div>
                <small className="text-muted smaller">Total</small>
             </div>
             <div className="text-center px-3 border-end">
                <div className="fw-bold text-success">{orders.filter(o=>o.status==='delivered').length}</div>
                <small className="text-muted smaller">Delivered</small>
             </div>
             <div className="text-center px-3">
                <div className="fw-bold text-warning">{orders.filter(o=>o.status==='shipped' || o.status==='pending').length}</div>
                <small className="text-muted smaller">In Progress</small>
             </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-5 p-4 text-muted">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-25" />
            <p className="mb-0">No purchase history found for this user.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 text-muted small fw-bold text-uppercase ls-1">Order ID</th>
                  <th className="text-muted small fw-bold text-uppercase ls-1">Date</th>
                  <th className="text-muted small fw-bold text-uppercase ls-1 text-center">Items</th>
                  <th className="text-muted small fw-bold text-uppercase ls-1">Total Amount</th>
                  <th className="text-muted small fw-bold text-uppercase ls-1">Status</th>
                  <th className="text-muted small fw-bold text-uppercase ls-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}
                      onClick={() => handleViewOrder(order)}
                      className="cursor-pointer"
                  >
                    <td className="ps-4">
                      <div className="fw-bold text-primary">#{order.order_id}</div>
                      <small className="text-muted">Direct Order</small>
                    </td>
                    <td>
                      <div className="text-dark small fw-semibold">{formatDate(order.created_at)}</div>
                      <small className="text-muted">10:30 AM</small>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border px-2 py-1 fw-bold">{order.items_count}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">₹{order.total_amount.toLocaleString()}</span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: '32px', height: '32px' }}
                         onClick={() => handleViewOrder(order)}
                        >
                            <Eye size={14}/>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
    
  );
};

export default UserOrderHistory;
