import React from "react";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

const SortableImageItem = ({ id, img, index, isExisting, handleRemoveImage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    width: 120,
    height: 120,
  };

  // Determine the image source
  const imageSrc = img.preview || img.url || `${IMAGE_PATH}${img.filename}`;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="position-relative border rounded shadow-sm"
    >
      {imageSrc ? (
        <>
          <div
            {...attributes}
            {...listeners}
            className="position-absolute top-0 start-0 z-2 bg-white bg-opacity-75 rounded p-1"
            style={{ cursor: 'grab' }}
          >
            <i className="bi bi-grip-horizontal text-primary"></i>
          </div>

          <img
            src={imageSrc}
            alt={`Preview ${index + 1}`}
            className="w-100 h-100 object-fit-cover rounded"
          />

          <button
            className="btn btn-sm position-absolute top-0 end-0 bg-dark bg-opacity-50 text-white p-1"
            onClick={() => handleRemoveImage(index, isExisting)}
            style={{ zIndex: 3 }}
          >
            <i className="bi bi-x"></i>
          </button>

          <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white text-center py-1 small rounded-bottom">
            {index + 1}
          </div>
        </>
      ) : (
        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center rounded">
          <span className="text-muted small">Image {index + 1}</span>
        </div>
      )}
    </div>
  );
};

export default SortableImageItem;