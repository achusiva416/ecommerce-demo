import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { Users, ShoppingCart, Package, Wallet } from "lucide-react";
import StatCard from '../../components/StatCard';
import { Link } from "react-router-dom";


const DealersList = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    total_dealers: 0,
    total_purchases: 0,
    outstanding_shipments: 0,
    total_purchase_amount: 0
  });
  const navigate = useNavigate();

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/dealers", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm
        }
      });
      setDealers(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch dealers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get("/dealers/dashboard-stats");

      console.log("Dashboard Data:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    fetchDealers();
    fetchDashboardData();
  }, [currentPage, itemsPerPage]);

  const handleDelete = async () => {
    if (!dealerToDelete) return;
    
    try {
      await apiClient.delete(`/dealers/${dealerToDelete}`);
      toast.success("Dealer deleted successfully");
      fetchDealers();
      fetchDashboardData(); // Refresh stats after deletion
    } catch (error) {
      toast.error("Failed to delete dealer");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setDealerToDelete(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchDealers();
    }
  };

  const handleSearchButtonClick = () => {
    setCurrentPage(1);
    fetchDealers();
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);


  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      {/* Stats Section */}
      <div className="col-12 px-0  d-flex align-items-end mb-3 mb-md-0">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
              
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i className="bi bi-agent me-1"></i>
                Dealers
            </li>
          </ol>
        </nav>
      </div>
      <div className="row mb-4">
        <StatCard 
            icon={<Users size={24} className="text-primary"/>} 
            value={dashboardData.total_dealers?.toLocaleString() || "0"} 
            label="Total Dealers" 
            
        />
        <StatCard 
            icon={<ShoppingCart size={24} className="text-primary"/>} 
            value={dashboardData.total_purchases?.toLocaleString() || "0"} 
            label="No. Of Purchases" 
            
        />
        <StatCard 
            icon={<Package size={24} className="text-primary"/>}
            value={dashboardData.outstanding_shipments?.toLocaleString() || "0"}
            label="Undelivered"
            
        />
        <StatCard 
            icon={<Wallet size={24} className="text-primary"/>} 
            value={`₹${(dashboardData.total_purchase_amount || 0).toLocaleString()}`} 
            label="Total Purchases" 
            
        />
        </div>

      {/* Header with Search and Add Button */}
      <div className="row mx-0 mb-4">
        
        <div className="col-12 px-0 ms-auto col-md-6 d-flex flex-column flex-sm-row gap-2">
          <div className="flex-grow-1">
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search dealers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearch}
              />
              
            </div>
            <button 
                className="btn btn-outline-primary d-none"
                onClick={handleSearchButtonClick}
              >
                Search
              </button>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center justify-content-center"
            onClick={() => navigate('/dealers/add')}
          >
            <i className="bi bi-plus me-1 me-md-2"></i>
            <span className="d-none d-md-inline">Add Dealer</span>
          </button>
        </div>
      </div>

      {/* Dealers Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-person-gear display-4 text-muted"></i>
              <p className="text-muted mt-3">No dealers found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate('/dealers/add')}
              >
                Add Your First Dealer
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Dealer Info</th>
                      <th className="d-none d-sm-table-cell">Contact</th>
                      <th>Purchase Info</th>
                      <th className="d-none d-sm-table-cell">Last Purchase</th>
                      <th className="d-none d-sm-table-cell">Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.map((dealer) => (
                      <tr key={dealer.id} 
                          onClick={() => navigate(`/dealers/${dealer.id}`)}
                          className="cursor-pointer"
                      >
                        <td>
                          <div className="fw-semibold">{dealer.name}</div>
                          <small className="text-muted">{dealer.location}</small>
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <div>{dealer.phone}</div>
                          {dealer.phone2 && (
                            <small className="text-muted">{dealer.phone2}</small>
                          )}
                        </td>
                        <td >
                          <div className="fw-semibold">
                            ₹{parseFloat(dealer.total_purchases || 0).toLocaleString()}
                          </div>
                          <small className="text-muted">
                            {dealer.purchase_count || 0} purchases
                          </small>
                        </td>
                        <td className="d-none d-sm-table-cell">
                          {dealer.last_purchase_date ? (
                            <>
                              <div>{new Date(dealer.last_purchase_date).toLocaleDateString(
                                'en-IN', { year: 'numeric', month: 'short', day: 'numeric' }
                              )}</div>
                              <small className="text-muted">
                                ₹{parseFloat(dealer.last_purchase_amount || 0).toLocaleString()}
                              </small>
                            </>
                          ) : (
                            <span className="text-muted">No purchases</span>
                          )}
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <span className={`badge ${dealer.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                            {dealer.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dealers/${dealer.id}`)}}
                              title="View Profile"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dealers/edit/${dealer.id}`)}}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDealerToDelete(dealer.id);
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
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    <span className="text-muted">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </span>
                  </div>
                  
                  <div className="d-flex gap-2 align-items-center">
                    <select 
                      className="form-select form-select-sm"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: 'auto' }}
                    >
                      {[5, 10, 20, 50].map(option => (
                        <option key={option} value={option}>{option} per page</option>
                      ))}
                    </select>
                    
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this dealer? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                >
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

export default DealersList;