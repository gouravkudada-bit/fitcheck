import React from 'react';
import { Award, CheckCircle2, RotateCcw, Sparkles, BookmarkCheck, LogIn } from 'lucide-react';

export default function FitScoreCard({
  result,
  onReset,
  currentUser,
  isSaved,
  onViewHistory,
  onOpenAuth
}) {
  if (!result) return null;

  const { score, vibe, harmony, occasion, suggestions, analyzedAt } = result;

  const getGradeText = (val) => {
    if (val >= 9.0) return 'Top Tier Fit';
    if (val >= 8.0) return 'Looking Sharp';
    return 'Solid Foundation';
  };

  return (
    <div className="card results-card" id="fitcheck-results-card">
      <div className="results-header-banner">
        <div className="occasion-tag">
          <Sparkles size={14} color="var(--primary)" />
          <span>Occasion: {occasion}</span>
        </div>
        <span className="analyzed-time">Analyzed at {analyzedAt}</span>
      </div>

      {/* Hero Score Section */}
      <div className="score-hero-container">
        <div className="score-badge-circle">
          <span className="score-number" id="fit-score-value">{score}</span>
          <span className="score-out-of">/ 10</span>
        </div>

        <div className="score-meta-text">
          <span className="score-grade-badge">{getGradeText(score)}</span>
          <h3 className="score-vibe-title">"{vibe}"</h3>
          <p className="score-harmony-sub">{harmony}</p>
        </div>
      </div>

      {/* History Saved Status Banner */}
      {currentUser ? (
        <div className="history-saved-banner success">
          <div className="history-saved-left">
            <BookmarkCheck size={18} color="#16A34A" />
            <span>Saved to your wardrobe history</span>
          </div>
          {onViewHistory && (
            <button
              type="button"
              className="history-saved-action-link"
              onClick={onViewHistory}
            >
              View in My History →
            </button>
          )}
        </div>
      ) : (
        <div className="history-saved-banner unauthenticated">
          <div className="history-saved-left">
            <Sparkles size={16} color="var(--primary)" />
            <span>Want to save this fit and track your style?</span>
          </div>
          <button
            type="button"
            className="history-signin-pill-btn"
            onClick={onOpenAuth}
          >
            <LogIn size={13} />
            <span>Sign In to Save</span>
          </button>
        </div>
      )}

      {/* 3 Improvement Suggestions Section */}
      <div className="suggestions-section">
        <h4 className="suggestions-title">
          <Award size={18} color="var(--primary)" />
          3 Ways to Improve This Fit
        </h4>
        <ul className="suggestions-list" id="fit-suggestions-list">
          {suggestions.map((tip, idx) => (
            <li key={idx} className="suggestion-item">
              <div className="suggestion-bullet-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action to restart or test another */}
      <button
        type="button"
        id="check-another-btn"
        className="secondary-btn"
        onClick={onReset}
      >
        <RotateCcw size={16} />
        <span>Check Another Fit</span>
      </button>
    </div>
  );
}
