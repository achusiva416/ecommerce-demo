import React from "react";
import StatCard from "../../components/StatCard";
import { Gift, TicketPercent, Coins } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

export default function DealsRewards() {
  return (
    <div className="container-fluid">
      <div className="col-12 px-0  px-0  d-flex align-items-end mb-3 mb-md-0">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
              
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i className="bi bi-percent me-1"></i>
                Deals & Rewards
            </li>
          </ol>
        </nav>
      </div>

      {/* Stat Cards Row */}
      
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
        <NavLink to="/deals/offers" className="text-decoration-none">
            <StatCard
            icon={<Gift size={24} className="text-primary" />}
            // value="12"
            label="Active Special Offers"
            trend="up"
            trendValue="2 New"
            col={'12'}
            />
        </NavLink>
        <NavLink to="/deals/coupons" className="text-decoration-none">
            <StatCard
            icon={<TicketPercent size={24} className="text-primary" />}
            // value="35"
            label="Coupons Available"
            trend="down"
            trendValue="5 Expired"
            col={'12'}
            />
        </NavLink>
        <NavLink to="/deals/coins" className="text-decoration-none">
        <StatCard
          icon={<Coins size={24} className="text-primary" />}
          // value="Manage Coin Value"
          label="Super Coins"
          trend="up"
          trendValue="Updated Today"
           col={'12'}
        />
        </NavLink>
        <NavLink to="/deals/flash-sales" className="text-decoration-none">
        <StatCard
          icon={<Coins size={24} className="text-primary" />}
          // value="Manage Coin Value"
          label="Flash Sales"
          trend="up"
          trendValue="Updated Today"
           col={'12'}
        />
        </NavLink>
      </div>
    </div>
  );
}
