import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export const AppLayout = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
)
