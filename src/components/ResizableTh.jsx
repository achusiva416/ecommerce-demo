import React, { useRef } from "react";

const ResizableTh = ({ children, width, onResize, className = "" }) => {
  const thRef = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startResize = (e) => {
    startX.current = e.clientX;
    startWidth.current = thRef.current.offsetWidth;

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);

    thRef.current.classList.add("resizing");
  };

  const handleResize = (e) => {
    const newWidth = startWidth.current + (e.clientX - startX.current);
    if (newWidth > 70) onResize(newWidth);
  };

  const stopResize = () => {
    thRef.current.classList.remove("resizing");
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  return (
    <th
      ref={thRef}
      className={`resizable ${className}`}
      style={{ width }}
    >
      <div className="d-flex justify-content-between align-items-center w-100">
        <span>{children}</span>
        <span className="resizer" onMouseDown={startResize}></span>
      </div>
    </th>
  );
};

export default ResizableTh;
