import React from "react";
import { Search } from 'lucide-react';
import Pagination from "../../../components/Pagination";

const ProductRate = ({ 
  productRates = [], 
  isLoading, 
  pagination, 
  onSearch, 
  searchVal 
}) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <h5 className="mb-0 fw-semibold fs-5">Product Rates</h5>
          
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search products..."
              value={searchVal}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-head">
              <tr>
                <th className="text-muted fw-semibold small">Product</th>
                <th className="text-muted fw-semibold small">Sale Price</th>
                <th className="text-muted fw-semibold small">Dealer Rate</th>
                <th className="text-muted fw-semibold small">Profit</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Loading rates...</span>
                  </td>
                </tr>
              ) : productRates.length > 0 ? (
                productRates.map((item, index) => {
                  const salePrice = Number(item.default_rate) || 0;
                  const dealerRate = Number(item.dealer_rate) || 0;
                  const profit = salePrice - dealerRate;

                  return (
                    <tr key={index}>
                      <td className="py-3">
                        <div className="fw-medium">{item.product_name}</div>
                        <div className="text-muted small">{item.code}</div>
                      </td>
                      <td>₹{salePrice.toFixed(2)}</td>
                      <td>₹{dealerRate.toFixed(2)}</td>
                      <td
                        className={`fw-medium ${
                          profit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        ₹{profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No product rates available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalItems > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.onPageChange}
              onItemsPerPageChange={pagination.onItemsPerPageChange}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRate;
