import React, { useState } from "react";

const ProfileSettings = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  const [profilePreview, setProfilePreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (profilePreview) URL.revokeObjectURL(profilePreview);

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      {/* HEADER */}
      <h5 className="fw-normal text-secondary mb-3  border-bottom pb-2">
        Profile Settings
      </h5>

      <div className="row g-4">
        {/* LEFT — PROFILE PIC */}
        <div className="col-md-2">
          <div
            className="d-flex flex-column align-items-center justify-content-center p-3 rounded-circle"
            style={{
              background: "#f8f9fa",
              border: "2px solid #c67a4a",
              width: "150px",
              height: "150px",
            }}
          >
            {!profilePreview ? (
              <label className="text-center cursor-pointer w-100">
                <i className="bi bi-cloud-upload fs-2 text-brown"></i>
                <div className="mt-1 text-brown small">Upload</div>

                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleProfileChange}
                />
              </label>
            ) : (
              <label className="cursor-pointer">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="rounded-circle"
                  width={140}
                  height={140}
                  style={{ objectFit: "cover" }}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleProfileChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="col-md-10 ">
          {/* Name */}
          <div className="row">
            <div className="col-md-6">
                <div className="form-floating mb-3">
                    <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    />
                    <label>Your Name</label>
                </div>
            </div>
            
            <div className="col-md-6">
                {/* Phone */}
                <div className="form-floating mb-3">
                    <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    />
                    <label>Phone Number</label>
                </div>
            </div>
          </div>
          
          

          {/* Bio */}
          <div className="form-floating mb-3">
            <textarea
              name="bio"
              className="form-control"
              style={{ minHeight: "110px" }}
              placeholder="Write something about yourself..."
              value={form.bio}
              onChange={handleChange}
            ></textarea>
            <label>About Biography</label>
          </div>
        </div>

        {/* Save Button */}
        <div className="col-12 text-end mt-3">
          <button className="btn btn-primary px-4" style={{ borderRadius: "4px" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
