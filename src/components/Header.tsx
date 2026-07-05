import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Mail, HelpCircle, Menu, Check, Trash2 } from 'lucide-react';
import { Session } from 'next-auth';
import { useNotifications } from './layout/NotificationContext';

interface HeaderProps {
  session: Session | null;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onMenuClick
}) => {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 fixed top-0 right-0 left-0 md:left-60 z-30 flex items-center justify-between px-5 transition-all duration-200">
      {/* Search Input Bar */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:bg-slate-50 p-1 rounded-md transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Indicators & Profile avatar */}
      <div className="flex items-center gap-3">

        <div className="h-3.5 w-px bg-slate-200 hidden lg:block" />

        <div className="flex items-center gap-1 text-slate-500 relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-slate-50 rounded-md hover:text-slate-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-sm text-slate-800">Notificações</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAll}
                    className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    Nenhuma notificação nova.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-brand-blue' : 'bg-slate-300'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {notif.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="text-slate-400 hover:text-brand-blue p-1"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

      </div>
    </header>
  );
};
