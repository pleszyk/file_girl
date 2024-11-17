import { createSlice } from '@reduxjs/toolkit';

const fileSlice = createSlice({
  name: 'file',
  initialState: {
    Loading: false,
  },
  reducers: {
    setLoading(state, action) {
      state.Loading = action.payload;
    },
  },
});

export const {
setLoading
} = fileSlice.actions;

export default fileSlice.reducer;
