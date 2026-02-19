import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
// import Layout from "../../components/Layout";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";


const StockManagement = () => {
  const navigate = useNavigate();
  
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);
  
  const [stockName, setStockName] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [editingStock, setEditingStock] = useState(null);

  const rowsPerPageOptions = [5, 10, 20, 50, 100];

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/stocks", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm
        }
      });
      setStocks(response.data.data || []);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch stocks");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [currentPage, itemsPerPage]);

  // Handle save stock
  const handleSaveStock = async () => {
    if (!stockName.trim()) {
      toast.error("Stock name is required");
      return;
    }

    try {
      if (editingStock) {
        await apiClient.put(`/stocks/${editingStock.id}`, { 
          name: stockName,
          quantity: Number(stockQuantity) || 0
        });
        toast.success("Stock updated successfully");
      } else {
        await apiClient.post("/stocks", { 
          name: stockName,
          quantity: Number(stockQuantity) || 0
        });
        toast.success("Stock added successfully");
      }
      
      setShowStockModal(false);
      setStockName("");
      setStockQuantity(0);
      setEditingStock(null);
      fetchStocks();
    } catch (error) {
      toast.error("Failed to save stock item");
      console.error(error);
    }
  };

  // Handle delete stock
  const handleDeleteStock = async () => {
    if (!stockToDelete) return;
    
    try {
      await apiClient.delete(`/stocks/${stockToDelete}`);
      toast.success("Stock item deleted");
      setShowDeleteModal(false);
      setStockToDelete(null);
      fetchStocks();
    } catch (error) {
      toast.error("Failed to delete stock item");
      console.error(error);
    }
  };

  // Handle edit click
  const handleEditClick = (stock) => {
    setEditingStock(stock);
    setStockName(stock.name);
    setStockQuantity(stock.quantity || 0);
    setShowStockModal(true);
  };

  // Handle view click
  const handleViewClick = (id) => {
    navigate(`/stocks/${id}`);
  };

  // Render quantity with low stock warning
  const renderQuantity = (quantity) => {
    const isLowStock = quantity < 10;
    
    return (
      <div className="d-flex align-items-center gap-2">
        <span className={isLowStock ? "text-danger fw-bold" : ""}>
          {quantity.toLocaleString()}
        </span>
        {isLowStock && (
          <span className="badge bg-danger">Low Stock</span>
        )}
      </div>
    );
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    
      <div className="container-fluid px-0 px-md-3 py-4">
        {/* Header with search and add button */}
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
                  <i class="bi bi-boxes me-1"></i>
                    Inventory
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
                  placeholder="Search stocks..."
                  // value={searchTerm}
                  onKeyUp={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value)
                    if (e.key === "Enter") {
                      fetchStocks(value); // pass directly
                    }
                  }}

                />
              </div>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center justify-content-center"
              onClick={() => {
                setEditingStock(null);
                setStockName("");
                setStockQuantity(0);
                setShowStockModal(true);
              }}
            >
              <i className="bi bi-plus me-1 me-md-2"></i>
              <span className="d-none d-md-inline">Add Stock Item</span>
            </button>
          </div>
        </div>

        {/* Stocks table */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading && stocks ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : stocks?.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No stock items found</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Stock Name</th>
                        <th>Quantity</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks?.map((stock, index) => (
                        <tr 
                          key={stock.id}
                          className={stock.quantity < 10 ? "table-danger" : ""}
                        >
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }} title={stock.name}>
                            {stock.name}
                          </td>
                          <td>{renderQuantity(stock.quantity || 0)}</td>
                          <td>
                            {stock.updated_at ? new Date(stock.updated_at).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }) : 'N/A'}
                          </td>
                          <td>
                            <div className="d-flex gap-1 gap-sm-2">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={() => handleViewClick(stock.id)}
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={() => handleEditClick(stock)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={() => {
                                  setStockToDelete(stock.id);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
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
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add/Edit Stock Modal */}
        {showStockModal && (
          <div className={`modal fade show d-block`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-box-seam me-2"></i>
                    {editingStock ? "Edit" : "Add"} Stock Item
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowStockModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Stock Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={stockName}
                      onChange={(e) => setStockName(e.target.value)}
                      placeholder="Enter stock name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveStock}>
                    {editingStock ? "Update" : "Add"} Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className={`modal fade show d-block`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this stock item? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteStock}>
                    <i className="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default StockManagement;