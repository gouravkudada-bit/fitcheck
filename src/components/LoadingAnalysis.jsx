import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const ANALYSIS_STEPS = [
  { text: "Scanning silhouette and color palette...", sub: "Evaluating fabric synergy & contrast" },
  { text: "Assessing fit for selected occasion...", sub: "Measuring formality balance & styling cues" },
  { text: "Finalizing your rating & styling tips...", sub: "Drafting 3 key improvement pointers" }
];

export default function LoadingAnalysis({ occasion }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 700);
    const timer2 = setTimeout(() => setCurrentStep(2), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="card analysis-card">
      <div className="scanner-avatar-wrapper">
        <div className="scanner-ring-outer"></div>
        <div className="scanner-ring"></div>
        <div className="scanner-core-icon">
          <Sparkles size={24} />
        </div>
      </div>

      <h3 className="analysis-status-text">
        {ANALYSIS_STEPS[currentStep].text}
      </h3>
      <p className="analysis-status-sub">
        {ANALYSIS_STEPS[currentStep].sub} • Evaluating for <strong>{occasion}</strong>
      </p>

      <div className="analysis-step-pills">
        {ANALYSIS_STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`step-pill ${idx <= currentStep ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
