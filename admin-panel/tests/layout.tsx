import { Provider } from 'react-redux'
import { SidebarProvider } from 'components/ui/sidebar'
import { store } from 'stores'

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </Provider>
  )
}
