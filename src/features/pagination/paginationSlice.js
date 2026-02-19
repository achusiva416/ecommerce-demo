import { createSlice } from "@reduxjs/toolkit";

const paginationSlice = createSlice({
    name: "pagination",
    initialState: {
        pages: {}, 
    },
    reducers: {
        setPagination: (state, action) => {
            const { page, perPage } = action.payload;
            state.pages[page] = perPage;
        },
        clearPagination: (state, action) => {
            const page = action.payload;
            if (page) {
                delete state.pages[page];
            } else {
                state.pages = {};
            }
        }
    }
});

export const selectPagination = (state) => state.pagination.pages;

export const selectPerPage = (page) => (state) => {
    return state.pagination.pages[page] || 10; 
};

export const { setPagination, clearPagination } = paginationSlice.actions;
export default paginationSlice.reducer;