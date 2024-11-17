import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from './authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    //Added 401, throws user back to homepage if invalid login?
    //bc server & home throw 401
    if (result?.error?.originalStatus === 403 || result?.error?.originalStatus === 401) {
        console.log('sending refresh token...')
        // send refresh token to get new access token 
        const refreshResult = await baseQuery('/refresh', api, extraOptions)
        if (refreshResult?.data) {
            // console.log(refreshResult)
            //get the user from the refresh result?
            const user = refreshResult.data.username
            const accessToken = refreshResult.data.accessToken
            // const user = api.getState().auth.user
            // store the new token 
            api.dispatch(setCredentials({ accessToken, user }))
            // retry the original query with new access token 
            result = await baseQuery(args, api, extraOptions)
        } else {
            api.dispatch(logout())
            //kick back to login
            if(!window.location.href.includes('/login')){
                window.location.href = '/login'
            }
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({})
})