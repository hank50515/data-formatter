/**
 * localStorage 工具函數
 * 用於持久化使用者偏好設定
 */

import type { UserPreferences, IndentSize, ViewMode } from '../types/json-advanced';

const STORAGE_KEYS = {
  INDENT_SIZE: 'json-formatter:indentSize',
  VIEW_MODE: 'json-formatter:viewMode',
  PREFERENCES: 'json-formatter:preferences',
  // Diff-related storage keys
  DIFF_ORIGINAL: 'data-formatter-diff-original',
  DIFF_MODIFIED: 'data-formatter-diff-modified',
  DIFF_VIEW_MODE: 'data-formatter-diff-view-mode',
  DIFF_OPTIONS: 'data-formatter-diff-options',
} as const;

/**
 * 儲存縮排大小偏好
 */
export function saveIndentSize(size: IndentSize): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INDENT_SIZE, String(size));
  } catch (error) {
    console.error('Failed to save indent size:', error);
  }
}

/**
 * 讀取縮排大小偏好
 */
export function loadIndentSize(): IndentSize {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INDENT_SIZE);
    if (stored === '2' || stored === '4') {
      return parseInt(stored) as IndentSize;
    }
  } catch (error) {
    console.error('Failed to load indent size:', error);
  }
  return 2; // 預設 2 空格
}

/**
 * 儲存檢視模式偏好
 */
export function saveViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (error) {
    console.error('Failed to save view mode:', error);
  }
}

/**
 * 讀取檢視模式偏好
 */
export function loadViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (stored === 'code' || stored === 'tree') {
      return stored;
    }
  } catch (error) {
    console.error('Failed to load view mode:', error);
  }
  return 'code'; // 預設程式碼檢視
}

/**
 * 儲存所有使用者偏好設定
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * 讀取所有使用者偏好設定
 */
export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }

  // 預設偏好設定
  return {
    indentSize: 2,
    viewMode: 'code',
  };
}

/**
 * 清除所有儲存的偏好設定
 */
export function clearPreferences(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear preferences:', error);
  }
}

// ============================================================================
// Diff Storage Functions
// ============================================================================

/**
 * 儲存原始 JSON 到 localStorage
 */
export function saveDiffOriginalJSON(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIFF_ORIGINAL, json);
  } catch (error) {
    console.error('Failed to save diff original JSON:', error);
  }
}

/**
 * 讀取原始 JSON 從 localStorage
 */
export function loadDiffOriginalJSON(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.DIFF_ORIGINAL);
  } catch (error) {
    console.error('Failed to load diff original JSON:', error);
    return null;
  }
}

/**
 * 儲存修改 JSON 到 localStorage
 */
export function saveDiffModifiedJSON(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIFF_MODIFIED, json);
  } catch (error) {
    console.error('Failed to save diff modified JSON:', error);
  }
}

/**
 * 讀取修改 JSON 從 localStorage
 */
export function loadDiffModifiedJSON(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.DIFF_MODIFIED);
  } catch (error) {
    console.error('Failed to load diff modified JSON:', error);
    return null;
  }
}

/**
 * 儲存 Diff 檢視模式到 localStorage
 */
export function saveDiffViewMode(viewMode: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIFF_VIEW_MODE, viewMode);
  } catch (error) {
    console.error('Failed to save diff view mode:', error);
  }
}

/**
 * 讀取 Diff 檢視模式從 localStorage
 */
export function loadDiffViewMode(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.DIFF_VIEW_MODE) || 'side-by-side';
  } catch (error) {
    console.error('Failed to load diff view mode:', error);
    return 'side-by-side';
  }
}

/**
 * 儲存 Diff 選項到 localStorage
 */
export function saveDiffOptions(options: any): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIFF_OPTIONS, JSON.stringify(options));
  } catch (error) {
    console.error('Failed to save diff options:', error);
  }
}

/**
 * 讀取 Diff 選項從 localStorage
 */
export function loadDiffOptions(): any {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIFF_OPTIONS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load diff options:', error);
    return null;
  }
}

/**
 * 清除所有 Diff 相關的 localStorage 資料
 */
export function clearDiffStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DIFF_ORIGINAL);
    localStorage.removeItem(STORAGE_KEYS.DIFF_MODIFIED);
    localStorage.removeItem(STORAGE_KEYS.DIFF_VIEW_MODE);
    localStorage.removeItem(STORAGE_KEYS.DIFF_OPTIONS);
  } catch (error) {
    console.error('Failed to clear diff storage:', error);
  }
}

/**
 * 清除兩側 Diff 輸入 (僅清除 Original 和 Modified)
 * @feature 007-json-diff-ui-enhancements
 * @task T010
 */
export function clearDiffInputs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DIFF_ORIGINAL);
    localStorage.removeItem(STORAGE_KEYS.DIFF_MODIFIED);
  } catch (error) {
    console.error('Failed to clear diff inputs:', error);
  }
}
