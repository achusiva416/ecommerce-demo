import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";
import ResizableTh from "../../components/ResizableTh";


const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [columnWidths, setColumnWidths] = useState({
    id: 80,
    code: 120,
    name: 220,
    price: 120,
    salePrice: 130,
    stock: 100,
    status: 100,
    actions: 120
  });


  const rowsPerPageOptions = [5, 10, 20, 50, 100];
  const perPage = useSelector(selectPerPage('products'))

  useEffect(() => {
    setItemsPerPage(perPage)
  },[])
  
  const {
    data: productsData = { data: [], total: 0 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', currentPage, itemsPerPage, searchTerm, sortConfig.key, sortConfig.direction],
    queryFn: async () => {
      const response = await apiClient.get("/products", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchTerm,
          sort_by: sortConfig.key,
          sort_order: sortConfig.direction
        }
      });
      return {
        data: response.data.data || [],
        total: response.data.total || 0
      };
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    onError: (error) => {
      toast.error("Failed to fetch products");
      console.error("Fetch products error:", error);
    }
  });

  const products = productsData.data;
  const totalItems = productsData.total;

  // React Query mutation for deleting product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      return await apiClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteModal(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete product");
      console.error("Delete product error:", error);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.key === 'Enter') {
      setCurrentPage(1);
      // Query will automatically refetch due to dependency changes
    }
  }

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  // Handle delete
  const handleDelete = async () => {
    if (!productToDelete) return;
    deleteProductMutation.mutate(productToDelete);
  };

  // Render stock status
  const renderStockStatus = (stock) => {
    if (stock < 5) {
      return <span className="badge rounded-pill bg-danger">Low</span>;
    } else if (stock < 10) {
      return <span className="badge rounded-pill bg-warning text-dark">Medium</span>;
    }
    return <span className="badge rounded-pill bg-success">Good</span>;
  };

  // Clear sort
  const clearSort = () => {
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  };

  const updateWidth = (key, width) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  };


  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4 px-0">
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
                <i className="bi bi-box me-1"></i>
                  Products
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12 col-md-6 px-0 d-flex flex-column flex-sm-row gap-2">
          <div className="flex-grow-1">
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                onKeyUp={(e) => handleSearch(e)}
              />
            </div>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center justify-content-center"
            onClick={() => navigate('/products/add')}
          >
            <i className="bi bi-plus me-1 me-md-2"></i>
            <span className="d-none d-md-inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <small className="text-muted me-2">Sort by:</small>
                <button
                  className={`btn btn-sm ${sortConfig.key === 'name' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIndicator('name')}
                </button>
                <button
                  className={`btn btn-sm ${sortConfig.key === 'price' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleSort('price')}
                >
                  Price {getSortIndicator('price')}
                </button>
                <button
                  className={`btn btn-sm ${sortConfig.key === 'sale_price' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleSort('sale_price')}
                >
                  Sale Price {getSortIndicator('sale_price')}
                </button>
                <button
                  className={`btn btn-sm ${sortConfig.key === 'stock' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleSort('stock')}
                >
                  Stock {getSortIndicator('stock')}
                </button>
                <button
                  className={`btn btn-sm ${sortConfig.key === 'code' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleSort('code')}
                >
                  Code {getSortIndicator('code')}
                </button>
                {sortConfig.key && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearSort}
                  >
                    Clear Sort
                  </button>
                )}
              </div>
            </div>
          </div>
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
              <p className="text-danger">Failed to load products</p>
              <button className="btn btn-primary" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <ResizableTh className="d-none d-md-table-cell"
                        width={columnWidths.id}
                        onResize={(w) => updateWidth("id", w)}
                      >
                        # {getSortIndicator("id")}
                      </ResizableTh>

                      <ResizableTh
                        className="d-none d-sm-table-cell"
                        width={columnWidths.code}
                        onResize={(w) => updateWidth("code", w)}
                      >
                        Code {getSortIndicator("code")}
                      </ResizableTh>

                      <ResizableTh
                        width={columnWidths.name}
                        onResize={(w) => updateWidth("name", w)}
                      >
                        Name {getSortIndicator("name")}
                      </ResizableTh>

                      <ResizableTh className="d-none d-sm-table-cell"
                        width={columnWidths.price}
                        onResize={(w) => updateWidth("price", w)}
                      >
                        Price {getSortIndicator("price")}
                      </ResizableTh>

                      <ResizableTh className="d-none d-lg-table-cell"
                        width={columnWidths.salePrice}
                        onResize={(w) => updateWidth("salePrice", w)}
                      >
                        Sale Price {getSortIndicator("sale_price")}
                      </ResizableTh>

                      <ResizableTh className="d-none d-md-table-cell"
                        width={columnWidths.stock}
                        onResize={(w) => updateWidth("stock", w)}
                      >
                        Stock {getSortIndicator("stock")}
                      </ResizableTh>

                      <ResizableTh className="d-none d-md-table-cell"
                        width={columnWidths.status}
                        onResize={(w) => updateWidth("status", w)}
                      >
                        Status
                      </ResizableTh>

                      <ResizableTh
                        width={columnWidths.actions}
                        onResize={(w) => updateWidth("actions", w)}
                      >
                        Actions
                      </ResizableTh>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className={product.stock < 5 ? "table-danger" : ""}
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          className="d-none d-md-table-cell"
                          style={{ width: columnWidths.id }}
                        >
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td className="d-none d-sm-table-cell" style={{ width: columnWidths.code }}>{product.code || "-"}</td>

                        <td style={{ width: columnWidths.name }}>
                          <div className="text-truncate" style={{ maxWidth: columnWidths.name }}>
                            {product.name}
                          </div>
                          <small>Model : {product.varient || "N/A"}</small>
                        </td>

                        <td
                          className="d-none d-sm-table-cell"
                          style={{ width: columnWidths.price }}
                        >
                          ₹{product.price.toLocaleString()}
                        </td>

                        <td
                          className="d-none d-lg-table-cell"
                          style={{ width: columnWidths.salePrice }}
                        >
                          ₹{product.sale_price.toLocaleString()}
                        </td>

                        <td className="d-none d-md-table-cell" style={{ width: columnWidths.stock }}>
                          {product.stock}
                        </td>

                        <td className="d-none d-md-table-cell" style={{ width: columnWidths.status }}>
                          {renderStockStatus(product.stock)}
                        </td>

                        <td style={{ width: columnWidths.actions }}>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-circle"
                              onClick={(e) => { e.stopPropagation(); navigate(`/products/edit/${product.id}`); }}
                              style={{ width: 32, height: 32 }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductToDelete(product.id);
                                setShowDeleteModal(true);
                              }}
                              style={{ width: 32, height: 32 }}
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


              {totalPages  && (
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
                          page: 'products',
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                  disabled={deleteProductMutation.isLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteProductMutation.isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isLoading}
                >
                  {deleteProductMutation.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i> Delete
                    </>
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

export default ProductsPage;