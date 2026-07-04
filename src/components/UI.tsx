import React from 'react';
import { Prioridade, StatusOcorrencia, StatusItem, EstadoConservacao } from '@/mockData';
import { AlertTriangle, CheckCircle, Clock, Info, XCircle, CalendarCheck, Ban, ArrowLeftRight } from 'lucide-react';

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
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
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

// Helper to translate enums to display labels
export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const STATUS_OCORRENCIA_LABEL: Record<StatusOcorrencia, string> = {
  ABERTA: 'Aberta',
  AGUARDANDO_CORRECAO: 'Aguardando Correção',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADA: 'Aprovada',
  AGENDADA: 'Agendada',
  EM_EXECUCAO: 'Em Execução',
  CONCLUIDA: 'Concluída',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada',
};

export const STATUS_ITEM_LABEL: Record<StatusItem, string> = {
  ATIVO: 'Ativo',
  EM_MANUTENCAO: 'Em Manutenção',
  BAIXADO: 'Baixado',
};

export const TIPO_SOLICITACAO_LABEL: Record<string, string> = {
  SERVICO: 'Serviço',
  REPARO: 'Reparo',
  TROCA: 'Troca',
  REABASTECIMENTO: 'Reabastecimento',
  OUTRO: 'Outro',
};

// Highly legible state badges for Priorities
export const PriorityBadge: React.FC<{ priority: Prioridade | null }> = ({ priority }) => {
  if (!priority) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-slate-50 text-slate-500 border border-slate-150">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        Pendente
      </span>
    );
  }
  if (priority === 'ALTA' || priority === 'URGENTE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-red-50 text-red-700 border border-red-150">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        {PRIORIDADE_LABEL[priority]}
      </span>
    );
  }
  if (priority === 'MEDIA') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-150">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        Média
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      Baixa
    </span>
  );
};

// Custom badge for Occurrences Status
export const StatusBadge: React.FC<{ status: StatusOcorrencia }> = ({ status }) => {
  if (status === 'ABERTA') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
        Aberta
      </span>
    );
  }
  if (status === 'EM_EXECUCAO') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded bg-brand-ice text-brand-blue border border-blue-150">
        Em Execução
      </span>
    );
  }
  if (status === 'CONCLUIDA') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-teal-50 text-teal-700 border border-teal-150">
        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        Concluída
      </span>
    );
  }
  if (status === 'AGUARDANDO_APROVACAO') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-150">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        Aguardando Aprovação
      </span>
    );
  }
  if (status === 'APROVADA') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-blue-50 text-blue-700 border border-blue-150">
        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        Aprovada
      </span>
    );
  }
  if (status === 'AGENDADA') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-purple-50 text-purple-700 border border-purple-150">
        <CalendarCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        Agendada
      </span>
    );
  }
  if (status === 'RECUSADA' || status === 'CANCELADA') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-rose-50 text-rose-700 border border-rose-150">
        <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        {STATUS_OCORRENCIA_LABEL[status]}
      </span>
    );
  }
  if (status === 'AGUARDANDO_CORRECAO') {
    return (
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded bg-orange-50 text-orange-700 border border-orange-150">
        <ArrowLeftRight className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        Aguardando Correção
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
      {STATUS_OCORRENCIA_LABEL[status] || status}
    </span>
  );
};

// Custom badge for Assets Status
export const AssetStatusBadge: React.FC<{ status: StatusItem }> = ({ status }) => {
  if (status === 'ATIVO') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-teal-50 text-teal-700 border border-teal-150">
        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        Ativo
      </span>
    );
  }
  if (status === 'EM_MANUTENCAO') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-slate-50 text-slate-600 border border-slate-150">
        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        Em Manutenção
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-red-50 text-red-700 border border-red-150">
      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
      Baixado
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
    <Card className="p-4 flex items-start justify-between bg-white">
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-xs mt-1.5 font-medium">
            {trend && (
              <span className={`font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
      {icon && <div className="p-2 bg-slate-50 rounded-md text-slate-500 border border-slate-100/80 shrink-0">{icon}</div>}
    </Card>
  );
};