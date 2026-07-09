import { useState } from 'react';
import { Check, X, AlertCircle, Flag, HelpCircle, Star, MessageSquare } from 'lucide-react';
import { db } from '../services/db';

export default function QuestionCard({ question, onAnswerSubmit, onNextQuestion, onOpenAuth, onFlagQuestion, currentUser, isLastInSet }) {
  // Common state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrectOverall, setIsCorrectOverall] = useState(false);

  // Type-specific answer state initialized dynamically
  const [answer, setAnswer] = useState(() => {
    switch (question.type) {
      case 'MultipleChoice':
      case 'Ranking':
        return [];
      case 'EMQ':
        return {};
      case 'SBA':
      default:
        return '';
    }
  });

  // Flagging state
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagText, setFlagText] = useState('');
  const [isFlagSubmitted, setIsFlagSubmitted] = useState(false);

  // Rating state
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Validation
    if (question.type === 'SBA' && !answer) return;
    if (question.type === 'MultipleChoice' && answer.length !== 3) return;
    if (question.type === 'Ranking' && answer.length !== question.options.length) return;
    if (question.type === 'EMQ' && Object.keys(answer).length !== question.scenarios.length) return;

    setIsSubmitted(true);
    let isCorrect = false;

    if (question.type === 'SBA') {
      isCorrect = answer === question.correct;
    } else if (question.type === 'MultipleChoice') {
      // Check if all 3 match
      const correctSet = new Set(question.correct);
      const answerSet = new Set(answer);
      isCorrect = correctSet.size === 3 && answerSet.size === 3 && [...answerSet].every(val => correctSet.has(val));
    } else if (question.type === 'Ranking') {
      // Check exact order
      isCorrect = answer.length === question.correct.length && answer.every((val, index) => val === question.correct[index]);
    } else if (question.type === 'EMQ') {
      // Check every scenario
      isCorrect = question.scenarios.every(scen => answer[scen.id] === scen.correct);
    }

    setIsCorrectOverall(isCorrect);
    onAnswerSubmit(isCorrect);
  };

  const submitFlag = () => {
    if (!flagText.trim()) return;
    setIsFlagSubmitted(true);
    setShowFlagForm(false);
    if (onFlagQuestion) {
      onFlagQuestion(question.id, flagText);
    }
  };

  const handleRating = async (stars) => {
    if (onOpenAuth && !currentUser) {
      onOpenAuth('register');
    } else {
      setRating(stars);
      if (currentUser) {
        try {
          await db.rateQuestion(currentUser.email, question.id, stars);
        } catch (err) {
          console.error("Failed to save rating", err);
        }
      }
    }
  };



  const renderSBA = () => (
    <div className="options-container">
      {question.options.map((option, idx) => {
        const isSelected = answer === option;
        const isCorrectAnswer = option === question.correct;
        const showCorrectStyle = isSubmitted && isCorrectAnswer;
        const showIncorrectStyle = isSubmitted && isSelected && !isCorrectAnswer;
        
        let wrapperClass = 'option-wrapper';
        if (isSelected) wrapperClass += ' selected';
        if (showCorrectStyle) wrapperClass += ' correct';
        if (showIncorrectStyle) wrapperClass += ' incorrect';
        if (isSubmitted) wrapperClass += ' disabled';

        return (
          <div key={idx} className={wrapperClass} onClick={() => !isSubmitted && setAnswer(option)}>
            <input type="radio" className="option-radio" checked={isSelected} readOnly />
            <span className="option-text">{option}</span>
            {showCorrectStyle && <span className="option-status-icon correct"><Check size={20} strokeWidth={3} /></span>}
            {showIncorrectStyle && <span className="option-status-icon incorrect"><X size={20} strokeWidth={3} /></span>}
          </div>
        );
      })}
    </div>
  );

  const renderMultipleChoice = () => {
    return (
      <div className="options-container">
        <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem'}}>
          Select exactly 3 options. ({answer?.length || 0}/3 selected)
        </p>
        {question.options.map((option, idx) => {
          const isSelected = answer?.includes(option);
          const isCorrectAnswer = question.correct.includes(option);
          const showCorrectStyle = isSubmitted && isCorrectAnswer;
          const showIncorrectStyle = isSubmitted && isSelected && !isCorrectAnswer;
          
          let wrapperClass = 'option-wrapper';
          if (isSelected) wrapperClass += ' selected';
          if (showCorrectStyle) wrapperClass += ' correct';
          if (showIncorrectStyle) wrapperClass += ' incorrect';
          if (isSubmitted || (!isSelected && answer?.length >= 3)) wrapperClass += ' disabled';

          return (
            <div key={idx} className={wrapperClass} onClick={() => {
              if (isSubmitted) return;
              if (isSelected) {
                setAnswer(answer.filter(a => a !== option));
              } else if (answer.length < 3) {
                setAnswer([...answer, option]);
              }
            }}>
              <input type="checkbox" checked={isSelected} readOnly />
              <span className="option-text">{option}</span>
              {showCorrectStyle && <span className="option-status-icon correct"><Check size={20} strokeWidth={3} /></span>}
              {showIncorrectStyle && <span className="option-status-icon incorrect"><X size={20} strokeWidth={3} /></span>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRanking = () => {
    const unranked = question.options.filter(opt => !answer?.includes(opt));
    
    return (
      <div className="options-container">
        <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem'}}>
          Click options to rank them from most appropriate (1) to least appropriate ({question.options.length}).
        </p>
        
        {/* Ranked Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          {answer?.map((opt, idx) => {
            const isCorrectRank = isSubmitted && question.correct[idx] === opt;
            const isIncorrectRank = isSubmitted && !isCorrectRank;
            let bg = 'var(--color-bg-app)';
            if (isCorrectRank) bg = 'var(--color-success-bg)';
            if (isIncorrectRank) bg = 'var(--color-error-bg)';

            return (
              <div key={opt} onClick={() => !isSubmitted && setAnswer(answer.filter(a => a !== opt))}
                style={{
                  padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem', cursor: isSubmitted ? 'default' : 'pointer', backgroundColor: bg,
                  display: 'flex', alignItems: 'center', gap: '1rem'
                }}
              >
                <span style={{ fontWeight: 'bold', color: 'var(--color-brand-primary)' }}>{idx + 1}.</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isCorrectRank && <Check size={18} color="green" />}
                {isIncorrectRank && <X size={18} color="red" />}
              </div>
            );
          })}
        </div>

        {/* Unranked Options */}
        {!isSubmitted && unranked.length > 0 && (
          <div>
            <p style={{fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Unranked Options (Click to add):</p>
            {unranked.map((opt) => (
              <div key={opt} onClick={() => setAnswer([...answer, opt])}
                style={{
                  padding: '0.75rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: 'var(--color-bg-card)'
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}

        {/* Show correct ranking if submitted and incorrect */}
        {isSubmitted && !isCorrectOverall && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Correct Ranking:</h4>
            {question.correct.map((opt, idx) => (
              <div key={opt} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>{idx + 1}.</strong> {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEMQ = () => {
    return (
      <div className="options-container">
        {/* Options List */}
        <div style={{ backgroundColor: 'var(--color-bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Options:</h4>
          <ul style={{ listStyleType: 'none', padding: 0, fontSize: '0.85rem', columns: 2 }}>
            {question.options.map(opt => <li key={opt} style={{ marginBottom: '0.25rem' }}>{opt}</li>)}
          </ul>
        </div>

        {/* Scenarios */}
        {question.scenarios.map((scen, idx) => {
          const selected = answer?.[scen.id] || '';
          const isCorrect = selected === scen.correct;
          const showCorrect = isSubmitted && isCorrect;
          const showIncorrect = isSubmitted && !isCorrect;

          return (
            <div key={scen.id} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: showCorrect ? 'var(--color-success-bg)' : (showIncorrect ? 'var(--color-error-bg)' : 'transparent') }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}><strong>Scenario {idx + 1}:</strong> {scen.text}</p>
              <select 
                value={selected}
                onChange={(e) => setAnswer({...answer, [scen.id]: e.target.value})}
                disabled={isSubmitted}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                <option value="" disabled>Select the most likely diagnosis...</option>
                {question.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {isSubmitted && !isCorrect && (
                <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>Correct Answer: {scen.correct}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch(question.type) {
      case 'MultipleChoice': return renderMultipleChoice();
      case 'Ranking': return renderRanking();
      case 'EMQ': return renderEMQ();
      case 'SBA':
      default: return renderSBA();
    }
  };

  // Determine if submit should be disabled
  const isSubmitDisabled = () => {
    if (question.type === 'SBA') return !answer;
    if (question.type === 'MultipleChoice') return answer?.length !== 3;
    if (question.type === 'Ranking') return answer?.length !== question.options.length;
    if (question.type === 'EMQ') return Object.keys(answer || {}).length !== question.scenarios.length;
    return true;
  };

  return (
    <div className="card card-lg animate-slide-up" style={{ minHeight: '400px' }}>
      {/* Meta Header */}
      <div className="question-header">
        <div className="question-meta-group">
          <span className="badge badge-primary">{question.topic}</span>
          <span className="badge badge-secondary">{question.blueprint_tag}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isFlagSubmitted ? (
            <span className="badge badge-success">Flagged Submitted</span>
          ) : (
            <button 
              className="btn-text"
              onClick={() => setShowFlagForm(!showFlagForm)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
            >
              <Flag size={14} />
              <span>Flag Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Flag Form Dropdown */}
      {showFlagForm && !isFlagSubmitted && (
        <div style={{ backgroundColor: 'var(--color-warning-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-warning-border)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} /> Suggest an improvement
          </h4>
          <textarea 
            value={flagText}
            onChange={(e) => setFlagText(e.target.value)}
            placeholder="What could be improved about this question? (e.g., outdated guidelines, typo)"
            style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn-text" onClick={() => setShowFlagForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitFlag} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Submit Flag</button>
          </div>
        </div>
      )}

      {/* Question Type Hint */}
      <div 
        style={{ 
          fontSize: '0.8rem', 
          color: 'var(--color-text-muted)', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--color-bg-app)',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <HelpCircle size={14} style={{ color: 'var(--color-brand-secondary)' }} />
        <span><strong>Question Type:</strong> {question.type}</span>
      </div>

      {/* Theme for EMQ, Stem for others */}
      {question.type === 'EMQ' ? (
        <>
          <h3 className="question-stem" style={{ marginBottom: '0.5rem' }}>Theme: {question.theme}</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>{question.stem}</p>
        </>
      ) : (
        <p className="question-stem">{question.stem}</p>
      )}

      {/* Interactive Options */}
      {renderContent()}

      {/* Action Buttons */}
      <div className="flex-between" style={{ marginTop: '2rem', alignItems: 'center' }}>
        
        {/* Rating Component (shown mainly after submit or always available) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Rate this question:</span>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={20} 
                onClick={() => handleRating(star)}
                fill={rating >= star ? '#ffc107' : 'none'}
                color={rating >= star ? '#ffc107' : 'var(--color-border)'}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
            ))}
          </div>
        </div>

        {!isSubmitted ? (
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled()}
            style={{ minWidth: '150px' }}
          >
            Submit Answer
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={onNextQuestion}
            style={{ minWidth: '150px' }}
          >
            {isLastInSet ? 'Finish Practice Set' : 'Next Question'}
          </button>
        )}
      </div>

      {/* Explanation Box */}
      {isSubmitted && (
        <div className="explanation-box animate-fade" style={{ marginTop: '2rem' }}>
          <div className="explanation-title">
            <AlertCircle size={18} style={{ color: 'var(--color-brand-secondary)' }} />
            <span>Explanation & Feedback</span>
          </div>
          <div className="explanation-body">
            <p style={{ marginBottom: '1rem' }}>{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
