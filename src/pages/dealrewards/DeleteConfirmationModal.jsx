import React, { useState } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";

const DeleteConfirmationModal = ({ 
  open, 
  onClose, 
  item, 
  onDelete, 
  type = "coupon" // "coupon" or "offer"
}) => {
  const [deleting, setDeleting] = useState(false);

  const getItemTypeConfig = () => {
    const config = {
      coupon: {
        endpoint: "coupons",
        nameField: "coupon_name",
        displayName: "Coupon",
        successMessage: "Coupon deleted successfully",
        errorMessage: "Failed to delete coupon"
      },
      offer: {
        endpoint: "offers", 
        nameField: "offer_name",
        displayName: "Offer",
        successMessage: "Offer deleted successfully",
        errorMessage: "Failed to delete offer"
      },
      flashsale: {
        endpoint: "flash-sales",
        nameField: "flash_sale_name",
        displayName: "Flash Sale",
        successMessage: "Flash Sale deleted successfully",
        errorMessage: "Failed to delete flash sale"
      }
    };
    return config[type] || config.coupon;
  };

  const deleteItem = async () => {
    console.log(item)
    if (!item) return;
    
    const config = getItemTypeConfig();
    
    try {
      setDeleting(true);
      await apiClient.delete(`/${config.endpoint}/${item.id}`);
      toast.success(config.successMessage);
      onDelete();
    } catch (error) {
      toast.error(config.errorMessage);
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  const config = getItemTypeConfig();
  const itemName = item ? item[config.nameField] : '';

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Confirm Delete</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-3">
              <i className="bi bi-exclamation-triangle text-danger display-4"></i>
            </div>
            <p className="text-center mb-0">
              Are you sure you want to delete the {config.displayName.toLowerCase()}
              {itemName && <strong> "{itemName}"</strong>}? 
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={deleteItem} 
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Delete {config.displayName}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;