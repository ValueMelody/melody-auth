import {
  Middleware, configureStore,
  isRejectedWithValue,
} from '@reduxjs/toolkit'
import { authApi } from 'services/auth'
import appReducer from 'stores/app'
import { errorSignal } from 'signals'

export const rtkQueryErrorLogger: Middleware =
  () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      if (typeof action.payload === 'object' && action.payload && 'data' in action.payload) {
        errorSignal.value = String(action.payload.data)
      }
    } else if (typeof action === 'object' && action && 'type' in action && String(action.type).endsWith('executeMutation/fulfilled')) {
      errorSignal.value = ''
    }

    return next(action)
  }

const store = configureStore({
  reducer: {
    app: appReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(authApi.middleware)
      .concat(rtkQueryErrorLogger),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store }
