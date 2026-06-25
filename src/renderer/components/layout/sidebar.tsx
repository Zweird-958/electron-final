import { NavLink } from 'react-router-dom'
import { ShoppingCart, Package, Receipt, LayoutDashboard, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', icon: ShoppingCart, labelKey: 'nav.pos' },
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/products', icon: Package, labelKey: 'nav.products' },
  { to: '/sales', icon: Receipt, labelKey: 'nav.sales' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const

export const Sidebar = () => {
  const { t } = useTranslation()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          €
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">Caisse</p>
          <p className="text-xs text-muted-foreground">Épicerie</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="size-4" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3 text-xs text-muted-foreground text-center">
        v1.0.0
      </div>
    </aside>
  )
}
