import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";

const DealerRates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, [id]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/dealers/${id}/rates`);
      setRates(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch product rates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (productId, newRate) => {
    setRates(rates.map(rate => 
      rate.product_id === productId 
        ? { ...rate, dealer_rate: parseFloat(newRate) || 0 }
        : rate
    ));
  };

  const handleSaveRates = async () => {
    try {
      setSaving(true);
      await apiClient.post(`/dealers/${id}/rates`, {
        rates: rates.map(rate => ({
          product_id: rate.product_id,
          dealer_rate: rate.dealer_rate
        }))
      });
      toast.success("Rates saved successfully");
      navigate(`/dealers/${id}`);
    } catch (error) {
      toast.error("Failed to save rates");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-0 px-md-3 py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-3 py-4">
      <div className="row mx-0 mb-4">
        <div className="col-12">
          <h2 className="mb-0">Assign Product Rates</h2>
          <p className="text-muted">Set custom rates for this dealer</p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Default Rate</th>
                  <th>Dealer Rate</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.product_id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {rate.image && (
                          <img 
                            src={rate.image} 
                            alt={rate.product_name}
                            className="rounded me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div className="fw-semibold">{rate.product_name}</div>
                          <small className="text-muted">{rate.product_code}</small>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <span className="text-muted">₹{parseFloat(rate.default_rate).toLocaleString()}</span>
                    </td>
                    <td className="align-middle" style={{ width: '200px' }}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          value={rate.dealer_rate}
                          onChange={(e) => handleRateChange(rate.product_id, e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/dealers/edit/${id}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dealer Details
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveRates}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving Rates...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save Rates & Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerRates;