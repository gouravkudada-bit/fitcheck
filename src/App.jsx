import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PhotoUploader from './components/PhotoUploader';
import OccasionSelect from './components/OccasionSelect';
import LoadingAnalysis from './components/LoadingAnalysis';
import FitScoreCard from './components/FitScoreCard';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { saveOutfitCheck, getUserHistory } from './services/historyService';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

// Sample demo outfit for instant one-click testing
const DEMO_OUTFIT_URL = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";

export default function App() {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'history'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const [imagePreview, setImagePreview] = useState(null);
  const [occasion, setOccasion] = useState('Casual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync history count whenever user logs in or changes
  const refreshHistoryCount = async () => {
    if (currentUser?.uid) {
      try {
        const history = await getUserHistory(currentUser.uid);
        setHistoryCount(history.length);
      } catch (err) {
        console.error('Failed to fetch history count:', err);
      }
    } else {
      setHistoryCount(0);
    }
  };

  useEffect(() => {
    refreshHistoryCount();
  }, [currentUser?.uid]);

  // If a user logs in while viewing an unsaved result, auto-save it
  useEffect(() => {
    if (currentUser?.uid && analysisResult && !isSaved && imagePreview) {
      saveOutfitCheck(currentUser.uid, {
        photoURL: imagePreview,
        occasion,
        ...analysisResult,
      }).then(() => {
        setIsSaved(true);
        refreshHistoryCount();
      }).catch((err) => {
        console.warn('Auto-save upon login failed:', err);
      });
    }
  }, [currentUser?.uid, analysisResult, isSaved, imagePreview, occasion]);

  const handleImageSelect = (previewUrl) => {
    setImagePreview(previewUrl);
    setAnalysisResult(null);
    setIsSaved(false);
    setErrorMessage(null);
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setIsSaved(false);
    setErrorMessage(null);
  };

  const handleUseDemoPhoto = () => {
    setImagePreview(DEMO_OUTFIT_URL);
    setAnalysisResult(null);
    setIsSaved(false);
    setErrorMessage(null);
  };

  const handleCheckFit = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsSaved(false);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/check-fit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imagePreview,
          occasion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setAnalysisResult(data);

      // Save to history if logged in
      if (currentUser?.uid) {
        try {
          await saveOutfitCheck(currentUser.uid, {
            photoURL: imagePreview,
            occasion,
            ...data,
          });
          setIsSaved(true);
          refreshHistoryCount();
        } catch (saveErr) {
          console.warn('Failed to save to history:', saveErr);
        }
      }

      // Smooth scroll to the result card
      setTimeout(() => {
        document.getElementById('fitcheck-results-card')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err) {
      console.error('Failed to analyze fit with Gemini:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while contacting the Gemini API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsSaved(false);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      <main className="main-container">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={historyCount}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Tab 1: Check Fit Flow */}
        {activeTab === 'home' && (
          <>
            {/* Upload Section */}
            <PhotoUploader
              imagePreview={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
            />

            {/* Demo outfit shortcut helper */}
            {!imagePreview && (
              <div style={{ textAlign: 'center', marginTop: '-6px' }}>
                <button
                  type="button"
                  id="try-demo-outfit-btn"
                  onClick={handleUseDemoPhoto}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '4px 8px',
                  }}
                >
                  Don't have a photo handy? Click to use demo outfit
                </button>
              </div>
            )}

            {/* Occasion Selection */}
            <OccasionSelect
              selectedOccasion={occasion}
              onSelectOccasion={(newOccasion) => {
                setOccasion(newOccasion);
                if (analysisResult) setAnalysisResult(null);
                if (errorMessage) setErrorMessage(null);
              }}
            />

            {/* Error Alert Box */}
            {errorMessage && (
              <div
                className="card"
                style={{
                  borderColor: '#F87171',
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <AlertCircle size={20} color="#DC2626" />
                  <span>Gemini AI Analysis Error</span>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.4, color: '#7F1D1D' }}>
                  {errorMessage}
                </p>
                {errorMessage.includes('GEMINI_API_KEY') && (
                  <p style={{ fontSize: '0.82rem', color: '#991B1B', marginTop: '4px' }}>
                    💡 <strong>How to fix:</strong> Add your Gemini API key to <code>.env</code> file in the project directory as <code>GEMINI_API_KEY=your_key_here</code> and restart the server.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleCheckFit}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                    background: '#DC2626',
                    color: '#FFF',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* "Check My Fit" Primary Trigger */}
            {!isAnalyzing && !analysisResult && (
              <button
                type="button"
                id="check-my-fit-btn"
                className="cta-button"
                disabled={!imagePreview}
                onClick={handleCheckFit}
              >
                <Sparkles size={20} />
                <span>Check My Fit</span>
                <ArrowRight size={18} />
              </button>
            )}

            {/* Loading / Progress State */}
            {isAnalyzing && (
              <LoadingAnalysis occasion={occasion} />
            )}

            {/* Results Card */}
            {analysisResult && !isAnalyzing && (
              <FitScoreCard
                result={analysisResult}
                onReset={handleReset}
                currentUser={currentUser}
                isSaved={isSaved}
                onViewHistory={() => setActiveTab('history')}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}
          </>
        )}

        {/* Tab 2: My History Flow */}
        {activeTab === 'history' && (
          <HistoryView
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        <footer className="app-footer">
          FitCheck • Powered by Google Gemini AI & Firebase • Mobile-first Design
        </footer>
      </main>

      {/* Authentication Modal Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={refreshHistoryCount}
      />
    </div>
  );
}
