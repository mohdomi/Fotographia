import { createSlice } from '@reduxjs/toolkit';

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    unlockedCategories: [],
    loading: false,
    error: null
  },
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    unlockCategory: (state, action) => {
      if (!state.unlockedCategories.includes(action.payload)) {
        state.unlockedCategories.push(action.payload);
      }
    },
    setCategoryLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCategoryError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setCategories,
  unlockCategory,
  setCategoryLoading,
  setCategoryError
} = categorySlice.actions;

export default categorySlice.reducer;
