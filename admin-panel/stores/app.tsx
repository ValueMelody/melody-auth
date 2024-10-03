import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface AppState {
  acquireAuthToken: Function | null;
}

const initialState: AppState = { acquireAuthToken: null }

export const appSlice = createSlice({
  name: 'appStoreStore',
  initialState,
  reducers: {
    storeAcquireAuthToken: (
      state: AppState, action: PayloadAction<Function | null>,
    ) => {
      state.acquireAuthToken = action.payload
    },
  },
})

export default appSlice.reducer
