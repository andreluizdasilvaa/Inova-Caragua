import React from 'react';
import { UserSession } from '@/mockData';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  Eye, 
  School, 
  Users, 
  Settings, 
  LogOut,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  session: UserSession;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  session, 
  onLogout 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventário', icon: Package },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
    { id: 'triagem', label: 'Triagem / Monitoramento', icon: Eye },
    { id: 'lote', label: 'Lote / Cadastro', icon: ShieldAlert },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20 shrink-0 font-sans">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-none tracking-tight text-white">InovaCaragua</h1>
            <p className="font-mono text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Manutenção Escolar</p>
          </div>
        </div>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Administração</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'inventario' && currentView === 'detalhes');
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-150 text-left cursor-pointer ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4">
          <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apoio</p>
          <button 
            onClick={() => alert('Configurações de sistema simuladas.')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-left cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Configurações</span>
          </button>
        </div>
      </nav>

      {/* User Session Footer Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-2.5 px-1 py-1 rounded-md">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700 uppercase text-slate-200">
            {session.user.name.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-none">{session.user.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{session.user.email}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded border border-slate-800 hover:border-rose-500/55 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Sessão</span>
        </button>
      </div>
    </aside>
  );
};