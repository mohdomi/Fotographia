import { createAsyncThunk } from '@reduxjs/toolkit';
import api from "../../api/axios";
export const generateUploadUrls = createAsyncThunk(
  'projectUpload/generateUploadUrls',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/admin/generate-upload-urls', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Upload failed' });
    }
  }
);
