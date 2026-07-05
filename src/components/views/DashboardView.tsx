'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Occurrence, Asset, CategoriaItem } from '@/types';
import { StatsCard, Card, Button } from '@/components/UI';
import { formatDate } from '@/lib/utils/timestamp';
import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Flame
} from 'lucide-react';
import dynamic from 'next/dynamic';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Ponto {
  id: string;
  nome: string;
  tipo: string;
  lat: number;
  lng: number;
  peso: number;
}

interface Controles {
  metrica: string;
  periodo: number;
  status: string;
  tipos: string[];
  raio: number;
  opacidade: number;
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const METRICAS = [
  { value: 'ocorrencias', label: 'Total de Ocorrências' },
  { value: 'urgentes', label: 'Ocorrências Urgentes/Altas' },
  { value: 'sem_resposta', label: 'Sem Resposta (paradas)' },
  { value: 'itens_ruins', label: 'Itens em Mau Estado' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'AGUARDANDO_CORRECAO', label: 'Aguardando Correção' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' },
  { value: 'APROVADA', label: 'Aprovada' },
  { value: 'AGENDADA', label: 'Agendada' },
  { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'RECUSADA', label: 'Recusada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const TIPO_OPTIONS = [
  { value: 'CRECHE', label: 'Creche' },
  { value: 'EMEI', label: 'EMEI' },
  { value: 'EMEF', label: 'EMEF' },
  { value: 'EMEIF', label: 'EMEIF / CIEFI' },
  { value: 'OUTRO', label: 'Outro (CEI, CRIES, Biblioteca)' },
];

const TODOS_TIPOS = TIPO_OPTIONS.map(t => t.value);

// Centro aproximado de Caraguatatuba
const CENTRO_CARAGUA = { lat: -23.62, lng: -45.41 };

const MapaLeaflet = dynamic(
  () => import('./mapa-calor/MapaLeaflet').then(mod => mod.MapaLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-50 text-slate-500 text-sm">
        Carregando mapa...
      </div>
    ),
  }
);

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

// ─── Painel de Controles ──────────────────────────────────────────────────────

interface PainelControlesProps {
  controles: Controles;
  onChange: (c: Controles) => void;
  carregando: boolean;
  totalPontos: number;
}

const PainelControles: React.FC<PainelControlesProps> = ({
  controles,
  onChange,
  carregando,
  totalPontos,
}) => {
  const set = (partial: Partial<Controles>) => onChange({ ...controles, ...partial });

  const toggleTipo = (tipo: string) => {
    if (controles.tipos.length === 0) {
      set({ tipos: TODOS_TIPOS.filter(t => t !== tipo) });
      return;
    }

    const tipos = controles.tipos.includes(tipo)
      ? controles.tipos.filter(t => t !== tipo)
      : [...controles.tipos, tipo];

    if (tipos.length === TODOS_TIPOS.length) {
      set({ tipos: [] });
      return;
    }

    set({ tipos });
  };

  return (
    <aside className="w-full xl:w-80 xl:shrink-0 bg-slate-900/95 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-5 text-slate-200 text-sm shadow-xl backdrop-blur overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100vh-140px)]">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white">Configurações do mapa</h2>
        <p className="text-xs text-slate-400 leading-relaxed">Ajuste os parâmetros para destacar onde os chamados e itens se concentram.</p>
      </div>

      {/* Métrica */}
      <div className="space-y-1.5 min-w-0">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Métrica</label>
        <select
          value={controles.metrica}
          onChange={e => set({ metrica: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {METRICAS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Período */}
      <div className="space-y-2 min-w-0">
        <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Período</span>
          <span className="text-blue-400 font-mono normal-case">{controles.periodo} dias</span>
        </label>
        <input
          type="range"
          min={7} max={365} step={7}
          value={controles.periodo}
          onChange={e => set({ periodo: parseInt(e.target.value) })}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600">
          <span>7d</span><span>1 ano</span>
        </div>
      </div>

      {/* Status */}
      {(controles.metrica === 'ocorrencias') && (
        <div className="space-y-1.5 min-w-0">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Status das Ocorrências</label>
          <select
            value={controles.status}
            onChange={e => set({ status: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tipos de Instituição */}
      <div className="space-y-2 min-w-0">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tipos de Instituição</label>
        <div className="flex flex-wrap gap-2">
          {TIPO_OPTIONS.map(t => (
            <label key={t.value} className="flex items-center gap-2.5 cursor-pointer group w-full sm:w-[calc(50%-0.25rem)] xl:w-full">
              <input
                type="checkbox"
                checked={controles.tipos.length === 0 || controles.tipos.includes(t.value)}
                onChange={() => toggleTipo(t.value)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors leading-snug break-words">{t.label}</span>
            </label>
          ))}
        </div>
        {controles.tipos.length > 0 && (
          <button
            onClick={() => set({ tipos: [] })}
            className="text-xs text-blue-400 hover:text-blue-300 underline text-left"
          >
            Selecionar todos
          </button>
        )}
      </div>

      {/* Raio */}
      <div className="space-y-2 min-w-0">
        <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Raio Visual</span>
          <span className="text-blue-400 font-mono normal-case">{controles.raio}px</span>
        </label>
        <input
          type="range"
          min={10} max={120} step={5}
          value={controles.raio}
          onChange={e => set({ raio: parseInt(e.target.value) })}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Opacidade */}
      <div className="space-y-2 min-w-0">
        <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Opacidade</span>
          <span className="text-blue-400 font-mono normal-case">{Math.round(controles.opacidade * 100)}%</span>
        </label>
        <input
          type="range"
          min={0.1} max={1} step={0.05}
          value={controles.opacidade}
          onChange={e => set({ opacidade: parseFloat(e.target.value) })}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Status footer */}
      <div className="mt-auto pt-3 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        {carregando ? (
          <p className="text-blue-400 animate-pulse">⟳ Atualizando dados...</p>
        ) : (
          <p>
            <span className="text-slate-300 font-semibold">{totalPontos}</span> instituições exibidas
          </p>
        )}
      </div>
    </aside>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  occurrences,
  assets,
  setView,
  setSelectedOccurrence
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  
  // Estados do mapa de calor
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [controles, setControles] = useState<Controles>({
    metrica: 'ocorrencias',
    periodo: 30,
    status: '',
    tipos: [],
    raio: 40,
    opacidade: 0.7,
  });

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

  // Buscar dados do mapa
  const buscarDados = useCallback(async (c: Controles) => {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams({
        metrica: c.metrica,
        periodo: c.periodo.toString(),
        ...(c.status ? { status: c.status } : {}),
        ...(c.tipos.length > 0 ? { tipos: c.tipos.join(',') } : {}),
      });
      const res = await fetch(`/api/mapa?${params}`);
      if (!res.ok) throw new Error('Falha ao buscar dados do mapa.');
      const json = await res.json();
      setPontos(json.pontos);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca inicial e quando controles mudam
  useEffect(() => {
    buscarDados(controles);
  }, [controles, buscarDados]);

  const pontosComPeso = pontos.filter(p => p.peso > 0);
  const totalPeso = pontosComPeso.reduce((s, p) => s + p.peso, 0);

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

      {/* Heatmap Section with Controls - Improved Layout */}
      <div className="space-y-4">
        {/* Header with Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">Mapa de Calor</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-24 h-3 rounded-full shrink-0" style={{ background: 'linear-gradient(to right, #00c3ff, #ffff00, #ff0000)' }} />
              <span>Baixo <span className="mx-1">→</span> Alto</span>
            </div>
          </div>
        </div>

        {/* Map and Controls Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-4 items-start">
          {/* Map Container */}
          <div className="min-w-0 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative bg-white h-max xl:h-[600px]">
            {erro ? (
              <div className="flex items-center justify-center h-full bg-slate-50 text-red-500 text-sm">
                ⚠ {erro}
              </div>
            ) : (
              <MapaLeaflet
                pontos={pontos}
                raio={controles.raio}
                opacidade={controles.opacidade}
                centro={CENTRO_CARAGUA}
              />
            )}

            {/* Overlay de carregando */}
            {carregando && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow text-sm text-slate-700 font-medium">
                  <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Atualizando mapa...
                </div>
              </div>
            )}
          </div>

          {/* Painel de Controles - Sticky on larger screens */}
          <div className="xl:sticky xl:top-4">
            <PainelControles
              controles={controles}
              onChange={setControles}
              carregando={carregando}
              totalPontos={pontos.length}
            />
          </div>
        </div>

        {/* Tabela resumo das instituições com maior peso - Integrated below map */}
        {pontosComPeso.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Top instituições — {METRICAS.find(m => m.value === controles.metrica)?.label}</h3>
              <span className="text-xs text-slate-400">Últimos {controles.periodo} dias</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold text-left uppercase tracking-wider">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Instituição</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pontosComPeso]
                    .sort((a, b) => b.peso - a.peso)
                    .slice(0, 8)
                    .map((p, i) => (
                      <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium max-w-xs truncate">{p.nome}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-semibold">
                            {p.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={`font-bold ${p.peso >= 5 ? 'text-red-600' : p.peso >= 2 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {p.peso}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};