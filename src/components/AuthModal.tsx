import React, { useState } from 'react';
import { getSupabase } from '../services/supabase';
import { 
  X, Chrome, Facebook, Loader2 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    setMessage(null);

    const { error } = isRegister 
      ? await sb.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: displayName }
          }
        })
      : await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      if (isRegister) {
        setMessage({ text: '¡Cuenta creada! Verifica tu correo electrónico.', type: 'success' });
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ text: 'Ingresa tu correo para el enlace mágico.', type: 'error' });
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: '¡Enlace enviado! Revisa tu correo.', type: 'success' });
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div className="card animate-fadeUp" style={{
        width: '100%', maxWidth: 440, padding: '48px 40px',
        position: 'relative', overflow: 'hidden',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: 24, right: 24,
          background: 'transparent', color: 'var(--text-muted)', border: 'none',
        }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Accede con Google, Facebook o tu correo.
          </p>
        </div>

        {/* Social Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          <button onClick={() => handleOAuth('google')} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '14px', borderRadius: 12, background: 'var(--bg-secondary)',
            border: '2px solid var(--border)', fontWeight: 700, fontSize: 15,
            transition: 'all 0.2s', color: 'var(--text-primary)',
          }}>
            <Chrome size={20} color="#EA4335" /> Continuar con Google
          </button>
          <button onClick={() => handleOAuth('facebook')} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '14px', borderRadius: 12, background: '#1877F2',
            color: '#fff', fontWeight: 700, fontSize: 15,
            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(24,119,242,0.2)'
          }}>
            <Facebook size={20} fill="#fff" /> Continuar con Facebook
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontWeight: 600 }}>o con correo</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isRegister && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Nombre completo</label>
              <div style={{ position: 'relative' }}>
                <input required type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Tu nombre veci..."
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', outline: 'none', fontSize: 15,
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: 15,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: 15,
                }}
              />
            </div>
          </div>

          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: message.type === 'success' ? '#22c55e' : '#ef4444',
            }}>{message.text}</div>
          )}

          <button type="submit" disabled={loading} style={{ 
            width: '100%', justifyContent: 'center', padding: '16px',
            background: '#54a0d1', // Matching the blue in the image
            color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 16,
            transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(84,160,209,0.3)',
          }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>{isRegister ? 'Crear cuenta' : 'Entrar'}</>
            )}
          </button>

          {!isRegister && (
            <button type="button" onClick={handleMagicLink} disabled={loading} style={{
              background: 'transparent', color: 'var(--gold)', fontSize: 12, fontWeight: 600,
              textAlign: 'center', marginTop: -8,
            }}>
              Usar enlace mágico (sin contraseña)
            </button>
          )}
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button onClick={() => setIsRegister(!isRegister)} style={{
            background: 'transparent', color: '#60a5fa', fontWeight: 700, marginLeft: 6
          }}>
            {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
