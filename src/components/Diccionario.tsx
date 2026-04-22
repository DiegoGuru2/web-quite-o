import { type WordResponse, type WordPaged, fetchWords, voteWord } from '../services/api';
import { getSupabase } from '../services/supabase';
import { Search, Volume2, ThumbsUp, MessageSquare, Star, RotateCcw } from 'lucide-react';
import ProponerPalabra from './ProponerPalabra';

interface Props {
  initialData: WordPaged;
  limit?: number;
}

export default function Diccionario({ initialData, limit }: Props) {
  const [data, setData] = useState<WordPaged>(initialData);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!limit);

  // Debounced search via Proxy
  useEffect(() => {
    if (search.trim() === '') {
      setData(initialData);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await fetchWords(0, 100, search);
      setData(result);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, initialData]);

  const displayItems = isExpanded ? data.items : data.items.slice(0, limit);

  return (
    <section id="diccionario" className="section">
      <div className="container">
        <div className="section-bar"></div>
        <h2 className="section-title">
          Diccionario <span className="text-gradient">Quiteño</span>
        </h2>
        <p className="section-sub">
          {data.total > 0 ? `${data.total} quiteñismos en línea. ` : ''}Busca y descubre el sabor del dialecto capitalino.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', maxWidth: 520, flex: 1 }}>
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(212,160,23,0.12), transparent)',
              filter: 'blur(8px)', pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '14px 20px', transition: 'border-color 0.2s',
            }}>
              <Search size={18} style={{ color: 'var(--gold)', marginRight: 12, flexShrink: 0 }} />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar palabra... (ej. Achachay, Guambra)"
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 15, width: '100%',
                }}
              />
              {loading && <RotateCcw size={16} className="animate-spin" style={{ color: 'var(--gold)', marginLeft: 10 }} />}
            </div>
          </div>

          <ProponerPalabra />
        </div>

        {data.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 64, marginBottom: 16 }}>🤷‍♂️</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>¡No asoma, veci!</h3>
            <p style={{ maxWidth: 400, margin: '0 auto' }}>No encontramos esa palabra en nuestra base. ¿Por qué no la propones tú mismo?</p>
          </div>
        ) : (
          <>
            <div className="grid-3">
              {displayItems.map((w, i) => (
                <WordCard key={w.id} word={w} delay={i * 0.04} />
              ))}
            </div>
            
            {!isExpanded && data.items.length > limit! && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button onClick={() => setIsExpanded(true)} className="btn-outline" style={{ padding: '14px 32px' }}>
                  Ver todos los quiteñismos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}


function WordCard({ word: w, delay }: { word: WordResponse; delay: number }) {
  const catName = w.categories?.length > 0 ? w.categories[0].name : 'General';
  const example = w.examples?.length > 0 ? w.examples[0].sentence : null;

  return (
    <div className="card animate-fadeUp" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <span className="tag tag-gold" style={{ marginBottom: 6 }}>{catName}</span>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{w.term}</h3>
          {w.origin && (
            <p style={{ fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', marginTop: 4, fontWeight: 600 }}>
              Origen: {w.origin}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {w.is_featured && (
            <div style={{
              width: 34, height: 34, borderRadius: 999,
              background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="Palabra Destacada">
              <Star size={15} style={{ color: 'var(--gold)' }} />
            </div>
          )}
          {w.audio_url && (
            <button onClick={() => new Audio(w.audio_url!).play()} style={{
              width: 34, height: 34, borderRadius: 999,
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)', transition: 'all 0.2s',
            }} title="Escuchar">
              <Volume2 size={15} />
            </button>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
        {w.meaning}
      </p>

      {example && (
        <p style={{
          fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic',
          borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8,
        }}>
          &ldquo;{example}&rdquo;
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={async () => {
              const sb = getSupabase();
              if (!sb) return;
              const { data: { session } } = await sb.auth.getSession();
              if (!session) { alert("¡Inicia sesión para votar, veci!"); return; }
              const ok = await voteWord(w.slug, 1, session.access_token);
              if (ok) alert("¡Voto registrado! 🎉");
              else alert("Ya has votado o hubo un error.");
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, 
              color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: 'none', 
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer' 
            }}
          >
            <ThumbsUp size={13} /> {w.vote_count || 0}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', padding: '6px 0' }}>
            <MessageSquare size={13} /> {w.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
