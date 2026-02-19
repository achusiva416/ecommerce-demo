import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectPerPage, setPagination } from "../../features/pagination/paginationSlice";
import { Search, Users, UserCheck, UserX, Eye } from "lucide-react";
import useUsers from "../../hooks/useUsers";
import { IMAGE_PATH } from "../../utils/constants";

const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  const perPage = useSelector(selectPerPage("users"));
  const rowsPerPageOptions = [10, 20, 50, 100];

  const { userQueryClient } = useUsers({ page: currentPage, perPage, search: searchDebounce });
  const { data, isLoading, isError, error } = userQueryClient;
  
  
  const users = data?.items || [];
  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.lastPage || 0;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const startIndex = (currentPage - 1) * perPage;

  const getStatusBadge = (status) => {
    if (status) {
      return <span className="badge rounded-pill bg-success text-white">Active</span>;
    }
    return <span className="badge rounded-pill bg-danger text-white">Inactive</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4 align-items-center">
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
                <i className="bi bi-people me-1"></i>
                Users
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-12 col-md-6 px-0">
          <div className="input-group">
            <span className="input-group-text bg-primary text-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-4 text-muted"></i>
              <p className="text-muted mt-3">No users found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">#</th>
                      <th>Customer</th>
                      <th className="d-none d-md-table-cell">Contact</th>
                      <th className="d-none d-md-table-cell">Joined</th>
                      <th className="d-none d-sm-table-cell text-center">Status</th>
                      <th className="d-none d-lg-table-cell text-center">Orders</th>
                      <th className="d-none d-lg-table-cell">Coins</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="cursor-pointer"
                      >
                        <td className="ps-4 text-muted small">{startIndex + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white bg-primary bg-gradient shadow-sm"
                              style={{ width: 42, height: 42, fontSize: 16 }}
                            >
                              {user?.photo ? (
                                <img src={IMAGE_PATH + user.photo} alt={user.name} className="rounded-circle w-100 h-100" />
                              ) : (
                                (user.name || "U").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="fw-bold text-dark mb-0">{user.name || "—"}</div>
                              <small className="text-muted lh-1">{user.email || "—"}</small>
                            </div>
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="small fw-semibold">{user.phone}</div>
                          <small className="text-muted text-capitalize">Mobile</small>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <span className="small">{formatDate(user.created_at)}</span>
                        </td>
                        <td className="d-none d-sm-table-cell text-center">{getStatusBadge(user)}</td>
                        <td className="d-none d-lg-table-cell text-center">
                          <span className="text-primary fw-bold">{user.orders_count ?? 0}</span>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="d-flex align-items-center gap-1 text-primary  fw-bold small">
                            <i className="bi bi-coin"></i> {user?.coin?.coins || 0}
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-light border rounded-circle shadow-xs active-hover"
                            style={{ width: 32, height: 32 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${user.id}`);
                            }}
                          >
                            <i className="bi bi-chevron-right text-primary"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={perPage}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    dispatch(setPagination({ page: "users", perPage: value }));
                    setCurrentPage(1);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
