/**
 * 控制列元件
 * 提供清除、格式化、壓縮等操作按鈕
 */

import { useTranslation } from 'react-i18next';
import { IndentSelector } from './IndentSelector';
import type { IndentSize } from '../../types/json-advanced';

interface ControlBarProps {
  // 縮排設定
  indentSize: IndentSize;
  onIndentChange: (size: IndentSize) => void;

  // 操作按鈕
  onClear: () => void;
  onFormat: () => void;
  onMinify: () => void;

  // 按鈕狀態
  disabled?: boolean;
  hasInput?: boolean; // 是否有輸入內容
}

export function ControlBar({
  indentSize,
  onIndentChange,
  onClear,
  onFormat,
  onMinify,
  disabled = false,
  hasInput = false,
}: ControlBarProps) {
  const { t } = useTranslation();
  return (
    <div className="control-bar">
      {/* 縮排選擇器 */}
      <IndentSelector
        value={indentSize}
        onChange={onIndentChange}
        disabled={disabled}
      />

      {/* 操作按鈕組 */}
      <div className="control-bar__actions">
        <button
          onClick={onClear}
          disabled={!hasInput}
          className="control-bar__button control-bar__button--clear"
          aria-label={t('controlBar.clear')}
          title={`${t('controlBar.clear')} (Ctrl+K)`}
        >
          <span className="control-bar__button-icon">🗑️</span>
          <span className="control-bar__button-text">{t('controlBar.clear')}</span>
        </button>

        <button
          onClick={onFormat}
          disabled={disabled || !hasInput}
          className="control-bar__button control-bar__button--format"
          aria-label={t('controlBar.format')}
          title={`${t('controlBar.format')} (Ctrl+B)`}
        >
          <span className="control-bar__button-icon">✨</span>
          <span className="control-bar__button-text">{t('controlBar.format')}</span>
        </button>

        <button
          onClick={onMinify}
          disabled={disabled || !hasInput}
          className="control-bar__button control-bar__button--minify"
          aria-label={t('controlBar.minify')}
          title={`${t('controlBar.minify')} (Ctrl+M)`}
        >
          <span className="control-bar__button-icon">📦</span>
          <span className="control-bar__button-text">{t('controlBar.minify')}</span>
        </button>
      </div>
    </div>
  );
}
