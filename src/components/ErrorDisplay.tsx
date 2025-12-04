/**
 * 錯誤顯示元件
 * 顯示格式化過程中的錯誤訊息
 * 支援自動修復功能 (User Story 2)
 */

import { useTranslation } from 'react-i18next';
import type { FormatterError } from '../types';

interface ErrorDisplayProps {
  error: FormatterError | null;
  canAutoFix?: boolean;
  onAutoFix?: () => void;
  isFixing?: boolean;
}

export default function ErrorDisplay({
  error,
  canAutoFix = false,
  onAutoFix,
  isFixing = false,
}: ErrorDisplayProps) {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  return (
    <div className="error-message">
      <div className="error-message__content">
        <div>
          <strong>{t('error.prefix')}</strong> {error.message}
          {error.line !== undefined && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {error.column !== undefined
                ? t('error.locationFull', {
                    line: error.line,
                    column: error.column,
                  })
                : t('error.location', { line: error.line })}
            </div>
          )}
        </div>

        {/* 自動修復按鈕 (User Story 2) */}
        {canAutoFix && onAutoFix && (
          <button
            onClick={onAutoFix}
            disabled={isFixing}
            className="error-message__autofix-button"
            title="自動修復常見的 JSON 錯誤"
          >
            {isFixing ? '修復中...' : '🔧 自動修復'}
          </button>
        )}
      </div>

      {/* 提示：如果可以自動修復 */}
      {canAutoFix && !isFixing && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--success-color)',
          }}
        >
          💡 此錯誤可能可以自動修復，點擊上方按鈕嘗試修復
        </div>
      )}
    </div>
  );
}
