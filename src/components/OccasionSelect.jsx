import React from 'react';
import { Calendar, Coffee, Briefcase, Heart, Sparkles } from 'lucide-react';
import { OCCASIONS } from '../data/mockFeedback';

export default function OccasionSelect({ selectedOccasion, onSelectOccasion }) {
  const getOccasionIcon = (iconName) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee size={16} />;
      case 'Briefcase':
        return <Briefcase size={16} />;
      case 'Heart':
        return <Heart size={16} />;
      case 'Sparkles':
        return <Sparkles size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  return (
    <div className="card occasion-card">
      <div className="section-header">
        <span className="section-label">
          <Calendar size={18} color="var(--primary)" />
          2. Select Occasion
        </span>
        <span className="section-step">Step 2</span>
      </div>

      {/* Primary Dropdown as explicitly requested */}
      <div className="occasion-select-native-wrapper">
        <label htmlFor="occasion-dropdown" className="uploader-prompt-sub" style={{ display: 'block', marginBottom: '6px' }}>
          Where are you wearing this fit?
        </label>
        <select
          id="occasion-dropdown"
          className="occasion-native-select"
          value={selectedOccasion}
          onChange={(e) => onSelectOccasion(e.target.value)}
        >
          {OCCASIONS.map((occ) => (
            <option key={occ.id} value={occ.id}>
              {occ.label} — {occ.id === 'Casual' ? 'Everyday & Weekend' : occ.id === 'Work' ? 'Office & Meetings' : occ.id === 'Date' ? 'Dinner & Nights Out' : 'Galas & Black Tie'}
            </option>
          ))}
        </select>
      </div>

      {/* Visual quick-select cards for instant mobile tapping */}
      <div className="occasion-grid" role="radiogroup" aria-label="Quick occasion selection">
        {OCCASIONS.map((occ) => {
          const isSelected = selectedOccasion === occ.id;
          return (
            <div
              key={occ.id}
              className={`occasion-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectOccasion(occ.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectOccasion(occ.id)}
            >
              <div className="occasion-pill-top">
                <div className="occasion-pill-name">
                  {getOccasionIcon(occ.icon)}
                  <span>{occ.label}</span>
                </div>
              </div>
              <span className="occasion-pill-desc">{occ.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
