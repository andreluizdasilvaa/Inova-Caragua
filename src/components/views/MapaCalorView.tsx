'use client';

/**
 * MapaCalorView — Mapa de Calor de Ocorrências por Instituição
 *
 * Disponível apenas para usuários com papel MESTRE.
 * Usa Leaflet + leaflet.heat com tiles gratuitos (CartoDB Positron).
 *
 * Controles configuráveis pelo mestre:
 *   - Métrica  (o que gera o "calor")
 *   - Período  (janela de tempo em dias)
 *   - Status   (filtro de status das ocorrências)
 *   - Tipos    (filtro de tipo de instituição)
 *   - Raio     (raio visual do HeatmapLayer)
 *   - Opacidade
 */

import React, { useState, useEffect, useCallback } from 'react';
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

// ─── Componente Principal ─────────────────────────────────────────────────────

export const MapaCalorView: React.FC = () => {
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
    <div className="flex flex-col gap-4 min-h-[calc(100vh-120px)] overflow-x-hidden">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-sm px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Mapa operacional</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Mapa de Calor</h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              Visualize a concentração de ocorrências, itens críticos e escolas com maior pressão de demanda.
            </p>
          </div>

          {/* Legenda rápida */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm w-full xl:w-auto">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-24 h-3 rounded-full shrink-0" style={{ background: 'linear-gradient(to right, #00c3ff, #ffff00, #ff0000)' }} />
              <div className="flex justify-between w-24 -mt-0.5">
                <span>Baixo</span><span>Alto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo: mapa + painel */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] items-start min-h-0">
        {/* Mapa */}
        <div className="min-w-0 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative bg-white h-[72vh] xl:h-[calc(100vh-220px)]">
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

        {/* Painel de Controles */}
        <PainelControles
          controles={controles}
          onChange={setControles}
          carregando={carregando}
          totalPontos={pontos.length}
        />
      </div>

      {/* Tabela resumo das instituições com maior peso */}
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
  );
};
