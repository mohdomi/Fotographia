import { createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../api/axios'; // your configured Axios instance

export const addAccess = createAsyncThunk(
  'access/addAccess',
  async ({ userId, email, role }, thunkAPI) => {
    try {
      const res = await api.patch(`/api/v1/user/addmembers/${userId}`, {
        email,
        role,
      });
      return res.data; // Axios automatically parses JSON
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to add access';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
