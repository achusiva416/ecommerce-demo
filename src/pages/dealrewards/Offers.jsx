import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import OfferModal from "./OfferModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ViewOfferModal from "./ViewOfferModal";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const OfferList = () => {
  const navigate = useNavigate();  
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [offers, setOffers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/offers", {
        params: {
          page: page,
          per_page: perPage,
          with_items: true
        },
      });
      setOffers(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch offers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [page, perPage]);

  const handleViewClick = (offer) => {
    setSelectedOffer(offer);
    setViewOpen(true);
  };

  const handleEditClick = (offer) => {
    setSelectedOffer(offer);
    setOpen(true);
  };

  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedOffer(null);
    setOpen(true);
  };

  const handleOfferSaved = () => {
    setOpen(false);
    setSelectedOffer(null);
    fetchOffers();
  };

  const handleOfferDeleted = () => {
    setDeleteDialogOpen(false);
    setOfferToDelete(null);
    fetchOffers();
  };

  const getStatusBadge = (isActive, endDate) => {
    if (!isActive) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    
    const today = new Date();
    const end = new Date(endDate);
    
    if (end < today) {
      return <span className="badge bg-danger">Expired</span>;
    }
    
    return <span className="badge bg-success">Active</span>;
  };

  const getDiscountTypeText = (type) => {
    return type === 'percentage' ? 'Percentage' : 'Fixed Amount';
  };

  const getDiscountDisplay = (offer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}%`;
    } else {
      return `₹${offer.discount_value}`;
    }
  };

  const getApplicableForText = (applicableFor) => {
    switch (applicableFor) {
      case 'all_products':
        return 'All Products';
      case 'selected_products':
        return 'Selected Products';
      case 'selected_categories':
        return 'Selected Categories';
      default:
        return 'All Products';
    }
  };

  // Format datetime for display in DD/MM/YYYY HH:mm AM/PM format
  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return '-';
    
    try {
      return dayjs.utc(datetimeString).format('DD/MM/YYYY hh:mm A');
    } catch (error) {
      console.error('Error formatting datetime:', datetimeString, error);
      return '-';
    }
  };

  // Format product display in table
  const formatSelectedItems = (offer) => {
    if (offer.applicable_for === 'all_products' || !offer.items || offer.items.length === 0) {
      return '-';
    }
    
    const count = offer.items.length;
    return `${count} item${count !== 1 ? 's' : ''}`;
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage;

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4">
        <div className="col-12 px-0 col-md-6  px-0  d-flex align-items-end mb-3 mb-md-0">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>
                  Dashboard
                </Link>
                
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <Link to="/deals" className="text-decoration-none">
                  <i className="bi bi-percent me-1"></i>
                  Deals & Rewards
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i className="bi bi-gift me-1"></i>
                 Offers
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleAddClick}
          >
            <i className="bi bi-plus me-2"></i>
            Add Offer
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading offers...</p>
            </div>
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-tag display-4 text-muted"></i>
              <p className="text-muted mt-3">No offers found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={handleAddClick}
              >
                Add Your First Offer
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Offer Name</th>
                      <th>Discount</th>
                      <th>Applicable For</th>
                      <th>Min Order</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer, index) => (
                      <tr key={offer.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{offer.offer_name}</td>
                        <td>
                          {getDiscountDisplay(offer)}
                          <br />
                          <small className="text-muted">{getDiscountTypeText(offer.discount_type)}</small>
                        </td>
                        <td>
                          {getApplicableForText(offer.applicable_for)}
                          <br />
                          {offer.applicable_for !== "all_products" && (
                            
                            <small className="text-muted">{formatSelectedItems(offer)}</small>
                          )}
                        </td>
                        <td>
                          {offer.min_order_amount ? `₹${offer.min_order_amount}` : 'No minimum'}
                        </td>
                        <td>{new Date(offer.start_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                        })}</td>
                        <td>{new Date(offer.end_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                        })}</td>
                        <td>{getStatusBadge(offer.is_active, offer.end_date)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleViewClick(offer)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleEditClick(offer)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleDeleteClick(offer)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    <span className="text-muted">
                      Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalItems)} of {totalItems} entries
                    </span>
                  </div>
                  
                  <div className="d-flex gap-2 align-items-center">
                    <select 
                      className="form-select form-select-sm"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      style={{ width: 'auto' }}
                    >
                      {[5, 10, 20, 50].map(option => (
                        <option key={option} value={option}>{option} per page</option>
                      ))}
                    </select>
                    
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <OfferModal
        open={open}
        onClose={() => setOpen(false)}
        offer={selectedOffer}
        onSave={handleOfferSaved}
      />

      {/* View Details Modal */}
      <ViewOfferModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        offer={selectedOffer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        item={offerToDelete}
        onDelete={handleOfferDeleted}
        type="offer"
      />
    </div>
  );
};

export default OfferList;