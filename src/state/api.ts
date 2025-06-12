import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn } from '@reduxjs/toolkit/query';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://inventory-backend-1-tkmd.onrender.com/';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  reducerPath: 'api',
  tagTypes: [], // optional: use for cache invalidation
  endpoints: (builder) => ({}), // we'll add endpoints here later
});

export const {} = api;
