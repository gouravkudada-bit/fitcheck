import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, History, LogIn, LogOut, CheckCircle } from 'lucide-react';

export default function Header({ activeTab, onTabChange, historyCount = 0, onOpenAuth }) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="app-header">
      {/* Top utility bar: Advisor Badge & Auth User Status */}
      <div className="header-top-bar">
        <div className="logo-badge">
          <Sparkles size={14} />
          <span>FITCHECK AI</span>
        </div>

        <div className="header-auth-section">
          {currentUser ? (
            <div className="user-profile-badge">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="user-avatar-img"
              />
              <span className="user-name-text">
                {currentUser.displayName || currentUser.email.split('@')[0]}
              </span>
              <button
                type="button"
                className="user-logout-btn"
                onClick={logout}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="header-signin-btn"
              onClick={onOpenAuth}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Branding Title */}
      <h1 className="app-title">
        Fit<span>Check</span>
      </h1>
      <p className="app-tagline">
        Instant outfit rating and personalized styling advice powered by Gemini.
      </p>

      {/* Navigation Switcher Tabs */}
      <nav className="header-nav-tabs" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
        >
          <Sparkles size={16} />
          <span>Check Fit</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          <History size={16} />
          <span>My History</span>
          {historyCount > 0 && (
            <span className="nav-tab-badge">{historyCount}</span>
          )}
        </button>
      </nav>
    </header>
  );
}
