'use client';

/**
 * MapaCalorView — Mapa de Calor de Ocorrências por Instituição
 *
 * Estratégia:
 *   Tentamos usar o Google Maps. Se houver falha de API/bloqueio (ApiTargetBlockedMapError),
 *   ele ativa o fallback para OpenStreetMap (Leaflet.js) automaticamente.
 */

import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';

interface Ponto { id: string; nome: string; tipo: string; lat: number; lng: number; peso: number; }
interface Controles { metrica: string; periodo: number; status: string; tipos: string[]; raio: number; opacidade: number; }

const METRICAS = [
  { value: 'ocorrencias', label: 'Total de Ocorrências' },
  { value: 'urgentes', label: 'Ocorrências Urgentes/Altas' },
  { value: 'sem_resposta', label: 'Sem Resposta (paradas)' },
  { value: 'itens_ruins', label: 'Itens em Mau Estado' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' }, { value: 'ABERTA', label: 'Aberta' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' }, { value: 'APROVADA', label: 'Aprovada' },
  { value: 'AGENDADA', label: 'Agendada' }, { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'CONCLUIDA', label: 'Concluída' }, { value: 'RECUSADA', label: 'Recusada' },
];
const TIPO_OPTIONS = [
  { value: 'CRECHE', label: 'Creche' }, { value: 'EMEI', label: 'EMEI' }, { value: 'EMEF', label: 'EMEF' },
  { value: 'EMEIF', label: 'EMEIF / CIEFI' }, { value: 'OUTRO', label: 'Outro' },
];
const CENTRO_CARAGUA = { lat: -23.62, lng: -45.41 };

// ─── Google Maps (Círculos) ───────────────────────────────────────────────────

const CirculosCalor: React.FC<{ pontos: Ponto[]; raio: number; opacidade: number }> = ({ pontos, raio, opacidade }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const comPeso = pontos.filter(p => p.peso > 0 && p.lat != null && p.lng != null);
    if (comPeso.length === 0) return;
    const maxPeso = Math.max(...comPeso.map(p => p.peso), 1);

    const circles = comPeso.map(p => {
      const ratio = p.peso / maxPeso;
      const r = Math.round(255 * Math.min(1, ratio * 2));
      const g = Math.round(255 * Math.min(1, 2 - ratio * 2));
      const b = Math.round(80 * (1 - ratio));
      return new google.maps.Circle({
        map,
        center: { lat: Number(p.lat), lng: Number(p.lng) },
        radius: raio * (30 + ratio * 70),
        fillColor: `rgb(${r},${g},${b})`,
        fillOpacity: opacidade * (0.3 + ratio * 0.5),
        strokeWeight: 0,
        clickable: false,
      });
    });
    return () => circles.forEach(c => c.setMap(null));
  }, [map, pontos, raio, opacidade]);
  return null;
};

// ─── Leaflet (OpenStreetMap) Fallback ─────────────────────────────────────────

const LeafletHeatmap: React.FC<{ pontos: Ponto[]; raio: number; opacidade: number }> = ({ pontos, raio, opacidade }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const heatRef = useRef<any>(null);
  const lRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    Promise.all([
      import('leaflet'),
      // @ts-ignore
      import('leaflet.heat')
    ]).then(([leafletModule]) => {
      if (cancelled || !containerRef.current) return;
      const L = (leafletModule as any).default ?? leafletModule;
      lRef.current = L;

      const map = L.map(containerRef.current, {
        center: [CENTRO_CARAGUA.lat, CENTRO_CARAGUA.lng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setTimeout(() => { map.invalidateSize(); setMapReady(true); }, 150);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; lRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L || !mapReady) return;
    if (heatRef.current) { heatRef.current.remove(); heatRef.current = null; }

    const comPeso = pontos.filter(p => p.peso > 0 && p.lat != null && p.lng != null);
    if (comPeso.length === 0) return;
    const maxPeso = Math.max(...comPeso.map(p => p.peso), 1);
    const dados = comPeso.map(p => [Number(p.lat), Number(p.lng), p.peso / maxPeso] as [number, number, number]);

    if (typeof (L as any).heatLayer === 'function') {
      heatRef.current = (L as any).heatLayer(dados, {
        radius: raio,
        blur: Math.round(raio * 0.8),
        maxZoom: 17,
        max: 1.0,
        minOpacity: opacidade * 0.3,
        gradient: { 0.2: '#0ea5e9', 0.5: '#facc15', 0.8: '#ef4444', 1.0: '#7f1d1d' },
      }).addTo(map);
    }
  }, [pontos, raio, opacidade, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-green-500/90 text-green-950 text-xs font-bold px-2.5 py-1 rounded-full shadow pointer-events-none">
        <span>🗺</span> OpenStreetMap (modo alternativo)
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export const MapaCalorView: React.FC = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modoFallback, setModoFallback] = useState(false);
  const [controles, setControles] = useState<Controles>({ metrica: 'ocorrencias', periodo: 30, status: '', tipos: [], raio: 40, opacidade: 0.7 });

  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('[MapaCalor] Google Maps falhou — ativando fallback OpenStreetMap');
      setModoFallback(true);
    };
    return () => { delete (window as any).gm_authFailure; };
  }, []);

  const buscarDados = useCallback(async (c: Controles) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({
        metrica: c.metrica, periodo: c.periodo.toString(),
        ...(c.status ? { status: c.status } : {}),
        ...(c.tipos.length > 0 ? { tipos: c.tipos.join(',') } : {}),
      });
      const res = await fetch(`/api/mapa?${params}`);
      if (!res.ok) throw new Error('Falha');
      const json = await res.json();
      setPontos(json.pontos ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { buscarDados(controles); }, [controles, buscarDados]);

  const setCtrl = (p: Partial<Controles>) => setControles({ ...controles, ...p });
  const toggleTipo = (t: string) => setCtrl({ tipos: controles.tipos.includes(t) ? controles.tipos.filter(x => x !== t) : [...controles.tipos, t] });
  const pontosComPeso = pontos.filter(p => p.peso > 0);
  const totalPeso = pontosComPeso.reduce((s, p) => s + p.peso, 0);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Mapa de Calor</h2>
          <p className="text-sm text-slate-500 mt-0.5">Concentração de ocorrências e problemas por região.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <div className="w-24 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #0ea5e9, #facc15, #ef4444)' }} />
          <div className="flex justify-between w-24 -mt-0.5"><span>Baixo</span><span>Alto</span></div>
          <span className="ml-2 text-slate-400">Total: <strong className="text-slate-700">{totalPeso}</strong></span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-100">
          {modoFallback ? (
            <LeafletHeatmap pontos={pontos} raio={controles.raio} opacidade={controles.opacidade} />
          ) : (
            <APIProvider apiKey={apiKey} version="3.64">
              <Map defaultCenter={CENTRO_CARAGUA} defaultZoom={12} mapId="inova-caragua-heatmap" gestureHandling="greedy" style={{ width: '100%', height: '100%' }}>
                <CirculosCalor pontos={pontos} raio={controles.raio} opacidade={controles.opacidade} />
              </Map>
            </APIProvider>
          )}

          {carregando && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow text-sm text-slate-700 font-medium">
                <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Atualizando mapa...
              </div>
            </div>
          )}
        </div>

        <aside className="w-80 shrink-0 bg-slate-900 border border-slate-700/60 rounded-xl p-5 flex flex-col gap-5 text-slate-200 text-sm shadow-xl overflow-y-auto">
          <div>
            <h2 className="text-base font-bold text-white mb-0.5">Configurações do Mapa</h2>
            {modoFallback && <p className="mt-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-1">Usando OpenStreetMap como alternativa gratuita.</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Métrica</label>
            <select value={controles.metrica} onChange={e => setCtrl({ metrica: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              {METRICAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider"><span>Período</span><span className="text-blue-400 font-mono normal-case">{controles.periodo} dias</span></label>
            <input type="range" min={7} max={365} step={7} value={controles.periodo} onChange={e => setCtrl({ periodo: parseInt(e.target.value) })} className="w-full accent-blue-500 cursor-pointer" />
          </div>
          {controles.metrica === 'ocorrencias' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select value={controles.status} onChange={e => setCtrl({ status: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tipos</label>
            <div className="space-y-1.5">
              {TIPO_OPTIONS.map(t => (
                <label key={t.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={controles.tipos.length === 0 || controles.tipos.includes(t.value)} onChange={() => toggleTipo(t.value)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                  <span className="text-slate-300 group-hover:text-white transition-colors">{t.label}</span>
                </label>
              ))}
            </div>
            {controles.tipos.length > 0 && <button onClick={() => setCtrl({ tipos: [] })} className="text-xs text-blue-400 hover:text-blue-300 underline">Selecionar todos</button>}
          </div>
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider"><span>Raio</span><span className="text-blue-400 font-mono normal-case">{controles.raio}px</span></label>
            <input type="range" min={10} max={120} step={5} value={controles.raio} onChange={e => setCtrl({ raio: parseInt(e.target.value) })} className="w-full accent-blue-500 cursor-pointer" />
          </div>
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider"><span>Opacidade</span><span className="text-blue-400 font-mono normal-case">{Math.round(controles.opacidade * 100)}%</span></label>
            <input type="range" min={0.1} max={1} step={0.05} value={controles.opacidade} onChange={e => setCtrl({ opacidade: parseFloat(e.target.value) })} className="w-full accent-blue-500 cursor-pointer" />
          </div>
        </aside>
      </div>
    </div>
  );
};
