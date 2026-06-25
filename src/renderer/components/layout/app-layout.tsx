import { Outlet } from "react-router-dom"

import { Sidebar } from "./sidebar"

export const AppLayout = () => (
  <div className="bg-background flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
)
