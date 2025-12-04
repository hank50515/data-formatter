/**
 * JSON 自動修復服務
 * 使用 jsonrepair 函式庫修復常見的 JSON 語法錯誤
 */

import { jsonrepair } from 'jsonrepair';
import type { ValidationResult } from '../types/json-advanced';

/**
 * 嘗試自動修復 JSON 字串
 * @param input - 可能包含錯誤的 JSON 字串
 * @returns 修復結果（包含修復後的 JSON 或錯誤資訊）
 */
export function autoFixJSON(input: string): ValidationResult {
  try {
    // 去除首尾空白
    const trimmed = input.trim();

    if (!trimmed) {
      return {
        isValid: false,
        canAutoFix: false,
        error: {
          message: '輸入內容為空',
          line: 1,
          column: 1,
        },
      };
    }

    // 先檢查是否為有效 JSON
    try {
      JSON.parse(trimmed);
      // 如果已經是有效 JSON，直接回傳
      return {
        isValid: true,
        canAutoFix: false,
        fixedJSON: trimmed,
      };
    } catch {
      // 不是有效 JSON，嘗試修復
    }

    // 使用 jsonrepair 修復
    const repaired = jsonrepair(trimmed);

    // 驗證修復後的 JSON 是否有效
    try {
      JSON.parse(repaired);
      return {
        isValid: true,
        canAutoFix: true,
        fixedJSON: repaired,
      };
    } catch (error) {
      // 修復後仍然無效
      return {
        isValid: false,
        canAutoFix: false,
        error: {
          message: '自動修復失敗，請手動檢查 JSON 語法',
          line: 1,
          column: 1,
        },
      };
    }
  } catch (error) {
    // jsonrepair 本身拋出錯誤
    const errorMessage =
      error instanceof Error
        ? error.message
        : '未知錯誤';

    return {
      isValid: false,
      canAutoFix: false,
      error: {
        message: `自動修復失敗: ${errorMessage}`,
        line: 1,
        column: 1,
      },
    };
  }
}

/**
 * 檢查 JSON 錯誤是否可以自動修復
 * @param input - JSON 字串
 * @returns 是否可以自動修復
 */
export function canAutoFix(input: string): boolean {
  const result = autoFixJSON(input);
  return result.canAutoFix;
}

/**
 * 常見的可修復錯誤類型
 */
export const FIXABLE_ERRORS = [
  '缺少逗號',
  '多餘的逗號',
  '缺少引號',
  '單引號（應使用雙引號）',
  '缺少結束括號',
  '缺少結束大括號',
  '註解（JSON 不支援註解）',
] as const;
