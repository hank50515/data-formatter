import React from 'react';

export type ViewMode = 'code' | 'tree';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="view-mode-switcher">
      <button
        className={`mode-btn ${currentMode === 'code' ? 'active' : ''}`}
        onClick={() => onModeChange('code')}
        title="Switch to Code View"
      >
        <span className="icon">{'</>'}</span> Code
      </button>
      <button
        className={`mode-btn ${currentMode === 'tree' ? 'active' : ''}`}
        onClick={() => onModeChange('tree')}
        title="Switch to Tree View"
      >
        <span className="icon">🌳</span> Tree
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
