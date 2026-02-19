import React, { useState } from "react";
import StockHealthCard from "./StockHealthCard";
import StockModal from "./StockModal";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function StockCard({ lowStockCount, outOfStockCount, loading, healthyStockCount }) {
  const [activeStockModal, setActiveStockModal] = useState(null);

  
  const addToProcurement = (item) => {
    toast.info(`${item.name} — ready for reorder`);
  };

  return (
    <>
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column gap-2 p-3">
          <h6 className="card-title text-primary mb-1">Stock Health</h6>
          {loading ? (
            <div className="d-flex justify-content-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : (
            <>
              <StockHealthCard
                icon={<AlertTriangle size={20} className="text-danger" />}
                label="Out of Stock"
                count={outOfStockCount}
                variant="danger"
                onClick={() => setActiveStockModal("out")}
              />
              <StockHealthCard
                icon={<Package size={20} className="text-warning" />}
                label="Low Stock"
                count={lowStockCount}
                variant="warning"
                onClick={() => setActiveStockModal("low")}
              />
              <StockHealthCard
                icon={<CheckCircle size={20} className="text-success" />}
                label="Healthy Stock"
                count={healthyStockCount}
                variant="success"
                // onClick={() => setActiveStockModal("healthy")}
              />
            </>
          )}
        </div>
      </div>

      {activeStockModal && (
        <StockModal
          type={activeStockModal}
          onClose={() => setActiveStockModal(null)}
          onAddItem={addToProcurement}
        />
      )}
    </>
  );
}