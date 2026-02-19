// src/pages/blogs/BlogList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiClient from "../../services/apiClient";
import { IMAGE_PATH } from "../../utils/constants";
import Pagination from "../../components/Pagination";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";

const BlogList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);

  const perPageFromRedux = useSelector(selectPerPage("blogs"));
  const [itemsPerPage, setItemsPerPage] = useState(perPageFromRedux || 10);
  const rowsPerPageOptions = [5, 10, 20, 50, 100];

  useEffect(() => {
    setItemsPerPage(perPageFromRedux || 10);
  }, [perPageFromRedux]);

  const {
    data: blogsData = { data: [], total: 0 },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["blogs", currentPage, itemsPerPage],
    queryFn: async () => {
      const res = await apiClient.get("/blogs", {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
        },
      });

      return {
        data: res.data.data?.data || [],
        total: res.data.data?.total || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    onError: (err) => {
      console.error(err);
      toast.error("Failed to fetch blogs");
    },
  });

  const blogs = blogsData.data;
  const totalItems = blogsData.total;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId) => {
      return await apiClient.delete(`/blogs/${blogId}`);
    },
    onSuccess: () => {
      toast.success("Blog deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setDeleteDialog({ open: false, id: null });

      if (blogs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete blog");
      setDeleteDialog({ open: false, id: null });
    },
  });

  const deleteBlog = () => {
    if (!deleteDialog.id) return;
    deleteBlogMutation.mutate(deleteDialog.id);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(
      setPagination({
        page: "blogs",
        perPage: newItemsPerPage,
      })
    );
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      {/* Header + Breadcrumb */}
      <div className="row mx-0 mb-4">
        <div className="col-12 col-md-6 px-0 d-flex align-items-end mb-3 mb-md-0">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>
                  Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i className="bi bi-journal-text me-1"></i>
                Blogs
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12 px-0 col-md-6 d-flex justify-content-md-end">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => navigate("/blogs/add")}
          >
            <i className="bi bi-plus me-2"></i>
            Add Blog
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading blogs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="bi bi-exclamation-triangle display-4 text-danger"></i>
              <p className="text-danger mt-3">Failed to load blogs</p>
              <button className="btn btn-primary mt-2" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x display-4 text-muted"></i>
              <p className="text-muted mt-3">No blogs found</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => navigate("/blogs/add")}
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Thumbnail</th>
                      <th>Status</th>
                      <th>Published</th>
                      <th>Views</th>
                      <th>SEO</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog, index) => {
                      const hasSeo =
                        blog.meta_title || blog.meta_description || blog.meta_keywords;

                      return (
                        <tr key={blog.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>
                            <div className="fw-semibold">{blog.title}</div>
                            <small className="text-muted">/{blog.slug}</small>
                          </td>
                          <td>
                            {blog.thumbnail && (
                              <img
                                src={`${IMAGE_PATH}${blog.thumbnail}`}
                                alt={blog.title}
                                className="rounded"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                blog.status === "published"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {blog.status === "published" ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td>{formatDate(blog.published_at)}</td>
                          <td>{blog.views_count ?? 0}</td>
                          <td>
                            <span
                              className={`badge ${
                                hasSeo
                                  ? "bg-outline-success text-success border border-success bg-light"
                                  : "bg-outline-warning text-warning border border-warning bg-light"
                              }`}
                            >
                              {hasSeo ? "SEO Ready" : "SEO Missing"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                onClick={() =>
                                  setDeleteDialog({ open: true, id: blog.id })
                                }
                                title="Delete"
                                disabled={deleteBlogMutation.isLoading}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(totalPages != null || totalItems > 0) && (
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

      {/* Delete Modal */}
      {deleteDialog.open && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
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
                  disabled={deleteBlogMutation.isLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this blog? This action cannot be
                  undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteDialog({ open: false, id: null })}
                  disabled={deleteBlogMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteBlog}
                  disabled={deleteBlogMutation.isLoading}
                >
                  {deleteBlogMutation.isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
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

export default BlogList;
