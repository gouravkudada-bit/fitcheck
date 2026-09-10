import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHistory, deleteOutfitCheck } from '../services/historyService';
import {
  Sparkles,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  LogIn,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

export default function HistoryView({ onOpenAuth, onNavigateHome }) {
  const { currentUser } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedCardId, setExpandedCardId] = useState(null);

  const fetchHistory = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await getUserHistory(currentUser.uid);
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser?.uid]);

  const handleDelete = async (checkId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this outfit check from your history?')) return;

    try {
      await deleteOutfitCheck(currentUser.uid, checkId);
      setHistoryItems((prev) => prev.filter((item) => item.id !== checkId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // Not signed in state
  if (!currentUser) {
    return (
      <div className="card history-empty-card">
        <div className="history-empty-icon-circle">
          <LogIn size={28} color="var(--primary)" />
        </div>
        <h3 className="history-empty-title">Sign in to View Your History</h3>
        <p className="history-empty-desc">
          Create a free account or sign in with Google to automatically track all your past outfit checks, ratings, and personalized styling advice.
        </p>
        <button
          type="button"
          className="cta-button"
          style={{ maxWidth: '280px', margin: '16px auto 0' }}
          onClick={onOpenAuth}
        >
          <LogIn size={18} />
          <span>Sign In to Continue</span>
        </button>
      </div>
    );
  }

  // Filter items
  const filteredItems = selectedFilter === 'All'
    ? historyItems
    : historyItems.filter((item) => item.occasion?.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="history-view-container">
      {/* Header bar with count and refresh */}
      <div className="history-header-row">
        <div>
          <h2 className="history-title">My Outfit History</h2>
          <p className="history-subtitle">
            {historyItems.length} saved {historyItems.length === 1 ? 'fit evaluation' : 'fit evaluations'}
          </p>
        </div>
        <button
          type="button"
          className="history-refresh-btn"
          onClick={fetchHistory}
          title="Refresh history"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filter chips */}
      <div className="history-filter-scroll">
        {['All', 'Casual', 'Work', 'Date', 'Formal'].map((filter) => (
          <button
            key={filter}
            type="button"
            className={`filter-chip ${selectedFilter === filter ? 'active' : ''}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card history-loading-state">
          <div className="scanner-ring" style={{ width: 36, height: 36, margin: '0 auto 12px' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading your outfit history...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="card history-empty-card">
          <div className="history-empty-icon-circle">
            <Sparkles size={28} color="var(--primary)" />
          </div>
          <h3 className="history-empty-title">
            {selectedFilter === 'All' ? 'No Outfit Checks Saved Yet' : `No ${selectedFilter} Fits Saved`}
          </h3>
          <p className="history-empty-desc">
            {selectedFilter === 'All'
              ? 'Upload a photo and check your fit. Every evaluation will automatically be saved to your wardrobe journal.'
              : `You haven't evaluated any outfits for ${selectedFilter} yet.`}
          </p>
          <button
            type="button"
            className="cta-button"
            style={{ maxWidth: '240px', margin: '16px auto 0' }}
            onClick={onNavigateHome}
          >
            <Sparkles size={18} />
            <span>Check a Fit Now</span>
          </button>
        </div>
      )}

      {/* Scrollable list of History Cards */}
      {!loading && filteredItems.length > 0 && (
        <div className="history-cards-list">
          {filteredItems.map((item) => {
            const isExpanded = expandedCardId === item.id;
            return (
              <div key={item.id} className="card history-card">
                <div className="history-card-main" onClick={() => toggleExpand(item.id)}>
                  {/* Photo Thumbnail */}
                  <div className="history-photo-wrapper">
                    <img
                      src={item.photoURL || item.imageUrl}
                      alt={`Outfit for ${item.occasion}`}
                      className="history-photo-img"
                    />
                    <div className="history-score-tag">
                      <span>{item.score}</span>
                      <small>/10</small>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="history-details">
                    <div className="history-top-meta">
                      <span className={`occasion-badge occ-${item.occasion?.toLowerCase()}`}>
                        {item.occasion}
                      </span>
                      <span className="history-time">
                        <Clock size={12} />
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>

                    <h4 className="history-vibe-heading">
                      "{item.vibe || 'Great Outfit'}"
                    </h4>

                    <p className="history-harmony-note">
                      {item.harmony || 'Balanced styling & palette'}
                    </p>

                    <div className="history-card-actions">
                      <span className="history-expand-indicator">
                        {isExpanded ? 'Hide suggestions' : 'View 3 suggestions'}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>

                      <button
                        type="button"
                        className="history-delete-btn"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete this fit from history"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Suggestions Accordion */}
                {isExpanded && item.suggestions && item.suggestions.length > 0 && (
                  <div className="history-suggestions-drawer">
                    <div className="history-drawer-divider" />
                    <p className="history-drawer-title">3 Suggestions from AI Critic:</p>
                    <ul className="history-drawer-list">
                      {item.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="history-drawer-item">
                          <div className="history-bullet-icon">
                            <CheckCircle2 size={13} />
                          </div>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
