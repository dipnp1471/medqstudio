import { useState } from 'react';
import { X, Award, CheckCircle, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { db } from '../services/db';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [alias, setAlias] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setAlias('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'register') {
      try {
        if (email.toLowerCase() === 'admin@medqstudios.com') {
          setErrorMsg('This email address is already registered.');
          return;
        }

        const newUser = await db.registerUser({
          displayName: displayName || email.split('@')[0],
          email: email,
          password: password,
          role: 'user',
          alias: alias || 'Anonymous User'
        });

        onLoginSuccess(newUser);
        setSuccessMsg(`Welcome, ${newUser.displayName}! Your account has been created and you are now signed in.`);
      } catch (err) {
        setErrorMsg(err.message || 'Registration failed.');
      }
    } else {
      if (email.toLowerCase() === 'admin@medqstudios.com' && password === 'admin') {
        const adminUser = {
          displayName: 'Admin Dr. MedQ',
          email: 'admin@medqstudios.com',
          role: 'admin'
        };
        onLoginSuccess(adminUser);
        setSuccessMsg('Successfully signed in as Administrator.');
        return;
      }

      try {
        const matchedUser = await db.loginUser(email, password);
        onLoginSuccess(matchedUser);
        setSuccessMsg(`Welcome back, ${matchedUser.displayName}!`);
      } catch (err) {
        setErrorMsg('Invalid email address or password.');
      }
    }
  };

  return (
    <div className="modal-overlay animate-fade">
      <div className="modal-content animate-pop">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {successMsg ? (
          <div className="text-center animate-fade" style={{ padding: '1rem 0' }}>
            <div 
              style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                backgroundColor: 'var(--color-success-bg)', 
                color: 'var(--color-success)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem auto' 
              }}
            >
              <CheckCircle size={32} />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Success</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {successMsg}
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Continue Practising
            </button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">
              {activeTab === 'login' ? 'Sign In to Your Account' : 'Create Free Account'}
            </h2>
            <p className="modal-subtitle">
              {activeTab === 'login' 
                ? 'Unlock detailed dashboard performance statistics.' 
                : 'Create an account to track your progress and compete on leaderboards.'}
            </p>

            {errorMsg && (
              <div 
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: 'var(--color-error-bg)', 
                  border: '1px solid var(--color-error-border)', 
                  color: 'var(--color-error)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1rem' 
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {activeTab === 'register' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="displayName">Display Name</label>
                    <input
                      type="text"
                      id="displayName"
                      className="form-input"
                      placeholder="e.g. Dr. Sarah J."
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="alias">Leaderboard Alias (Fun Name!)</label>
                    <input
                      type="text"
                      id="alias"
                      className="form-input"
                      placeholder="e.g. Cardio Dolphin 1234"
                      required
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      This is how you will appear on the public leaderboards (e.g. Speciality + Animal + PIN)
                    </p>
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="name@doctors.org.uk"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                {activeTab === 'login' ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* Test credentials helper */}
            {activeTab === 'login' && (
              <div 
                style={{ 
                  marginTop: '1.25rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'var(--color-brand-light)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center'
                }}
              >
                🔑 <strong>Demo Administrator Credentials:</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  Email: <code style={{ color: 'var(--color-brand-secondary)' }}>admin@medqstudios.com</code>
                </div>
                <div>
                  Password: <code style={{ color: 'var(--color-brand-secondary)' }}>admin</code>
                </div>
              </div>
            )}

            {/* Benefits box (Register only) */}
            {activeTab === 'register' && (
              <div 
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: 'var(--color-brand-light)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ fontWeight: '700', color: 'var(--color-brand-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  🔑 Registered Account Benefits:
                </span>
                <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--color-brand-secondary)' }} />
                    Permanent revision progress tracking
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={14} style={{ color: 'var(--color-brand-secondary)' }} />
                    Compete on weekly/monthly leaderboards
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} style={{ color: 'var(--color-brand-secondary)' }} />
                    Full timed exam mode simulations
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HeartPulse size={14} style={{ color: 'var(--color-brand-secondary)' }} />
                    Submit new questions & flag updates
                  </li>
                </ul>
              </div>
            )}

            {/* Toggle Tab */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {activeTab === 'login' ? (
                <>
                  New to Med Q Studios?{' '}
                  <button className="btn-text" onClick={() => handleTabChange('register')}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="btn-text" onClick={() => handleTabChange('login')}>
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
