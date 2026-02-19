import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import { IMAGE_PATH } from "../../utils/constants";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";

const ComboProductList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get perPage from Redux and use it as initial state
  const perPageFromRedux = useSelector(selectPerPage('combo'));
  const [itemsPerPage, setItemsPerPage] = useState(perPageFromRedux || 10);
  
  const rowsPerPageOptions = [5, 10, 20, 50, 100];

  // Sync Redux state with local state
  useEffect(() => {
    setItemsPerPage(perPageFromRedux || 10);
  }, [perPageFromRedux]);

  // React Query for fetching combo products
  const {
    data: combosData = { data: [], total: 0 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['combo-products', currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await apiClient.get("/combo-products", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
        },
      });
      return {
        data: response.data.data.data || [],
        total: response.data.data.total || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      toast.error("Failed to fetch combo products");
      console.error("Fetch combos error:", error);
    }
  });

  const combos = combosData.data;
  const totalItems = combosData.total;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  console.log(combosData)
  // React Query mutation for deleting combo
  const deleteComboMutation = useMutation({
    mutationFn: async (comboId) => {
      return await apiClient.delete(`/combo-products/${comboId}`);
    },
    onSuccess: () => {
      toast.success("Combo deleted successfully!");
      // Invalidate and refetch combo products
      queryClient.invalidateQueries({ queryKey: ['combo-products'] });
      setDeleteDialog({ open: false, id: null });
      
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (combos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error) => {
      toast.error("Failed to delete combo");
      console.error("Delete combo error:", error);
      setDeleteDialog({ open: false, id: null });
    }
  });

  const deleteCombo = async () => {
    if (!deleteDialog.id) return;
    deleteComboMutation.mutate(deleteDialog.id);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(setPagination({
      page: 'combo',
      perPage: newItemsPerPage
    }));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
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
                <i className="bi bi-boxes me-1"></i>
                Combo Products
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12  px-0 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => navigate('/combo-products/add')}
          >
            <i className="bi bi-plus me-2"></i>
            Create Combo
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading combo products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="bi bi-exclamation-triangle display-4 text-danger"></i>
              <p className="text-danger mt-3">Failed to load combo products</p>
              <button className="btn btn-primary mt-2" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : combos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam display-4 text-muted"></i>
              <p className="text-muted mt-3">No combo products found</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate('/combo-products/add')}
              >
                Create Your First Combo
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Combo Name</th>
                      <th>Price</th>
                      <th>Image</th>
                      <th>Products</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map((combo, index) => (
                      <tr
                        key={combo.id}
                        onClick={() => navigate(`/combo-products/edit/${combo.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <div>{combo.title}</div>
                          <small>Model : {combo.varient || 'N/A'}</small>
                        </td>
                        <td>₹{combo.combo_price}</td>
                        <td>
                          {combo.image_path && (
                            <img 
                              src={`${IMAGE_PATH}${combo.image_path}`}
                              alt={combo.title}
                              className="rounded"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          )}
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {(combo.products || []).map(p => p.name).join(", ")}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => { e.stopPropagation(); navigate(`/combo-products/view/${combo.id}`); }}
                              title="View"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => { e.stopPropagation(); navigate(`/combo-products/edit/${combo.id}`); }}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                              onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: combo.id }); }}
                              title="Delete"
                              disabled={deleteComboMutation.isLoading}
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

              {/* Fixed Pagination - Only show if we have more than 1 page OR items to paginate */}
              {(totalPages != null) && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialog.open && (
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
                  onClick={() => setDeleteDialog({ open: false, id: null })}
                  aria-label="Close"
                  disabled={deleteComboMutation.isLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this combo product? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteDialog({ open: false, id: null })}
                  disabled={deleteComboMutation.isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={deleteCombo}
                  disabled={deleteComboMutation.isLoading}
                >
                  {deleteComboMutation.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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

export default ComboProductList;