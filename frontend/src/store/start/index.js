import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../slice/authSlice.js"
import categoryReducer from "../slice/categorySlice.js";
import projectReducer from "../slice/projectSlice.js"
import accessReducer from "../slice/accessSlice.js"

export default configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    project: projectReducer,
    access: accessReducer,
  }
});
