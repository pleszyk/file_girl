import { apiSlice } from './apiSlice';

export const fileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSignedURL: builder.mutation({
      query: ({ username, fileName, size, encrypted, salt, iv }) => ({
        url: '/upload',
        method: 'GET',
        params: {
          username,
          fileName,
          size,
          encrypted,
          salt,
          iv
        },
      }),
    }),
    getMultiURL: builder.mutation({
      query: ({ username, fileName, size }) => ({
        url: '/multi',
        method: 'GET',
        params: {
          username,
          fileName,
          size
        },
      }),
    }),
    postComplete: builder.mutation({
      query: ({ username, fileName, completedParts, uploadId, size, encrypted, salt, iv }) => ({
        url: '/multi',
        method: 'POST',
        params: {
          username,
          fileName,
          completedParts,
          uploadId,
          size,
          encrypted,
          salt,
          iv
        },
      }),
    }),
    dlSignedURL: builder.mutation({
      query: ({ username, file }) => ({
        url: '/download',
        method: 'GET',
        params: {
          username,
          file,
        },
      }),
    }),
    getFiles: builder.mutation({
      query: ({ username }) => ({
        url: '/listfile',
        method: 'GET',
        params: {
          username,
        },
      }),
    }),
    deleteFile: builder.mutation({
      query: ({ file, username }) => ({
        url: '/delete',
        method: 'POST',
        params: {
          file,
          username,
        },
      }),
    }),
  }),
});

export const {
  useGetSignedURLMutation,
  useGetFilesMutation,
  useDeleteFileMutation,
  useDlSignedURLMutation,
  useGetMultiURLMutation,
  usePostCompleteMutation
} = fileApiSlice;
