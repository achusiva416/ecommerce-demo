import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const ProductSavingLoader = () => {
  const steps = [
    "Processing images",
    "Optimizing files", 
    "Saving product data",
    "Finalizing setup"
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 border-0 shadow-sm text-center" style={{ width: "400px", borderRadius: "12px" }}>
        {/* Animated Icon */}
        <div className="mb-3">
          <div className="position-relative d-inline-block">
            <FaSpinner 
              className="text-primary .spinning-icon" 
              style={{ 
                fontSize: "2.5rem", 
                animation: "spin 1s linear infinite" 
              }} 
            />
          </div>
        </div>

        {/* Title */}
        <h5 className="fw-semibold text-dark mb-3">Saving Product</h5>

        {/* Steps */}
        <div className="mb-3">
          {steps.map((step, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <div className="me-2">
                {index < currentStep ? (
                  <FaCheckCircle className="text-success" size={14} />
                ) : index === currentStep ? (
                  <div 
                    className="spinner-grow spinner-grow-sm text-primary" 
                    style={{ width: "14px", height: "14px" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <div 
                    className="rounded-circle bg-light border" 
                    style={{ width: "14px", height: "14px" }}
                  ></div>
                )}
              </div>
              <span className={index <= currentStep ? "text-dark" : "text-muted"}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <small className="text-muted">
            Step {currentStep + 1} of {steps.length}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ProductSavingLoader;