import React from "react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  rowsPerPageOptions,
  onPageChange,
  onItemsPerPageChange
}) => {
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    console.log("total Pages",totalPages)

    // --- Previous button ---
    items.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          aria-label="Previous"
        >
          &laquo;
        </button>
      </li>
    );

    // Calculate visible range
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < maxVisiblePages - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // --- First page + ellipsis ---
    if (startPage > 1) {
      items.push(
        <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        items.push(<li key="start-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
      }
    }

    // --- Middle pages ---
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(number)}
            style={currentPage === number ? {
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#fff'
            } : {}}
          >
            {number}
          </button>
        </li>
      );
    }

    // --- Last page + ellipsis ---
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<li key="end-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
      }
      items.push(
        <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(totalPages)}
            style={currentPage === totalPages ? {
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#fff'
            } : {}}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    // --- Next button ---
    items.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          aria-label="Next"
        >
          &raquo;
        </button>
      </li>
    );

    return items;
  };

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
      {/* Rows per page */}
      <div className="d-flex align-items-center mb-2 mb-md-0">
        <span className="me-2 text-muted">Rows per page:</span>
        <select 
          className="form-select form-select-sm w-auto"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            borderColor: 'var(--primary)',
            color: 'var(--primary)'
          }}
        >
          {rowsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      {/* Info text */}
      <div className="mb-2 mb-md-0">
        <span className="text-muted">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} items
        </span>
      </div>
      
      {/* Pagination */}
      <nav>
        <ul className="pagination pagination-sm mb-0">
          {getPaginationItems()}
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
