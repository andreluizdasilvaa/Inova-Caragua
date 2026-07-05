'use client';

import React, { useState, useMemo } from 'react';
import { Occurrence, Asset, CategoriaItem } from '@/types';
import { StatsCard, Card, Button } from '@/components/UI';
import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  occurrences: Occurrence[];
  assets: Asset[];
  setView: (view: string) => void;
  setSelectedOccurrence?: (occ: Occurrence) => void;
}

const CATEGORIA_LABEL: Record<CategoriaItem, string> = {
  INFORMATICA: 'Informática',
  MOBILIARIO: 'Mobiliário',
  ELETRODOMESTICO: 'Eletrodoméstico',
  CONECTIVIDADE: 'Conectividade',
  PREDIAL: 'Predial',
  OUTRO: 'Outro',
};

// Map occurrence type to category for grouping
const getCategoryFromTipo = (tipo: string): string => {
  const map: Record<string, string> = {
    REPARO: 'Predial',
    SERVICO: 'Predial',
    TROCA: 'Mobiliário',
    REABASTECIMENTO: 'Eletrodoméstico',
    OUTRO: 'Outro',
  };
  return map[tipo] || 'Outro';
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  occurrences,
  assets,
  setView,
  setSelectedOccurrence
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Statistics calculations based on new status enums
  const totalOccurrences = occurrences.length;
  const openOccurrences = occurrences.filter(o => o.status === 'ABERTA' || o.status === 'AGUARDANDO_CORRECAO').length;
  const inProgressOccurrences = occurrences.filter(o => 
    ['EM_EXECUCAO', 'AGENDADA', 'APROVADA', 'AGUARDANDO_APROVACAO'].includes(o.status)
  ).length;
  const resolvedOccurrences = occurrences.filter(o => o.status === 'CONCLUIDA').length;

  const totalAssets = assets.length;
  const operationalAssets = assets.filter(a => a.status === 'ATIVO').length;
  const maintenanceAssets = assets.filter(a => a.status === 'EM_MANUTENCAO').length;
  const damagedAssets = assets.filter(a => a.status === 'BAIXADO').length;

  // Category analysis by tipoSolicitacao
  const categories = useMemo(() => {
    const countByTipo: Record<string, number> = {};
    occurrences.forEach(o => {
      const label = getCategoryFromTipo(o.tipoSolicitacao);
      countByTipo[label] = (countByTipo[label] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      'Predial': '#f59e0b',
      'Informática': '#3b82f6',
      'Mobiliário': '#10b981',
      'Eletrodoméstico': '#8b5cf6',
      'Conectividade': '#ef4444',
      'Outro': '#94a3b8',
    };

    return Object.entries(countByTipo).map(([name, count]) => ({
      name,
      count,
      color: colors[name] || '#94a3b8',
    }));
  }, [occurrences]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-lg shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-extrabold tracking-tight">Painel de Controle Geral</h2>
          <p className="text-sm text-slate-400">
            Acompanhe o estado da infraestrutura de todas as unidades escolares integradas.
          </p>
        </div>
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hoje é</p>
            <p className="text-sm font-bold text-slate-200">
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="p-2 bg-white/10 rounded-md border border-white/10 text-white">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ocorrências em Aberto"
          value={openOccurrences}
          subtitle="Aguardando triagem"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          trend={{ value: `${openOccurrences} pendentes`, positive: false }}
        />
        <StatsCard
          title="Em Atendimento"
          value={inProgressOccurrences}
          subtitle="Técnicos em campo"
          icon={<Wrench className="w-5 h-5 text-brand-blue" />}
          trend={{ value: 'Em andamento', positive: true }}
        />
        <StatsCard
          title="Ativos em Manutenção"
          value={maintenanceAssets}
          subtitle="Equipamentos sob revisão"
          icon={<Clock className="w-5 h-5 text-slate-500" />}
        />
        <StatsCard
          title="Taxa de Resolução"
          value={`${totalOccurrences ? Math.round((resolvedOccurrences / totalOccurrences) * 100) : 0}%`}
          subtitle="Média histórica de reparos"
          icon={<CheckCircle className="w-5 h-5 text-teal-500" />}
          trend={{ value: `${resolvedOccurrences} concluídas`, positive: true }}
        />
      </div>

      {/* Bento Grid layout containing Charts and logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Chart Panel: Donut distribution and metrics list */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ocorrências por Categoria</h3>
              <p className="text-sm text-slate-500">Distribuição volumétrica das solicitações</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Custom Interactive SVG Ring Chart (Donut Chart) */}
            <div className="flex justify-center relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background Ring */}
                <circle cx="100" cy="100" r="72" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                
                {categories.map((cat, idx) => {
                  const total = categories.reduce((s, c) => s + c.count, 0);
                  const pct = total ? (cat.count / total) * 100 : 0;
                  let offset = 0;
                  for (let i = 0; i < idx; i++) {
                    offset += (categories[i].count / total) * 452;
                  }
                  return (
                    <circle
                      key={cat.name}
                      cx="100"
                      cy="100"
                      r="72"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={hoveredSlice === idx ? 24 : 20}
                      strokeDasharray={`${(pct * 452) / 100} 452`}
                      strokeDashoffset={`-${offset}`}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Text displaying hover information */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {hoveredSlice !== null ? categories[hoveredSlice].name : 'Total'}
                </span>
                <span className="text-2xl font-black text-slate-800 mt-1 leading-none">
                  {hoveredSlice !== null 
                    ? `${categories[hoveredSlice].count}` 
                    : `${totalOccurrences}`}
                </span>
                <span className="text-xs text-slate-400 font-medium leading-none mt-1">chamados</span>
              </div>
            </div>

            {/* List side legend */}
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div 
                  key={cat.name} 
                  className={`flex items-center justify-between p-2 rounded-md transition-colors duration-150 ${
                    hoveredSlice === idx ? 'bg-slate-50 border border-slate-150' : 'border border-transparent'
                  }`}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Panel: Recent Alerts/Queue */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Alertas de Triagem</h3>
            <p className="text-sm text-slate-500">Últimos chamados necessitando análise</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
            {occurrences
              .filter(o => o.status === 'ABERTA' || o.status === 'AGUARDANDO_APROVACAO')
              .slice(0, 3)
              .map((occ) => (
              <div 
                key={occ.id} 
                onClick={() => {
                  if (setSelectedOccurrence) {
                    setSelectedOccurrence(occ);
                    setView('triagem');
                  } else {
                    setView('triagem');
                  }
                }}
                className="group border border-slate-100 hover:border-brand-blue hover:shadow-sm rounded-lg p-3 bg-slate-50/50 cursor-pointer transition-all duration-150 relative"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-150 px-2 py-0.5 rounded">
                    #{occ.numero}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {formatDate(occ.createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">
                  {occ.titulo}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{occ.localizacaoDescricao || 'Local não especificado'}</span>
                </div>
              </div>
            ))}
            {occurrences.filter(o => o.status === 'ABERTA').length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum chamado pendente</p>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-slate-700 hover:border-brand-blue hover:text-brand-blue text-xs py-2"
            onClick={() => setView('triagem')}
          >
            <span>Ver Fila Completa</span>
            <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
          </Button>
        </Card>
      </div>
    </div>
  );
};