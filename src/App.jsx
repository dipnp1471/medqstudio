import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import FreePractice from './pages/FreePractice';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { ShieldAlert, LogIn, Home as HomeIcon } from 'lucide-react';
import { db } from './services/db';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user from localStorage', e);
      }
    }
    return null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const loadQs = async () => {
      try {
        const loaded = await db.getQuestions();
        setQuestions(loaded);
      } catch (err) {
        console.error("Failed to load questions from database", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQs();
  }, []);

  const updateQuestions = async (newQuestions) => {
    try {
      const updated = await db.saveAllQuestions(newQuestions);
      setQuestions(updated);
    } catch (err) {
      console.error("Failed to save questions", err);
    }
  };

  const handleFlagQuestion = async (id, text) => {
    try {
      const updated = await db.flagQuestion(id, text);
      setQuestions(updated);
    } catch (err) {
      console.error("Failed to flag question", err);
    }
  };

  const handleOpenAuth = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  const renderPage = () => {
    if (loadingQuestions) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="text-center">
            <div style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand-secondary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <p className="text-muted">Loading questions...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'practice':
        return (
          <FreePractice 
            questions={questions} 
            onOpenAuth={handleOpenAuth} 
            onFlagQuestion={handleFlagQuestion} 
            currentUser={currentUser} 
          />
        );
      case 'dashboard':
        if (currentUser) {
          return <UserDashboard currentUser={currentUser} questions={questions} updateQuestions={updateQuestions} />;
        } else {
          // Fallback if accessed without login
          return (
            <FreePractice 
              questions={questions} 
              onOpenAuth={handleOpenAuth} 
              onFlagQuestion={handleFlagQuestion} 
              currentUser={currentUser} 
            />
          );
        }
      case 'how-it-works':
        return <HowItWorks setCurrentPage={setCurrentPage} onOpenAuth={handleOpenAuth} />;
      case 'admin':
        if (currentUser?.role === 'admin') {
          return <AdminDashboard questions={questions} updateQuestions={updateQuestions} />;
        } else {
          return (
            <div 
              className="card animate-fade text-center" 
              style={{ 
                maxWidth: '600px', 
                margin: '4rem auto', 
                padding: '3rem 2rem',
                border: '1px solid var(--color-error-border)'
              }}
            >
              <div 
                style={{ 
                  width: '4rem', 
                  height: '4rem', 
                  backgroundColor: 'var(--color-error-bg)', 
                  color: 'var(--color-error)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem auto' 
                }}
              >
                <ShieldAlert size={36} />
              </div>
              <h2 style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '1.75rem' }}>
                Access Denied
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                The Admin Panel is reserved for administrators only. If you have admin credentials, please sign in. Otherwise, return to the practice area.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleOpenAuth('login')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <LogIn size={16} />
                  Sign In as Admin
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setCurrentPage('home')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <HomeIcon size={16} />
                  Return Home
                </button>
              </div>
            </div>
          );
        }
      case 'home':
      default:
        return <Home questions={questions} setCurrentPage={setCurrentPage} onOpenAuth={handleOpenAuth} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenAuth={handleOpenAuth} 
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Study Workspace */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Footer Details */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Login & Register Modal Dialog */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={handleCloseAuth} 
        initialTab={authModalTab} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
