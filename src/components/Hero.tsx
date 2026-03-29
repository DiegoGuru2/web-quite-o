import React from 'react';
import { BookOpen, Flame, Brain, MessageCircle, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '120px 0 80px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 600,
        background: 'radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="animate-fadeUp" style={{ marginBottom: 24 }}>
            <span className="tag tag-gold" style={{ fontSize: 11 }}>
              🇪🇨 Dialecto Capitalino • v2.0
            </span>
          </div>

          <h1 className="animate-fadeUp delay-1" style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.05, marginBottom: 20,
            fontFamily: 'var(--font-heading)',
          }}>
            Habla como un<br />
            <span className="text-gradient">Chulla Quiteño</span>
          </h1>

          <p className="animate-fadeUp delay-2" style={{
            fontSize: 18, color: 'var(--text-secondary)',
            maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Diccionario interactivo, expresiones picantes, trivia y más.
            Todo el poder del Español Quiteño en un solo lugar.
          </p>

          <div className="animate-fadeUp delay-3" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="#diccionario" className="btn-gold">
              <BookOpen size={16} /> Explorar Diccionario
            </a>
            <a href="#test" className="btn-outline">
              <Brain size={16} /> Hacer el Test
            </a>
          </div>
        </div>

        {/* Feature pills */}
        <div className="animate-fadeUp delay-4" style={{
          display: 'flex', justifyContent: 'center', gap: 32, marginTop: 72, flexWrap: 'wrap',
        }}>
          {[
            { icon: BookOpen, label: 'Diccionario', desc: '+500 palabras', href: '#diccionario', color: 'var(--gold)' },
            { icon: Flame, label: 'Puteadas', desc: 'Las picantes', href: '#puteadas', color: '#ff6b6b' },
            { icon: Brain, label: 'Test', desc: 'Trivia Quiz', href: '#test', color: '#a78bfa' },
            { icon: MessageCircle, label: 'Comentarios', desc: 'Comunidad', href: '#comentarios', color: '#60a5fa' },
          ].map((f, i) => (
            <a key={i} href={f.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '20px 28px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              transition: 'all 0.3s', minWidth: 140, textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <f.icon size={24} style={{ color: f.color }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{f.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{f.desc}</span>
            </a>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <ArrowDown size={20} style={{ color: 'var(--text-muted)', animation: 'float 2s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  );
}
