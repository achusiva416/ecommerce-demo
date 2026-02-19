import React from 'react'
import StatCard from '../components/StatCard'
import { People, Cart, BoxArrowLeft, CurrencyDollar } from 'react-bootstrap-icons'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LabelList } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import { Link } from 'react-router-dom'
import { Ship } from 'lucide-react'
import { useSelector } from 'react-redux'
import RecentReviews from '../components/RecentReviews'
import useUsers from '../hooks/useUsers'

const COLORS = ['#1e1b4b', '#0369a1', '#020617', '#475569', '#475569'];

export default function Dashboard() {
  const user = useSelector(state => state.auth.user)

  // React Query for dashboard reports
  const { data: dashboardData = {
    users: 0,
    order_count: 0,
    order_total: 0,
    returns: 0,
    monthly_orders: {},
    monthly_returns: [],
    order_count_to_ship: 0
  }, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-reports'],
    queryFn: async () => {
      const response = await apiClient.get("/reports");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // React Query for sales summary
  const { data: topData = [] } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: async () => {
      const response = await apiClient.get("/products/sales-summary/summary");
      return response.data.map((d) => ({
        name: d.product_name,
        shortName: getShortProductName(d.product_name),
        value: d.total_sold,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  // React Query for recent orders
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          page: 1,
          per_page: 5,
          sort_by: 'created_at',
          sort_order: 'desc'
        }
      });
      return response.data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Shorten product names for pie chart labels
  const getShortProductName = (name) => {
    if (name.length <= 15) return name;
    
    
    const shortenMap = {
      'karungali': 'Krg',
      'rudraksha': 'Rud',
      'bracelet': 'Brc',
      'mala': 'Mala',
      'combo': 'Cmb',
      'thulasi': 'Thl',
      'wood': 'Wd',
      'premium': 'Prem',
      'spiritual': 'Spl'
    };

    let shortName = name;
    Object.entries(shortenMap).forEach(([long, short]) => {
      shortName = shortName.replace(new RegExp(long, 'gi'), short);
    });

    return shortName.length > 15 ? shortName.substring(0, 12) : shortName;
  };

  const getMonthlyOrdersData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    const monthlyData = [];
    
    for (let i = 0; i < 12; i++) {
      const monthNumber = (currentMonth - i - 1 + 12) % 12 + 1;
      const monthName = monthNames[monthNumber - 1];
      const monthKey = monthNumber.toString();
      
      monthlyData.unshift({
        name: monthName,
        monthNumber: monthNumber,
        orders: dashboardData.monthly_orders[monthKey] || 0,
        returns: dashboardData.monthly_returns[monthKey] || 0
      });
    }
    
    return monthlyData;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'paid' || status === 'completed') {
      return 'bg-primary-light text-primary';
    } else if (status === 'confirmed') {
      return 'bg-success-light text-success';
    } else if (status === 'pending' && paymentStatus === 0) {
      return 'bg-warning text-dark';
    } else if (status === 'cancelled') {
      return 'bg-danger-light text-danger';
    }
    return 'bg-secondary-light text-secondary';
  };

  // Get status text
  const getStatusText = (status, paymentStatus) => {
    if (status === 'paid') return 'Paid';
    if (status === 'confirmed' && paymentStatus === 0) return 'COD';
    if (status === 'pending' && paymentStatus === 0) return 'Pending Payment';
    if (status === 'pending') return 'Pending';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const { reviewQueryClient } = useUsers({});
  const { data: reviews } = reviewQueryClient;

  const isLoading = dashboardLoading || ordersLoading;

  return (
    <div className="container-fluid">
      <nav className="small mb-3 text-muted">Dashboard &nbsp;/&nbsp; Overview</nav>

      <div className="row row-cols-1 row-cols-md-4 g-3 mb-4">
        <StatCard 
          icon={<People size={24} className="text-primary"/>} 
          value={dashboardData.users.toLocaleString()} 
          label="Total Users" 
          loading={isLoading}
        />
        <StatCard 
          icon={<Cart size={24} className="text-primary"/>} 
          value={dashboardData.order_count.toLocaleString()} 
          label="Total Orders" 
          loading={isLoading}
        />
        {user.is_admin === 1 ? (
          <StatCard 
            icon={<CurrencyDollar size={24} className="text-primary"/>} 
            value={formatCurrency(dashboardData.order_total)} 
            label="Total Revenue" 
            loading={isLoading}
          />
        ) : (
          <StatCard 
            icon={<Ship size={24} className="text-primary"/>}
            value={dashboardData.order_count_to_ship?.toLocaleString() || '0'}
            label="Orders to Ship"
            loading={isLoading}
          />
        )}
        
        <StatCard 
          icon={<BoxArrowLeft size={24} className="text-primary"/>} 
          value={dashboardData.returns} 
          label="Product Returns" 
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="row g-3">
        {/* Monthly Orders Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary">Monthly Orders</h5>
              <p className="text-muted mb-3">Order volume for the past 12 months</p>
              
                <div style={{height: 300}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyOrdersData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar 
                        dataKey="orders" 
                        name="Orders" 
                        fill="var(--primary)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
            </div>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary">Top Selling Products</h5>
              <p className="text-muted mb-3">Most popular items by sales volume</p>
              
                <div style={{height: 300}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={topData.slice(0, 8)}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      barCategoryGap="20%"
                      barGap={2}
                    >

                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="shortName" 
                        type="category" 
                        width={70}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        cursor={{fill: 'var(--primary-light)'}}
                        formatter={(value, name, props) => [
                          value, 
                          props.payload.name
                        ]}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      >
                        {topData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList dataKey="value" position="right" style={{ fontSize: '12px', fill: 'var(--text-muted)' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="row mt-4 g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title m-0 text-primary">Recent Orders</h5>
                <Link to='/orders' className="btn btn-sm btn-primary">
                  View All Orders
                </Link>
              </div>
              {ordersLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No recent orders found
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>
                              <div>{order.name}</div>
                              <small className="text-muted">{order.email}</small>
                            </td>
                            <td>{formatCurrency(order.total)}</td>
                            <td>
                              {order.payment_status === 1 ? (
                                <span className="badge bg-success">Paid</span>
                              ) : order.payment_type === 'cod' ? (
                                <span className="badge bg-warning text-dark">COD</span>
                              ) : (
                                <span className="badge bg-secondary">Pending</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadge(order.status, order.payment_status)}`}>
                                {getStatusText(order.status, order.payment_status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews Section */}
        <div className="col-lg-4">
          <RecentReviews limit={4} reviewsData={reviews} />
        </div>
      </div>
    </div>
  );
}