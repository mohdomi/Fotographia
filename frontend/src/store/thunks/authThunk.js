// store/thunks/authThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({pin}, thunkAPI) => {
    try {
      const response = await api.post('/api/v1/user/signin', {pin});
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
