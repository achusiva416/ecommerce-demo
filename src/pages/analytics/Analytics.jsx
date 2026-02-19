import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { toast } from "react-toastify";
import StatCard from "../../components/StatCard";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ClipboardList,
  Truck,
  PackageOpen,
  Award,
  RotateCcw,
  Box,
} from "lucide-react";

import { useQueries, useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import PeriodToggle from "./components/PeriodToggle";
import ProcurementModal from "./components/ProcurementModal";
import StockCard from "./components/StockCard";
import useProducts from "../../hooks/useProducts";
import { useSelector } from "react-redux";
import { selectProcurementItems } from "../../features/procurement/procurementSlice";
import useAnalysis from "../../hooks/useAnalysis";

const PRIMARY = "#1e1b4b";
const SECONDARY = "#0369a1";
const PRIMARY_DARK = "#0f172a";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(val);

export default function Analytics() {
  const [salesPeriod, setSalesPeriod] = useState("monthly");
  const [showPOModal, setShowPOModal] = useState(false);
  const procurementItems = useSelector(selectProcurementItems);

  const {
    getSellingAnalytics,
    getSalesTrendData,
    topSellingProducts,
    generateShortName,
  } = useAnalysis({ salesPeriod });

  const {
    orders_data = [],
    order_total = 0,
    order_count = 0,
    returns = 0,
    avg_order_value = 0,
    avg_shipment_fee = 0,
    best_shipping_company = null,
  } = getSellingAnalytics.data || {};

  const topSellingData = topSellingProducts.data || [];

  const topSellingChartData = (topSellingData?.top_selling_products || [])
    .map((item) => ({
      productId: item.product_id,
      sold: parseInt(item.total_sold),
      revenue: parseFloat(item.total_price),
      name: item.product_name,
      shortName: generateShortName(item.product_name),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const { data: topProductsData = [], isLoading: topProductsLoading } =
    useQuery({
      queryKey: ["analytics-top-products"],
      queryFn: async () => {
        const response = await apiClient.get("/products/sales-summary/summary");
        return response.data
          .map((d) => ({
            name: d.product_name,
            shortName:
              d.product_name.length > 12
                ? d.product_name.substring(0, 10) + ".."
                : d.product_name,
            revenue: d.total_revenue || d.total_sold * 500, // Fallback if revenue not in API
            sold: d.total_sold,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
      },
    });

  //stock count
  const { stocks } = useProducts();
  const lowStockCount = stocks.data?.low_stock || 0;
  const outOfStockCount = stocks.data?.out_of_stock || 0;
  const healthyStockCount = stocks.data?.healthy_stock || 0;
  const totalProducts = stocks.data?.total_products || 0;
  const isLoading =
    getSellingAnalytics.isLoading || topProductsLoading || stocks.isLoading;

  const returnRate =
    order_count > 0 ? ((returns / order_count) * 100).toFixed(1) : 0;

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active">Analytics</li>
            </ol>
          </nav>
        </div>
        <button
          className={`btn ${procurementItems.length > 0 ? "btn-primary" : "btn-outline-primary"} btn-sm d-flex align-items-center gap-2`}
          onClick={() => setShowPOModal(true)}
        >
          <ClipboardList size={16} />
          Procurement ({procurementItems.length})
        </button>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 mb-3">
        <StatCard
          icon={<DollarSign size={24} className="text-primary" />}
          value={formatCurrency(order_total)}
          label="Total Revenue"
          loading={isLoading}
        />
        <StatCard
          icon={<ShoppingCart size={24} className="text-primary" />}
          value={order_count.toLocaleString()}
          label="Total Orders"
          loading={isLoading}
        />
        <StatCard
          icon={<TrendingUp size={24} className="text-primary" />}
          value={formatCurrency(avg_order_value)}
          label="Avg. Order Value"
          loading={isLoading}
        />
        <StatCard
          icon={<Box size={24} className="text-primary" />}
          value={totalProducts}
          label="Total Products"
          loading={isLoading}
        />
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 mb-4">
        <StatCard
          icon={<Truck size={24} className="text-primary" />}
          value={formatCurrency(avg_shipment_fee)}
          label="Avg. Cost / Shipment"
          loading={isLoading}
        />
        <StatCard
          icon={<Award size={24} className="text-primary" />}
          value={
            best_shipping_company
              ? `${best_shipping_company.delivery_partner} (₹${best_shipping_company.avg_shipping_fee})`
              : "N/A"
          }
          label="Best Shipping Partner"
          loading={isLoading}
        />
        <StatCard
          icon={<PackageOpen size={24} className="text-primary" />}
          value={getSellingAnalytics.data?.items_to_ship || 0}
          label="Items to Ship"
          loading={isLoading}
        />
        <StatCard
          icon={<RotateCcw size={24} className="text-primary" />}
          value={`${returnRate}%`}
          label="Return Rate"
          loading={isLoading}
        />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-9 col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="card-title text-primary mb-0">
                    Revenue vs Orders
                  </h6>
                  <small className="text-muted">
                    Financial performance compared with order volume
                  </small>
                </div>
                <PeriodToggle value={salesPeriod} onChange={setSalesPeriod} />
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getSalesTrendData(orders_data)}>
                    <defs>
                      <linearGradient
                        id="gradRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={PRIMARY}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={PRIMARY}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradOrders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={SECONDARY}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor={SECONDARY}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "6px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      formatter={(v, name, props) => {
                        const isProj = props?.payload?.isProjected;
                        const label = isProj ? `${name} (Projected)` : name;
                        const value =
                          name === "Revenue" ? formatCurrency(v) : v;
                        return [value, label];
                      }}
                    />
                    <Legend iconType="circle" />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke={PRIMARY}
                      fill="url(#gradRevenue)"
                      strokeWidth={2.5}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke={SECONDARY}
                      fill="url(#gradOrders)"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-12">
          <StockCard
            lowStockCount={lowStockCount}
            outOfStockCount={outOfStockCount}
            healthyStockCount={healthyStockCount}
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-primary">
                Top 12 Revenue Products
              </h6>
              <small className="text-muted d-block mb-3">
                Highest grossing products by total revenue
              </small>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingChartData} margin={{ bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="shortName"
                      angle={-25}
                      textAnchor="end"
                      fontSize={11}
                      interval={0}
                      height={65}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      fontSize={12}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Revenue")
                          return [formatCurrency(value), name];
                        return [value, name];
                      }}
                    />

                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Revenue"
                      fill={PRIMARY_DARK}
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="sold"
                      name="Units Sold"
                      fill={SECONDARY}
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPOModal && (
        <ProcurementModal onClose={() => setShowPOModal(false)} />
      )}
    </div>
  );
}
