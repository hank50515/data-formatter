/**
 * 控制列元件
 * 提供清除、格式化、壓縮等操作按鈕
 */

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
          aria-label="清除所有資料"
          title="清除所有資料 (Ctrl+K)"
        >
          <span className="control-bar__button-icon">🗑️</span>
          <span className="control-bar__button-text">清除</span>
        </button>

        <button
          onClick={onFormat}
          disabled={disabled || !hasInput}
          className="control-bar__button control-bar__button--format"
          aria-label="格式化 JSON"
          title="格式化 JSON (Ctrl+B)"
        >
          <span className="control-bar__button-icon">✨</span>
          <span className="control-bar__button-text">格式化</span>
        </button>

        <button
          onClick={onMinify}
          disabled={disabled || !hasInput}
          className="control-bar__button control-bar__button--minify"
          aria-label="壓縮 JSON"
          title="壓縮 JSON (Ctrl+M)"
        >
          <span className="control-bar__button-icon">📦</span>
          <span className="control-bar__button-text">壓縮</span>
        </button>
      </div>
    </div>
  );
}
