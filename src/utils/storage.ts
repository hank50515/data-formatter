/**
 * localStorage 工具函數
 * 用於持久化使用者偏好設定
 */

import type { UserPreferences, IndentSize, ViewMode } from '../types/json-advanced';

const STORAGE_KEYS = {
  INDENT_SIZE: 'json-formatter:indentSize',
  VIEW_MODE: 'json-formatter:viewMode',
  PREFERENCES: 'json-formatter:preferences',
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
