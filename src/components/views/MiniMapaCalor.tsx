'use client';

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

// ─── Componente Principal ─────────────────────────────────────────────────────

export const MiniMapaCalor: React.FC = () => {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/mapa?metrica=ocorrencias&periodo=30');
      if (!res.ok) throw new Error('Falha ao buscar dados do mapa.');
      const json = await res.json();
      setPontos(json.pontos);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const pontosComPeso = pontos.filter(p => p.peso > 0);
  const totalPeso = pontosComPeso.reduce((s, p) => s + p.peso, 0);

  return (
    <div className="space-y-3">
      {/* Header do mapa */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Mapa de Calor - Ocorrências
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Concentração de chamados nas últimas 30 dias
          </p>
        </div>
        <div className="text-xs text-slate-500">
          <span className="text-slate-300 font-semibold">{pontos.length}</span> instituições
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-[280px] relative">
        {erro ? (
          <div className="flex items-center justify-center h-full bg-slate-50 text-red-500 text-sm">
            ⚠ {erro}
          </div>
        ) : (
          <MapaLeaflet
            pontos={pontos}
            raio={30}
            opacidade={0.6}
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
              Carregando...
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #00c3ff, #ffff00, #ff0000)' }} />
          <span className="text-slate-500">Baixo → Alto</span>
        </div>
        <span className="text-slate-500">
          Total: <strong className="text-slate-700">{totalPeso}</strong> ocorrências
        </span>
      </div>
    </div>
  );
};