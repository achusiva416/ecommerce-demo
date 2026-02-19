import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../services/apiClient";
import { clearUser } from "../features/auth/authSlice";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {

  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading,setLoading] = useState();

   useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await apiClient.get("/login-check");
        if (response?.data?.status === "success") {
           // update Redux state if needed
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        dispatch(clearUser());
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
