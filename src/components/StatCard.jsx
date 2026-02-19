
import React from 'react'

// Example StatCard component
function StatCard({ icon, value, label, trend, trendValue,col=3}) {
  return (

    <div className={`col-md-${col} sm-12`}>
      <div className="card mb-2 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="bg-primary-light p-2 rounded me-3">
              {icon}
            </div>
            <div>
              <h6 className="mb-1 text-muted text-capitalize fs-7 fw-semibold"  style={{fontSize:"14px"}}>{label}</h6>
              <h5 className="mb-0">{value}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StatCard;

