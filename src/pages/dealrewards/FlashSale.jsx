import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import FlashSaleModal from "./FlashModal";
import ViewFlashSaleModal from "./ViewFlashSaleModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const FlashSale = () => {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);

  /* ---------------- Fetch Flash Sales ---------------- */
  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/flash-sales", {
        params: { page, per_page: perPage }
      });
      setSales(res.data.data || []);
      setTotalItems(res.data.total || 0);
    } catch {
      toast.error("Failed to fetch flash sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, perPage]);

  const totalPages = Math.ceil(totalItems / perPage);

  /* ---------------- Handlers ---------------- */
  const handleAddClick = () => {
    setSelectedSale(null);
    setOpen(true);
  };

  const handleEditClick = (sale) => {
    setSelectedSale(sale);
    setOpen(true);
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setDeleteOpen(true);
  };

  const getStatus = (isActive, endDate) => {
    if (!isActive) return <span className="badge bg-secondary">Inactive</span>;
    if (dayjs(endDate).isBefore(dayjs())) {
      return <span className="badge bg-danger">Expired</span>;
    }
    return <span className="badge bg-success">Live</span>;
  };

  return (
    <div className="container-fluid py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active">Flash Sales</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h5 className="mb-0">Flash Sales</h5>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Flash Sale
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-5">No flash sales found</div>
          ) : (
            <>
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Flash Sale Name</th>
                    <th>Discount</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={sale.id}>
                      <td>{(page - 1) * perPage + index + 1}</td>
                      <td>{sale.flash_sale_name}</td>
                      <td>
                        {sale.discount_type === "percentage"
                          ? `${sale.discount_value}%`
                          : `₹${sale.discount_value}`}
                      </td>
                      <td>{dayjs(sale.start_date).format("DD MMM YYYY hh:mm A")}</td>
                      <td>{dayjs(sale.end_date).format("DD MMM YYYY hh:mm A")}</td>
                      <td>{getStatus(sale.is_active, sale.end_date)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-circle"
                            onClick={() => {
                              setSelectedSale(sale);
                              setViewOpen(true);
                            }}
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-circle"
                            onClick={() => handleEditClick(sale)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            onClick={() => handleDeleteClick(sale)}
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

              {totalPages > 1 && (
                <div className="px-3 py-2">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    onPageChange={setPage}
                    onItemsPerPageChange={(value) => {
                      setPerPage(value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <FlashSaleModal
        open={open}
        sale={selectedSale}
        onClose={() => {
          setOpen(false);
          setSelectedSale(null);
        }}
        onSave={fetchSales}
      />

      <DeleteConfirmationModal
        open={deleteOpen}
        item={saleToDelete}
        type="flashsale"
        onClose={() => setDeleteOpen(false)}
        onDelete={() => {
          setDeleteOpen(false);
          setSaleToDelete(null);
          fetchSales();
        }}
      />

      <ViewFlashSaleModal
        open={viewOpen}
        flashSale={selectedSale}
        onClose={() => setViewOpen(false)}
      />
    </div>
  );
};

export default FlashSale;
