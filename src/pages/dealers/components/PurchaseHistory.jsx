import React, { useState } from "react";
import { FaImage, FaCheck, FaUpload, FaSync } from "react-icons/fa";
import UploadPhotosModal from "../UploadPhotosModal";
import ViewPhotosModal from "../ViewPhotosModal";
import { printPurchaseOrder } from "../../../utils/printPurchaseOrder";
import YogifyPrintLogo from "../../../assets/Yogifyr-Print.png";
import Pagination from "../../../components/Pagination";
import { Search, Calendar as CalendarIcon } from "lucide-react";

const PurchaseHistory = ({ 
  purchaseHistory = [], 
  onStatusUpdate, 
  onPhotosUpload, 
  onSyncStock, 
  dealerName,
  isLoading,
  pagination,
  filters
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [photosToView, setPhotosToView] = useState([]);

  const handleMarkDelivered = async (purchase) => {
    if (!onStatusUpdate) return;
    
    try {
      await onStatusUpdate(purchase.id, 'delivered');
      // Show upload modal after marking as delivered
      setSelectedPurchase(purchase);
      setShowUploadModal(true);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUploadPhotos = (purchase) => {
    setSelectedPurchase(purchase);
    setShowUploadModal(true);
  };

  const handleViewPhotos = (purchase) => {
    setPhotosToView(purchase.photos || []);
    setShowViewModal(true);
  };

  const handlePhotosUpload = async (photos, notes = '') => {
    if (!onPhotosUpload || !selectedPurchase) return;

    try {
      await onPhotosUpload(selectedPurchase.id, photos, notes);
      setShowUploadModal(false);
      setSelectedPurchase(null);
    } catch (error) {
      console.error('Failed to upload photos:', error);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedPurchase(null);
  };

  const handlePrint = (item) => {
    const printItems = [{
      name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      rate: item.rate
    }];
    printPurchaseOrder(printItems, dealerName || 'Dealer', YogifyPrintLogo);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setPhotosToView([]);
  };

  const getStatusBadge = (status) => {
    const isDelivered = status?.toLowerCase() === "delivered";
    
    return (
      <span
        className={`badge px-3 py-2 fw-medium ${
          isDelivered
            ? "bg-success-subtle text-success"
            : "bg-warning-subtle text-warning"
        }`}
      >
        {isDelivered ? "Delivered" : "Pending"}
      </span>
    );
  };

  const getActionButton = (purchase) => {
    const isDelivered = purchase.delivery_status?.toLowerCase() === "delivered";
    const hasPhotos = purchase.photos && purchase.photos.length > 0;

    return (
      <div className="d-flex gap-2">
        {!isDelivered ? (
          <button 
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 smaller"
            onClick={() => handleMarkDelivered(purchase)}
          >
            <FaCheck />
            <span>Mark Delivered</span>
          </button>
        ) : (
          <>
            {!purchase.is_synced && onSyncStock && (
              <button 
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 fs-small"
                onClick={() => onSyncStock(purchase.id)}
                title="Sync with Product Stock"
              >
                <FaSync className={purchase.syncing ? 'fa-spin' : ''} />
                <span>Sync Stock</span>
              </button>
            )}
            
            {hasPhotos ? (
              <button 
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={() => handleViewPhotos(purchase)}
              >
                <FaImage />
                <span>View Photos ({purchase.photos.length})</span>
              </button>
            ) : (
              <button 
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={() => handleUploadPhotos(purchase)}
              >
                <FaUpload />
                <span>Upload Photos</span>
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <h5 className="fw-semibold fs-5 mb-0">Purchase History</h5>
            
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {/* Search */}
              <div className="input-group input-group-sm" style={{ width: '200px' }}>
                <span className="input-group-text bg-white border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => filters.setSearch(e.target.value)}
                />
              </div>

              {/* Date Filters */}
              <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm" style={{ width: '150px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <CalendarIcon size={14} className="text-muted" />
                  </span>
                  <input
                    type="date"
                    className="form-control border-start-0"
                    value={filters.startDate}
                    onChange={(e) => filters.setStartDate(e.target.value)}
                  />
                </div>
                <span className="text-muted small">to</span>
                <div className="input-group input-group-sm" style={{ width: '150px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <CalendarIcon size={14} className="text-muted" />
                  </span>
                  <input
                    type="date"
                    className="form-control border-start-0"
                    value={filters.endDate}
                    onChange={(e) => filters.setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {filters.startDate || filters.endDate || filters.search ? (
                <button 
                  className="btn btn-sm btn-link text-danger p-0 ms-2"
                  onClick={() => {
                    filters.setSearch("");
                    filters.setStartDate("");
                    filters.setEndDate("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-muted fw-semibold small">Purchase Date</th>
                  <th className="text-muted fw-semibold small">Product</th>
                  <th className="text-muted fw-semibold small">Quantity</th>
                  <th className="text-muted fw-semibold small">Rate</th>
                  <th className="text-muted fw-semibold small">Total Amount</th>
                  <th className="text-muted fw-semibold small">Status</th>
                  <th className="text-muted fw-semibold small">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      <span className="text-muted">Loading history...</span>
                    </td>
                  </tr>
                ) : purchaseHistory.length > 0 ? (
                  purchaseHistory.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="py-3 small">
                        {new Date(item.purchase_date).toLocaleDateString(
                          "en-IN",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </td>
                      <td className="py-3">
                        <div className="fw-medium">{item.product?.name || 'N/A'}</div>
                        <div className="text-muted small">
                          {item.product?.code || 'No code'}
                        </div>
                      </td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">₹{Number(item.rate).toFixed(2)}</td>
                      <td className="py-3 fw-semibold">
                        ₹{Number(item.total).toFixed(2)}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(item.delivery_status)}
                      </td>
                      <td className="py-3">
                        {getActionButton(item)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-muted py-4"
                    >
                      <div className="py-3">
                        <FaImage className="display-4 text-muted mb-3" />
                        <p className="mb-2">No purchase history available</p>
                        <small>Purchases will appear here once added</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalItems > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.onPageChange}
                onItemsPerPageChange={pagination.onItemsPerPageChange}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <UploadPhotosModal
          purchase={selectedPurchase}
          onUpload={handlePhotosUpload}
          onClose={handleCloseUploadModal}
        />
      )}

      {/* View Photos Modal */}
      {showViewModal && (
        <ViewPhotosModal
          photos={photosToView}
          purchase={selectedPurchase}
          onClose={handleCloseViewModal}
          onAddMore={() => {
            setShowViewModal(false);
            setShowUploadModal(true);
          }}
        />
      )}
    </>
  );
};

export default PurchaseHistory;