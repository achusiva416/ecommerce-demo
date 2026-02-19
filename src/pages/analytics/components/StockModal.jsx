import React from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import useProducts from "../../../hooks/useProducts";
import { useDispatch } from "react-redux";
import { addToProcurement } from "../../../features/procurement/procurementSlice";
import { toast } from "react-toastify";

const CONFIG = {
  out: { title: "Out of Stock Products", variant: "danger" },
  low: { title: "Low Stock Products", variant: "warning" },
  healthy: { title: "Healthy Stock Products", variant: "success" },
};

export default function StockModal({ type, onClose }) {
  const { title, variant } = CONFIG[type] || CONFIG.healthy;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRowClick = (item) => {
    onClose();
    navigate(`/products/edit/${item.id}`);
  };

  const { getLowStockProducts,getOutOfStockProducts } = useProducts();

  const lowStockProducts = getLowStockProducts.data?.low_stock_products;
  const outOfStockProducts = getOutOfStockProducts.data?.out_of_stock_products;

  const products = type === "low" ? lowStockProducts : outOfStockProducts;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(val);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-0">
            {products.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Package size={40} className="mb-2 opacity-25" />
                <p>No products in this category.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Current Stock</th>
                      <th className="text-center">Recommended Buy</th>
                      {type !== "healthy" && (
                        <th className="text-end">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">
                            {item.code} &bull; {formatCurrency(item.sale_price)}/unit
                          </small>
                        </td>
                        <td className="text-center">
                          <span
                            className={`fw-semibold ${item.stock === 0 ? "text-danger" : "text-warning"}`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className='text-success fw-semibold '
                          >
                            {item.recommended_stock}
                          </span>
                        </td>
                        {type !== "healthy" && (
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(addToProcurement(item));
                                toast.success(`${item.name} added to procurement list`);
                              }}
                            >
                              Add to Reorder
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

