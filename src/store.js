import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import loadingReducer from "./features/loading/loadingSlice";
import paginationReducer from './features/pagination/paginationSlice'
import procurementReducer from './features/procurement/procurementSlice'
const authPersistConfig = {
  key: "auth",
  storage,
};

const cartPersistConfig = {
  key: "cart",
  storage,
};

const paginationPersistConfig = {
  key: 'pagination',
  storage,
}

const procurementPersistConfig = {
  key: 'procurement',
  storage,
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedPaginationReducer = persistReducer(paginationPersistConfig, paginationReducer)
const persistedProcurementReducer = persistReducer(procurementPersistConfig, procurementReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cart: persistedCartReducer,
    loading: loadingReducer,
    pagination: persistedPaginationReducer,
    procurement: persistedProcurementReducer,
  },
});

export const persistor = persistStore(store);
