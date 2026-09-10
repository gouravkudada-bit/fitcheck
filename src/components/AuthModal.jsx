import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, isFirebaseConfigured } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">
            {isSignUp ? 'Create your Account' : 'Welcome to FitCheck'}
          </h2>
          <p className="modal-subtitle">
            Sign in to save your outfit evaluations and build your personal style history.
          </p>
        </div>

        {error && (
          <div className="modal-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="modal-divider">
          <span>or continue with email</span>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailSubmit} className="modal-form">
          {isSignUp && (
            <div className="input-group">
              <label htmlFor="auth-name">Your Name</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="cta-button auth-submit-btn" disabled={loading}>
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="modal-footer">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="modal-toggle-btn"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="modal-toggle-btn"
                onClick={() => setIsSignUp(true)}
              >
                Create one
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
