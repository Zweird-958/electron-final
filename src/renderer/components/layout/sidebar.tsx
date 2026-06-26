import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const links = [
  { to: "/", icon: ShoppingCart, labelKey: "nav.catalog" },
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/products", icon: Package, labelKey: "nav.products" },
  { to: "/sales", icon: Receipt, labelKey: "nav.sales" },
  { to: "/settings", icon: Settings, labelKey: "nav.settings" },
] as const

export const Sidebar = () => {
  const { t } = useTranslation()

  return (
    <aside className="border-border bg-sidebar flex h-full w-56 flex-col border-r">
      <div className="border-border flex items-center gap-2 border-b px-4 py-4">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
          €
        </div>
        <div>
          <p className="text-sidebar-foreground text-sm font-bold">Caisse</p>
          <p className="text-muted-foreground text-xs">Épicerie</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )
            }
          >
            <Icon className="size-4" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-border text-muted-foreground border-t p-3 text-center text-xs">
        v1.0.0
      </div>
    </aside>
  )
}
