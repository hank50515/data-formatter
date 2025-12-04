/**
 * CSV Formatter Service
 *
 * 使用 papaparse 解析和格式化 CSV
 * 自動偵測分隔符，提供表格預覽（最多 100 列）
 */

import Papa from 'papaparse';
import type { FormatterError } from '../types';

export interface CSVTableData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  truncated: boolean;
}

export interface CSVFormatterResult {
  formattedText: string;
  tableData?: CSVTableData;
  error: FormatterError | null;
}

const MAX_PREVIEW_ROWS = 100;

/**
 * 格式化 CSV 字串
 * @param input 原始 CSV 字串
 * @returns 格式化結果（包含表格資料）
 */
export function formatCSV(input: string): CSVFormatterResult {
  try {
    // 移除前後空白
    const trimmed = input.trim();

    if (!trimmed) {
      return {
        formattedText: '',
        error: null,
      };
    }

    // 解析 CSV（自動偵測分隔符）
    const parseResult = Papa.parse<string[]>(trimmed, {
      // 第一行不作為標題（手動處理）
      header: false,
      // 跳過空白行
      skipEmptyLines: true,
      // 不自動轉換數字和布林值
      dynamicTyping: false,
    });

    // 檢查解析錯誤
    if (parseResult.errors && parseResult.errors.length > 0) {
      const errors = parseResult.errors
        .map(err => `第 ${(err.row ?? 0) + 1} 行: ${err.message}`)
        .join('\n');

      return {
        formattedText: '',
        error: {
          message: `CSV 解析錯誤:\n${errors}`,
          type: 'syntax_error',
        },
      };
    }

    const data = parseResult.data as string[][];

    if (data.length === 0) {
      return {
        formattedText: '',
        error: {
          message: 'CSV 檔案為空',
          type: 'validation_error',
        },
      };
    }

    // 使用偵測到的分隔符重新格式化
    const detectedDelimiter = parseResult.meta.delimiter || ',';

    // 重新格式化為 CSV（標準化引號和格式）
    const formatted = Papa.unparse(data, {
      delimiter: detectedDelimiter,
      quotes: true, // 為包含特殊字元的欄位加上引號
      quoteChar: '"',
      escapeChar: '"',
      header: false,
      newline: '\n',
    });

    // 生成表格資料（最多 100 列）
    const totalRows = data.length;
    const truncated = totalRows > MAX_PREVIEW_ROWS;
    const previewData = truncated ? data.slice(0, MAX_PREVIEW_ROWS) : data;

    // 假設第一行是標題（如果所有欄位都是字串且與其他行不同）
    const hasHeader = isFirstRowHeader(data);
    const headers = hasHeader ? previewData[0] : generateDefaultHeaders(previewData[0]?.length || 0);
    const rows = hasHeader ? previewData.slice(1) : previewData;

    const tableData: CSVTableData = {
      headers,
      rows,
      totalRows: hasHeader ? totalRows - 1 : totalRows,
      truncated,
    };

    return {
      formattedText: formatted,
      tableData,
      error: null,
    };
  } catch (error) {
    return {
      formattedText: '',
      error: {
        message: error instanceof Error ? error.message : 'CSV 格式化失敗',
        type: 'format_error',
      },
    };
  }
}

/**
 * 判斷第一行是否為標題
 * @param data CSV 資料
 * @returns 是否為標題
 */
function isFirstRowHeader(data: string[][]): boolean {
  if (data.length < 2) return false;

  const firstRow = data[0];
  const secondRow = data[1];

  // 如果第一行的所有欄位都不是純數字，而第二行有數字，可能是標題
  const firstRowHasNumbers = firstRow.some(cell => !isNaN(Number(cell)) && cell.trim() !== '');
  const secondRowHasNumbers = secondRow.some(cell => !isNaN(Number(cell)) && cell.trim() !== '');

  return !firstRowHasNumbers && secondRowHasNumbers;
}

/**
 * 生成預設標題（Column 1, Column 2, ...）
 * @param columnCount 欄位數量
 * @returns 標題陣列
 */
function generateDefaultHeaders(columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
}

/**
 * 驗證 CSV 語法
 * @param input CSV 字串
 * @returns 驗證結果
 */
export function validateCSV(input: string): { valid: boolean; error?: FormatterError } {
  try {
    const parseResult = Papa.parse(input, {
      skipEmptyLines: true,
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      const errors = parseResult.errors
        .map(err => `第 ${(err.row ?? 0) + 1} 行: ${err.message}`)
        .join('\n');

      return {
        valid: false,
        error: {
          message: `CSV 解析錯誤:\n${errors}`,
          type: 'syntax_error',
        },
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: {
        message: error instanceof Error ? error.message : 'CSV 驗證失敗',
        type: 'validation_error',
      },
    };
  }
}

/**
 * 解析 CSV 錯誤訊息
 * @param error 錯誤物件
 * @returns FormatterError
 */
export function parseCSVError(error: unknown): FormatterError {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'syntax_error',
    };
  }

  return {
    message: 'CSV 解析失敗',
    type: 'unknown_error',
  };
}
