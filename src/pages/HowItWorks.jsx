import { 
  Zap, 
  Repeat, 
  Users, 
  ArrowRight, 
  Coffee, 
  Smartphone, 
  BookCheck, 
  BarChart3,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div className="info-page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="info-page-title">How to Use Med Q Studios</h1>
        <p className="text-muted" style={{ maxWidth: '580px', margin: '0 auto', fontSize: '1.05rem' }}>
          A high-volume companion question bank built for rapid recall, spaced repetition, and seeing where you stand against other candidates.
        </p>
      </div>

      <div className="how-to-use-container">
        {/* Section 1: Secondary / Companion Question Bank */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-brand-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Layers size={22} style={{ color: 'var(--color-brand-secondary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Built as a Companion Bank</h2>
          </div>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)', fontSize: '0.975rem' }}>
            Keep your primary question bank (Passmedicine, Pastest, etc.) for long study blocks at your desk. Med Q Studios is designed to run alongside it—giving you a quick, lightweight way to test yourself throughout the day.
          </p>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div style={{ background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Primary Bank</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Long clinical vignettes, detailed textbook explanations, and slow first-pass reading.
              </p>
            </div>
            <div style={{ background: 'var(--color-brand-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--color-brand-primary)' }}>Med Q Studios (Companion)</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                Rapid-fire questions, instant rationales, and high-frequency reps anywhere you have 2 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: High Volume & Spaced Repetition */}
        <div className="grid-2" style={{ gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Zap size={22} style={{ color: 'var(--color-brand-secondary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>High Volume & Active Recall</h3>
            </div>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
              Reading notes feels productive, but testing yourself is what actually makes facts stick.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Get through 30–50 quick questions in the time it takes to review a single dense case.</li>
              <li>Build instinctive pattern recognition for common presentations and first-line treatments.</li>
              <li>Spend less time deliberating on exam day.</li>
            </ul>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Repeat size={22} style={{ color: 'var(--color-brand-secondary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Spaced Repetition</h3>
            </div>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
              You naturally forget clinical guidelines if you only cover them once weeks before the exam.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Repeatedly encounter high-yield themes across 12 specialties in short bursts.</li>
              <li>Reinforce past topics while continuing to learn new ones.</li>
              <li>Keep management steps and red flags fresh right up to exam week.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Compare Yourself to Other Candidates */}
        <div className="card" style={{ background: 'linear-gradient(135deg, hsla(200, 96%, 45%, 0.05) 0%, hsla(150, 80%, 35%, 0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Users size={22} style={{ color: 'var(--color-brand-secondary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Compare Yourself to Other Candidates</h2>
          </div>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Revising alone makes it hard to tell where you actually stand. Med Q Studios includes anonymous leaderboards and cohort accuracy stats so you can benchmark your progress.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--color-brand-primary)' }}>Gauge Real Readiness</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                See how your accuracy compares directly to other doctors preparing for the same exam cycle.
              </p>
            </div>

            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--color-brand-primary)' }}>Stay Accountable</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Weekly and monthly question counts give you that extra bit of motivation to keep your daily streak alive.
              </p>
            </div>

            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--color-brand-primary)' }}>Find Your Weak Spots</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                If everyone misses a question, it's just hard. If only you miss it, you know exactly what to revise.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Recommended Daily Routine */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>Recommended Daily Routine</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              A simple way to fit high question volume into a busy hospital or clinic schedule:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="playbook-step-item" style={{ padding: '1rem 1.25rem' }}>
              <div className="playbook-step-number" style={{ width: '2rem', height: '2rem', fontSize: '0.9rem' }}>1</div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Coffee size={15} style={{ color: 'var(--color-brand-secondary)' }} />
                  Morning Warmup (5–10 mins)
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Do 10 quick questions with your morning coffee to wake up your diagnostic brain before work.
                </p>
              </div>
            </div>

            <div className="playbook-step-item" style={{ padding: '1rem 1.25rem' }}>
              <div className="playbook-step-number" style={{ width: '2rem', height: '2rem', fontSize: '0.9rem' }}>2</div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Smartphone size={15} style={{ color: 'var(--color-brand-secondary)' }} />
                  Downtime Micro-Sessions
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Instead of scrolling social media during ward breaks or on the train, do 3–5 quick questions. That's 100+ extra questions completed a week with zero dedicated desk time.
                </p>
              </div>
            </div>

            <div className="playbook-step-item" style={{ padding: '1rem 1.25rem' }}>
              <div className="playbook-step-number" style={{ width: '2rem', height: '2rem', fontSize: '0.9rem' }}>3</div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookCheck size={15} style={{ color: 'var(--color-brand-secondary)' }} />
                  Post-Study Check
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  After studying a specialty in your primary question bank or guidelines, jump on Med Q Studios to test what you actually remember without looking at notes.
                </p>
              </div>
            </div>

            <div className="playbook-step-item" style={{ padding: '1rem 1.25rem' }}>
              <div className="playbook-step-number" style={{ width: '2rem', height: '2rem', fontSize: '0.9rem' }}>4</div>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarChart3 size={15} style={{ color: 'var(--color-brand-secondary)' }} />
                  Weekly Review & Leaderboard Check
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Check your dashboard accuracy across the 12 specialties, target your lowest scoring topics, and see how your weekly volume ranks against peers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            background: 'var(--color-brand-light)',
            border: '1px solid var(--color-brand-secondary)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <h3 style={{ color: 'var(--color-brand-primary)', margin: 0, fontSize: '1.35rem' }}>
            Ready to start practicing?
          </h3>
          <p style={{ fontSize: '0.925rem', margin: 0, maxWidth: '520px', color: 'var(--color-text-muted)' }}>
            Jump into free random practice mode instantly with no account needed, or sign up for free to track your scores and join the leaderboard.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/practice')}>
              <span>Try Free Practice</span>
              <ArrowRight size={15} />
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login?tab=register')}>
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

