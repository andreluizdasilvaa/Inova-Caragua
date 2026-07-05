'use client';

import React from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CamadaCalor } from './CamadaCalor';

interface Ponto {
  id: string;
  nome: string;
  tipo: string;
  lat: number;
  lng: number;
  peso: number;
}

interface MapaLeafletProps {
  pontos: Ponto[];
  raio: number;
  opacidade: number;
  centro: { lat: number; lng: number };
}

export function MapaLeaflet({ pontos, raio, opacidade, centro }: MapaLeafletProps) {
  const pontosComPeso = pontos.filter(p => p.peso > 0);

  return (
    // @ts-ignore
    <MapContainer center={[centro.lat, centro.lng]} zoom={12} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        {...({
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19
        } as any)}
      />
      <CamadaCalor pontos={pontos} raio={raio} opacidade={opacidade} />

      {pontos.map(ponto => (
        <CircleMarker
          key={ponto.id}
          {...({
            center: [ponto.lat, ponto.lng],
            radius: ponto.peso > 0 ? 10 : 7,
            pathOptions: {
              color: '#0f172a',
              weight: 1,
              opacity: ponto.peso > 0 ? 0.25 : 0.15,
              fillOpacity: ponto.peso > 0 ? 0.12 : 0.07,
              fillColor: ponto.peso > 0 ? '#2563eb' : '#64748b',
            }
          } as any)}
        >
          <Tooltip {...({ direction: "top", offset: [0, -8] } as any)}>
            <div className="text-xs leading-relaxed">
              <div className="font-semibold text-slate-900">{ponto.nome}</div>
              <div className="text-slate-600">Tipo: {ponto.tipo}</div>
              <div className="text-slate-700 font-medium">Peso: {ponto.peso}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {pontosComPeso.length === 0 && (
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control bg-white/95 text-slate-700 text-xs px-3 py-2 rounded-md shadow">
            Nenhuma instituição com peso positivo no filtro atual.
          </div>
        </div>
      )}
    </MapContainer>
  );
}
