import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [form, setForm] = useState({
    current: "",
    newpass: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    newpass: false,
    confirm: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Check strength for new password
    if (name === "newpass") {
      checkPasswordStrength(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 🔥 Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.current) newErrors.current = "Current password is required";

    if (!form.newpass) {
      newErrors.newpass = "New password is required";
    } else if (form.newpass.length < 8) {
      newErrors.newpass = "Password must be at least 8 characters long";
    } else if (passwordStrength < 3) {
      newErrors.newpass =
        "Weak password! Add uppercase, numbers & special characters.";
    }

    if (!form.confirm) {
      newErrors.confirm = "Confirm your password";
    } else if (form.newpass !== form.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await apiClient.post("/change-password", {
        current_password: form.current,
        new_password: form.newpass,
        new_password_confirmation: form.confirm,
      });

      toast.success("Password updated successfully!");

      setForm({ current: "", newpass: "", confirm: "" });
      setPasswordStrength(0);
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    if (passwordStrength === 4) return "Strong";
    if (passwordStrength === 5) return "Very Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "danger";
    if (passwordStrength === 3) return "warning";
    return "success";
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <h5 className="fw-semibold text-secondary mb-3 border-bottom pb-2">
        Change Password
      </h5>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* CURRENT PASSWORD */}
        <div className="col-md-12 position-relative">
          <div className="form-floating">
            <input
              type={show.current ? "text" : "password"}
              name="current"
              className={`form-control ${errors.current ? "is-invalid" : ""}`}
              placeholder="Current Password"
              value={form.current}
              onChange={handleChange}
            />
            <label>Current Password</label>

            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted cursor-pointer"
              onClick={() => toggle("current")}
            >
              {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errors.current && (
            <small className="text-danger">{errors.current}</small>
          )}
        </div>

        {/* NEW PASSWORD */}
        <div className="col-md-6 position-relative">
          <div className="form-floating">
            <input
              type={show.newpass ? "text" : "password"}
              name="newpass"
              className={`form-control ${errors.newpass ? "is-invalid" : ""}`}
              placeholder="New Password"
              value={form.newpass}
              onChange={handleChange}
            />
            <label>New Password</label>

            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted cursor-pointer"
              onClick={() => toggle("newpass")}
            >
              {show.newpass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Password strength */}
          {form.newpass && (
            <small className={`text-${getStrengthColor()}`}>
              Strength: {getStrengthLabel()}
            </small>
          )}

          {errors.newpass && (
            <small className="text-danger d-block mt-1">
              {errors.newpass}
            </small>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="col-md-6 position-relative">
          <div className="form-floating">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirm"
              className={`form-control ${errors.confirm ? "is-invalid" : ""}`}
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
            />
            <label>Confirm Password</label>

            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted cursor-pointer"
              onClick={() => toggle("confirm")}
            >
              {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {errors.confirm && (
            <small className="text-danger">{errors.confirm}</small>
          )}
        </div>

        {/* SUBMIT */}
        <div className="col-12 text-end mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary px-4"
            style={{ borderRadius: "4px" }}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
