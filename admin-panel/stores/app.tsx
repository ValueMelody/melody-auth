import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { CreatedAppDetail } from 'services/auth/api'

export interface AppState {
  acquireAuthToken: Function | null;
  createdApp: CreatedAppDetail | null;
}

const initialState: AppState = {
  acquireAuthToken: null,
  createdApp: null,
}

export const appSlice = createSlice({
  name: 'appStoreStore',
  initialState,
  reducers: {
    storeAcquireAuthToken: (
      state: AppState, action: PayloadAction<Function | null>,
    ) => {
      state.acquireAuthToken = action.payload
    },
    storeCreatedApp: (
      state: AppState, action: PayloadAction<CreatedAppDetail | null>,
    ) => {
      state.createdApp = action.payload
    },
  },
})

export default appSlice.reducer
