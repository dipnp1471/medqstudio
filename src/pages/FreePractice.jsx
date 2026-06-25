import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import { ArrowRight, RefreshCw, User, CheckCircle } from 'lucide-react';
import { db } from '../services/db';

export default function FreePractice({ questions, onFlagQuestion, currentUser }) {
  const navigate = useNavigate();

  // Filters
  const [paperFilter, setPaperFilter] = useState('All');

  // Question Pool and State
  const [history, setHistory] = useState([]); // Track question IDs answered in this session
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  });

  // Scores
  const [stats, setStats] = useState({
    totalAnswered: 0,
    correctAnswered: 0
  });

  const papers = ['All', 'Clinical Problem Solving', 'Professional Dilemmas'];

  // Compute pool on render
  const filteredPool = questions.filter(q => {
    if (paperFilter !== 'All' && q.blueprint_tag !== paperFilter) return false;
    return true;
  });

  // Load a random question
  const loadNewQuestion = (customPool = filteredPool) => {
    if (customPool.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    // Filter out questions already answered in this session, unless all have been answered
    let available = customPool.filter(q => !history.includes(q.id));
    
    if (available.length === 0) {
      // If all questions in the filtered pool have been answered, reset history for this pool
      available = customPool;
      setHistory([]);
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    setCurrentQuestion(available[randomIndex]);
  };

  const handleFilterChange = (paper) => {
    setPaperFilter(paper);

    const nextPool = questions.filter(q => {
      if (paper !== 'All' && q.blueprint_tag !== paper) return false;
      return true;
    });

    loadNewQuestion(nextPool);
  };

  const handleAnswerSubmit = async (isCorrect) => {
    setStats(prev => ({
      totalAnswered: prev.totalAnswered + 1,
      correctAnswered: prev.correctAnswered + (isCorrect ? 1 : 0)
    }));

    if (currentQuestion) {
      setHistory(prev => [...prev, currentQuestion.id]);

      if (currentUser) {
        try {
          await db.updateUserStats(currentUser.email, {
            questionId: currentQuestion.id,
            isCorrect
          });
        } catch (err) {
          console.error("Failed to update user stats in database", err);
        }
      }
    }
  };

  const handleNextQuestion = () => {
    loadNewQuestion();
  };

  const resetStats = () => {
    setStats({ totalAnswered: 0, correctAnswered: 0 });
    setHistory([]);
    if (filteredPool.length === 0) {
      setCurrentQuestion(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredPool.length);
    setCurrentQuestion(filteredPool[randomIndex]);
  };

  // Calculate accuracy
  const accuracy = stats.totalAnswered > 0 
    ? Math.round((stats.correctAnswered / stats.totalAnswered) * 100) 
    : 0;

  return (
    <div className="practice-container animate-fade">
      {/* Main Study Workspace */}
      <div className="question-workspace">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>MSRA Paper</label>
            <select 
              className="filter-select"
              value={paperFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              {papers.map(paper => (
                <option key={paper} value={paper}>{paper}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Question area */}
        {currentQuestion ? (
          <QuestionCard 
            key={currentQuestion.id}
            question={currentQuestion} 
            onAnswerSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
            onOpenAuth={() => navigate('/dashboard?tab=login')}
            onFlagQuestion={onFlagQuestion}
            currentUser={currentUser}
          />
        ) : (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>No Questions Found</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              No questions match your active filter combination. Try clearing your filters or selecting a different paper.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => handleFilterChange('All')}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Analytics & Sign Up CTA */}
      <div className="practice-sidebar">
        {/* Score Panel */}
        <div className="card score-panel">
          <h3 style={{ fontSize: '1.15rem' }}>Session Progress</h3>
          <div className="score-radial">
            <span>{accuracy}%</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Accuracy Rate
          </p>

          <div className="score-stats">
            <div className="score-stat-box">
              <div className="score-stat-val success">{stats.correctAnswered}</div>
              <div className="score-stat-lbl">Correct</div>
            </div>
            <div className="score-stat-box">
              <div className="score-stat-val error">{stats.totalAnswered - stats.correctAnswered}</div>
              <div className="score-stat-lbl">Incorrect</div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <span>Total Answered: <strong>{stats.totalAnswered}</strong></span>
            <button 
              className="btn-text" 
              onClick={resetStats} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* Sidebar Register / Logged In CTA */}
        {currentUser ? (
          <div 
            className="sidebar-cta" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.12) 100%)', 
              borderColor: 'var(--color-success-border)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ margin: 0, color: 'var(--color-success)' }}>Session Active</h3>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
              Logged in as <strong>{currentUser.displayName}</strong>. Your practice analytics and scores are being recorded.
            </p>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.8rem', 
                color: 'var(--color-text-muted)',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(16, 185, 129, 0.15)' 
              }}
            >
              <User size={14} style={{ color: 'var(--color-brand-secondary)' }} />
              <span>Role: {currentUser.role === 'admin' ? 'Administrator' : 'Candidate'}</span>
            </div>
          </div>
        ) : (
          <div className="sidebar-cta">
            <h3>Save Your Progress</h3>
            <p>
              You are currently revising in **anonymous guest mode**. Your scores will be lost once you close this tab.
            </p>
            <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyleType: 'disc' }}>
              <li>Log performance over time</li>
              <li>Identify clinical weak spots</li>
              <li>Compete on national leaderboards</li>
            </ul>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard?tab=register')} style={{ backgroundColor: 'var(--color-brand-secondary)', color: '#fff', border: 'none' }}>
              <span>Create Account</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
