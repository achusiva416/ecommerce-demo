import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../services/apiClient";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check password strength when new password is entered
    if (name === "new_password") {
      checkPasswordStrength(value);
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    
    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters long";
    } else if (passwordStrength < 3) {
      newErrors.new_password = "Password is too weak. Include uppercase, lowercase, numbers, and special characters";
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiClient.post("/change-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.confirm_password
      });
      
      toast.success("Password changed successfully!");
      
      // Reset form
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      setPasswordStrength(0);
      
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = error.response.data.errors;
        setErrors(serverErrors);
        toast.error("Please fix the errors in the form");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    if (passwordStrength === 4) return "Strong";
    return "Very Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "danger";
    if (passwordStrength === 3) return "warning";
    return "success";
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-sm border-0 overflow-hidden">
            <div className="card-header border-primary text-white bg-primary py-3">
              <h5 className="mb-0">Change Password</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Current Password Field */}
                <div className="mb-4">
                  <label htmlFor="current_password" className="form-label fw-medium text-secondary">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.current_password ? "is-invalid" : ""}`}
                    id="current_password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                  />
                  {errors.current_password && (
                    <div className="invalid-feedback">{errors.current_password}</div>
                  )}
                </div>

                {/* New Password Field */}
                <div className="mb-4">
                  <label htmlFor="new_password" className="form-label fw-medium text-secondary">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.new_password ? "is-invalid" : ""}`}
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                  />
                  {errors.new_password && (
                    <div className="invalid-feedback">{errors.new_password}</div>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.new_password && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <div className="progress" style={{ height: "5px" }}>
                            <div
                              className={`progress-bar bg-${getPasswordStrengthColor()}`}
                              role="progressbar"
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ms-2 small text-muted">
                          {getPasswordStrengthText()}
                        </div>
                      </div>
                      <div className="form-text">
                        Use at least 8 characters with uppercase, lowercase, numbers, and special characters
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label htmlFor="confirm_password" className="form-label fw-medium text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirm_password ? "is-invalid" : ""}`}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                  />
                  {errors.confirm_password && (
                    <div className="invalid-feedback">{errors.confirm_password}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate(-1)}
                    style={{ borderRadius: "4px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={isLoading}
                    style={{ borderRadius: "4px" }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Tips Card */}
          <div className="card mt-4 shadow-sm border-0">
            <div className="card-body">
              <h6 className="card-title text-secondary mb-3">Password Tips</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <small className="text-muted">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Use at least 8 characters
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Include uppercase and lowercase letters
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Add numbers and special characters
                  </small>
                </li>
                <li>
                  <small className="text-muted">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Avoid common words or personal information
                  </small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;