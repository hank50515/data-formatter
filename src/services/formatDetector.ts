/**
 * 格式偵測服務
 * 自動偵測輸入文字的資料格式類型
 */

import type { FormatType } from '../types';

/**
 * 偵測輸入文字的格式類型
 * @param input - 原始輸入文字
 * @returns 偵測到的格式類型
 */
export function detectFormat(input: string): FormatType | 'unknown' {
  const trimmed = input.trim();

  if (!trimmed) {
    return 'unknown';
  }

  // 優先嘗試 JSON 偵測
  if (isJSON(trimmed)) {
    return 'json';
  }

  // XML 偵測（P2 功能，目前回傳 unknown）
  if (trimmed.startsWith('<') && trimmed.includes('</')) {
    return 'unknown'; // 將在 P2 實作時改為 'xml'
  }

  // YAML 偵測（P2 功能，目前回傳 unknown）
  if (trimmed.includes(':') && !trimmed.startsWith('{') && !trimmed.startsWith('<')) {
    return 'unknown'; // 將在 P2 實作時改為 'yaml'
  }

  // CSV 偵測（P2 功能，目前回傳 unknown）
  if (trimmed.includes(',') && isLikelyCSV(trimmed)) {
    return 'unknown'; // 將在 P2 實作時改為 'csv'
  }

  return 'unknown';
}

/**
 * 檢查字串是否為有效 JSON
 * @param input - 要檢查的字串
 * @returns 是否為 JSON
 */
function isJSON(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * 檢查字串是否像 CSV
 * 簡單檢查：多行且每行都有逗號
 * @param input - 要檢查的字串
 * @returns 是否像 CSV
 */
function isLikelyCSV(input: string): boolean {
  const lines = input.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    return false;
  }

  // 檢查每行是否都有逗號
  const allHaveCommas = lines.every((line) => line.includes(','));

  // 檢查每行的欄位數量是否一致
  const firstLineColumns = lines[0].split(',').length;
  const consistentColumns = lines.every(
    (line) => line.split(',').length === firstLineColumns
  );

  return allHaveCommas && consistentColumns;
}
