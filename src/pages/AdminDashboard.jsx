import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Save, X, ChevronLeft, AlertTriangle, CheckCircle,
  List, Flag, Database, Search, Download, Upload, Copy, RefreshCw, FileText, Check, Users
} from 'lucide-react';
import { questions as defaultQuestions } from '../data/questions';
import { db } from '../services/db';

export default function AdminDashboard({ questions, updateQuestions }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Tabs: 'questions', 'flags', 'tools'
  const [activeTab, setActiveTab] = useState('questions');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [flagFilter, setFlagFilter] = useState('All'); // 'All', 'Flagged', 'Unflagged'

  // Backup & Import state
  const [importJson, setImportJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // User Stats state
  const [userStatsData, setUserStatsData] = useState({ totalUsers: 0, totalAnswered: 0, totalCorrect: 0 });
  const [allStats, setAllStats] = useState([]);

  // Fetch stats and users on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, stats] = await Promise.all([db.getAllUsers(), db.getAllStats()]);
        setAllStats(stats);
        let totalAnswered = 0;
        let totalCorrect = 0;
        stats.forEach(s => {
          totalAnswered += s.totalAnswered || 0;
          totalCorrect += s.correctAnswered || 0;
        });
        setUserStatsData({
          totalUsers: users.length,
          totalAnswered,
          totalCorrect
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    };
    fetchStats();
  }, []);

  // Compute ratings mapping: questionId -> { sum: number, count: number }
  const questionRatings = {};
  allStats.forEach(s => {
    if (s.ratings) {
      Object.entries(s.ratings).forEach(([qId, rating]) => {
        if (!questionRatings[qId]) {
          questionRatings[qId] = { sum: 0, count: 0 };
        }
        questionRatings[qId].sum += Number(rating) || 0;
        questionRatings[qId].count += 1;
      });
    }
  });

  const getAverageRating = (qId) => {
    const data = questionRatings[qId];
    if (!data || data.count === 0) return null;
    return {
      average: (data.sum / data.count).toFixed(1),
      count: data.count
    };
  };

  // Initial state helper for a new question based on type
  const getInitialFormState = (type = 'SBA') => {
    const base = {
      type,
      blueprint_tag: type === 'SBA' || type === 'EMQ' ? 'Clinical Problem Solving' : 'Professional Dilemmas',
      topic: '',
      subtopic: '',
      clinical_area: '',
      stem: '',
      explanation: ''
    };

    if (type === 'SBA') {
      return {
        ...base,
        options: ['', '', '', '', ''],
        correct: ''
      };
    } else if (type === 'MultipleChoice') {
      return {
        ...base,
        options: ['', '', '', '', '', '', '', ''], // Standard 8 options
        correct: [] // Array of 3 strings
      };
    } else if (type === 'Ranking') {
      return {
        ...base,
        options: ['', '', '', '', ''], // Standard 5 options
        correct: [] // Array of 5 strings (in correct order)
      };
    } else if (type === 'EMQ') {
      return {
        ...base,
        theme: '',
        options: ['A. ', 'B. ', 'C. ', 'D. ', 'E. '],
        scenarios: [
          { id: 'scen-1', text: '', correct: '' }
        ]
      };
    }
    return base;
  };

  const [formData, setFormData] = useState(() => getInitialFormState('SBA'));

  const handleTypeChange = (newType) => {
    setFormData(getInitialFormState(newType));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // SBA / MC / Ranking option editing
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  // EMQ specific dynamic option adding/removing
  const addEMQOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeEMQOption = (index) => {
    if (formData.options.length <= 2) return; // Need at least some options
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }));
  };

  // EMQ specific scenarios editing
  const handleScenarioChange = (index, field, value) => {
    const updatedScenarios = [...formData.scenarios];
    updatedScenarios[index] = {
      ...updatedScenarios[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      scenarios: updatedScenarios
    }));
  };

  const addScenario = () => {
    const newId = `scen-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, { id: newId, text: '', correct: '' }]
    }));
  };

  const removeScenario = (index) => {
    if (formData.scenarios.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter((_, idx) => idx !== index)
    }));
  };

  const handleMCSelect = (option) => {
    let updatedCorrect = [...formData.correct];
    if (updatedCorrect.includes(option)) {
      updatedCorrect = updatedCorrect.filter(o => o !== option);
    } else {
      if (updatedCorrect.length < 3) {
        updatedCorrect.push(option);
      }
    }
    setFormData(prev => ({ ...prev, correct: updatedCorrect }));
  };

  const handleRankSelect = (positionIndex, option) => {
    const updatedCorrect = [...formData.correct];
    updatedCorrect[positionIndex] = option;
    setFormData(prev => ({ ...prev, correct: updatedCorrect }));
  };

  // Edit action
  const handleEditClick = (q) => {
    setEditingId(q.id);
    setFormData({ ...q });
    setIsFormOpen(true);
  };

  // Delete action
  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updated = questions.filter(q => q.id !== id);
      updateQuestions(updated);
      showToast('Question deleted successfully!');
    }
  };

  // Resolve Flags
  const handleResolveFlags = (id) => {
    if (window.confirm('Are you sure you want to resolve and clear all flags for this question?')) {
      const updated = questions.map(q => {
        if (q.id === id) {
          // eslint-disable-next-line no-unused-vars
          const { flags, ...rest } = q;
          return rest;
        }
        return q;
      });
      updateQuestions(updated);
      showToast('Flags resolved successfully!');
    }
  };

  // Reset Default Bank
  const handleResetBank = () => {
    if (window.confirm('Are you sure you want to reset the question bank to the default curated questions? This will overwrite all custom changes, additions, and flags.')) {
      updateQuestions(defaultQuestions);
      showToast('Question bank reset to default!');
    }
  };

  // Export JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy JSON', err);
        alert('Failed to copy to clipboard.');
      });
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "msra_questions_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e) => {
    e.preventDefault();
    if (!importJson.trim()) {
      alert('Please paste some JSON first.');
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        alert('Import failed: The JSON must be an array of questions.');
        return;
      }

      // Basic validation of each imported question
      const isValid = parsed.every((q, idx) => {
        if (typeof q !== 'object' || q === null) return false;
        if (!q.type || !q.stem) {
          console.warn(`Question at index ${idx} is missing type or stem.`);
          return false;
        }
        return true;
      });

      if (!isValid) {
        alert('Import failed: Some questions are missing required properties (e.g. type or stem). Please check the console.');
        return;
      }

      updateQuestions(parsed);
      showToast('Questions imported successfully!');
      setImportJson('');
    } catch (err) {
      alert(`Import failed: Invalid JSON syntax. Error: ${err.message}`);
    }
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const validateForm = () => {
    if (!formData.topic.trim()) return 'Topic is required';
    if (!formData.stem.trim()) return 'Question Stem is required';
    
    // Type specific checks
    if (formData.type === 'SBA') {
      if (formData.options.some(opt => !opt.trim())) return 'All 5 options must be filled out';
      if (!formData.correct) return 'Please select the correct option';
    } else if (formData.type === 'MultipleChoice') {
      if (formData.options.some(opt => !opt.trim())) return 'All 8 options must be filled out';
      if (formData.correct.length !== 3) return 'Please select exactly 3 correct options';
    } else if (formData.type === 'Ranking') {
      if (formData.options.some(opt => !opt.trim())) return 'All 5 options must be filled out';
      if (formData.correct.length !== formData.options.length || formData.correct.some(c => !c)) {
        return 'Please specify the ranking for all positions';
      }
    } else if (formData.type === 'EMQ') {
      if (!formData.theme.trim()) return 'Theme is required';
      if (formData.options.some(opt => !opt.trim())) return 'All options must be filled out';
      if (formData.scenarios.some(scen => !scen.text.trim() || !scen.correct)) {
        return 'All scenarios must have a description and a correct matching option';
      }
    }
    
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    if (editingId) {
      // Edit mode
      const updated = questions.map(q => q.id === editingId ? { ...formData, id: editingId } : q);
      updateQuestions(updated);
      showToast('Question updated successfully!');
    } else {
      // Add mode
      const newQuestion = {
        ...formData,
        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
        status: 'Active'
      };
      updateQuestions([...questions, newQuestion]);
      showToast('Question added successfully!');
    }

    setIsFormOpen(false);
    setEditingId(null);
    setFormData(getInitialFormState('SBA'));
  };

  // Questions List Tab Filter Logic
  const filteredQuestions = questions.filter(q => {
    // Search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTopic = q.topic?.toLowerCase().includes(query);
      const matchSubtopic = q.subtopic?.toLowerCase().includes(query);
      const matchClinical = q.clinical_area?.toLowerCase().includes(query);
      const matchStem = q.stem?.toLowerCase().includes(query);
      if (!matchTopic && !matchSubtopic && !matchClinical && !matchStem) return false;
    }

    // Type Filter Match
    if (typeFilter !== 'All' && q.type !== typeFilter) return false;

    // Tag Filter Match
    if (tagFilter !== 'All' && q.blueprint_tag !== tagFilter) return false;

    // Flagged Filter Match
    const hasFlags = q.flags && q.flags.length > 0;
    if (flagFilter === 'Flagged' && !hasFlags) return false;
    if (flagFilter === 'Unflagged' && hasFlags) return false;

    return true;
  });

  // Flagged Questions logic
  const flaggedQuestions = questions.filter(q => q.flags && q.flags.length > 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Toast Alert */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)', border: '1px solid var(--color-success-border)',
          padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', zIndex: 1000, boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500'
        }}>
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Header Info */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Dashboard</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Manage the free practice question bank. All changes are stored locally in the browser.
          </p>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary" onClick={() => {
            setFormData(getInitialFormState('SBA'));
            setEditingId(null);
            setIsFormOpen(true);
          }}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        )}
      </div>

      {/* Tab Navigation (Hidden when form is open) */}
      {!isFormOpen && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          borderBottom: '1px solid var(--color-border)', 
          marginBottom: '1.5rem',
          paddingBottom: '1px'
        }}>
          <button 
            onClick={() => setActiveTab('questions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              color: activeTab === 'questions' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === 'questions' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <List size={16} />
            <span>Questions List</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('flags')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              color: activeTab === 'flags' ? 'var(--color-error)' : 'var(--color-text-muted)',
              borderBottom: activeTab === 'flags' ? '2px solid var(--color-error)' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <Flag size={16} fill={activeTab === 'flags' ? 'currentColor' : 'none'} />
            <span>Flagged Reviews</span>
            {flaggedQuestions.length > 0 && (
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                backgroundColor: 'var(--color-error)', 
                color: '#fff', 
                borderRadius: '10px', 
                padding: '0.1rem 0.4rem',
                minWidth: '18px',
                height: '18px'
              }}>
                {flaggedQuestions.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('tools')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              color: activeTab === 'tools' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === 'tools' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <Database size={16} />
            <span>Tools & Stats</span>
          </button>
        </div>
      )}

      {/* Question Form */}
      {isFormOpen ? (
        <div className="card animate-fade" style={{ marginBottom: '3rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <button className="btn-text" onClick={() => setIsFormOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ChevronLeft size={16} />
              <span>Back to List</span>
            </button>
            <h3 style={{ fontSize: '1.25rem' }}>{editingId ? 'Edit Question' : 'Create New Question'}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Metadata Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Question Type</label>
                <select 
                  className="filter-select"
                  value={formData.type} 
                  onChange={(e) => handleTypeChange(e.target.value)}
                  disabled={!!editingId}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                >
                  <option value="SBA">SBA (Single Best Answer)</option>
                  <option value="MultipleChoice">Multiple Choice (Select 3)</option>
                  <option value="Ranking">Ranking (Professional Dilemmas)</option>
                  <option value="EMQ">EMQ (Extended Matching)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Blueprint tag</label>
                <select 
                  className="filter-select"
                  value={formData.blueprint_tag} 
                  onChange={(e) => handleFieldChange('blueprint_tag', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                >
                  <option value="Clinical Problem Solving">Clinical Problem Solving</option>
                  <option value="Professional Dilemmas">Professional Dilemmas</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Topic</label>
                <input 
                  type="text" 
                  value={formData.topic} 
                  onChange={(e) => handleFieldChange('topic', e.target.value)}
                  placeholder="e.g. Cardiology, Prioritisation"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Subtopic</label>
                <input 
                  type="text" 
                  value={formData.subtopic} 
                  onChange={(e) => handleFieldChange('subtopic', e.target.value)}
                  placeholder="e.g. Heart Failure, Ethics"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Clinical Area (Optional)</label>
                <input 
                  type="text" 
                  value={formData.clinical_area} 
                  onChange={(e) => handleFieldChange('clinical_area', e.target.value)}
                  placeholder="e.g. Cardiovascular, Professional Attributes"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>

            {/* EMQ Theme */}
            {formData.type === 'EMQ' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Theme</label>
                <input 
                  type="text" 
                  value={formData.theme} 
                  onChange={(e) => handleFieldChange('theme', e.target.value)}
                  placeholder="e.g. Diagnosis of Headache"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            {/* Question Stem */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Question Stem / Instructions</label>
              <textarea 
                value={formData.stem} 
                onChange={(e) => handleFieldChange('stem', e.target.value)}
                placeholder="Write the clinical case details or general question instructions..."
                style={{ width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* OPTIONS INPUTS */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>Answer Options</h4>
                {formData.type === 'EMQ' && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addEMQOption} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <Plus size={12} /> Add Option
                  </button>
                )}
              </div>
              
              {formData.options.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', width: '30px', fontSize: '0.85rem' }}>{idx + 1}.</span>
                  <input 
                    type="text" 
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                  {formData.type === 'EMQ' && formData.options.length > 2 && (
                    <button type="button" onClick={() => removeEMQOption(idx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* CORRECT ANSWER SELECTION (CONTEXTUAL) */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-app)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Correct Answer Specification</h4>

              {/* SBA Correct */}
              {formData.type === 'SBA' && (
                <div>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Select the correct option:</label>
                  <select 
                    value={formData.correct}
                    onChange={(e) => handleFieldChange('correct', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">-- Choose option --</option>
                    {formData.options.map((opt, idx) => (
                      <option key={idx} value={opt} disabled={!opt.trim()}>{opt || `Option ${idx + 1} (Empty)`}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Multiple Choice Correct */}
              {formData.type === 'MultipleChoice' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Select exactly 3 options that form the correct answer:
                  </p>
                  {formData.options.map((opt, idx) => {
                    const isChecked = formData.correct?.includes(opt);
                    return (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMCSelect(opt)}
                          disabled={!isChecked && formData.correct?.length >= 3}
                        />
                        <span>{opt || `Option ${idx + 1}`}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Ranking Correct */}
              {formData.type === 'Ranking' && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    Map options to their correct ranking order (from 1 = most appropriate, to 5 = least appropriate):
                  </p>
                  {Array.from({ length: 5 }).map((_, rankIdx) => (
                    <div key={rankIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', width: '80px' }}>Rank {rankIdx + 1}:</span>
                      <select
                        value={formData.correct?.[rankIdx] || ''}
                        onChange={(e) => handleRankSelect(rankIdx, e.target.value)}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                      >
                        <option value="">-- Choose Option --</option>
                        {formData.options.map((opt, idx) => (
                          <option key={idx} value={opt} disabled={!opt.trim() || formData.correct?.includes(opt)}>{opt || `Option ${idx + 1}`}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* EMQ Correct Scenarios */}
              {formData.type === 'EMQ' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Define scenarios and specify their correct matching option:
                    </p>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addScenario} style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>
                      <Plus size={10} /> Add Scenario
                    </button>
                  </div>
                  
                  {formData.scenarios.map((scen, idx) => (
                    <div key={scen.id} style={{ border: '1px solid var(--color-border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', backgroundColor: '#fff' }}>
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Scenario {idx + 1}</span>
                        {formData.scenarios.length > 1 && (
                          <button type="button" onClick={() => removeScenario(idx)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      
                      <textarea
                        value={scen.text}
                        onChange={(e) => handleScenarioChange(idx, 'text', e.target.value)}
                        placeholder={`Scenario ${idx + 1} description`}
                        style={{ width: '100%', minHeight: '60px', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '0.5rem' }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Correct Answer:</span>
                        <select
                          value={scen.correct}
                          onChange={(e) => handleScenarioChange(idx, 'correct', e.target.value)}
                          style={{ flex: 1, padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        >
                          <option value="">-- Choose Option --</option>
                          {formData.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt} disabled={!opt.trim()}>{opt || `Option ${oIdx + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Explanation / Feedback */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Explanation & Rationale</label>
              <textarea 
                value={formData.explanation} 
                onChange={(e) => handleFieldChange('explanation', e.target.value)}
                placeholder="Explain why the correct answer is right and why others are wrong..."
                style={{ width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Question</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Render Selected Tab content */
        <div className="animate-fade" style={{ marginBottom: '3rem' }}>
          
          {/* TAB 1: QUESTIONS LIST */}
          {activeTab === 'questions' && (
            <div>
              {/* Search & Filters */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                marginBottom: '1.5rem', 
                padding: '1.25rem', 
                backgroundColor: 'var(--color-bg-card)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Search Input */}
                  <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search by topic, subtopic, clinical area or stem..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.6rem 1rem 0.6rem 2.2rem', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--color-border)', 
                        backgroundColor: 'var(--color-bg-app)',
                        color: 'var(--color-text)'
                      }}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Type Filter */}
                  <div style={{ flex: '1 1 150px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Question Type</label>
                    <select 
                      className="filter-select" 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text)' }}
                    >
                      <option value="All">All Types</option>
                      <option value="SBA">SBA</option>
                      <option value="EMQ">EMQ</option>
                      <option value="MultipleChoice">Multiple Choice</option>
                      <option value="Ranking">Ranking</option>
                    </select>
                  </div>

                  {/* Tag Filter */}
                  <div style={{ flex: '1 1 200px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Blueprint Tag</label>
                    <select 
                      className="filter-select" 
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text)' }}
                    >
                      <option value="All">All Papers</option>
                      <option value="Clinical Problem Solving">Clinical Problem Solving</option>
                      <option value="Professional Dilemmas">Professional Dilemmas</option>
                    </select>
                  </div>

                  {/* Flag Filter */}
                  <div style={{ flex: '1 1 150px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Flag Status</label>
                    <select 
                      className="filter-select" 
                      value={flagFilter}
                      onChange={(e) => setFlagFilter(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text)' }}
                    >
                      <option value="All">All Questions</option>
                      <option value="Flagged">Flagged Only</option>
                      <option value="Unflagged">Unflagged Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions Table */}
              <div className="card">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center" style={{ padding: '3rem 0' }}>
                    <AlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
                    <h3>No Questions Found</h3>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                      Try adjusting your search queries or filter dropdowns.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                          <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Topic</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Tag</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Avg Rating</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuestions.map((q) => {
                          const ratingInfo = getAverageRating(q.id);
                          return (
                            <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>#{q.id}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                  {q.type}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{q.topic}</td>
                              <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{q.blueprint_tag}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                {ratingInfo ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#ffc107', fontWeight: '500' }}>
                                    <span style={{ fontSize: '1rem', lineHeight: '1' }}>★</span>
                                    <span style={{ color: 'var(--color-text)' }}>{ratingInfo.average}</span>
                                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({ratingInfo.count})</span>
                                  </span>
                                ) : (
                                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>N/A</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                {q.flags && q.flags.length > 0 ? (
                                  <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <Flag size={10} fill="currentColor" /> {q.flags.length} flag{q.flags.length > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Active</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => handleEditClick(q)} 
                                    style={{ padding: '0.25rem 0.5rem', minWidth: 'auto' }}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    onClick={() => handleDeleteClick(q.id)}
                                    style={{ padding: '0.25rem 0.5rem', color: 'red', minWidth: 'auto' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FLAGGED REVIEWS */}
          {activeTab === 'flags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {flaggedQuestions.length === 0 ? (
                <div className="text-center" style={{ padding: '4rem 0', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', marginBottom: '1rem' }}>
                    <CheckCircle size={24} />
                  </div>
                  <h3>No Flagged Questions</h3>
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                    Excellent! All questions in the bank are currently flag-free.
                  </p>
                </div>
              ) : (
                flaggedQuestions.map(q => {
                  const ratingInfo = getAverageRating(q.id);
                  return (
                    <div key={q.id} className="card animate-fade" style={{ borderLeft: '4px solid var(--color-error)' }}>
                      <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Question #{q.id}</span>
                          <span className="badge badge-secondary" style={{ marginRight: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>{q.type}</span>
                          {ratingInfo && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#ffc107', fontWeight: '500', marginRight: '0.5rem', fontSize: '0.85rem' }}>
                              <span style={{ fontSize: '0.9rem', lineHeight: '1' }}>★</span>
                              <span style={{ color: 'var(--color-text)' }}>{ratingInfo.average}</span>
                              <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>({ratingInfo.count})</span>
                            </span>
                          )}
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{q.topic} &raquo; {q.subtopic}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolveFlags(q.id)}
                            style={{ color: 'var(--color-success)', borderColor: 'var(--color-success-border)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Check size={14} />
                            <span>Resolve Flags</span>
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEditClick(q)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteClick(q.id)}
                            style={{ color: 'red', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Question Stem:</h5>
                        <p style={{ fontSize: '0.9rem', backgroundColor: 'var(--color-bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', whiteSpace: 'pre-wrap' }}>
                          {q.stem}
                        </p>
                      </div>

                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-error)' }}>
                          User Feedback / Flag Reports ({q.flags.length}):
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {q.flags.map((flag, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              gap: '0.75rem', 
                              padding: '0.75rem', 
                              backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                              border: '1px solid rgba(239, 68, 68, 0.15)', 
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }}>
                                <Flag size={14} fill="currentColor" />
                              </div>
                              <div style={{ flexGrow: 1, wordBreak: 'break-word', color: 'var(--color-text)' }}>{flag}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: TOOLS & STATS */}
          {activeTab === 'tools' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Stats Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={18} />
                  <span>Database Statistics</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Total Questions</span>
                    <span style={{ fontWeight: 'bold' }}>{questions.length}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Single Best Answer (SBA)</span>
                    <span>{questions.filter(q => q.type === 'SBA').length}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Extended Matching (EMQ)</span>
                    <span>{questions.filter(q => q.type === 'EMQ').length}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Multiple Choice (Select 3)</span>
                    <span>{questions.filter(q => q.type === 'MultipleChoice').length}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Ranking Questions</span>
                    <span>{questions.filter(q => q.type === 'Ranking').length}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-error)' }}>
                    <span style={{ color: 'var(--color-error)' }}>Flagged Questions</span>
                    <span style={{ fontWeight: 'bold' }}>{flaggedQuestions.length}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Total Reports Submitted</span>
                    <span>{questions.reduce((acc, q) => acc + (q.flags?.length || 0), 0)}</span>
                  </div>
                </div>
              </div>

              {/* User Stats Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} />
                  <span>User Statistics</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Registered Users</span>
                    <span style={{ fontWeight: 'bold' }}>{userStatsData.totalUsers}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Total Practice Questions Answered</span>
                    <span>{userStatsData.totalAnswered}</span>
                  </div>
                  <div className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-muted">Global Accuracy</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                      {userStatsData.totalAnswered > 0 ? Math.round((userStatsData.totalCorrect / userStatsData.totalAnswered) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Backup & Import Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} />
                  <span>Backup & Bulk Tools</span>
                </h3>

                {/* Export */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Export Database</h4>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Copy the complete database configuration as JSON to backup or share it.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopyJson} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleDownloadJson} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Download size={14} />
                      <span>Download JSON</span>
                    </button>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

                {/* Import */}
                <form onSubmit={handleImportJson}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Import Database</h4>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Paste questions JSON array here to overwrite the current database.
                  </p>
                  <textarea
                    placeholder='[ { "id": 1, "type": "SBA", "stem": "..." } ]'
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '80px', 
                      fontSize: '0.75rem', 
                      fontFamily: 'monospace', 
                      padding: '0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--color-border)',
                      marginBottom: '0.75rem',
                      backgroundColor: 'var(--color-bg-app)',
                      color: 'var(--color-text)'
                    }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-brand-primary)', borderColor: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Upload size={14} />
                    <span>Upload & Import</span>
                  </button>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

                {/* Reset */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-error)' }}>Reset Questions</h4>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Wipe all customizations, additions, and flags. Restore the original curated questions.
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={handleResetBank} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-border)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <RefreshCw size={14} />
                    <span>Reset to Default Bank</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
