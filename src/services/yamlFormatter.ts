/**
 * YAML Formatter Service
 *
 * 使用 js-yaml 解析和格式化 YAML
 * 支援 anchors、aliases、多行字串
 */

import * as yaml from 'js-yaml';
import type { FormatterError } from '../types';

export interface YAMLFormatterResult {
  formattedText: string;
  error: FormatterError | null;
}

/**
 * 格式化 YAML 字串
 * @param input 原始 YAML 字串
 * @returns 格式化結果
 */
export function formatYAML(input: string): YAMLFormatterResult {
  try {
    // 移除前後空白
    const trimmed = input.trim();

    if (!trimmed) {
      return {
        formattedText: '',
        error: null,
      };
    }

    // 解析 YAML（保留 anchors 和 aliases）
    const parsed = yaml.load(trimmed, {
      // 允許重複的 keys（會使用最後一個值）
      json: false,
    });

    // 將解析結果轉回 YAML 格式
    const formatted = yaml.dump(parsed, {
      // 縮排 2 個空格
      indent: 2,
      // 每行最大長度（0 表示不限制）
      lineWidth: -1,
      // 保留 anchors 和 aliases
      noRefs: false,
      // 使用更緊湊的格式
      flowLevel: -1,
      // 排序物件的 keys
      sortKeys: false,
      // 使用 YAML 1.2 語法
      condenseFlow: false,
      // 引號樣式（' 或 "，預設自動選擇）
      quotingType: '"',
      // 強制引號（false 表示只在必要時使用引號）
      forceQuotes: false,
    });

    return {
      formattedText: formatted.trim(),
      error: null,
    };
  } catch (error) {
    // 處理 YAML 解析錯誤
    if (error instanceof yaml.YAMLException) {
      return {
        formattedText: '',
        error: {
          message: `YAML 語法錯誤: ${error.message}`,
          type: 'syntax_error',
          line: error.mark?.line,
          column: error.mark?.column,
        },
      };
    }

    return {
      formattedText: '',
      error: {
        message: error instanceof Error ? error.message : 'YAML 格式化失敗',
        type: 'format_error',
      },
    };
  }
}

/**
 * 驗證 YAML 語法
 * @param input YAML 字串
 * @returns 是否為有效 YAML
 */
export function validateYAML(input: string): { valid: boolean; error?: FormatterError } {
  try {
    yaml.load(input);
    return { valid: true };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return {
        valid: false,
        error: {
          message: `YAML 語法錯誤: ${error.message}`,
          type: 'syntax_error',
          line: error.mark?.line,
          column: error.mark?.column,
        },
      };
    }

    return {
      valid: false,
      error: {
        message: error instanceof Error ? error.message : 'YAML 驗證失敗',
        type: 'validation_error',
      },
    };
  }
}

/**
 * 解析 YAML 錯誤訊息
 * @param error 錯誤物件
 * @returns FormatterError
 */
export function parseYAMLError(error: unknown): FormatterError {
  if (error instanceof yaml.YAMLException) {
    return {
      message: `YAML 語法錯誤: ${error.message}`,
      type: 'syntax_error',
      line: error.mark?.line,
      column: error.mark?.column,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'syntax_error',
    };
  }

  return {
    message: 'YAML 解析失敗',
    type: 'unknown_error',
  };
}
