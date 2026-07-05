import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Mail, HelpCircle, Menu } from 'lucide-react';
import { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onMenuClick
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < 50) {
        // Near the top - show header
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`h-14 ${isVisible ? 'bg-white/95 backdrop-blur-sm' : 'bg-transparent'} border-b ${isVisible ? 'border-slate-200/80' : 'border-transparent'} fixed top-0 right-0 left-0 md:left-60 z-10 flex items-center justify-between px-5 transition-all duration-200 ${isVisible ? '' : '-translate-y-full'}`}>
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

        <div className="flex items-center gap-1 text-slate-500">
          <button className="p-2 hover:bg-slate-50 rounded-md hover:text-slate-900 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

      </div>
    </header>
  );
};
