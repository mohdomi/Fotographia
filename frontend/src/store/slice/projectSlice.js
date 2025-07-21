import { createSlice } from '@reduxjs/toolkit';
import { generateUploadUrls } from "../thunks/generateUrlThunk";
const projectUploadSlice = createSlice({
  name: 'projectUpload',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: null,
  },
  reducers: {
    resetUploadState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateUploadUrls.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(generateUploadUrls.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(generateUploadUrls.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.error || 'Upload failed';
      });
  },
});

export const { resetUploadState } = projectUploadSlice.actions;
export default projectUploadSlice.reducer;
