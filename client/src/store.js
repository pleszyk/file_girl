import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import fileReducer from './slices/fileSlice'
import { apiSlice } from "./slices/apiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    file: fileReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
})

export default store