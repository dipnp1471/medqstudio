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

  // Guest Practice Set States
  const [setAnsweredCount, setSetAnsweredCount] = useState(0);
  const [setCorrectCount, setSetCorrectCount] = useState(0);
  const [isSetFinished, setIsSetFinished] = useState(false);

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

      // Guest-specific set tracking
      if (!currentUser) {
        setSetAnsweredCount(prev => prev + 1);
        if (isCorrect) {
          setSetCorrectCount(prev => prev + 1);
        }
      }

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
    if (!currentUser && setAnsweredCount >= 5) {
      setIsSetFinished(true);
    } else {
      loadNewQuestion();
    }
  };

  const handleResetSet = () => {
    setSetAnsweredCount(0);
    setSetCorrectCount(0);
    setIsSetFinished(false);
    loadNewQuestion();
  };

  const resetStats = () => {
    setStats({ totalAnswered: 0, correctAnswered: 0 });
    setHistory([]);
    if (!currentUser) {
      setSetAnsweredCount(0);
      setSetCorrectCount(0);
      setIsSetFinished(false);
    }
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

        {/* Practice Set Tracker for Guest Users */}
        {!currentUser && !isSetFinished && (
          <div className="practice-set-tracker" style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-brand-secondary)' }}>Practice Set:</span>
              <span className="text-muted">Question {setAnsweredCount + 1 <= 5 ? setAnsweredCount + 1 : 5} of 5</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((slot) => {
                let dotStyle = {
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.3s ease'
                };
                
                if (slot <= setAnsweredCount) {
                  dotStyle.backgroundColor = 'var(--color-brand-secondary)';
                  dotStyle.borderColor = 'var(--color-brand-secondary)';
                } else if (slot === setAnsweredCount + 1) {
                  dotStyle.backgroundColor = 'transparent';
                  dotStyle.borderColor = 'var(--color-brand-secondary)';
                  dotStyle.transform = 'scale(1.2)';
                } else {
                  dotStyle.backgroundColor = 'var(--color-bg-alt)';
                }
                
                return <div key={slot} style={dotStyle} />;
              })}
            </div>
          </div>
        )}

        {/* Question area / Set Results */}
        {isSetFinished ? (
          <div className="card text-center animate-fade" style={{ padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-light)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--color-brand-secondary)',
              marginBottom: '0.5rem'
            }}>
              <CheckCircle size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Practice Set Completed! 🎉
              </h2>
              <p className="text-muted" style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.95rem' }}>
                Great job! You have completed a 5-question practice set. Here is how you did:
              </p>
            </div>

            {/* Set Score Radial */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid var(--color-border)',
              borderTopColor: 'var(--color-brand-secondary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0.5rem 0'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                {setCorrectCount}/5
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Correct
              </span>
            </div>

            {/* Value Proposition Box */}
            <div className="card" style={{
              maxWidth: '500px',
              width: '100%',
              padding: '1.5rem',
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '600' }}>
                Unlock the complete study platform:
              </h4>
              <ul style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '0.875rem'
              }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-brand-secondary)' }}>📈</span>
                  <div>
                    <strong>Save Score & Analytics:</strong> Track your progress over time. Unregistered stats are lost once you close this tab.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-brand-secondary)' }}>🎯</span>
                  <div>
                    <strong>Topic-Wise Drills:</strong> Target your weak spots and filter questions specifically by 12 clinical specialties.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-brand-secondary)' }}>✍️</span>
                  <div>
                    <strong>Contribute Questions:</strong> Get the opportunity to submit your own high-yield questions to our active community question bank.
                  </div>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '500px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/login?tab=register')}
                style={{ flex: 1, minWidth: '200px', padding: '0.85rem' }}
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleResetSet}
                style={{ flex: 1, minWidth: '200px', padding: '0.85rem' }}
              >
                <RefreshCw size={14} />
                <span>Start Another Set</span>
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          <QuestionCard 
            key={currentQuestion.id}
            question={currentQuestion} 
            onAnswerSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
            onOpenAuth={() => navigate('/login?tab=login')}
            onFlagQuestion={onFlagQuestion}
            currentUser={currentUser}
            isLastInSet={!currentUser && setAnsweredCount === 5}
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
              <li>Contribute questions to the bank</li>
            </ul>
            <button className="btn btn-primary" onClick={() => navigate('/login?tab=register')} style={{ backgroundColor: 'var(--color-brand-secondary)', color: '#fff', border: 'none' }}>
              <span>Create Account</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
