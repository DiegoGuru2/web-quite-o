import React from 'react';
import { type WordResponse } from '../services/api';
import { Flame, Info } from 'lucide-react';

interface Props {
  initialWords: WordResponse[];
}

export default function Puteadas({ initialWords }: Props) {
  // Filtermos las palabras que tengan "Puteada" en sus categorías o en el origen
  const puteadas = initialWords.filter(w => 
    w.categories.some(c => c.name.toLowerCase() === 'puteada') || 
    w.origin?.toLowerCase() === 'puteada' ||
    ['pelotudo', 'caremadera', 'batracio', 'chanda'].includes(w.term.toLowerCase())
  );

  if (puteadas.length === 0) return null;

  return (
    <section id="puteadas" className="section" style={{ background: 'rgba(239, 68, 68, 0.02)' }}>
      <div className="container">
        <div style={{ 
          width: 60, height: 4, background: '#ef4444', borderRadius: 2, marginBottom: 24 
        }}></div>
        <h2 className="section-title">
          Sección <span style={{ color: '#ef4444' }}>Picante</span>
        </h2>
        <p className="section-sub">
          Insultos, desplantes y esas palabras que solo se dicen con confianza o al calor de la bronca.
        </p>

        <div className="grid-3">
          {puteadas.map((w, i) => (
            <div key={w.id} className="card animate-fadeUp" style={{ 
              animationDelay: `${i * 0.1}s`,
              borderColor: 'rgba(239,68,68,0.1)',
              background: 'linear-gradient(135deg, var(--bg-card), rgba(239,68,68,0.03))'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#ef4444' }}>{w.term}</h3>
                <Flame size={20} style={{ color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                {w.meaning}
              </p>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 8, 
                padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                fontSize: 12, color: 'var(--text-muted)'
              }}>
                <Info size={14} />
                <span>Úsese con precaución, mijo.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
