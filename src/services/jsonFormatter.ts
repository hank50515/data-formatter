/**
 * JSON 格式化服務
 * 使用原生 JSON.parse 和 JSON.stringify 進行格式化
 */

import type { FormatterError } from '../types';
import type { ValidationResult } from '../types/json-advanced';

/**
 * 格式化 JSON 字串
 * @param input - 未格式化的 JSON 字串
 * @param indentSize - 縮排空格數（預設 2）
 * @returns 格式化後的 JSON 字串
 * @throws 當 JSON 無效時拋出錯誤
 */
export function formatJSON(input: string, indentSize: number = 2): string {
  try {
    // 去除首尾空白
    const trimmed = input.trim();

    if (!trimmed) {
      throw new Error('輸入內容為空');
    }

    // 解析 JSON
    const parsed = JSON.parse(trimmed);

    // 格式化 JSON（使用指定的縮排）
    return JSON.stringify(parsed, null, indentSize);
  } catch (error) {
    // 重新拋出錯誤讓上層處理
    throw error;
  }
}

/**
 * 解析 JSON 錯誤並提取錯誤位置
 * @param error - JSON.parse 拋出的錯誤
 * @param input - 原始輸入字串
 * @returns 格式化的錯誤物件
 */
export function parseJSONError(error: unknown, input: string): FormatterError {
  if (!(error instanceof Error)) {
    return {
      message: '未知錯誤',
      type: 'unknown',
    };
  }

  const errorMessage = error.message;

  // 嘗試從錯誤訊息中提取行號和列號
  // JSON.parse 錯誤訊息通常包含位置資訊
  const positionMatch = errorMessage.match(/position (\d+)/i);

  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const lines = input.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    return {
      message: `JSON 格式錯誤：${errorMessage}`,
      line,
      column,
      type: 'parse_error',
    };
  }

  // 如果無法提取位置，回傳基本錯誤訊息
  return {
    message: `JSON 格式錯誤：${errorMessage}`,
    type: 'parse_error',
  };
}

/**
 * 驗證 JSON 字串是否有效
 * @param input - 要驗證的字串
 * @returns 是否為有效 JSON
 */
export function isValidJSON(input: string): boolean {
  try {
    JSON.parse(input.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * 壓縮 JSON 字串（移除所有空白和換行）
 * @param input - JSON 字串（可以是格式化的或未格式化的）
 * @returns 壓縮後的 JSON 字串（無空白、無換行）
 * @throws 當 JSON 無效時拋出錯誤
 */
export function minifyJSON(input: string): string {
  try {
    const trimmed = input.trim();

    if (!trimmed) {
      throw new Error('輸入內容為空');
    }

    // 解析 JSON
    const parsed = JSON.parse(trimmed);

    // 壓縮：不使用任何縮排和空格
    return JSON.stringify(parsed);
  } catch (error) {
    throw error;
  }
}

/**
 * 即時驗證 JSON 字串
 * @param input - 要驗證的 JSON 字串
 * @returns 驗證結果（包含錯誤位置和訊息）
 */
export function validateJSON(input: string): ValidationResult {
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

  try {
    JSON.parse(trimmed);
    return {
      isValid: true,
      canAutoFix: false,
    };
  } catch (error) {
    if (!(error instanceof Error)) {
      return {
        isValid: false,
        canAutoFix: true,
        error: {
          message: '未知的 JSON 錯誤',
          line: 1,
          column: 1,
        },
      };
    }

    const errorMessage = error.message;

    // 嘗試從錯誤訊息中提取位置資訊
    const positionMatch = errorMessage.match(/position (\d+)/i);
    let line = 1;
    let column = 1;

    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const lines = trimmed.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    } else {
      // 嘗試其他格式的錯誤訊息
      const lineMatch = errorMessage.match(/line (\d+)/i);
      const colMatch = errorMessage.match(/column (\d+)/i);

      if (lineMatch) line = parseInt(lineMatch[1], 10);
      if (colMatch) column = parseInt(colMatch[1], 10);
    }

    // 檢查是否為常見的可修復錯誤
    const canAutoFix =
      errorMessage.includes('Unexpected token') ||
      errorMessage.includes('Unexpected end') ||
      errorMessage.includes('Expected') ||
      errorMessage.includes('trailing comma') ||
      errorMessage.includes('property name');

    return {
      isValid: false,
      canAutoFix,
      error: {
        message: `JSON 語法錯誤: ${errorMessage}`,
        line,
        column,
      },
    };
  }
}
