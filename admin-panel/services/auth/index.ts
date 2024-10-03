import {
  createApi, fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'
import { AppState } from 'stores/app'

const baseQuery = fetchBaseQuery({
  baseUrl: '',
  prepareHeaders: async (
    headers, { getState },
  ) => {
    const state = getState() as { app: AppState | undefined }
    const appState = state.app

    const token = appState?.acquireAuthToken ? await appState.acquireAuthToken() : ''

    if (token) {
      headers.set(
        'Authorization',
        `Bearer ${token}`,
      )
    }
    return headers
  },
})

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: () => ({}),
})
