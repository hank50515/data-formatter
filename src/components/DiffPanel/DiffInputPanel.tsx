/**
 * DiffInputPanel.tsx
 *
 * 雙輸入面板元件 - 提供原始與修改 JSON 的輸入框
 *
 * @feature 006-json-diff-compare
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface DiffInputPanelProps {
  originalJSON: string;
  modifiedJSON: string;
  onOriginalChange: (value: string) => void;
  onModifiedChange: (value: string) => void;
}

const DiffInputPanel: React.FC<DiffInputPanelProps> = ({
  originalJSON,
  modifiedJSON,
  onOriginalChange,
  onModifiedChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="diff-input-panel">
      <div className="diff-input-panel__column">
        <label htmlFor="original-json" className="diff-input-panel__label">
          {t('diff.original')}
        </label>
        <textarea
          id="original-json"
          className="diff-input-panel__textarea"
          value={originalJSON}
          onChange={(e) => onOriginalChange(e.target.value)}
          placeholder={t('diff.original')}
          rows={15}
          spellCheck={false}
        />
      </div>

      <div className="diff-input-panel__column">
        <label htmlFor="modified-json" className="diff-input-panel__label">
          {t('diff.modified')}
        </label>
        <textarea
          id="modified-json"
          className="diff-input-panel__textarea"
          value={modifiedJSON}
          onChange={(e) => onModifiedChange(e.target.value)}
          placeholder={t('diff.modified')}
          rows={15}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default DiffInputPanel;
