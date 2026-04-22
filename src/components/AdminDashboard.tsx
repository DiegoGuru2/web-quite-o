import React, { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabase';
import { fetchWords, type WordResponse, type WordPaged, type QuizQuestionResponse, fetchQuizQuestions } from '../services/api';
import {
  CheckCircle2, XCircle, LayoutGrid, Edit,
  ShieldAlert, ArrowUpRight, TrendingUp, RotateCcw, 
  Plus, MessageCircleQuestion, HelpCircle, Users
} from 'lucide-react';

interface Props {
  initialWords?: any;
  initialQuestions?: any[];
}

export default function AdminDashboard({ initialWords, initialQuestions }: Props) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [words, setWords] = useState<WordResponse[]>(initialWords?.items || []);
  const [questions, setQuestions] = useState<QuizQuestionResponse[]>(initialQuestions || []);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: initialWords?.total || 0,
    pending: (initialWords?.items || []).filter((w: any) => !w.is_active).length,
    comments: 342,
    votes: '+52'
  });

  const [activeTab, setActiveTab] = useState<'words' | 'questions' | 'users'>('words');

  // Modal states
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuizQuestionResponse>>({ question: '', answers: [] });

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAdmin(session?.user?.user_metadata?.is_admin || false);
      setLoading(false);
      if (session?.user?.user_metadata?.is_admin) {
        // Solo cargamos si no tenemos datos iniciales para evitar que el fallo de CORS en cliente borre los datos del servidor
        if (words.length === 0) loadWords();
        if (questions.length === 0) loadQuestions();
        loadUsers();
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
    const items = data?.items || [];
    setWords(items);
    setStats(prev => ({ 
      ...prev, 
      total: data?.total || 0, 
      pending: items.filter(w => !w.is_active).length 
    }));
  };

  const loadQuestions = async () => {
    const data = await fetchQuizQuestions();
    setQuestions(data || []);
  };

  const loadUsers = async () => {
    const sb = getSupabase();
    if (!sb) return;
    // Se intenta cargar de la tabla 'users' pública (asumiendo que se sincronizan los perfiles ahí)
    const { data, error } = await sb.from('users').select('*').limit(50);
    if (!error && data) {
      setUsersList(data);
    }
  };

  const handleActionWord = async (slug: string, action: 'approve' | 'delete') => {
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

  const handleDeleteQuestion = async (id: number) => {
    if (!session?.access_token) return;
    if (!window.confirm(`¿Seguro que quieres eliminar esta pregunta?`)) return;
    try {
      const resp = await fetch(`https://lectorquite-o.vercel.app/api/v1/lexicon/quiz/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        alert("¡Pregunta eliminada!");
        loadQuestions();
      } else {
        alert("Error al eliminar la pregunta. (Verifica si tu API tiene este endpoint)");
      }
    } catch { alert('Error de conexión.'); }
  };

  const handleSaveQuestion = async () => {
    if (!session?.access_token) return;
    try {
      const method = editingQuestion.id ? 'PUT' : 'POST';
      const url = editingQuestion.id 
        ? `https://lectorquite-o.vercel.app/api/v1/lexicon/quiz/questions/${editingQuestion.id}`
        : `https://lectorquite-o.vercel.app/api/v1/lexicon/quiz/questions`;
        
      const resp = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingQuestion)
      });

      if (resp.ok) {
        alert("¡Pregunta guardada correctamente!");
        setQuestionModalOpen(false);
        loadQuestions();
      } else {
        alert("Error al guardar. La API externa podría no soportar esta acción o requieres permisos.");
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
    <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: 40, position: 'relative' }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        {[
          { label: 'Total Léxico', value: stats.total, icon: LayoutGrid, color: '#60a5fa' },
          { label: 'Preguntas Trivia', value: questions.length, icon: HelpCircle, color: 'var(--gold)' },
          { label: 'Comentarios', value: stats.comments, icon: MessageCircleQuestion, color: '#4ade80' },
          { label: 'Usuarios Registrados', value: usersList.length > 0 ? usersList.length : 'N/A', icon: Users, color: '#a78bfa' },
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
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }}>
        <button 
          onClick={() => setActiveTab('words')}
          className={activeTab === 'words' ? 'btn-gold' : 'btn-outline'}
          style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
        >
          <LayoutGrid size={18} /> Gestión de Léxico
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          className={activeTab === 'questions' ? 'btn-gold' : 'btn-outline'}
          style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
        >
          <HelpCircle size={18} /> Gestión de Trivia
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-gold' : 'btn-outline'}
          style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
        >
          <Users size={18} /> Usuarios
        </button>
      </div>

      {/* Main Table Area */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '28px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {activeTab === 'words' ? 'Control de Palabras' : activeTab === 'questions' ? 'Control de Trivia' : 'Usuarios Registrados'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Moderación y edición en tiempo real.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {activeTab === 'questions' && (
               <button onClick={() => { setEditingQuestion({ question: '', answers: [] }); setQuestionModalOpen(true); }} className="btn-outline" style={{ borderRadius: 12 }}><Plus size={18} /> Añadir Pregunta</button>
            )}
            <button onClick={() => { activeTab === 'words' ? loadWords() : activeTab === 'questions' ? loadQuestions() : loadUsers(); }} className="btn-outline" style={{ borderRadius: 12 }}><RotateCcw size={18} /></button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {activeTab === 'words' && ['Término', 'Categoría', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '16px 40px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
                {activeTab === 'questions' && ['Pregunta', 'Respuestas', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '16px 40px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
                {activeTab === 'users' && ['ID / Nombre', 'Email', 'Rol', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '16px 40px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'words' && words.map(w => (
                <tr key={w.id}>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{w.term}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.meaning.slice(0, 50)}...</div>
                  </td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                    <span className="tag tag-blue">{w.categories?.[0]?.name || 'Gral'}</span>
                  </td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    {w.is_active ? <span style={{ color: '#22c55e' }}>● Activa</span> : <span style={{ color: 'var(--gold)' }}>○ Pendiente</span>}
                  </td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!w.is_active && <button onClick={() => handleActionWord(w.slug, 'approve')} className="tag tag-gold"><CheckCircle2 size={14} /></button>}
                      <button onClick={() => handleActionWord(w.slug, 'delete')} className="tag" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}><XCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'questions' && questions.map(q => (
                <tr key={q.id}>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{q.question}</td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{q.answers?.length || 0} opciones</td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13, color: '#22c55e' }}>● Activa</td>
                  <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', gap: 8 }}>
                       <button onClick={() => { setEditingQuestion(q); setQuestionModalOpen(true); }} className="tag tag-blue" title="Editar"><Edit size={14} /></button>
                       <button onClick={() => handleDeleteQuestion(q.id)} className="tag" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }} title="Eliminar"><XCircle size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'users' && (
                usersList.length > 0 ? usersList.map((u, idx) => (
                  <tr key={u.id || idx}>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{u.full_name || u.id}</td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      {u.is_admin ? <span className="tag tag-gold">Admin</span> : <span className="tag tag-blue">Usuario</span>}
                    </td>
                    <td style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>-</td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay usuarios para mostrar en la tabla pública o no se tienen los permisos.
                     </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preguntas */}
      {isQuestionModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
             <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>{editingQuestion.id ? 'Editar Pregunta' : 'Añadir Pregunta'}</h3>
             
             <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Pregunta</label>
             <input 
               value={editingQuestion.question} 
               onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
               style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: 20 }}
             />

             <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Respuestas (Marca la correcta)</label>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {editingQuestion.answers?.map((ans, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                     <input type="radio" name="correct_answer" checked={ans.is_correct || false} onChange={() => {
                        const newAnswers = editingQuestion.answers!.map((a, i) => ({...a, is_correct: i === idx}));
                        setEditingQuestion({...editingQuestion, answers: newAnswers});
                     }} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
                     <input 
                       value={ans.answer_text}
                       onChange={e => {
                         const newAnswers = [...editingQuestion.answers!];
                         newAnswers[idx].answer_text = e.target.value;
                         setEditingQuestion({...editingQuestion, answers: newAnswers});
                       }}
                       style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                     />
                     <button onClick={() => {
                        const newAnswers = editingQuestion.answers!.filter((_, i) => i !== idx);
                        setEditingQuestion({...editingQuestion, answers: newAnswers});
                     }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={18} /></button>
                  </div>
                ))}
                <button onClick={() => {
                   setEditingQuestion({...editingQuestion, answers: [...(editingQuestion.answers || []), { id: 0, answer_text: 'Nueva opción', is_correct: false }]});
                }} className="btn-outline" style={{ padding: '8px', fontSize: 13, alignSelf: 'flex-start' }}>+ Añadir opción</button>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setQuestionModalOpen(false)} className="btn-outline" style={{ padding: '10px 20px' }}>Cancelar</button>
                <button onClick={handleSaveQuestion} className="btn-gold" style={{ padding: '10px 20px' }}>Guardar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
