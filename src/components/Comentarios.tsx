import React, { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabase';
import { fetchComments, postComment, type CommentResponse, type WordResponse } from '../services/api';
import { MessageCircle, Send, ChevronDown } from 'lucide-react';

interface Props {
  initialWords: WordResponse[];
}

export default function Comentarios({ initialWords }: Props) {
  const [words] = useState<WordResponse[]>(initialWords);
  const [selectedSlug, setSelectedSlug] = useState(initialWords[0]?.slug || '');
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (selectedSlug) loadComments(selectedSlug);
  }, []);

  const loadComments = async (slug: string) => {
    setLoadingComments(true);
    const data = await fetchComments(slug);
    setComments(data);
    setLoadingComments(false);
  };

  const handleSlugChange = (slug: string) => {
    setSelectedSlug(slug);
    loadComments(slug);
  };

  const handleSubmit = async () => {
    if (!comment.trim() || !selectedSlug) return;
    const sb = getSupabase();
    if (!sb) { setMessage('Configura Supabase para comentar.'); return; }
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { setMessage('Inicia sesión con Google para comentar.'); return; }

    setSending(true);
    const result = await postComment(selectedSlug, comment, session.access_token);
    if (result) {
      setComment('');
      setMessage('¡Comentario enviado, veci! 🎉');
      loadComments(selectedSlug);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage('Error al enviar. Intenta de nuevo.');
    }
    setSending(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffH = Math.floor((now.getTime() - date.getTime()) / 3600000);
      if (diffH < 1) return 'hace unos minutos';
      if (diffH < 24) return `hace ${diffH}h`;
      return `hace ${Math.floor(diffH / 24)}d`;
    } catch { return ''; }
  };

  return (
    <section id="comentarios" className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-bar" style={{ margin: '0 auto 24px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            <MessageCircle size={36} style={{ display: 'inline', color: '#60a5fa', verticalAlign: 'middle', marginRight: 12 }} />
            <span style={{ color: '#60a5fa' }}>Comentarios</span> de la Comunidad
          </h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '12px auto 0' }}>
            ¿Conoces una palabra que falta? ¡Cuéntanos, veci!
          </p>
        </div>

        {/* Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Ver comentarios de:</span>
          <div style={{ position: 'relative' }}>
            <select value={selectedSlug} onChange={e => handleSlugChange(e.target.value)}
              style={{
                appearance: 'none', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '8px 36px 8px 14px', color: 'var(--text-primary)',
                fontSize: 14, fontWeight: 600, outline: 'none', cursor: 'pointer',
              }}
            >
              {words.map(w => (
                <option key={w.slug} value={w.slug}>{w.term}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#60a5fa', fontSize: 14 }}>Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>💬</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No hay comentarios aún. ¡Sé el primero, veci!
              </p>
            </div>
          ) : (
            comments.map(c => <CommentItem key={c.id} comment={c} formatDate={formatDate} />)
          )}
        </div>

        {/* Form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)', padding: 28, boxShadow: 'var(--shadow-sm)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>
            Comentar sobre: <span style={{ color: 'var(--gold)' }}>{words.find(w => w.slug === selectedSlug)?.term || selectedSlug}</span>
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Escribe tu comentario aquí, veci..."
              rows={3}
              style={{
                flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', outline: 'none',
                lineHeight: 1.6, transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button onClick={handleSubmit} disabled={sending || !comment.trim()} className="btn-gold"
              style={{ alignSelf: 'flex-end', padding: '12px 20px', opacity: sending || !comment.trim() ? 0.5 : 1 }}>
              <Send size={16} />
            </button>
          </div>
          {message && (
            <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: message.includes('🎉') ? '#22c55e' : '#ff6b6b' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CommentItem({ comment: c, formatDate }: { comment: CommentResponse; formatDate: (d: string) => string }) {
  return (
    <div>
      <div className="animate-fadeUp" style={{
        display: 'flex', gap: 14, padding: 22,
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999, flexShrink: 0,
          background: `hsl(${(c.author_id?.charCodeAt(0) || 0) * 37 % 360}, 40%, 40%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff',
        }}>
          {c.author_id?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{c.author_id?.slice(0, 8) || 'Anónimo'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.content}</p>
        </div>
      </div>
      {c.replies?.length > 0 && (
        <div style={{ marginLeft: 48, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.replies.map(r => <CommentItem key={r.id} comment={r} formatDate={formatDate} />)}
        </div>
      )}
    </div>
  );
}
