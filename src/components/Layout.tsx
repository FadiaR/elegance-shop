import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  PackageSearch,
  Receipt,
  Settings,
} from 'lucide-react';
import type { StockNotification } from '../types';
import NotificationPanel from './NotificationPanel';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/products', icon: PackageSearch, label: 'Inventaire' },
  { to: '/add', icon: PackagePlus, label: 'Ajouter' },
  { to: '/sales', icon: Receipt, label: 'Ventes' },
  { to: '/settings', icon: Settings, label: 'Reglages' },
];

interface Props {
  notifications: StockNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function Layout({ notifications, onMarkRead, onMarkAllRead, onClearAll }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-violet-700 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <PackageSearch className="w-7 h-7" />
        <h1 className="text-lg font-bold tracking-wide flex-1">Elegance Shop</h1>
        <NotificationPanel
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onClearAll={onClearAll}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? 'text-violet-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
