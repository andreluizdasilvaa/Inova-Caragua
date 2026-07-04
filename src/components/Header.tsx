import React from 'react';
import { Search, Bell, Mail, HelpCircle, Menu } from 'lucide-react';
import { UserSession } from '@/mockData';

interface HeaderProps {
  session: UserSession;
  title?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  session, 
  title = "School Inspection System", 
  onMenuClick 
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200/80 fixed top-0 right-0 left-0 md:left-60 z-10 flex items-center justify-between px-5 transition-all duration-200">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:bg-slate-50 p-1 rounded-md transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-72 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar no sistema..."
            className="w-full pl-10 pr-3 py-1.5 text-sm font-sans rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Navigation Indicators & Profile avatar */}
      <div className="flex items-center gap-3">
        {/* Inspection system center-text */}
        <span className="hidden lg:inline text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80">
          {title}
        </span>

        <div className="h-3.5 w-px bg-slate-200 hidden lg:block" />

        <div className="flex items-center gap-1 text-slate-500">
          <button className="p-2 hover:bg-slate-50 rounded-md hover:text-slate-900 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          
          <button className="p-2 hover:bg-slate-50 rounded-md hover:text-slate-900 transition-colors">
            <Mail className="w-4 h-4" />
          </button>

          <button className="p-2 hover:bg-slate-50 rounded-md hover:text-slate-900 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Headshot Avatar Layout */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-800 shadow-inner flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            {session.user.name ? session.user.name.substring(0, 2) : 'US'}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">
            {session.user.name ? session.user.name.split(' ')[0] : 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  );
};
