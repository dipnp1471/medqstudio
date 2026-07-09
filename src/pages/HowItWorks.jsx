import { BrainCircuit, Milestone, TrendingUp, Users, HeartHandshake, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      <div className="info-page-header">
        <h1 className="info-page-title">How It Works</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          The cognitive science and platform design principles behind our MSRA revision methodology.
        </p>
      </div>

      <div className="info-content-card">
        {/* Concept 1: Active Recall */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrainCircuit size={28} style={{ color: 'var(--color-brand-secondary)' }} />
            <h3 style={{ margin: 0 }}>Active Recall vs. Passive Reading</h3>
          </div>
          <p>
            Study after study shows that re-reading textbooks or highlighting notes is one of the least effective revision techniques. In contrast, **testing yourself** (forcing your brain to retrieve clinical knowledge under exam-like constraints) stimulates synaptic connections, solidifying memory pathways.
          </p>
          <p>
            Med Q Studios exposes you to realistic scenarios instantly. Answering a question incorrectly and reading the detailed rationale immediately creates a "prediction error" in your brain, making the corrected clinical fact highly memorable.
          </p>
        </div>

        {/* Concept 2: Spaced Repetition */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Milestone size={28} style={{ color: 'var(--color-brand-secondary)' }} />
            <h3 style={{ margin: 0 }}>Targeted Weakness Intervention</h3>
          </div>
          <p>
            True efficiency comes from practicing what you *don't* know. In our unregistered free mode, you receive a completely randomized distribution of questions.
          </p>
          <p>
            When you register a free account, our dashboard monitors your accuracy across the 12 clinical specialties. If you are consistently scoring 80% on *Cardiovascular* but struggling at 45% in *Paediatrics*, the system automatically recommends subtopic drills to patch your knowledge gaps.
          </p>
        </div>

        {/* Concept 3: Motivation through Competition */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <TrendingUp style={{ color: 'var(--color-brand-secondary)' }} size={24} />
              <h3 style={{ margin: 0 }}>Analytics Dashboard</h3>
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              Track your daily targets, accuracy margins, and question count timelines. Visualizing progress keeps you motivated and ensures consistent study habits.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Users style={{ color: 'var(--color-brand-secondary)' }} size={24} />
              <h3 style={{ margin: 0 }}>Leaderboard Rankings</h3>
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              Engage with our weekly and monthly leaderboards. See how your revision volumes match up against other UK medical candidates preparing for the same recruitment cycle.
            </p>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lightbulb size={28} style={{ color: 'var(--color-brand-secondary)' }} />
            <h3 style={{ margin: 0 }}>Our Recommended Revision Strategy</h3>
          </div>
          <p>
            To optimize your MSRA score, we recommend structuring your daily prep using these three practical guidelines:
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
            <li>
              <strong>Answer a High Volume of Questions:</strong> Aim for high repetition to maximize active recall. Exposing your brain to diverse scenarios forces retrieval and locks down facts much better than passive reading.
            </li>
            <li>
              <strong>Use as a Companion:</strong> Treat Med Q Studios as a powerful clinical companion alongside your primary question banks. It provides a fast, dedicated workspace to reinforce key guidelines and professional dilemmas.
            </li>
            <li>
              <strong>Replace Unproductive Habits:</strong> Turn idle moments into active learning. Instead of scrolling through social media during breaks, open Med Q Studios for a quick set of 3 to 5 questions. These micro-revision sessions build massive long-term retention.
            </li>
          </ul>
        </div>

        {/* CTA Banner */}
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            background: 'var(--color-brand-light)', 
            border: '1px dashed var(--color-brand-secondary)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <HeartHandshake size={32} style={{ color: 'var(--color-brand-secondary)' }} />
          </div>
          <h3 style={{ color: 'var(--color-brand-primary)' }}>Start Your Revision Today</h3>
          <p style={{ fontSize: '0.95rem', margin: '0.5rem auto 1.5rem auto', maxWidth: '600px' }}>
            Unlock the free random practice engine or register to activate data-driven learning diagnostics.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/practice')}>
              Access Free Practice Mode
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login?tab=register')}>
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

