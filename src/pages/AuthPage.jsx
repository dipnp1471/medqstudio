import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        // User is logged in, AuthContext will catch it and redirect
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setSuccessMsg("Registration successful! Please check your email to confirm your account.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '550px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <button 
            className="btn-text" 
            style={{ 
              flex: 1, 
              padding: '1rem', 
              fontWeight: '600', 
              fontSize: '1.1rem',
              color: isLogin ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: isLogin ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
              borderRadius: 0,
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button 
            className="btn-text" 
            style={{ 
              flex: 1, 
              padding: '1rem', 
              fontWeight: '600', 
              fontSize: '1.1rem',
              color: !isLogin ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: !isLogin ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
              borderRadius: 0,
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Register
          </button>
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-muted text-center" style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
          {isLogin 
            ? 'Sign in to access your practice dashboard.' 
            : 'Join to track your progress and compete on the leaderboard.'}
        </p>

        {errorMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-error-border)' }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success-bg, #ecfdf5)', color: 'var(--color-success, #065f46)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-success-border, #a7f3d0)' }}>
            {successMsg}
          </div>
        )}

        {/* Temporarily disabled until Google OAuth is configured
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ margin: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
        </div>
        */}

        <form onSubmit={handleEmailAuth}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              required
              value={email}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)', outline: 'none' }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={password}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)', outline: 'none' }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: '600', marginBottom: '1rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        {isLogin && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/reset-password')}
              className="btn-text" 
              style={{ color: 'var(--color-brand-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
