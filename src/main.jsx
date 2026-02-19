import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App";
import "./assets/css/style.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";   // ✅ single import
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ add this import
import { CLIENT_ID } from "./utils/constants";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <React.StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
