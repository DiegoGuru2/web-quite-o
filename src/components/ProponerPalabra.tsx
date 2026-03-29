import { useState } from 'react';
import { getSupabase } from '../services/supabase';
import { proposeWord } from '../services/api';
import { PlusCircle, X, Send, RotateCcw } from 'lucide-react';

export default function ProponerPalabra() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      setMsg({ text: 'Inicia sesión con Google para proponer, veci.', type: 'error' });
      return;
    }

    setLoading(true);
    // Asumiendo que la categoria 1 es "General"
    const result = await proposeWord(term, meaning, 1, session.access_token);
    if (result) {
      setMsg({ text: '¡Propuesta enviada, veci! Un administrador la revisará pronto.', type: 'success' });
      setTerm('');
      setMeaning('');
      setTimeout(() => { setOpen(false); setMsg(null); }, 3000);
    } else {
      setMsg({ text: 'Error al enviar. Intenta de nuevo.', type: 'error' });
    }
    setLoading(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-outline animate-fadeUp delay-4" style={{ marginTop: 20 }}>
      <PlusCircle size={16} /> Proponer una palabra
    </button>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={() => setOpen(false)}>
      <div className="glass animate-fadeUp" style={{
        width: '100%', maxWidth: 500, padding: 32,
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setOpen(false)} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'transparent', color: 'var(--text-muted)', border: 'none',
        }}>
          <X size={24} />
        </button>

        <h3 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
          Propón tu <span className="text-gradient">Quiteñismo</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          ¿Conoces una expresión que no está en el diccionario? ¡Compártela con la comunidad!
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Término / Palabra</label>
            <input required type="text" value={term} onChange={e => setTerm(e.target.value)}
              placeholder="Ej. Batracio, Chapa, Chiro..."
              style={{
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Significado / Definición</label>
            <textarea required rows={3} value={meaning} onChange={e => setMeaning(e.target.value)}
              placeholder="Explica qué significa vici..."
              style={{
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {msg && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: msg.type === 'success' ? '#22c55e' : '#ef4444',
            }}>{msg.text}</div>
          )}

          <button disabled={loading} type="submit" className="btn-gold" style={{ padding: '16px', marginTop: 8, justifyContent: 'center' }}>
            {loading ? <RotateCcw className="animate-spin" size={18} /> : (
              <><Send size={18} /> Enviar Propuesta</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
