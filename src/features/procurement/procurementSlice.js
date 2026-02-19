import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // { id, name, code, price, orderQty }
};

const procurementSlice = createSlice({
  name: "procurement",
  initialState,
  reducers: {
    addToProcurement: (state, action) => {
      const { id, name, code, price, recommended_stock } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      
      if (existingItem) {
        // If already exists, we might not want to do anything or increment
        // User's current logic seems to be just adding it or it might already be there
        // Let's just update the recommended_stock if it changed, but keep user edited qty?
        // Actually, let's just keep it simple: if it's there, don't add again but maybe update info.
      } else {
        state.items.push({
          id,
          name,
          code,
          price: price || action.payload.sale_price, // Use price or sale_price
          orderQty: recommended_stock || 1,
        });
      }
    },
    updateProcurementQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.orderQty = qty;
      }
    },
    updateProcurementPrice: (state, action) => {
      const { id, price } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.price = price;
      }
    },
    removeFromProcurement: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearProcurement: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToProcurement,
  updateProcurementQty,
  updateProcurementPrice,
  removeFromProcurement,
  clearProcurement,
} = procurementSlice.actions;

export const selectProcurementItems = (state) => state.procurement.items;

export default procurementSlice.reducer;
