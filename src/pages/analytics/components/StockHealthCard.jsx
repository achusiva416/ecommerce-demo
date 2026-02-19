import React from "react";

export default function StockHealthCard({ icon, label, count, variant, onClick }) {
  return (
    <div className="col w-100" onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        className="card border-0 shadow-sm h-100"
        style={{ borderLeft: `4px solid var(--${variant})` }}
      >
        <div className="card-body py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted small mb-1">{label}</p>
              <h3 className={`fw-bold mb-0 text-${variant}`}>{count}</h3>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Click to view →
              </small>
            </div>
            <div className={`bg-${variant}-light p-2 rounded`}>{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
