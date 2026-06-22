import { Play, UserCheck, BookOpen, Brain, Trophy, ShieldAlert } from 'lucide-react';

export default function Home({ questions, setCurrentPage, onOpenAuth }) {
  return (
    <div className="animate-fade">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Practice high volumes of questions and consolidate your knowledge and memory.
        </h1>
        <p className="hero-subtitle">
          Practice your applied clinical knowledge and professional dilemmas.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setCurrentPage('practice')}>
            <Play size={18} strokeWidth={2.5} />
            <span>Try Free Practice Mode</span>
          </button>
          <button className="btn btn-secondary" onClick={() => onOpenAuth('register')}>
            <UserCheck size={18} />
            <span>Create Free Account</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{questions ? questions.length : 0}</div>
            <div className="stat-label">High-Yield Questions</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">A free platform driven by the community</h2>

        <div className="grid-2">
          {/* Benefit 1 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <Brain size={24} />
            </div>
            <h3>Active Recall & Spaced Repetition</h3>
            <p className="text-muted">
              Test yourself on questions to force active recall. Repeating question themes with spaced repition to consolidate your knowledge over days and week.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <BookOpen size={24} />
            </div>
            <h3>Various question types covered</h3>
            <p className="text-muted">
              Fully covers Problem Solving and applied clinical knowledge (questions across 12 specialties) and Professional Dilemmas (situational judgement tests).
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <Trophy size={24} />
            </div>
            <h3>Competitive Leaderboards</h3>
            <p className="text-muted">
              Rank anonymously against other candidates on weekly and monthly correct-answer tallies. Leverage peer motivation to drive consistent daily practice.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <ShieldAlert size={24} />
            </div>
            <h3>Community driven</h3>
            <p className="text-muted">
              Questions are reveiwed by clinicians and updated as guidelines change. Flag questions and get the opportunity to add your own questions to the bank for others to appreciate.
            </p>
          </div>
        </div>
      </section>

      {/* Revision Science CTA Card */}
      <section style={{ margin: '4rem 0 2rem 0' }}>
        <div
          className="card card-lg"
          style={{
            background: 'linear-gradient(135deg, #161a22 0%, #0f1115 100%)',
            color: 'var(--color-text-light)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: 'var(--color-text-light)', fontSize: '2rem' }}>Ready to optimize your study time?</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            Get started immediately with our free random practice mode. No log-in required. Unlock topic-wise filtering, timed mocks, and dashboard history when you register.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setCurrentPage('practice')}>
              Start Free Practice Now
            </button>
            <button
              className="btn btn-outline"
              onClick={() => onOpenAuth('register')}
              style={{ color: 'var(--color-brand-primary)', borderColor: 'var(--color-brand-primary)' }}
            >
              Sign Up for Progress Tracking
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
