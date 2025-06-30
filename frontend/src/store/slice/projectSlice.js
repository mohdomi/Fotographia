import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    weddingImages: {},
    loading: false,
    error: null
  },
  reducers: {
    setWeddingImages: (state, action) => {
      state.weddingImages = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProjectLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProjectError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setWeddingImages,
  setProjectLoading,
  setProjectError
} = projectSlice.actions;

export default projectSlice.reducer;
