import { SidebarProvider } from 'components/ui/sidebar'

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}
