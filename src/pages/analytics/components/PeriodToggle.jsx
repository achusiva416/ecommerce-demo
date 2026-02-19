import React from "react";

const PERIODS = ["daily", "weekly", "monthly", "yearly"];

export default function PeriodToggle({ value, onChange }) {
  return (
    <div className="btn-group btn-group-sm" role="group">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          className={`btn ${value === p ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => onChange(p)}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}
