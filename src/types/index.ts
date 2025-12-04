// 格式類型 - 支援 5 種資料格式
export type FormatType = 'json' | 'xml' | 'yaml' | 'csv' | 'sql';

// 錯誤類型
export type ErrorType =
  | 'parse_error' // 解析錯誤（語法錯誤）
  | 'syntax_error' // 語法錯誤
  | 'size_limit' // 檔案大小超過限制
  | 'unsupported_format' // 不支援的格式
  | 'format_error' // 格式化失敗
  | 'format_warning' // 格式化警告（降級處理）
  | 'validation_error' // 驗證錯誤
  | 'unknown_error' // 未知錯誤
  | 'unknown'; // 未知錯誤（相容性保留）

// 格式化錯誤
export interface FormatterError {
  message: string; // 錯誤訊息
  type: ErrorType; // 錯誤類型
  line?: number; // 錯誤行號（如果可獲得）
  column?: number; // 錯誤列號（如果可獲得）
  details?: string; // 額外的錯誤詳情
}

// 單一格式的 formatter 狀態
export interface FormatterState {
  input: {
    rawText: string; // 使用者輸入的原始文字
    characterCount: number; // 字元數
    sizeInBytes: number; // 檔案大小（bytes）
  };
  output: {
    formattedText: string; // 格式化後的文字
    format: FormatType; // 格式類型
    error: FormatterError | null; // 錯誤資訊（無錯誤時為 null）
    lineCount: number; // 輸出行數
    characterCount: number; // 輸出字元數
  };
  isFormatting: boolean; // 是否正在格式化
}

// 整個應用程式狀態
export interface AppState {
  activeTab: FormatType; // 當前選中的 tab
  formatters: Record<FormatType, FormatterState>; // 各格式的狀態
  preferences: {
    language: 'zh-TW' | 'en'; // 介面語言
    theme: 'light' | 'dark'; // 主題（預留）
  };
}

// 文字統計資訊
export interface TextStatistics {
  characterCount: number;
  lineCount: number;
  sizeInBytes: number;
  wordCount?: number;
}

// CSV 表格資料（用於預覽）
export interface CSVTableData {
  headers: string[]; // 欄位標題
  rows: string[][]; // 資料列
  totalRows: number; // 總行數
  displayedRows: number; // 顯示的行數（最多 100）
  delimiter: string; // 偵測到的分隔符
  hasHeader: boolean; // 是否有標題列
}

// 測試案例資料
export interface SampleData {
  id: string; // 唯一識別碼
  name: string; // 範例名稱（支援 i18n key）
  description: string; // 範例描述（支援 i18n key）
  content: string; // 範例資料內容
  category: 'basic' | 'complex' | 'edge'; // 範例類別
}

// 常數
export const MAX_FILE_SIZE = 1024 * 1024; // 1MB
export const CSV_MAX_PREVIEW_ROWS = 100; // CSV 表格預覽最多 100 列
export const DEFAULT_INDENT = '  '; // 2 空格縮排
