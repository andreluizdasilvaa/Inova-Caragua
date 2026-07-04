'use client';

import React, { useState } from 'react';
import { Occurrence, Asset } from '@/mockData';
import { StatsCard, Card, Button } from '@/components/UI';
import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  ShieldAlert, 
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  occurrences,
  assets,
  setView,
  setSelectedOccurrence
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Statistics calculations
  const totalOccurrences = occurrences.length;
  const openOccurrences = occurrences.filter(o => o.status === 'Aberto').length;
  const inProgressOccurrences = occurrences.filter(o => o.status === 'Em Andamento').length;
  const resolvedOccurrences = occurrences.filter(o => o.status === 'Resolvido').length;

  const totalAssets = assets.length;
  const operationalAssets = assets.filter(a => a.status === 'Operacional').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Em Manutenção').length;
  const damagedAssets = assets.filter(a => a.status === 'Danificado').length;

  // Category analysis for the chart
  const categories = [
    { name: 'Encanamento', count: occurrences.filter(o => o.category === 'Encanamento' || o.category === 'Hidráulica').length, color: '#f59e0b' },
    { name: 'Elétrica', count: occurrences.filter(o => o.category === 'Elétrica').length, color: '#3b82f6' },
    { name: 'Climatização', count: occurrences.filter(o => o.category === 'Climatização').length, color: '#10b981' },
    { name: 'Audiovisual', count: occurrences.filter(o => o.category === 'Audiovisual').length, color: '#8b5cf6' },
    { name: 'Estrutural', count: occurrences.filter(o => o.category === 'Estrutural').length, color: '#ef4444' }
  ];

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
            <p className="text-sm font-bold text-slate-200">04 de Julho de 2026</p>
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
          trend={{ value: '+4 novas', positive: false }}
        />
        <StatsCard
          title="Em Atendimento"
          value={inProgressOccurrences}
          subtitle="Técnicos em campo"
          icon={<Wrench className="w-5 h-5 text-brand-blue" />}
          trend={{ value: 'Estável', positive: true }}
        />
        <StatsCard
          title="Ativos em Manutenção"
          value={maintenanceAssets}
          subtitle="Equipamentos sob revisão"
          icon={<Clock className="w-5 h-5 text-slate-500" />}
        />
        <StatsCard
          title="Taxa de Resolução"
          value={`${Math.round((resolvedOccurrences / totalOccurrences) * 100) || 75}%`}
          subtitle="Média histórica de reparos"
          icon={<CheckCircle className="w-5 h-5 text-teal-500" />}
          trend={{ value: '98% SLA', positive: true }}
        />
      </div>

      {/* Bento Grid layout containing Charts and logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Chart Panel: Donut distribution and metrics list */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ocorrências por Categoria</h3>
              <p className="text-sm text-slate-500">Distribuição volumétrica das falhas reportadas</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <TrendingUp className="w-4 h-4" />
              Sincronizado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Custom Interactive SVG Ring Chart (Donut Chart) */}
            <div className="flex justify-center relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background Ring */}
                <circle cx="100" cy="100" r="72" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                
                {/* Interactive Slices */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSlice === 0 ? 24 : 20}
                  strokeDasharray={`${(30 * 452) / 100} 452`}
                  strokeDashoffset="0"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(0)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth={hoveredSlice === 1 ? 24 : 20}
                  strokeDasharray={`${(25 * 452) / 100} 452`}
                  strokeDashoffset={`-${(30 * 452) / 100}`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(1)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth={hoveredSlice === 2 ? 24 : 20}
                  strokeDasharray={`${(20 * 452) / 100} 452`}
                  strokeDashoffset={`-${(55 * 452) / 100}`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(2)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth={hoveredSlice === 3 ? 24 : 20}
                  strokeDasharray={`${(15 * 452) / 100} 452`}
                  strokeDashoffset={`-${(75 * 452) / 100}`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(3)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth={hoveredSlice === 4 ? 24 : 20}
                  strokeDasharray={`${(10 * 452) / 100} 452`}
                  strokeDashoffset={`-${(90 * 452) / 100}`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(4)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
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
            <p className="text-sm text-slate-500">Últimos relatórios necessitando aprovação</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
            {occurrences.slice(0, 3).map((occ) => (
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
                    {occ.id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {occ.date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">
                  {occ.description}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{occ.school}</span>
                </div>
              </div>
            ))}
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