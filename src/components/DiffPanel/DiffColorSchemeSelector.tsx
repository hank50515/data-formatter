/**
 * DiffColorSchemeSelector.tsx
 *
 * Color scheme selector for diff visualization
 * Supports standard, high-contrast, and colorblind-safe modes
 *
 * @feature 007-json-diff-ui-enhancements (T036-T038)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface DiffColorSchemeSelectorProps {
  currentScheme: 'standard' | 'high-contrast' | 'colorblind-safe';
  onSchemeChange: (scheme: 'standard' | 'high-contrast' | 'colorblind-safe') => void;
}

const DiffColorSchemeSelector: React.FC<DiffColorSchemeSelectorProps> = ({
  currentScheme,
  onSchemeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="diff-color-scheme-selector" role="radiogroup" aria-label={t('diff.colorScheme.label', 'Color Scheme')}>
      <span className="diff-color-scheme-selector__title">{t('diff.colorScheme.label', 'Color Scheme')}:</span>

      <label className="diff-color-scheme-selector__option">
        <input
          type="radio"
          name="color-scheme"
          value="standard"
          checked={currentScheme === 'standard'}
          onChange={() => onSchemeChange('standard')}
          aria-label={t('diff.colorScheme.standard')}
        />
        <span className="diff-color-scheme-selector__label">
          {t('diff.colorScheme.standard')}
        </span>
      </label>

      <label className="diff-color-scheme-selector__option">
        <input
          type="radio"
          name="color-scheme"
          value="high-contrast"
          checked={currentScheme === 'high-contrast'}
          onChange={() => onSchemeChange('high-contrast')}
          aria-label={t('diff.colorScheme.highContrast')}
        />
        <span className="diff-color-scheme-selector__label">
          {t('diff.colorScheme.highContrast')}
        </span>
      </label>

      <label className="diff-color-scheme-selector__option">
        <input
          type="radio"
          name="color-scheme"
          value="colorblind-safe"
          checked={currentScheme === 'colorblind-safe'}
          onChange={() => onSchemeChange('colorblind-safe')}
          aria-label={t('diff.colorScheme.colorblindSafe')}
        />
        <span className="diff-color-scheme-selector__label">
          {t('diff.colorScheme.colorblindSafe')}
        </span>
      </label>
    </div>
  );
};

export default DiffColorSchemeSelector;
