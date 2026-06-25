import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import FreePractice from './pages/FreePractice';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { db } from './services/db';

export default function App() {
  const navigate = useNavigate();
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
    navigate('/');
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

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Study Workspace */}
      <main className="main-content">
        {loadingQuestions ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="text-center">
              <div style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand-secondary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
              <p className="text-muted">Loading questions...</p>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home questions={questions} />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route 
              path="/practice" 
              element={
                <FreePractice 
                  questions={questions} 
                  onFlagQuestion={handleFlagQuestion} 
                  currentUser={currentUser} 
                />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <UserDashboard 
                  currentUser={currentUser} 
                  questions={questions} 
                  updateQuestions={updateQuestions} 
                  onLoginSuccess={handleLoginSuccess}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                currentUser?.role === 'admin' ? (
                  <AdminDashboard questions={questions} updateQuestions={updateQuestions} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      {/* Footer Details */}
      <Footer />
    </div>
  );
}

