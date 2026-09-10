import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, RefreshCw, Trash2, Camera } from 'lucide-react';

export default function PhotoUploader({ imagePreview, onImageSelect, onImageRemove }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WEBP, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelect(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="card uploader-card">
      <div className="section-header">
        <span className="section-label">
          <Camera size={18} color="var(--primary)" />
          1. Upload Your Outfit
        </span>
        <span className="section-step">Step 1</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="fitcheck-file-input"
        className="hidden-file-input"
        accept="image/*"
        onChange={handleFileChange}
      />

      {!imagePreview ? (
        <div
          id="fitcheck-dropzone"
          className={`uploader-dropzone ${isDragOver ? 'drag-active' : ''}`}
          onClick={triggerPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerPicker()}
        >
          <div className="uploader-icon-circle">
            <UploadCloud size={28} />
          </div>
          <p className="uploader-prompt-main">Drop outfit photo here</p>
          <p className="uploader-prompt-sub">or click to browse from your device</p>
        </div>
      ) : (
        <div className="preview-container">
          <img src={imagePreview} alt="Outfit preview" className="preview-img" />
          <div className="preview-badge">
            <ImageIcon size={14} />
            <span>Outfit Loaded</span>
          </div>
          <div className="preview-actions">
            <button
              type="button"
              id="change-photo-btn"
              className="preview-action-btn"
              onClick={triggerPicker}
              title="Select a different photo"
            >
              <RefreshCw size={14} />
              <span>Change</span>
            </button>
            <button
              type="button"
              id="remove-photo-btn"
              className="preview-action-btn delete-btn"
              onClick={onImageRemove}
              title="Remove photo"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
