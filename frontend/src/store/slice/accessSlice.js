import { createSlice} from '@reduxjs/toolkit';
import { addAccess } from '../thunks/addAcess';

const accessSlice = createSlice({
  name: 'access',
  initialState: {
    loading: false,
    error: null,
    success: false,
    accessUser: null,
  },
  reducers: {
    resetAccessStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.accessUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.accessUser = action.payload.accessUser;
      })
      .addCase(addAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAccessStatus } = accessSlice.actions;
export default accessSlice.reducer;