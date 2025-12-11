/**
 * DiffNavigation.tsx
 *
 * 差異導航元件 - 提供 Next/Previous 按鈕來跳轉差異
 *
 * @feature 006-json-diff-compare
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface DiffNavigationProps {
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  onPrevious: () => void;
  onClearBoth?: () => void;
  isClearing?: boolean;
}

const DiffNavigation: React.FC<DiffNavigationProps> = ({
  currentIndex,
  totalCount,
  onNext,
  onPrevious,
  onClearBoth,
  isClearing = false,
}) => {
  const { t } = useTranslation();

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="diff-navigation">
      <div className="diff-navigation__info">
        <span className="diff-navigation__text">
          {t('diff.navigation.current', { current: currentIndex + 1, total: totalCount })}
        </span>
      </div>

      <div className="diff-navigation__controls">
        <button
          className="diff-navigation__button diff-navigation__button--prev"
          onClick={onPrevious}
          disabled={totalCount === 0}
          aria-label={`${t('diff.navigation.previous')} (Alt+P)`}
          title={`${t('diff.navigation.previous')} (Alt+P)`}
        >
          ▲ {t('diff.navigation.previous')}
        </button>

        <button
          className="diff-navigation__button diff-navigation__button--next"
          onClick={onNext}
          disabled={totalCount === 0}
          aria-label={`${t('diff.navigation.next')} (Alt+N)`}
          title={`${t('diff.navigation.next')} (Alt+N)`}
        >
          ▼ {t('diff.navigation.next')}
        </button>

        {onClearBoth && (
          <button
            className="diff-navigation__button diff-navigation__button--clear"
            onClick={onClearBoth}
            disabled={isClearing}
            aria-label={t('diff.clearBoth')}
            title={t('diff.clearBoth')}
          >
            🗑️ {isClearing ? t('diff.clearing') : t('diff.clearBoth')}
          </button>
        )}
      </div>
    </div>
  );
};

export default DiffNavigation;
