import React, { useState, useRef,useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector,useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../services/apiClient";
import Pagination from "../../components/Pagination";
import OrderDetailsModal from "./modal/OrderDetailsModal";
import BusinessCard from "../../components/Print.jsx";
import YogifyPrintLogo from "../../assets/Yogifyr-Print.png";
// import { useDispatch, useSelector } from "react-redux";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";

const Orders = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [printOffset, setPrintOffset] = useState(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const printRef = useRef();
  const bulkPrintRef = useRef();

  const rowsPerPageOptions = [5, 10, 20, 50, 100, 200];
  const perPage = useSelector(selectPerPage('orders'))
  
  useEffect(() => {
    setItemsPerPage(perPage)
  },[])

  const [customerData, setCustomerData] = useState({
      name: "",
      email: "",
      phone: "",
      secondary_phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    });
  // React Query for fetching orders
  const {
    data: ordersData = { data: [], total: 0 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', currentPage, itemsPerPage, searchTerm, fromDate, toDate, deliveryPartner, status, user?.id, user?.is_admin],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          user_id: user.id,
          role: user.is_admin === 3 ? 1 : user.is_admin,
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm,
          from: fromDate,
          to: toDate,
          delivery_partner: deliveryPartner,
          status: status,
        },
      });
      return {
        data: response.data?.data || [],
        total: response.data?.total || response.data?.data?.length || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      toast.error("Failed to fetch orders");
      console.error("Fetch orders error:", error);
    }
  });

  const orders = ordersData.data;
  const totalItems = ordersData.total;
  const filteredOrders = orders; // Since we're filtering via API

  // React Query mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, deliveryPartner, trackingId }) => {
      return await apiClient.patch(`/orders/${orderId}/status`, {
        status,
        delivery_partner: deliveryPartner,
        tracking_id: status === "shipped" ? trackingId.trim() : null,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        secondary_phone: customerData.secondary_phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        country: customerData.country,
        pincode: customerData.pincode,
      });
    },
    onSuccess: () => {
      toast.success("Order status updated");
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowOrderModal(false);
      setTrackingId("");
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error("Status update error:", error);
    }
  });

  // React Query for next ten orders for printing
  const { data: nextTenOrders = [], refetch: refetchNextTen } = useQuery({
    queryKey: ['next-ten-orders', printOffset, fromDate, toDate, deliveryPartner, user?.id, user?.is_admin],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          from: fromDate,
          to: toDate,
          user_id: user.id,
          role: user.is_admin === 3 ? 1 : user.is_admin,
          delivery_partner: deliveryPartner,
          print_status: 0,
          page: (printOffset / 10) + 1,
          per_page: 10,
        },
      });
      return response.data?.data || [];
    },
    enabled: false, // Don't fetch automatically
  });

  // Convert image to base64 for printing
  const getBase64Image = async (imagePath) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Handle status update
  const handleStatusChange = async (status, dPartner) => {
    if (!selectedOrder) {
      toast.error("No order selected");
      return;
    }

    if (status === "shipped" && !trackingId.trim()) {
      toast.error("Please enter tracking ID before shipping");
      return;
    }
    console.log(status)

    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status,
      deliveryPartner: dPartner,
      trackingId: status === "shipped" ? trackingId.trim() : null,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      secondary_phone: customerData.secondary_phone,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      country: customerData.country,
      pincode: customerData.pincode,
    });
  };

  const handleSearchAndFilter = () => {
    setSelectedOrderIds([]);
    setCurrentPage(1);
  };

  const handleBulkStatusProcessing = async () => {
    if (selectedOrderIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(selectedOrderIds.map(orderId => 
        apiClient.patch(`/orders/${orderId}/status`, { 
          status: 'processing'
        })
      ));
      toast.success("Orders status changed to processing");
      setSelectedOrderIds([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Failed to change status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Row selection logic
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === orders.length && orders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(order => order.id));
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePrintSelected = async () => {
    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
    if (selectedOrders.length === 0) {
      toast.warning("No orders selected for printing");
      return;
    }
    
    // Reuse the logic from handleBulkPrint but with selectedOrders
    await printOrdersList(selectedOrders, `Selected Orders - ${selectedOrders.length} orders`);
  };

  // Extract shared print logic to avoid duplication
  const printOrdersList = async (ordersList, title) => {
    try {
      const logoBase64 = await getBase64Image(YogifyPrintLogo);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      const ordersHTML = ordersList.map((order, index) => {
        const deliveryPartnerName = getDeliveryPartnerName(order.delivery_partner);
        return `
          <div class="label" style="page-break-after: ${index === ordersList.length - 1 ? 'auto' : 'always'};">
            <div class="label-header">
              <div class="logo">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Yogify" class="logo-img" />` : '<div class="company-name">Yogify</div>'}
              </div>
              <div class="order-info">
                <div>${deliveryPartnerName}</div>
                <div>Order ID: ${order.id}</div>
              </div>
            </div>  
            <div class="label-body">
              <div class="sender">
                Yogify,<br>
                Kottuparambil tower,<br>
                Old Market Rd,<br>
                Angamaly, Kerala<br>
                Pin: 683572<br>
                Phone: 7994219909‬
              </div>
              <div class="receiver">
                ${order.customer_name || order.name || 'N/A'}<br>
                ${order.address || 'N/A'}<br>
                ${order.city || 'N/A'}, ${order.state || 'N/A'}<br>
                Pin: ${order.pincode || 'N/A'}<br>
                Phone: ${order.phone || 'N/A'}
                ${order.secondary_phone ? `<br>Alt Phone: ${order.secondary_phone}` : ''}
              </div>
            </div>
            <div class="product-info">
              ${order.order_items?.map(item => 
                `<div class="product-item">${getProductName(item)} (Qty: ${item.quantity})</div>`
              ).join('') || '<div class="product-item">No products</div>'}
            </div>
          </div>
        `;
      }).join('');

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; margin: 0.5in; padding: 0; background: white; -webkit-print-color-adjust: exact !important; }
              .label { width: 100%; min-height: 3.5in; padding: 15px; position: relative; font-size: 14px; line-height: 1.3; page-break-inside: avoid; break-inside: avoid; }
              .label-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; }
              .logo-img { max-height:200px; max-width: 200px; }
              .order-info { flex: 1; text-align: left; font-size: 26px; font-weight: 400; }
              .label-body { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 20px; }
              .sender, .receiver { flex: 1; font-size: 26px; padding: 10px; line-height: 32px; }
              .product-info { margin-top: 15px; padding-top: 10px; font-size: 20px; }
              .product-item { margin-bottom: 5px; }
              @media print { body { margin: 0.2in !important; padding: 0 !important; } .label { margin: 0 !important; page-break-after: always; } }
              @page { size: A4 landscape; margin: 0.2in; }
            </style>
          </head>
          <body>${ordersHTML}</body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => { if (!printWindow.closed) printWindow.close(); }, 1000);
      }, 500);
      toast.success(`Prepared ${ordersList.length} orders for printing`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error("Failed to prepare orders for printing");
    }
  };

  // Get delivery partner name
  const getDeliveryPartnerName = (deliveryPartner) => {
    switch (deliveryPartner) {
      case 'indianpost':
        return 'Indian Post';
      case 'speed&fast':
        return 'Speed And Safe';
      case 'ecart':
        return 'E-Kart';
      case 'dtdc':
        return 'DTDC Express Delivery';
      default:
        return 'Indian Post';
    }
  };

  const getProductName = (item) => {
    if (item.product_type === 'normal') {
      return item.product?.name || 'Product';
    } else if (item.product_type === 'combo') {
      return item.combo?.title || 'Combo';
    }
    return 'Product';
  };

  const handlePrintPDF = async (orderToPrint) => {
    const order = orderToPrint || selectedOrder;
    if (!order) return;

    try {
      const logoBase64 = await getBase64Image(YogifyPrintLogo);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      const deliveryPartnerName = getDeliveryPartnerName(order.delivery_partner);

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Order-${order.id}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0.5in;
                padding: 0;
                background: white;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .label {
                width: 100%;
                min-height: 3.5in;
                padding: 15px;
                position: relative;
                font-size: 14px;
                line-height: 1.3;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .label-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
              .logo {
                flex: 1;
              }
              .logo-img {
                max-height:200px;
                max-width: 200px;
              }
              .order-info {
                flex: 1;
                text-align: left;
                font-size: 26px;
                font-weight: 400;
              }
              .label-body {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                gap: 20px;
              }
              .sender, .receiver {
                flex: 1;
                font-size: 26px;
                padding: 10px;
                line-height: 32px;
              }
              .sender-title, .receiver-title {
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 20px;
              }
              .product-info {
                margin-top: 15px;
                padding-top: 10px;
                font-size: 20px;
              }
              .product-item {
                margin-bottom: 5px;
              }
              @media print {
                body {
                  margin: 0.2in !important;
                  padding: 0 !important;
                }
                .label {
                  margin: 0 !important;
                  page-break-after: always;
                }
              }
              @page {
                size: A4 landscape;
                margin: 0.2in;
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="label-header">
                <div class="logo">
                  ${logoBase64 ? `<img src="${logoBase64}" alt="Yogify" class="logo-img" />` : '<div class="company-name">Yogify</div>'}
                </div>
                <div class="order-info">
                  <div>${deliveryPartnerName}</div>
                  <div>Order ID: ${order.id}</div>
                  
                </div>
              </div>  
              <div class="label-body">
                <div class="sender">
                  Yogify,<br>
                  Kottuparambil tower,<br>
                  Old Market Rd,<br>
                  Angamaly, Kerala<br>
                  Pin: 683572<br>
                  Phone: 7994219909
                </div>
                <div class="receiver">
                  ${order.customer_name || order.name || 'N/A'}<br>
                  ${order.address || 'N/A'}<br>
                  ${order.city || 'N/A'}, ${order.state || 'N/A'}<br>
                  Pin: ${order.pincode || 'N/A'}<br>
                  Phone: ${order.phone || 'N/A'}
                  ${order.secondary_phone ? `<br>Alt Phone: ${order.secondary_phone}` : ''}
                </div>
              </div>
              <div class="product-info">
                ${order.order_items?.map(item => 
                  `<div class="product-item">${getProductName(item)} (Qty: ${item.quantity})</div>`
                ).join('') || '<div class="product-item">No products</div>'}
              </div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      }, 500);

      toast.success(`Order ${order.id} ready for printing`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to generate print');
    }
  };

  const handleBulkPrint = async () => {
    if (filteredOrders.length === 0) {
      toast.warning("No orders to print");
      return;
    }
    await printOrdersList(filteredOrders, `Bulk Orders - ${filteredOrders.length} orders`);
  };

  const handleNextTenPrint = async () => {
    try {
      const { data: fetchNextTenResult } = await refetchNextTen();
      const ordersToPrint = fetchNextTenResult || [];
      
      if (ordersToPrint.length > 0) {
        await printOrdersList(ordersToPrint, `Orders ${printOffset + 1}-${printOffset + ordersToPrint.length}`);
        setPrintOffset(printOffset + ordersToPrint.length);
      } else {
        toast.info("No more orders to print");
        setPrintOffset(0);
      }
    } catch (error) {
      console.error('Next ten print error:', error);
      toast.error("Failed to fetch orders for printing");
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "secondary";
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "paid":
      case "processing":
        return "info";
      case "shipped":
      case "delivered":
        return "success";
      case "confirmed":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return <span className={`badge rounded-pill bg-${color}`}>{status}</span>;
  };

  const getRowClass = (status) => {
    if (!status) return "";
    switch (status.toLowerCase()) {
      case "pending":
        return "table-warning";
      case "cancelled":
        return "table-danger";
      case "paid":
        return "table-info";
      case "processing":
        return "table-primary";
      case "shipped":
      case "delivered":
        return "table-success";
      default:
        return "";
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleSearchAndFilter();
    } else {
      setSearchTerm(e.target.value);
    }
  };

  const getDeliverPartner = (delivery_partner) => {
    return getDeliveryPartnerName(delivery_partner);
  };

  const getPaymentType = (type) => {
    if(type == 'cod') {
      return 'Cash on delivery';
    } else {
      return 'Pre-paid'
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      {/* Header with filters */}
      <div className="row mx-0 mb-4">
        <div className="col-12 col-md-6 px-0  d-flex align-items-end mb-3 mb-md-0">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>
                  Dashboard
                </Link>
                
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i className="bi bi-cart me-1"></i>
                  Orders 
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12  px-0 col-md-6 d-flex flex-column flex-sm-row gap-2">
          <div className="flex-grow-1">
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="row mb-4">
        <div className="col-12 col-md-2 mb-2">
          <label className="form-label text-muted small fw-bold">From Date</label>
          <input
            type="datetime-local"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2 mb-2">
          <label className="form-label text-muted small fw-bold">To Date</label>
          <input
            type="datetime-local"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3 mb-2">
          <label className="form-label text-muted small fw-bold">Delivery Partner</label>
          <select
            className="form-select"
            value={deliveryPartner}
            onChange={(e) => setDeliveryPartner(e.target.value)}
          >
            <option value="">All Partners</option>
            <option value="speed&fast">Speed & Fast</option>
            <option value="indianpost">Indian Post</option>
            <option value="ecart">E-kart</option>
            <option value="dtdc">DTDC</option>
          </select>
        </div>
        <div className="col-12 col-md-2 mb-2">
          <label className="form-label text-muted small fw-bold">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-12 col-md-3 mb-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={handleSearchAndFilter}
            disabled={isLoading}
          >
            <i className="bi bi-funnel me-2"></i>
            {isLoading ? "Loading..." : "Apply Filters"}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 d-flex gap-2 flex-wrap">
          {selectedOrderIds.length > 0 && (
            <button 
              className="btn btn-success" 
              onClick={handlePrintSelected}
              disabled={isLoading}
            >
              <i className="bi bi-printer-fill me-2"></i>
              Print Selected ({selectedOrderIds.length})
            </button>
          )}

          {filteredOrders.length > 0 ? (
            <button 
              className="btn btn-outline-primary" 
              onClick={handleBulkPrint}
              disabled={isLoading || filteredOrders.length === 0}
            >
              <i className="bi bi-printer me-2"></i>
              Print All ({filteredOrders.length})
            </button>
          ) : (
            <button 
              className="btn btn-outline-primary" 
              onClick={handleNextTenPrint}
              disabled={isLoading}
            >
              <i className="bi bi-printer me-2"></i>
              Print Next 10
            </button>
          )}
          {selectedOrderIds.length > 0 ? (
             <button 
               className="btn btn-warning" 
               onClick={handleBulkStatusProcessing}
               disabled={isProcessing}
             >
               {isProcessing ? (
                 <span className="spinner-border spinner-border-sm me-2"></span>
               ) : (
                 <i className="bi bi-gear-fill me-2"></i>
               )}
               Processing ({selectedOrderIds.length})
             </button>
          ) : (
            <Link to='/orders/add' className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Add Order Manually
            </Link>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">Failed to load orders</p>
              <button className="btn btn-primary" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No orders found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40px" }}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total (₹)</th>
                      <th>Status</th>
                      <th>Date</th>
                      {user.is_admin !== 0 && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={getRowClass(order.status)}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={() => toggleSelectOrder(order.id)}
                            />
                          </div>
                        </td>
                        <td>{order.id}</td>
                        <td>
                          <div>{order.name}</div>
                          <small style={{ fontSize: '13px' }}>
                            Delivery Partner : {getDeliverPartner(order.delivery_partner)} {`(${getPaymentType(order.payment_type)})`}
                          </small>
                        </td>

                        <td>₹{(order.total || 0).toLocaleString()}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          {order.created_at
                            ?  new Date(order.created_at).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })

                            : "N/A"}
                        </td>
                          <td>
                            <div className="d-flex gap-1 gap-sm-2">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                  setTrackingId(order.tracking_id || "");
                                }}
                                title="View"
                                disabled={isLoading}
                              >
                                <i className="bi bi-eye"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  handlePrintPDF(order);
                                }}
                                title="Print"
                                disabled={isLoading}
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-3 py-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value);
                      dispatch(setPagination({
                          page: 'orders',
                          perPage: value
                      }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <OrderDetailsModal
        show={showOrderModal}
        order={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        handlePrintPDF={handlePrintPDF}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
          setTrackingId("");
        }}
        onStatusChange={handleStatusChange}
        trackingId={trackingId}
        setTrackingId={setTrackingId}
        isLoading={updateStatusMutation.isLoading}
        onDeliveryPartner={getDeliverPartner}
        onPaymentType={getPaymentType}
        customerData={customerData}
        setCustomerData={setCustomerData}
      />

      <div className="d-none">
        {selectedOrder && (
          <div ref={printRef}>
            <BusinessCard order={selectedOrder} isPreview={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;