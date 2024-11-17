import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
      setCredentials: (state, action) => {
        // console.log('Action Payload:', action.payload); 
          const { user, accessToken } = action.payload
          state.user = user
          state.token = accessToken
          //Just for routing, not authentication
          localStorage.setItem('isLoggedIn', true);
      },
      logout: (state, action) => {
          state.user = null
          state.token = null
          localStorage.removeItem('isLoggedIn');
      }
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token