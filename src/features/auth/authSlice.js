import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateProfile: (state, action) => {
      //console.log(action)
      if (state.user) {
        state.user = action.payload || state.user;
        
      }
    },
  },
});

export const { setUser, clearUser, updateProfile } = authSlice.actions;

export default authSlice.reducer;
