import React from "react";
import { FaTimes, FaPlus, FaDownload } from "react-icons/fa";
import { IMAGE_PATH } from "../../utils/constants";

const ViewPhotosModal = ({ photos = [], purchase, onClose, onAddMore }) => {
  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Delivery Photos - {purchase?.product?.name}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {photos.map((photo, index) => (
                
                <div key={index} className="col-md-4 mb-3">
                    {/* {console.log(photo)} */}
                  <div className="card">
                    <img 
                      src={IMAGE_PATH + photo.file_path} 
                      className="card-img-top" 
                      alt={`Delivery photo ${index + 1}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    
                  </div>
                </div>
              ))}
            </div>
            
            {photos.length === 0 && (
              <div className="text-center py-4">
                <FaPlus className="display-4 text-muted mb-3" />
                <p className="text-muted">No photos uploaded yet</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              Close
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPhotosModal;