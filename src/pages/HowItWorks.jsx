import { 
  Brain, 
  Repeat, 
  Layers, 
  Users, 
  Compass, 
  Zap, 
  TrendingUp, 
  Trophy, 
  ArrowRight, 
  Sparkles,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="info-page-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={13} />
            Recommended Revision Strategy
          </span>
        </div>
        <h1 className="info-page-title">How to Use Med Q Studios</h1>
        <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
          Your dedicated secondary revision bank—engineered around high question volume, active recall, spaced repetition, and peer benchmarking.
        </p>
      </div>

      <div className="how-to-use-container">
        {/* The Companion Bank Philosophy */}
        <div className="companion-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={24} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>The Companion Question Bank Philosophy</h2>
          </div>
          <p style={{ margin: 0, lineHeight: '1.7', color: 'var(--color-text-main)' }}>
            Most candidates rely on a traditional primary question bank (such as Passmedicine or Pastest) for their initial syllabus coverage and deep, text-heavy reading. However, relying solely on long, paragraph-dense vignettes makes rapid daily drilling slow, and doing second passes often leads to memorizing familiar question stems rather than genuine clinical concepts.
          </p>
          <p style={{ margin: 0, lineHeight: '1.7', color: 'var(--color-text-main)' }}>
            <strong>Med Q Studios is purposefully built to be your secondary, companion revision engine.</strong> It runs in parallel with your primary revision, offering a lightweight, distraction-free environment focused on fast throughput, active retrieval, and continuous reinforcement.
          </p>

          <div className="companion-grid">
            <div className="companion-pill-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Zap size={18} />
                <span>Zero-Friction Micro-Reps</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Jump in and answer a question within two seconds. Perfect for 5-minute ward breaks, commutes, or quick study intervals.
              </p>
            </div>

            <div className="companion-pill-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <BookOpen size={18} />
                <span>Parallel Reinforcement</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Re-test topics you studied earlier in the week without resetting your main bank’s progress or skewing your primary diagnostic baseline.
              </p>
            </div>

            <div className="companion-pill-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Clock size={18} />
                <span>Working Memory Warmth</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Keep clinical facts, first-line treatments, and red flags warm and circulating right up until exam day.
              </p>
            </div>
          </div>
        </div>

        {/* Section: The Three Core Scientific Pillars */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>The Three Scientific Pillars of Our Bank</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
              Why training with Med Q Studios leads to faster retention and superior exam recall.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Pillar 1: Active Recall */}
            <div className="pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Brain size={26} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>1. Active Recall Over Passive Review</h3>
              </div>
              <p style={{ margin: 0, lineHeight: '1.65' }}>
                Re-reading clinical textbooks and highlighting notes creates the <em>fluency illusion</em>—you recognize the text, so you falsely assume you can produce it under exam conditions. In reality, testing is one of the most powerful learning interventions discovered by cognitive science.
              </p>
              <p style={{ margin: 0, lineHeight: '1.65', color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Forcing your brain to retrieve knowledge under time constraints triggers synaptic consolidation. When you get a question wrong and immediately read the concise clinical rationale, your brain registers a <strong>prediction error</strong>, which dramatically accelerates long-term retention of that specific guideline or diagnostic step.
              </p>
            </div>

            {/* Pillar 2: Spaced Repetition */}
            <div className="pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Repeat size={26} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>2. Spaced Repetition to Beat the Forgetting Curve</h3>
              </div>
              <p style={{ margin: 0, lineHeight: '1.65' }}>
                Without repeated reinforcement, freshly learned medical knowledge decays along Ebbinghaus's forgetting curve. A single pass of a topic during week one is often completely forgotten by week six when your exam takes place.
              </p>
              <p style={{ margin: 0, lineHeight: '1.65', color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Med Q Studios exposes you to recurring high-yield clinical themes and management dilemmas at spaced intervals across all 12 core specialties. Continually re-encountering concepts across different clinical contexts transforms short-term memorization into instinctual clinical knowledge.
              </p>
            </div>

            {/* Pillar 3: High Question Volume */}
            <div className="pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={26} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>3. Unapologetic High Question Volume</h3>
              </div>
              <p style={{ margin: 0, lineHeight: '1.65' }}>
                High-stakes exams like the MSRA, UKMLA, and AKT are speed and volume tests. When faced with 100+ questions in tight time limits, deliberating for two minutes on simple cases drains your cognitive battery for harder items.
              </p>
              <p style={{ margin: 0, lineHeight: '1.65', color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                Sheer volume builds <strong>instant clinical pattern recognition</strong>. By working through hundreds of high-throughput questions, you learn to spot key buzzwords, atypical presentations, and subtle distractors in seconds—sharpening the diagnostic reflexes you need on exam day.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Peer Comparison & Cohort Benchmarking */}
        <div className="peer-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={26} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.35rem' }}>Cohort Analytics</span>
              <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Comparing Yourself to Other Candidates</h2>
            </div>
          </div>
          <p style={{ margin: 0, lineHeight: '1.7', color: 'var(--color-text-main)' }}>
            Revising in isolation makes it difficult to assess how prepared you really are. Med Q Studios features anonymous weekly and monthly leaderboards as well as aggregate community analytics so you can accurately gauge your performance against peers preparing for the same exam cycle.
          </p>

          <div className="peer-benefit-grid">
            <div className="peer-benefit-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Trophy size={18} />
                <span>Readiness Calibration</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Benchmarking against an active cohort of UK medical candidates provides an objective reality check on your accuracy and pacing compared to the actual applicant pool.
              </p>
            </div>

            <div className="peer-benefit-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Flame size={18} />
                <span>Volume Accountability</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Building exam-winning question volume requires daily momentum. Seeing active candidates on the leaderboard provides the healthy competition needed to stay consistent.
              </p>
            </div>

            <div className="peer-benefit-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <TrendingUp size={18} />
                <span>Universal vs. Personal Gaps</span>
              </div>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                Cohort statistics reveal whether a challenging question is universally tricky for all candidates or if it represents an individual blind spot requiring targeted review.
              </p>
            </div>
          </div>
        </div>

        {/* Section: The 4-Step Daily Companion Playbook */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>Recommended Daily Routine (The Companion Playbook)</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
              How top scorers integrate Med Q Studios into their day-to-day preparation.
            </p>
          </div>

          <div className="playbook-step-list">
            <div className="playbook-step-item">
              <div className="playbook-step-number">1</div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem' }}>Morning Active Recall Warm-Up (10–15 Mins)</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Begin your study session or ward shift with 10–15 random questions. This primes your brain for active diagnostic retrieval rather than passive information intake.
                </p>
              </div>
            </div>

            <div className="playbook-step-item">
              <div className="playbook-step-number">2</div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem' }}>Clinical Downtime Micro-Sessions (On-the-go)</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Swap out social media during coffee breaks, ward handovers, or commute trains. Answering 3–5 rapid questions in 3 minutes adds up to over 100 extra questions completed each week without dedicated study blocks.
                </p>
              </div>
            </div>

            <div className="playbook-step-item">
              <div className="playbook-step-number">3</div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem' }}>Evening Cross-Reinforcement</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  After studying a specific topic in your primary question bank or clinical guidelines, immediately open Med Q Studios to test your recall without looking at your notes. Immediate retrieval seals the memory.
                </p>
              </div>
            </div>

            <div className="playbook-step-item">
              <div className="playbook-step-number">4</div>
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem' }}>Spaced Diagnostics & Cohort Progress</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Check your user dashboard to view your accuracy across all 12 specialties. Identify dipping percentages, re-engage spaced practice on those weak topics, and track your climb up the weekly cohort leaderboard.
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
            padding: '2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Zap size={36} style={{ color: 'var(--color-brand-secondary)' }} />
          </div>
          <h3 style={{ color: 'var(--color-brand-primary)', margin: 0, fontSize: '1.6rem' }}>
            Ready to Build Unshakeable Clinical Recall?
          </h3>
          <p style={{ fontSize: '0.975rem', margin: '0 auto', maxWidth: '600px', color: 'var(--color-text-main)' }}>
            Start high-volume drilling right away in our free random practice mode, or create a free account to track your specialty stats and benchmark against the community.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/practice')}>
              <span>Try Free Practice Mode</span>
              <ArrowRight size={16} />
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

