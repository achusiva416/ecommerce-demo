import React, { useState, useEffect, useRef } from "react";
import RichTextEditor from "./RichTextEditor";

const DescriptionSection = ({ section, index, onUpdate, onRemove }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Load preview for server-provided image only
  useEffect(() => {
    if (section.existingImage && section.imagePreview) {
      setImagePreview(section.imagePreview);
    }
  }, []); //  run only once on mount


  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous preview if it exists
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Send only file to parent
      onUpdate(index, "image", file);

      // Clear existing image when uploading a new one
      onUpdate(index, "existingImage", null);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);

    // Tell parent to clear file + existing image
    onUpdate(index, "image", null);
    onUpdate(index, "existingImage", null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleContentUpdate = (content) => {
    onUpdate(index, "content", content);
  };

  return (
    <div className="card mb-4" key={`desc-section-${index}`}>
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Description Section {index + 1}</h6>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onRemove(index)}
        >
          <i className="bi bi-trash"></i> Remove
        </button>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <label className="form-label fw-medium text-secondary mb-2">
                Content
              </label>
              <RichTextEditor
                content={section.content}
                onUpdate={handleContentUpdate}
                placeholder="Enter description content..."
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label className="form-label fw-medium text-secondary mb-2">
                Image
              </label>
              <div className="border rounded p-3 bg-light h-100 d-flex flex-column justify-content-center align-items-center">
                {imagePreview ? (
                  <div className="text-center w-100">
                    <div className="position-relative d-inline-block mb-3">
                      <img
                        ref={imageRef}
                        src={imagePreview}
                        alt={`Description section ${index + 1}`}
                        className="img-fluid rounded shadow-sm"
                        style={{ maxHeight: "200px", maxWidth: "100%" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                        onClick={handleRemoveImage}
                        style={{ zIndex: 2 }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-2"
                      onClick={handleChangeImageClick}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>Change Image
                    </button>
                    <input
                      ref={fileInputRef}
                      id={`desc-image-${index}`}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </div>
                ) : (
                  <label className="btn btn-outline-primary d-flex flex-column align-items-center p-4 w-100">
                    <i className="bi bi-cloud-upload fs-1 mb-2"></i>
                    <span>Upload Image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionSection;
