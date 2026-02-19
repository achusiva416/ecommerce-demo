import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { isAuthenticated  } = useSelector((state) => state.auth);
  const redirecturl = localStorage.getItem('redirecturl');
 
  if (isAuthenticated) {
    return <Navigate to={redirecturl || '/'} replace />;
  }

  return children;
};

export default PublicRoute;
