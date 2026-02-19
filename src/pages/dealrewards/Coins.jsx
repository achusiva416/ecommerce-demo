import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";

const CoinSettings = () => {
  const [open, setOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [coinsAwarded, setCoinsAwarded] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingSetting, setEditingSetting] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState(null);
  const [settings, setSettings] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch coin settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/coin-settings", {
        params: {
          page: page,
          per_page: perPage,
        },
      });
      setSettings(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch coin settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [page, perPage]);

  // Save setting function
  const saveSetting = async () => {
    try {
      setSaving(true);
      const settingData = {
        purchase_amount: parseFloat(purchaseAmount),
        coins_awarded: parseInt(coinsAwarded),
        is_active: isActive
      };
      
      if (editingSetting) {
        await apiClient.put(`/coin-settings/${editingSetting.id}`, settingData);
        toast.success("Coin setting updated successfully");
      } else {
        await apiClient.post("/coin-settings", settingData);
        toast.success("Coin setting added successfully");
      }
      setOpen(false);
      resetForm();
      fetchSettings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to save coin setting");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Delete setting function
  const deleteSetting = async () => {
    if (!settingToDelete) return;
    
    try {
      setDeleting(true);
      await apiClient.delete(`/coin-settings/${settingToDelete.id}`);
      toast.success("Coin setting deleted successfully");
      setDeleteDialogOpen(false);
      setSettingToDelete(null);
      fetchSettings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete coin setting");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setPurchaseAmount("");
    setCoinsAwarded("");
    setIsActive(true);
    setEditingSetting(null);
  };

  const handleEditClick = (setting) => {
    setEditingSetting(setting);
    setPurchaseAmount(setting.purchase_amount);
    setCoinsAwarded(setting.coins_awarded);
    setIsActive(setting.is_active);
    setOpen(true);
  };

  const handleDeleteClick = (setting) => {
    setSettingToDelete(setting);
    setDeleteDialogOpen(true);
  };

  const calculateConversionRate = (purchase, coins) => {
    if (!purchase || !coins || purchase <= 0) return 0;
    return (coins / purchase).toFixed(2);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage;

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4">
        <div className="col-12 px-0 col-md-6 d-flex justify-content-md-start">
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
                <i class="bi bi-coin me-1"></i>
                  Coins
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12 px-0 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
          >
            <i className="bi bi-plus me-2"></i>
            Add Coin Setting
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
              <p className="mt-2 text-muted">Loading coin settings...</p>
            </div>
          ) : !settings || settings.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-coin display-4 text-muted"></i>
              <p className="text-muted mt-3">No coin settings found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => {
                  resetForm();
                  setOpen(true);
                }}
              >
                Add Your First Coin Setting
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Purchase Amount (₹)</th>
                      <th>Coins Awarded</th>
                      <th>Conversion Rate</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting, index) => (
                      <tr key={setting.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>₹{setting.purchase_amount}</td>
                        <td>{setting.coins_awarded} coins</td>
                        <td>{calculateConversionRate(setting.purchase_amount, setting.coins_awarded)} coins/₹</td>
                        <td>
                          {setting.is_active ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleEditClick(setting)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleDeleteClick(setting)}
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
      {open && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingSetting ? "Edit" : "Add"} Coin Setting</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="purchaseAmount" className="form-label">Purchase Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="purchaseAmount"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      placeholder="Enter purchase amount"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="coinsAwarded" className="form-label">Coins Awarded</label>
                    <input
                      type="number"
                      className="form-control"
                      id="coinsAwarded"
                      value={coinsAwarded}
                      onChange={(e) => setCoinsAwarded(e.target.value)}
                      placeholder="Enter coins awarded"
                      min="1"
                      step="1"
                    />
                  </div>
                  {purchaseAmount && coinsAwarded && (
                    <div className="col-12 mb-3">
                      <div className="alert alert-info py-2">
                        <small>
                          Conversion rate: {calculateConversionRate(purchaseAmount, coinsAwarded)} coins per $
                        </small>
                      </div>
                    </div>
                  )}
                  <div className="col-12 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active Status
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={saveSetting}
                  disabled={saving || !purchaseAmount || !coinsAwarded}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {editingSetting ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingSetting ? "Update" : "Add"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setDeleteDialogOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the coin setting for 
                  {settingToDelete && <strong> ${settingToDelete.purchase_amount} = {settingToDelete.coins_awarded} coins</strong>}? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={deleteSetting}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinSettings;