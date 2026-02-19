import React, { useState, useEffect } from "react";
import Select from "react-select";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const GroupingModal = ({ show, onClose, onConfirm, onSelectedGroup }) => {
  const [groupings, setGroupings] = useState([]);
  const [productsInGroup, setProductsInGroup] = useState([]);
  const [isLoadingGroupings, setIsLoadingGroupings] = useState(false);
  
  const [selectedGrouping, setSelectedGrouping] = useState(null);

  useEffect(() => {
    if (show) {
      fetchGroupings();
      // If we already have a selection, sync the products list
      if (selectedGrouping) {
        setProductsInGroup(selectedGrouping.products || []);
      }
    } else {
      // Reset only local state when closing
      setProductsInGroup([]);
    }
  }, [show, selectedGrouping]);

  const fetchGroupings = async () => {
    setIsLoadingGroupings(true);
    try {
      const response = await apiClient.get("/product-groups");
      const options = (response.data?.data || response.data || []).map((group) => ({
        value: group.id,
        label: group.name || `Group #${group.id}`,
        products: group.products || []
      }));
      setGroupings(options);
    } catch (error) {
      console.error("Error fetching groupings:", error);
      toast.error("Failed to fetch groupings");
    } finally {
      setIsLoadingGroupings(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedGrouping) {
      toast.warning("Please select a grouping first");
      return;
    }
    onConfirm(selectedGrouping, productsInGroup);
    onClose();
  };

  const handleGroupingChange = (group) => {
    setSelectedGrouping(group);
    if (typeof onSelectedGroup === 'function') {
      onSelectedGroup(group);
    }
    setProductsInGroup(group?.products || []);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid #dee2e6',
      borderRadius: '0.375rem',
      minHeight: '45px',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      '&:hover': {
        borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6c757d',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 1056, // Must be above modal
    })
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }} 
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center">
              <i className="bi bi-grid-3x3-gap-fill me-2"></i>
              Product Grouping
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-4">
            <div className="mb-4">
              <label className="form-label fw-bold text-muted mb-2">Select Grouping</label>
              <Select
                options={groupings}
                value={selectedGrouping}
                onChange={handleGroupingChange}
                placeholder="Search or select a grouping..."
                isLoading={isLoadingGroupings}
                styles={customStyles}
                isClearable
                isSearchable
              />
            </div>

            {selectedGrouping && (
              <div className="mt-4 border-top pt-3">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-box-seam me-2 text-primary"></i>
                  Products in Group: <span className="ms-2 badge bg-secondary">{productsInGroup.length}</span>
                </h6>
                
                <div 
                  className="overflow-auto" 
                  style={{ maxHeight: "300px", borderRadius: "8px" }}
                >
                  {productsInGroup.length > 0 ? (
                    <div className="list-group list-group-flush border rounded">
                      {productsInGroup.map((product) => (
                        <div 
                          key={product.id} 
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center">
                            <div 
                              className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center"
                              style={{ width: "40px", height: "40px" }}
                            >
                              <i className="bi bi-tag text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-bold mb-0">{product.name}</div>
                              <small className="text-muted">{product.code || 'No SKU'}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="fw-bold text-primary">₹{product.price?.toLocaleString()}</span>
                            {product.sale_price && (
                              <div className="text-muted small text-decoration-line-through">
                                ₹{product.sale_price?.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 bg-light rounded">
                      <i className="bi bi-inbox text-muted display-6 mb-2 d-block"></i>
                      <p className="text-muted mb-0">No products found in this group.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light border-top-0 p-3">
            <button 
              type="button" 
              className="btn btn-outline-secondary px-4" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary px-4" 
              onClick={handleConfirm}
              disabled={!selectedGrouping}
            >
              <i className="bi bi-check2-circle me-1"></i>
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupingModal;
