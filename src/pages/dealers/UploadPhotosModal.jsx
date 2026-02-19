import React, { useState } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "react-toastify";

const UploadPhotosModal = ({ purchase, onClose, onUploadComplete }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.warning("Some files are not images and were ignored");
    }

    const newPhotos = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const handleUpload = async () => {
    if (photos.length === 0) {
      toast.error("Please select at least one photo to upload");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos[]', photo.file);
      });

      await apiClient.post(`/purchases/${purchase.id}/upload-photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Photos uploaded successfully");
      onUploadComplete();
    } catch (error) {
      toast.error("Failed to upload photos");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg" style={{ maxWidth: '500px' }}>
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-camera me-2"></i>
              Upload Product Photos
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded p-5 text-center ${
                dragOver ? 'border-primary bg-light' : 'border-secondary'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ cursor: 'pointer' }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3"></i>
              <h5>Drag & Drop photos here</h5>
              <p className="text-muted">or click to select files</p>
              <small className="text-muted">Supports JPG, PNG, GIF (Max 7MB each)</small>
              
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected Photos Preview */}
            {photos.length > 0 && (
              <div className="mt-4">
                <h6>Selected Photos ({photos.length})</h6>
                <div className="row g-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="col-md-3 col-6">
                      <div className="card position-relative">
                        <img
                          src={photo.preview}
                          alt={`Preview ${index + 1}`}
                          className="card-img-top"
                          style={{ height: '100px', objectFit: 'cover' }}
                        />
                        <div className="card-body p-2">
                          <small className="d-block text-truncate" title={photo.name}>
                            {photo.name}
                          </small>
                          <small className="text-muted">{formatFileSize(photo.size)}</small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                          style={{ width: '24px', height: '24px', padding: 0 }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || photos.length === 0}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up me-2"></i>
                  Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotosModal;