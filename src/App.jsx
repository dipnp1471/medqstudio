import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import FreePractice from './pages/FreePractice';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AuthPage from './pages/AuthPage';
import ResetPassword from './pages/ResetPassword';
import { db } from './services/db';
import { useAuth } from './context/AuthContext';
import { questions as defaultQuestions } from './data/questions';

export default function App() {
  const { currentUser, dbUser, loading: authLoading, logout } = useAuth();

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

  // Synchronously initialize with cached or built-in questions for instant 0ms load
  const [questions, setQuestions] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_questions');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore cache parse errors
    }
    return defaultQuestions || [];
  });

  // Revalidate questions in background without blocking the UI
  useEffect(() => {
    let isMounted = true;
    const loadQs = async () => {
      try {
        const loaded = await db.getQuestions();
        if (isMounted && loaded && loaded.length > 0) {
          setQuestions(loaded);
        }
      } catch (err) {
        console.error("Failed to load questions from database in background", err);
      }
    };
    loadQs();
    return () => { isMounted = false; };
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

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={dbUser} // Use dbUser for alias and role
        onLogout={logout}
      />

      {/* Main Study Workspace */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home questions={questions} />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route 
            path="/practice" 
            element={
              <FreePractice 
                questions={questions} 
                onFlagQuestion={handleFlagQuestion} 
                currentUser={dbUser} 
              />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              authLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                  <div className="text-center">
                    <div style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand-secondary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                    <p className="text-muted">Loading Dashboard...</p>
                  </div>
                </div>
              ) : currentUser ? (
                <UserDashboard 
                  currentUser={dbUser || { email: currentUser.email, alias: currentUser.email?.split('@')[0], role: 'user' }} 
                  questions={questions} 
                  updateQuestions={updateQuestions} 
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              authLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                  <div className="text-center">
                    <div style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand-secondary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                    <p className="text-muted">Verifying permissions...</p>
                  </div>
                </div>
              ) : dbUser?.role === 'admin' ? (
                <AdminDashboard questions={questions} updateQuestions={updateQuestions} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Details */}
      <Footer />
    </div>
  );
}
