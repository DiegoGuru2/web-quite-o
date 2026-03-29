import { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabase';
import { LogIn, LogOut, ShieldCheck, User as UserIcon, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lq-theme');
    const isDark = saved ? saved === 'dark' : true;
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    const sb = getSupabase();
    if (!sb) return;

    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.is_admin || false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.is_admin || false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('lq-theme', next ? 'dark' : 'light');
  };

  const logout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const links = [
    { label: 'Diccionario', href: '#diccionario' },
    { label: 'Puteadas', href: '#puteadas' },
    { label: 'Test Quiteño', href: '#test' },
    { label: 'Comentarios', href: '#comentarios' },
  ];

  const navStyle: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 100, width: '100%',
    background: 'var(--bg-nav)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.3s',
  };

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--gold), #e6a800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--blue-deep)', fontWeight: 900, fontSize: 17,
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 4px 16px rgba(212,160,23,0.25)',
          }}>Q</div>
          <span style={{ fontSize: 19, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
            Lector<span style={{ color: 'var(--gold)' }}>Quiteño</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="desktop-nav">
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >{l.label}</a>
          ))}
          {isAdmin && (
            <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
              <ShieldCheck size={14} /> Admin
            </a>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} aria-label="Cambiar tema" style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', transition: 'all 0.2s',
          }}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', borderRadius: 999,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, overflow: 'hidden', background: '#556' }}>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={14} style={{ margin: 5, color: '#fff' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{user.user_metadata?.full_name?.split(' ')[0] || 'Veci'}</span>
              </div>
              <button onClick={logout} aria-label="Cerrar sesión" style={{
                padding: 8, background: 'transparent', color: 'var(--text-muted)', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <a href="/login" className="btn-gold" style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none' }}>
              <LogIn size={14} /> Iniciar Sesión
            </a>
          )}

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú" className="mobile-menu-btn" style={{
            display: 'none', padding: 8, background: 'transparent',
            color: 'var(--text-primary)',
          }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: 68, left: 0, right: 0,
          background: 'var(--bg-nav)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: 24, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 99,
        }}>
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >{l.label}</a>
          ))}
          {isAdmin && (
            <a href="/admin" onClick={() => setMobileOpen(false)}
              style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} /> Admin
            </a>
          )}
          {!user && (
            <a href="/login" onClick={() => setMobileOpen(false)}
              style={{ fontSize: 16, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogIn size={16} /> Iniciar Sesión
            </a>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
