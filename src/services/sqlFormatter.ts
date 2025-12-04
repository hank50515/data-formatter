/**
 * SQL Formatter Service
 *
 * 使用 sql-formatter 格式化 SQL
 * 關鍵字大寫、智慧縮排
 */

import { format } from 'sql-formatter';
import type { FormatterError } from '../types';

export interface SQLFormatterResult {
  formattedText: string;
  error: FormatterError | null;
}

/**
 * 格式化 SQL 字串
 * @param input 原始 SQL 字串
 * @returns 格式化結果
 */
export function formatSQL(input: string): SQLFormatterResult {
  try {
    // 移除前後空白
    const trimmed = input.trim();

    if (!trimmed) {
      return {
        formattedText: '',
        error: null,
      };
    }

    // 使用 sql-formatter 格式化
    const formatted = format(trimmed, {
      // 語言類型（自動偵測）
      language: 'sql',
      // 縮排 2 個空格
      tabWidth: 2,
      // 使用空格而非 tab
      useTabs: false,
      // 關鍵字大寫
      keywordCase: 'upper',
      // 資料型別大寫
      dataTypeCase: 'upper',
      // 函數名稱大寫
      functionCase: 'upper',
      // 查詢之間的空行數
      linesBetweenQueries: 2,
      // 邏輯運算子換行
      logicalOperatorNewline: 'before',
      // 表達式寬度
      expressionWidth: 50,
    });

    return {
      formattedText: formatted,
      error: null,
    };
  } catch (error) {
    // SQL formatter 發生錯誤時，返回原始輸入（降級處理）
    // 這是因為 SQL 語法變化很大，有些特殊語法可能無法解析
    console.warn('SQL 格式化失敗，返回原始輸入:', error);

    return {
      formattedText: input.trim(),
      error: {
        message: `SQL 格式化失敗，顯示原始內容: ${error instanceof Error ? error.message : '未知錯誤'}`,
        type: 'format_warning',
      },
    };
  }
}

/**
 * 驗證 SQL 語法（基本檢查）
 * @param input SQL 字串
 * @returns 驗證結果
 */
export function validateSQL(input: string): { valid: boolean; error?: FormatterError } {
  try {
    const trimmed = input.trim();

    if (!trimmed) {
      return { valid: true };
    }

    // 基本檢查：是否包含常見 SQL 關鍵字
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|GROUP|ORDER|HAVING|UNION|WITH)\b/i;

    if (!sqlKeywords.test(trimmed)) {
      return {
        valid: false,
        error: {
          message: '未偵測到有效的 SQL 關鍵字',
          type: 'validation_error',
        },
      };
    }

    // 檢查引號是否成對
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    const backticks = (trimmed.match(/`/g) || []).length;

    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) {
      return {
        valid: false,
        error: {
          message: 'SQL 引號不成對',
          type: 'syntax_error',
        },
      };
    }

    // 檢查括號是否成對
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      return {
        valid: false,
        error: {
          message: 'SQL 括號不成對',
          type: 'syntax_error',
        },
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: {
        message: error instanceof Error ? error.message : 'SQL 驗證失敗',
        type: 'validation_error',
      },
    };
  }
}

/**
 * 解析 SQL 錯誤訊息
 * @param error 錯誤物件
 * @returns FormatterError
 */
export function parseSQLError(error: unknown): FormatterError {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'syntax_error',
    };
  }

  return {
    message: 'SQL 解析失敗',
    type: 'unknown_error',
  };
}
