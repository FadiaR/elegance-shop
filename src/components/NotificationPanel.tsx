import { useState } from 'react';
import type { StockNotification } from '../types';
import {
  Bell,
  X,
  PackagePlus,
  PackageCheck,
  Trash2,
  CheckCheck,
  Trash,
  User,
  Clock,
  ShoppingCart,
  Tag,
  Undo2,
} from 'lucide-react';

interface Props {
  notifications: StockNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: Props) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getIcon = (type: StockNotification['type']) => {
    switch (type) {
      case 'stock_added':
        return <PackagePlus className="w-4 h-4 text-green-600" />;
      case 'stock_updated':
        return <PackageCheck className="w-4 h-4 text-blue-600" />;
      case 'stock_deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'product_sold':
        return <ShoppingCart className="w-4 h-4 text-orange-600" />;
      case 'price_changed':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'sale_cancelled':
        return <Undo2 className="w-4 h-4 text-amber-600" />;
    }
  };

  const getBgColor = (type: StockNotification['type'], read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'stock_added':
        return 'bg-green-50';
      case 'stock_updated':
        return 'bg-blue-50';
      case 'stock_deleted':
        return 'bg-red-50';
      case 'product_sold':
        return 'bg-orange-50';
      case 'price_changed':
        return 'bg-purple-50';
      case 'sale_cancelled':
        return 'bg-amber-50';
    }
  };

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-1.5 rounded-lg hover:bg-violet-600 transition-colors"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative mt-14 mx-2 mb-20 bg-white rounded-xl shadow-2xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden animate-in slide-in-from-top">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      onClearAll();
                      setOpen(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Supprimer tout"
                  >
                    <Trash className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Bell className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                <div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) onMarkRead(n.id);
                      }}
                      className={`px-4 py-3 border-b border-gray-50 transition-colors cursor-pointer hover:bg-gray-50 ${getBgColor(n.type, n.read)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <User className="w-3 h-3" />
                              {n.userName}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatTime(n.createdAt)}
                            </span>
                          </div>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
