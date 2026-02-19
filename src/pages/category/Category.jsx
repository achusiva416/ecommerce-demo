import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import { IMAGE_PATH } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";

const CategoryList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);

  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const perPage = useSelector(selectPerPage("category"));

  useEffect(() => {
    fetchCategories();
  }, [perPage, page]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/categories", {
        params: { page, per_page: perPage },
      });

      setCategories(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Save category
  const saveCategory = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", categoryName);

      if (categoryImage) {
        formData.append("image", categoryImage);
      }

      if (editingCategory) {
        await apiClient.post(
          `/categories/${editingCategory.id}?_method=PUT`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Category updated successfully");
      } else {
        await apiClient.post("/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added successfully");
      }

      setOpen(false);
      setCategoryName("");
      setCategoryImage(null);
      setPreviewImage(null);
      setEditingCategory(null);

      fetchCategories();
    } catch (error) {
      toast.error("Failed to save category");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);

      await apiClient.delete(`/categories/${categoryToDelete.id}`);

      toast.success("Category deleted successfully");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setPreviewImage(category.image_url ? category.image_url : null);
    setCategoryImage(null);
    setOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      {/* Header */}
      <div className="row mx-0 mb-4">
        <div className="col-12 col-md-6 mb-3 mb-md-0 p-0">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i> Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item active">
                <i className="bi bi-grid me-1"></i> Categories
              </li>
            </ol>
          </nav>
        </div>

        <div className="col-12 col-md-6 d-flex justify-content-md-end p-0">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => {
              setEditingCategory(null);
              setCategoryName("");
              setCategoryImage(null);
              setPreviewImage(null);
              setOpen(true);
            }}
          >
            <i className="bi bi-plus me-2"></i> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2 text-muted">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-grid display-4 text-muted"></i>
          <p className="text-muted mt-3">No categories found</p>
          <button className="btn btn-primary mt-2" onClick={() => setOpen(true)}>
            Add Your First Category
          </button>
        </div>
      ) : (
        <>
          {/* Card Grid */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mb-3">
            {categories.map((category) => (
              <div className="col" key={category.id}>
                <div
                  className="card border-0 shadow-sm h-100 transition-hover"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                  // onClick={() => navigate(`/categories/edit/${category.id}`)}
                >
                  <div
                    style={{
                      height: "200px",
                      backgroundColor: "#faf6f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {category.image ? (
                      <img
                        src={IMAGE_PATH + category.image}
                        alt={category.category_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="bi bi-image text-muted"
                        style={{ fontSize: "3rem", opacity: 0.3 }}
                      ></i>
                    )}
                  </div>

                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-1 text-truncate">
                      {category.category_name}
                    </h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-primary" style={{fontSize:"14px"}}>
                        {category.products_count || 0} Products
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "30px", height: "30px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(category);
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" style={{ fontSize: "12px" }}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "30px", height: "30px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(category);
                          }}
                          title="Delete"
                        >
                          <i className="bi bi-trash" style={{ fontSize: "12px" }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages && (
            <div className="card border-0 shadow-sm">
              <div className="card-body py-2 px-3">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={perPage}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  onPageChange={(p) => setPage(p)}
                  onItemsPerPageChange={(value) => {
                    dispatch(
                      setPagination({
                        page: "category",
                        perPage: value,
                      })
                    );
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {open && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h5>
                <button className="btn-close" onClick={() => setOpen(false)}></button>
              </div>

              <div className="modal-body">
                {/* Category Name */}
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                {/* Category Image */}
                <div className="mb-3">
                  <label className="form-label">Category Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setCategoryImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }}
                  />
                </div>

                {/* Preview Image */}
                {previewImage && (
                  <div className="mb-3">
                    <p className="mb-1">Preview:</p>
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={saveCategory}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingCategory ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteDialogOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setDeleteDialogOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                Are you sure you want to delete
                <strong> "{categoryToDelete?.category_name}"</strong>?
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={deleteCategory}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
