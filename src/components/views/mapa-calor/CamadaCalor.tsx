'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface Ponto {
  lat: number;
  lng: number;
  peso: number;
}

interface CamadaCalorProps {
  pontos: Ponto[];
  raio: number;
  opacidade: number;
}

export function CamadaCalor({ pontos, raio, opacidade }: CamadaCalorProps) {
  const map = useMap();

  useEffect(() => {
    const data: Array<[number, number, number]> = pontos
      .filter(p => p.peso > 0)
      .map(p => [p.lat, p.lng, p.peso]);

    if (data.length === 0) {
      return;
    }

    const maxPeso = Math.max(...data.map(([, , peso]) => peso), 1);

    const heat = L.heatLayer(data, {
      radius: raio,
      blur: 20,
      maxZoom: 17,
      max: maxPeso,
      minOpacity: opacidade,
      gradient: {
        0.2: '#00c3ff',
        0.5: '#ffff00',
        1.0: '#ff0000',
      },
    });

    (heat as any).addTo(map);

    return () => {
      map.removeLayer(heat as any);
    };
  }, [map, pontos, raio, opacidade]);

  return null;
}
