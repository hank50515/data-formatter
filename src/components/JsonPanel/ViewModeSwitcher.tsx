import React from 'react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'code' | 'tree';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  const { t } = useTranslation();

  return (
    <div className="view-mode-switcher">
      <button
        className={`mode-btn ${currentMode === 'code' ? 'active' : ''}`}
        onClick={() => onModeChange('code')}
        title={t('viewMode.switchView')}
      >
        <span className="icon">{'</>'}</span> {t('viewMode.code')}
      </button>
      <button
        className={`mode-btn ${currentMode === 'tree' ? 'active' : ''}`}
        onClick={() => onModeChange('tree')}
        title={t('viewMode.switchView')}
      >
        <span className="icon">🌳</span> {t('viewMode.tree')}
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
