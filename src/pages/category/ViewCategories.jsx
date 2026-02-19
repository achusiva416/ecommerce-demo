import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";

const CategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch category details
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/categories/${id}`);
      setCategory(response.data);
    } catch (error) {
      toast.error("Failed to fetch category details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-triangle display-4 text-muted mb-3"></i>
          <h4 className="text-muted">Category not found</h4>
          <p className="text-muted mb-4">The category you're looking for doesn't exist.</p>
          <Link to="/categories" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/categories" className="text-decoration-none">Categories</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {category.category_name}
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="mb-1">{category.category_name}</h2>
          <p className="text-muted mb-0">Category Details</p>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/categories')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate(`/categories/edit/${category.id}`)}
          >
            <i className="bi bi-pencil me-1"></i>
            Edit
          </button>
        </div>
      </div>

      {/* Category Details Card */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Category Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Category Name
                    </label>
                    <p className="fs-5 mb-0 text-dark">{category.category_name}</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Category ID
                    </label>
                    <p className="mb-0">
                      <span className="badge bg-secondary">#{category.id}</span>
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Total Products
                    </label>
                    <p className="mb-0">
                      <span className="badge bg-primary fs-6">
                        {category.products_count || 0} products
                      </span>
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Status
                    </label>
                    <p className="mb-0">
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Created Date
                    </label>
                    <p className="mb-0 text-dark">
                      <i className="bi bi-calendar me-2 text-muted"></i>
                      {new Date(category.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small mb-1">
                      Last Updated
                    </label>
                    <p className="mb-0 text-dark">
                      <i className="bi bi-arrow-repeat me-2 text-muted"></i>
                      {new Date(category.updated_at || category.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Last modified: {new Date(category.updated_at || category.created_at).toLocaleString()}
                </small>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${category.category_name}"?`)) {
                        // Handle delete logic here
                        toast.info('Delete functionality would be implemented here');
                      }
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-eye display-6 text-primary mb-3"></i>
                  <h5>View Products</h5>
                  <p className="text-muted small">Browse all products in this category</p>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/products?category=${category.id}`)}
                  >
                    View Products
                  </button>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-plus-circle display-6 text-success mb-3"></i>
                  <h5>Add Product</h5>
                  <p className="text-muted small">Add a new product to this category</p>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate('/products/add')}
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;