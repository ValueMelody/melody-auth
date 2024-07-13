import {
  createContext, Dispatch,
} from 'react'
import { ProviderConfig } from '../../global'

export interface OauthState {
  config: ProviderConfig;
  isLoading: boolean;
}

export type DispatchAction =
  | { type: 'setIsLoading'; payload: boolean }

export type OauthDispatch = Dispatch<DispatchAction>

export interface OauthContext {
  state: OauthState;
  dispatch: OauthDispatch;
}

const oauthContext = createContext<OauthContext>({} as OauthContext)

export default oauthContext
