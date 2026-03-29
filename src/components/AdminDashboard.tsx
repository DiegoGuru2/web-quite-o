import React, { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabase';
import { fetchWords, type WordResponse, type WordPaged, type QuizQuestionResponse, fetchQuizQuestions } from '../services/api';
import {
  CheckCircle2, XCircle, Clock, LayoutGrid,
  MessageSquare, ShieldAlert, ArrowUpRight, TrendingUp, RotateCcw, 
  Plus, MessageCircleQuestion, HelpCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [words, setWords] = useState<WordResponse[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionResponse[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    comments: 342,
    votes: '+52'
  });

  const [activeTab, setActiveTab] = useState<'words' | 'questions'>('words');

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAdmin(session?.user?.user_metadata?.is_admin || false);
      setLoading(false);
      if (session?.user?.user_metadata?.is_admin) {
        loadWords();
        loadQuestions();
      }
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAdmin(session?.user?.user_metadata?.is_admin || false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadWords = async () => {
    const data: WordPaged = await fetchWords(0, 100);
    setWords(data.items);
    setStats(prev => ({ 
      ...prev, 
      total: data.total, 
      pending: data.items.filter(w => !w.is_active).length 
    }));
  };

  const loadQuestions = async () => {
    const data = await fetchQuizQuestions();
    setQuestions(data);
  };

  const handleAction = async (slug: string, action: 'approve' | 'delete') => {
    if (!session?.access_token) return;
    if (!window.confirm(`¿Seguro que quieres ${action === 'approve' ? 'aprobar' : 'eliminar'} este término, veci?`)) return;

    try {
      const url = `https://lectorquite-o.vercel.app/api/v1/lexicon/words/${slug}${action === 'approve' ? '/approve' : ''}`;
      const method = action === 'approve' ? 'PUT' : 'DELETE';
      const resp = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        alert("¡Operación exitosa!");
        loadWords();
      }
    } catch { alert('Error de conexión.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100, color: 'var(--gold)' }}>
      <RotateCcw className="animate-spin" size={32} />
    </div>
  );

  if (!isAdmin) return (
    <div className="card animate-fadeUp" style={{
      maxWidth: 540, margin: '80px auto', padding: '60px 48px',
      textAlign: 'center', borderColor: 'rgba(239,68,68,0.2)',
    }}>
      <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto 24px' }} />
      <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
        ¡No seas batracio!
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Zona restringida para administradores.</p>
      <a href="/" className="btn-gold">Volver al Inicio</a>
    </div>
  );

  return (
    <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        {[
          { label: 'Total Léxico', value: stats.total, icon: LayoutGrid, color: '#60a5fa' },
          { label: 'Preguntas Trivia', value: questions.length, icon: HelpCircle, color: 'var(--gold)' },
          { label: 'Comentarios', value: stats.comments, icon: MessageCircleQuestion, color: '#4ade80' },
          { label: 'Vistas Hoy', value: stats.votes, icon: TrendingUp, color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--bg-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
                border: '1px solid var(--border)',
              }}><s.icon size={24} /></div>
              <ArrowUpRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</span>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button 
          onClick={() => setActiveTab('words')}
          className={activeTab === 'words' ? 'btn-gold' : 'btn-outline'}
          style={{ padding: '12px 24px' }}
        >
          <LayoutGrid size={18} /> Gestión de Léxico
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          className={activeTab === 'questions' ? 'btn-gold' : 'btn-outline'}
          style={{ padding: '12px 24px' }}
        >
          <HelpCircle size={18} /> Gestión de Trivia
        </button>
      </div>

      {/* Main Table Area */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '28px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {activeTab === 'words' ? 'Control de Palabras' : 'Control de Trivia'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Moderación y edición en tiempo real.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-outline" style={{ borderRadius: 12 }}><Plus size={18} /> Añadir {activeTab === 'words' ? 'Término' : 'Pregunta'}</button>
            <button onClick={activeTab === 'words' ? loadWords : loadQuestions} className="btn-outline" style={{ borderRadius: 12 }}><RotateCcw size={18} /></button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {activeTab === 'words' ? (
                  ['Término', 'Categoría', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '16px 40px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))
                ) : (
                  ['Pregunta', 'Respuestas', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '16px 40px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'words' ? (
                words.map(w => (
                  <tr key={w.id}>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{w.term}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.meaning.slice(0, 50)}...</div>
                    </td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                      <span className="tag tag-blue">{w.categories[0]?.name || 'Gral'}</span>
                    </td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      {w.is_active ? <span style={{ color: '#22c55e' }}>● Activa</span> : <span style={{ color: 'var(--gold)' }}>○ Pendiente</span>}
                    </td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!w.is_active && <button onClick={() => handleAction(w.slug, 'approve')} className="tag tag-gold"><CheckCircle2 size={14} /></button>}
                        <button onClick={() => handleAction(w.slug, 'delete')} className="tag" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}><XCircle size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                questions.map(q => (
                  <tr key={q.id}>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{q.question}</td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{q.answers.length} opciones</td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13, color: '#22c55e' }}>● Activa</td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                       <button className="tag" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}><XCircle size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
