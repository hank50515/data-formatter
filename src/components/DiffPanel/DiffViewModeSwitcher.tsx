/**
 * DiffViewModeSwitcher.tsx
 *
 * 檢視模式切換器 - 提供 side-by-side 和 unified 模式切換
 * Enhanced with character-level diff mode toggle
 *
 * @feature 006-json-diff-compare
 * @feature 007-json-diff-ui-enhancements (T031)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffViewMode } from '../../types/diff';

interface DiffViewModeSwitcherProps {
  currentMode: DiffViewMode;
  onModeChange: (mode: DiffViewMode) => void;
  diffHighlightMode?: 'line' | 'char' | 'both';
  onDiffModeChange?: (mode: 'line' | 'char' | 'both') => void;
}

const DiffViewModeSwitcher: React.FC<DiffViewModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  diffHighlightMode = 'char',
  onDiffModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="diff-view-mode-switcher-container">
      {/* View Mode Switcher: Side-by-side vs Unified */}
      <div className="diff-view-mode-switcher" role="radiogroup" aria-label={t('diff.viewMode.label')}>
        <span className="diff-view-mode-switcher__title">{t('diff.viewMode.label', 'View Mode')}:</span>
        <label className="diff-view-mode-switcher__option">
          <input
            type="radio"
            name="diff-view-mode"
            value="side-by-side"
            checked={currentMode === 'side-by-side'}
            onChange={() => onModeChange('side-by-side')}
            aria-label={t('diff.viewMode.sideBySide')}
          />
          <span className="diff-view-mode-switcher__label">
            {t('diff.viewMode.sideBySide')}
          </span>
        </label>

        <label className="diff-view-mode-switcher__option">
          <input
            type="radio"
            name="diff-view-mode"
            value="unified"
            checked={currentMode === 'unified'}
            onChange={() => onModeChange('unified')}
            aria-label={t('diff.viewMode.unified')}
          />
          <span className="diff-view-mode-switcher__label">
            {t('diff.viewMode.unified')}
          </span>
        </label>
      </div>

      {/* Diff Highlight Mode Switcher: Line vs Char vs Both (T031) */}
      {onDiffModeChange && (
        <div className="diff-highlight-mode-switcher" role="radiogroup" aria-label={t('diff.highlightMode.label', 'Diff Granularity')}>
          <span className="diff-highlight-mode-switcher__title">{t('diff.highlightMode.label', 'Granularity')}:</span>
          <label className="diff-highlight-mode-switcher__option">
            <input
              type="radio"
              name="diff-highlight-mode"
              value="line"
              checked={diffHighlightMode === 'line'}
              onChange={() => onDiffModeChange('line')}
              aria-label={t('diff.lineDiffMode', 'Line-level diff')}
            />
            <span className="diff-highlight-mode-switcher__label">
              {t('diff.lineDiffMode', 'Line')}
            </span>
          </label>

          <label className="diff-highlight-mode-switcher__option">
            <input
              type="radio"
              name="diff-highlight-mode"
              value="char"
              checked={diffHighlightMode === 'char'}
              onChange={() => onDiffModeChange('char')}
              aria-label={t('diff.charDiffMode', 'Character-level diff')}
            />
            <span className="diff-highlight-mode-switcher__label">
              {t('diff.charDiffMode', 'Char')}
            </span>
          </label>

          <label className="diff-highlight-mode-switcher__option">
            <input
              type="radio"
              name="diff-highlight-mode"
              value="both"
              checked={diffHighlightMode === 'both'}
              onChange={() => onDiffModeChange('both')}
              aria-label={t('diff.bothDiffMode', 'Line + Character diff')}
            />
            <span className="diff-highlight-mode-switcher__label">
              {t('diff.bothDiffMode', 'Both')}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default DiffViewModeSwitcher;
