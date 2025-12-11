/**
 * DiffSummary.tsx
 *
 * 差異摘要元件 - 顯示新增、刪除、修改的統計數量
 *
 * @feature 006-json-diff-compare
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffSummary as DiffSummaryType } from '../../types/diff';

interface DiffSummaryProps {
  summary: DiffSummaryType;
}

const DiffSummary: React.FC<DiffSummaryProps> = ({ summary }) => {
  const { t } = useTranslation();

  if (summary.totalChanges === 0) {
    return (
      <div className="diff-summary">
        <p className="diff-summary__no-changes">{t('diff.noDifferences')}</p>
      </div>
    );
  }

  return (
    <div className="diff-summary">
      <h3 className="diff-summary__title">{t('diff.summary.title')}</h3>
      <div className="diff-summary__stats">
        <div className="diff-summary__stat diff-summary__stat--total">
          <span className="diff-summary__stat-label">
            {t('diff.summary.total', { count: summary.totalChanges })}
          </span>
        </div>
        <div className="diff-summary__stat diff-summary__stat--addition">
          <span className="diff-summary__stat-label">
            {t('diff.summary.additions', { count: summary.additionCount })}
          </span>
        </div>
        <div className="diff-summary__stat diff-summary__stat--deletion">
          <span className="diff-summary__stat-label">
            {t('diff.summary.deletions', { count: summary.deletionCount })}
          </span>
        </div>
        <div className="diff-summary__stat diff-summary__stat--modification">
          <span className="diff-summary__stat-label">
            {t('diff.summary.modifications', { count: summary.modificationCount })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiffSummary;
