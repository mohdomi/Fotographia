// store/thunks/authThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({pin}, thunkAPI) => {
    try {
      const response = await api.post('/api/v1/user/signin', {pin});
       console.log(response.data);
      return await response?.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const Adminlogin = createAsyncThunk(
  'auth/Adminlogin',
  async ({password}, thunkAPI) => {
    try {
      const response = await api.post('/api/v1/admin/admsignin', {password});
      return await response?.data?.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const AdminlogoutThunk = createAsyncThunk(
  'auth/AdminlogoutThunk',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/api/v1/admin/logout');
      console.log(response);
      return response.data; // optional, can return message or empty
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
export const logoutThunk = createAsyncThunk(
  'auth/UserlogoutThunk',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/api/v1/user/logout');
      console.log(response);
      return response.data; // optional, can return message or empty
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
