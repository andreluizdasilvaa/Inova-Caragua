import React from 'react';
import { Priority, OccurrenceStatus, AssetStatus } from '@/mockData';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

// Card primitive conforming to design guidelines (Level 1 elevation: no shadow, clean outline)
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-lg overflow-hidden transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Standardized UI Button with clear focus ring and micro-animations
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-sans font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-brand-navy hover:bg-slate-800 text-white border border-transparent shadow-sm',
    secondary: 'bg-brand-blue hover:bg-brand-teal text-white border border-transparent shadow-sm',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-sm',
  };

  const sizes = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Highly legible state badges for Priorities
export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  if (priority === 'Alta') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-150">
        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
        Alta
      </span>
    );
  }
  if (priority === 'Média') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-150">
        <Info className="w-3 h-3 text-amber-600 shrink-0" />
        Média
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
      Baixa
    </span>
  );
};

// Custom badge for Occurrences Status
export const StatusBadge: React.FC<{ status: OccurrenceStatus }> = ({ status }) => {
  if (status === 'Aberto') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
        Aberto
      </span>
    );
  }
  if (status === 'Em Andamento') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded bg-brand-ice text-brand-blue border border-blue-150">
        Em Andamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-150">
      <CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />
      Resolvido
    </span>
  );
};

// Custom badge for Assets Status
export const AssetStatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  if (status === 'Operacional') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-150">
        <CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />
        Operacional
      </span>
    );
  }
  if (status === 'Em Manutenção') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
        Em Manutenção
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-150">
      <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
      Danificado
    </span>
  );
};

// Unified stats reporting container
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
}> = ({ title, value, subtitle, icon, trend }) => {
  return (
    <Card className="p-3.5 flex items-start justify-between bg-white">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-[10px] mt-1 font-medium">
            {trend && (
              <span className={`font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
      {icon && <div className="p-1.5 bg-slate-50 rounded-md text-slate-500 border border-slate-100/80 shrink-0">{icon}</div>}
    </Card>
  );
};
