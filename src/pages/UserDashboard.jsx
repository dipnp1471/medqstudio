import { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import { db } from '../services/db';
import { Trophy, Activity, Edit3, Target, CheckCircle, BarChart3, AlertCircle, HelpCircle, X } from 'lucide-react';

export default function UserDashboard({ currentUser, questions, updateQuestions }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hasSubmitPrivilege, setHasSubmitPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);

  // Practice state
  const [selectedFilters, setSelectedFilters] = useState(['Clinical Problem Solving', 'Professional Dilemmas']);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const availableSpecialties = Array.from(new Set(questions.map(q => q.clinical_area).filter(Boolean))).sort();

  // Submit Question State
  const [newQ, setNewQ] = useState({
    blueprint_tag: 'Clinical Problem Solving',
    question_text: '',
    options: ['', '', '', '', ''],
    correct_answer: '',
    explanation: ''
  });

  const selectQuestion = (paperFilters, specialtyFilters, userStatsHistory = stats?.history || []) => {
    // 1. Find questions matching the filters
    const matching = questions.filter(q => {
      const matchPaper = paperFilters.length === 0 || paperFilters.includes(q.blueprint_tag);
      const matchSpecialty = specialtyFilters.length === 0 || specialtyFilters.includes(q.clinical_area);
      return matchPaper && matchSpecialty;
    });
    if (matching.length === 0) {
      setCurrentQuestion(null);
      setIsReviewMode(false);
      return;
    }

    // 2. Find unanswered ones
    const unanswered = matching.filter(q => !userStatsHistory.includes(q.id));
    if (unanswered.length > 0) {
      const randomIndex = Math.floor(Math.random() * unanswered.length);
      setCurrentQuestion(unanswered[randomIndex]);
      setIsReviewMode(false);
    } else {
      // 3. Fall back to all matching questions (Review Mode)
      const randomIndex = Math.floor(Math.random() * matching.length);
      setCurrentQuestion(matching[randomIndex]);
      setIsReviewMode(true);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const userStats = await db.getUserStats(currentUser.email);
        setStats(userStats);

        const board = await db.getLeaderboard();
        setLeaderboard(board);

        const canSubmit = await db.hasSubmitPrivilege(currentUser.email);
        setHasSubmitPrivilege(canSubmit);

        // Load initial question based on current filter & history
        if (userStats) {
          selectQuestion(selectedFilters, selectedSpecialties, userStats.history || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, questions]);

  const loadNextQuestion = async () => {
    const updatedStats = await db.getUserStats(currentUser.email);
    selectQuestion(selectedFilters, selectedSpecialties, updatedStats?.history || []);
  };

  const handlePaperToggle = (tag) => {
    let newFilters;
    if (selectedFilters.includes(tag)) {
      newFilters = selectedFilters.filter(f => f !== tag);
    } else {
      newFilters = [...selectedFilters, tag];
    }
    setSelectedFilters(newFilters);
    selectQuestion(newFilters, selectedSpecialties, stats?.history || []);
  };

  const handleSpecialtyToggle = (area) => {
    let newFilters;
    if (selectedSpecialties.includes(area)) {
      newFilters = selectedSpecialties.filter(f => f !== area);
    } else {
      newFilters = [...selectedSpecialties, area];
    }
    setSelectedSpecialties(newFilters);
    selectQuestion(selectedFilters, newFilters, stats?.history || []);
  };

  const handleAnswerSubmit = async (isCorrect) => {
    if (!currentQuestion) return;
    try {
      const updatedStats = await db.updateUserStats(currentUser.email, {
        questionId: currentQuestion.id,
        isCorrect
      });
      setStats(updatedStats);
      // Update leaderboard after answer
      const board = await db.getLeaderboard();
      setLeaderboard(board);
    } catch (err) {
      console.error('Failed to save answer', err);
    }
  };

  const handleFlagQuestion = async (id, flagText) => {
    try {
      const updated = await db.flagQuestion(id, flagText);
      updateQuestions(updated);
    } catch (err) {
      console.error('Failed to flag question', err);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQ.options];
    newOptions[index] = value;
    setNewQ({ ...newQ, options: newOptions });
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.question_text || !newQ.correct_answer || newQ.options.some(o => !o)) {
      alert("Please fill in all fields.");
      return;
    }

    const questionToAdd = {
      id: `q${Date.now()}`,
      ...newQ,
      flags: [],
      status: 'Active'
    };

    try {
      const updated = await db.addQuestion(questionToAdd);
      updateQuestions(updated);
      alert("Question submitted successfully!");
      setNewQ({
        blueprint_tag: 'Clinical Problem Solving',
        question_text: '',
        options: ['', '', '', '', ''],
        correct_answer: '',
        explanation: ''
      });
    } catch (err) {
      console.error("Failed to submit question", err);
      alert("Failed to submit question");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container animate-fade" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const accuracy = stats?.totalAnswered > 0 
    ? Math.round((stats.correctAnswered / stats.totalAnswered) * 100) 
    : 0;

  return (
    <div className="dashboard-container animate-fade">
      <div className="practice-sidebar">
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--color-brand-primary)' }}>
            Welcome, {currentUser.displayName}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button 
                className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', gap: '0.5rem' }}
                onClick={() => setActiveTab('stats')}
              >
                <Activity size={16} /> My Statistics
              </button>
            </li>
            <li>
              <button 
                className={`btn ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', gap: '0.5rem' }}
                onClick={() => setActiveTab('practice')}
              >
                <Target size={16} /> Practice Area
              </button>
            </li>
            <li>
              <button 
                className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', gap: '0.5rem' }}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={16} /> Weekly Leaderboard
              </button>
            </li>
            {hasSubmitPrivilege && (
              <li>
                <button 
                  className={`btn ${activeTab === 'submit' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', gap: '0.5rem', backgroundColor: activeTab === 'submit' ? 'var(--color-brand-secondary)' : '', color: activeTab === 'submit' ? '#fff' : '' }}
                  onClick={() => setActiveTab('submit')}
                >
                  <Edit3 size={16} /> Submit Question
                </button>
              </li>
            )}
          </ul>
        </div>

        {activeTab !== 'stats' && stats && (
          <div className="card score-panel">
            <h3 style={{ fontSize: '1rem' }}>Quick Stats</h3>
            <div className="score-radial" style={{ width: '80px', height: '80px', fontSize: '1.25rem', margin: '1rem auto' }}>
              <span>{accuracy}%</span>
            </div>
            <div className="score-stats" style={{ gap: '0.5rem' }}>
              <div className="score-stat-box" style={{ padding: '0.5rem' }}>
                <div className="score-stat-val success" style={{ fontSize: '1.1rem' }}>{stats.correctAnswered}</div>
                <div className="score-stat-lbl">Correct</div>
              </div>
              <div className="score-stat-box" style={{ padding: '0.5rem' }}>
                <div className="score-stat-val" style={{ fontSize: '1.1rem' }}>{stats.totalAnswered}</div>
                <div className="score-stat-lbl">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="question-workspace" style={{ padding: 0 }}>
        
        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="card animate-fade" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <BarChart3 size={24} style={{ color: 'var(--color-brand-secondary)' }} />
              Performance Dashboard
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="card" style={{ background: 'var(--color-brand-light)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-brand-primary)' }}>{stats?.totalAnswered || 0}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Questions Answered</div>
              </div>
              <div className="card" style={{ background: 'var(--color-brand-light)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats?.correctAnswered || 0}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Correct Answers</div>
              </div>
              <div className="card" style={{ background: 'var(--color-brand-light)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-brand-secondary)' }}>{accuracy}%</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Overall Accuracy</div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} /> Weekly Progress
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                You have answered <strong>{stats?.weeklyCorrect || 0}</strong> questions correctly this week.
                Keep practicing to climb the leaderboard!
              </p>
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <div className="animate-fade practice-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Compact Horizontal Filter Bar */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Papers Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-muted)', minWidth: '80px' }}>Papers:</span>
                  {['Clinical Problem Solving', 'Professional Dilemmas'].map(tag => {
                    const isChecked = selectedFilters.includes(tag);
                    const topicStat = stats?.topicStats?.[tag];
                    const accuracy = topicStat && topicStat.total > 0 ? Math.round((topicStat.correct / topicStat.total) * 100) : null;
                    
                    return (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', backgroundColor: isChecked ? 'var(--color-brand-light)' : 'transparent', padding: '0.4rem 1rem', borderRadius: '50px', border: `1px solid ${isChecked ? 'var(--color-brand-secondary)' : 'var(--color-border)'}`, transition: 'all 0.2s' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => handlePaperToggle(tag)} style={{ display: 'none' }} />
                        <span style={{ fontWeight: isChecked ? '600' : '500', color: isChecked ? 'var(--color-brand-primary)' : 'var(--color-text-main)' }}>{tag}</span>
                        {accuracy !== null && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: accuracy >= 70 ? 'var(--color-success)' : (accuracy >= 40 ? 'var(--color-warning)' : 'var(--color-error)'), color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '12px' }} title={`${topicStat?.correct || 0} / ${topicStat?.total || 0} correct`}>
                            {accuracy}%
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Specialties Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-muted)', minWidth: '80px' }}>Specialities:</span>
                  
                  {/* Selected Specialties Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedSpecialties.length === 0 && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>All specialities included</span>
                    )}
                    
                    {selectedSpecialties.map(area => (
                      <div key={area} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-bg-alt)', padding: '0.3rem 0.8rem', borderRadius: '50px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: '500' }}>
                        <span>{area}</span>
                        <button onClick={() => handleSpecialtyToggle(area)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Specialty Dropdown */}
                  {availableSpecialties.filter(s => !selectedSpecialties.includes(s)).length > 0 && (
                    <select 
                      value="" 
                      onChange={(e) => { if(e.target.value) handleSpecialtyToggle(e.target.value); }} 
                      style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: '1px dashed var(--color-brand-secondary)', color: 'var(--color-brand-secondary)', fontSize: '0.85rem', outline: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '500' }}
                    >
                      <option value="">+ Add Speciality...</option>
                      {availableSpecialties.filter(s => !selectedSpecialties.includes(s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Question Workspace */}
            <div className="practice-main" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                {isReviewMode && currentQuestion && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: 'var(--color-brand-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-brand-primary)', fontSize: '0.85rem', fontWeight: '500' }}>
                    <HelpCircle size={14} />
                    <span>Review Mode (All new questions answered)</span>
                  </div>
                )}
              </div>

              {currentQuestion ? (
                <QuestionCard 
                  key={currentQuestion.id}
                  question={currentQuestion} 
                  onAnswerSubmit={handleAnswerSubmit}
                  onNextQuestion={loadNextQuestion}
                  onFlagQuestion={handleFlagQuestion}
                  currentUser={currentUser}
                />
              ) : (
                <div className="card text-center" style={{ padding: '4rem 2rem' }}>
                  <h3>No Questions Available</h3>
                  <p className="text-muted">There are no questions matching your selected filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="card animate-fade" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Trophy size={24} style={{ color: 'var(--color-brand-secondary)' }} />
              Weekly Leaderboard
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Rankings are based on the number of correct answers this week. The leaderboard resets every Sunday. The #1 user earns the privilege to submit a new question to the global question bank!
            </p>

            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <AlertCircle size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
                <p>No activity yet this week. Start practicing to be the first on the board!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Rank</th>
                      <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Alias</th>
                      <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: '600', textAlign: 'right' }}>Correct This Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: currentUser.email === entry.email ? 'var(--color-brand-light)' : 'transparent' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: index === 0 ? 'var(--color-brand-secondary)' : '' }}>
                          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {entry.alias} {currentUser.email === entry.email && <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-brand-primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>You</span>}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--color-success)' }}>
                          {entry.weeklyCorrect}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT QUESTION TAB */}
        {activeTab === 'submit' && hasSubmitPrivilege && (
          <div className="card animate-fade" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-brand-secondary)' }}>
              <Edit3 size={24} />
              Submit a New Question
            </h2>
            <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CheckCircle size={20} />
              <p style={{ margin: 0 }}>Congratulations on topping the leaderboard! You've earned the right to contribute.</p>
            </div>

            <form onSubmit={handleSubmitQuestion}>
              <div className="form-group">
                <label className="form-label">Category / Blueprint Tag</label>
                <select 
                  className="form-input" 
                  value={newQ.blueprint_tag} 
                  onChange={e => setNewQ({...newQ, blueprint_tag: e.target.value})}
                >
                  <option value="Clinical Problem Solving">Clinical Problem Solving</option>
                  <option value="Professional Dilemmas">Professional Dilemmas</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  value={newQ.question_text} 
                  onChange={e => setNewQ({...newQ, question_text: e.target.value})}
                  placeholder="Enter the clinical scenario..."
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Options (Provide 5 options)</label>
                {newQ.options.map((opt, i) => (
                  <input 
                    key={i}
                    type="text" 
                    className="form-input" 
                    style={{ marginBottom: '0.5rem' }}
                    value={opt} 
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    required
                  />
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Correct Answer</label>
                <select 
                  className="form-input" 
                  value={newQ.correct_answer} 
                  onChange={e => setNewQ({...newQ, correct_answer: e.target.value})}
                  required
                >
                  <option value="" disabled>Select correct option...</option>
                  {newQ.options.filter(o => o).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={newQ.explanation} 
                  onChange={e => setNewQ({...newQ, explanation: e.target.value})}
                  placeholder="Explain why the answer is correct..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-brand-secondary)', borderColor: 'var(--color-brand-secondary)' }}>
                Submit to Question Bank
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
