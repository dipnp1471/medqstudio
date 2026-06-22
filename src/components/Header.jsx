import { LogIn, UserPlus, Moon, Sun, User, LogOut } from 'lucide-react';
import Logo from './Logo';

export default function Header({ currentPage, setCurrentPage, onOpenAuth, theme, toggleTheme, currentUser, onLogout }) {
  return (
    <header className="navbar animate-fade">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="logo-container" onClick={() => setCurrentPage('home')}>
          <Logo size={34} />
          <span className="logo-text" style={{ color: 'var(--color-text-main)', display: 'flex', alignItems: 'center' }}>
            Med <span style={{ color: 'var(--color-brand-primary)', marginLeft: '0.25rem' }}>Q</span> 
            <span style={{ fontSize: '0.8rem', fontWeight: '500', letterSpacing: '0.15em', textTransform: 'uppercase', marginLeft: '0.5rem', color: 'var(--color-text-muted)' }}>Studios</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <nav>
          <ul className="nav-menu">
            <li 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </li>
            <li 
              className={`nav-link ${currentPage === 'practice' ? 'active' : ''}`}
              onClick={() => setCurrentPage('practice')}
            >
              Free Practice
            </li>
            {currentUser && (
              <li 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard
              </li>
            )}
            <li 
              className={`nav-link ${currentPage === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setCurrentPage('how-it-works')}
            >
              How It Works
            </li>
            {currentUser?.role === 'admin' && (
              <li 
                className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentPage('admin')}
              >
                Admin Panel
              </li>
            )}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Moon size={16} style={{ color: 'var(--color-brand-secondary)' }} />
                <span className="theme-toggle-text">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={16} style={{ color: 'hsl(38, 90%, 50%)' }} />
                <span className="theme-toggle-text">Light Mode</span>
              </>
            )}
          </button>
          
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.4rem 0.75rem', 
                  backgroundColor: 'var(--color-brand-light)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <User size={14} style={{ color: 'var(--color-brand-secondary)' }} />
                <span className="user-name-text" style={{ color: 'var(--color-text-main)' }}>{currentUser.displayName}</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuth('login')}>
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
