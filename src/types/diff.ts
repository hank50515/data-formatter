/**
 * DiffTypes.ts
 *
 * TypeScript type definitions for JSON Diff & Compare feature
 * Based on data-model.md specification
 *
 * @feature 006-json-diff-compare
 * @created 2025-12-05
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * DiffComparison - 代表單次 JSON 比對作業
 *
 * 包含完整的比對資訊：原始/修改 JSON、差異項目、摘要統計、選項與狀態
 */
export interface DiffComparison {
  /** 唯一識別碼 (UUID or timestamp) */
  id: string;

  /** 原始 JSON 文字 */
  originalJSON: string;

  /** 修改後 JSON 文字 */
  modifiedJSON: string;

  /** 解析後的原始 JSON 物件 */
  originalParsed?: any;

  /** 解析後的修改 JSON 物件 */
  modifiedParsed?: any;

  /** jsondiffpatch 產生的 delta 物件 */
  delta?: Delta;

  /** 差異項目陣列 */
  differences: DiffChange[];

  /** 差異摘要統計 */
  summary: DiffSummary;

  /** 比對選項 */
  options: DiffOptions;

  /** 比對狀態 */
  status: DiffStatus;

  /** 錯誤資訊（若有） */
  error: DiffError | null;

  /** 建立時間 */
  createdAt: Date;

  /** 計算耗時（毫秒） */
  calculationTime?: number;
}

/**
 * DiffChange - 代表單一差異變更
 *
 * 可能的變更類型：
 * - addition: 新增鍵值（僅 modifiedValue 有值）
 * - deletion: 刪除鍵值（僅 originalValue 有值）
 * - modification: 修改鍵值（兩者皆有值）
 */
export interface DiffChange {
  /** 唯一識別碼 (index-based, e.g., 'diff-0') */
  id: string;

  /** 變更類型 */
  type: DiffChangeType;

  /** JSON 鍵值路徑 (e.g., 'user.profile.email') */
  keyPath: string;

  /** 原始值（deletion/modification 有值） */
  originalValue?: any;

  /** 修改值（addition/modification 有值） */
  modifiedValue?: any;

  /** 行號資訊 */
  lineNumber: DiffLineNumber;

  /** 上下文資訊（unified view 使用） */
  context?: DiffContext;

  /** 顯示文字（格式化後） */
  displayText: string;
}

/**
 * DiffSummary - 差異摘要統計
 *
 * Invariant: totalChanges === additionCount + deletionCount + modificationCount
 */
export interface DiffSummary {
  /** 總變更數 */
  totalChanges: number;

  /** 新增數量 */
  additionCount: number;

  /** 刪除數量 */
  deletionCount: number;

  /** 修改數量 */
  modificationCount: number;

  /** 未變更鍵值數量（可選） */
  unchangedKeys?: number;
}

/**
 * DiffOptions - 比對選項
 *
 * 控制 diff 計算行為與顯示設定
 */
export interface DiffOptions {
  /** 忽略空白字元差異（預設：false） */
  ignoreWhitespace: boolean;

  /** 忽略陣列元素順序（預設：false） */
  ignoreArrayOrder: boolean;

  /** 忽略大小寫（字串比較）（預設：false） */
  ignoreCase: boolean;

  /** 最大顯示差異數量（預設：500） */
  maxDifferences: number;

  /** 比對前自動格式化（預設：true） */
  formatBeforeDiff: boolean;
}

/**
 * DiffNavigationState - 導航狀態
 *
 * 追蹤使用者在 diff 結果中的導航位置
 *
 * Validation: 0 ≤ currentIndex < totalCount
 * 當 totalCount === 0 時，currentIndex 應為 -1
 */
export interface DiffNavigationState {
  /** 當前差異索引 (0-based) */
  currentIndex: number;

  /** 總差異數量 */
  totalCount: number;

  /** 當前高亮的差異 ID */
  highlightedChangeId: string | null;

  /** 捲動位置（px） */
  scrollPosition?: number;

  /** 導航歷史（索引陣列） */
  history?: number[];
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * DiffChangeType - 差異變更類型
 */
export type DiffChangeType = 'addition' | 'deletion' | 'modification';

/**
 * DiffViewMode - 檢視模式
 *
 * - side-by-side: 並排檢視（預設），左右兩欄
 * - unified: 統一檢視，單欄顯示 +/-/~ 標記
 * - split: 分割檢視（未來擴充）
 */
export type DiffViewMode = 'side-by-side' | 'unified' | 'split';

/**
 * DiffStatus - 比對狀態
 *
 * State transitions:
 * idle → calculating → completed
 *                   ↘ error
 */
export type DiffStatus = 'idle' | 'calculating' | 'completed' | 'error';

/**
 * DiffLineNumber - 行號資訊
 *
 * - addition: 僅 modified 有值
 * - deletion: 僅 original 有值
 * - modification: 兩者皆有值
 */
export interface DiffLineNumber {
  /** Original JSON line number (deletion/modification) */
  original?: number;

  /** Modified JSON line number (addition/modification) */
  modified?: number;
}

/**
 * DiffContext - 上下文資訊
 *
 * 用於 unified view，顯示變更前後的程式碼行
 */
export interface DiffContext {
  /** Lines before the change (up to 3) */
  before: string[];

  /** Lines after the change (up to 3) */
  after: string[];
}

/**
 * DiffError - 錯誤資訊
 *
 * Error codes:
 * - PARSE_ERROR_ORIGINAL: 原始 JSON 解析失敗
 * - PARSE_ERROR_MODIFIED: 修改 JSON 解析失敗
 * - CALCULATION_ERROR: diff 計算失敗
 * - TIMEOUT: 計算超時
 */
export interface DiffError {
  /** 錯誤代碼 */
  code: DiffErrorCode;

  /** 錯誤訊息 */
  message: string;

  /** 詳細錯誤資訊（可選） */
  details?: string;

  /** 錯誤發生時間 */
  timestamp: Date;
}

/**
 * DiffErrorCode - 錯誤代碼
 */
export type DiffErrorCode =
  | 'PARSE_ERROR_ORIGINAL'
  | 'PARSE_ERROR_MODIFIED'
  | 'CALCULATION_ERROR'
  | 'TIMEOUT';

/**
 * Delta - jsondiffpatch delta 格式（簡化）
 *
 * jsondiffpatch 的內部 delta 結構
 * 參考: https://github.com/benjamine/jsondiffpatch
 */
export type Delta = {
  [key: string]: any;
  _t?: 'a'; // Array type marker
};

// ============================================================================
// Component State Types
// ============================================================================

/**
 * DiffPanelState - DiffPanel 元件狀態
 *
 * React component state for DiffPanel.tsx
 */
export interface DiffPanelState {
  /** 當前比對作業 */
  comparison: DiffComparison;

  /** 檢視模式 */
  viewMode: DiffViewMode;

  /** 導航狀態 */
  navigation: DiffNavigationState;

  /** 是否正在計算 diff */
  isCalculating: boolean;

  /** 錯誤資訊 */
  error: DiffError | null;
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * DiffStorageKeys - localStorage 鍵值常數
 */
export const DIFF_STORAGE_KEYS = {
  ORIGINAL: 'data-formatter-diff-original',
  MODIFIED: 'data-formatter-diff-modified',
  VIEW_MODE: 'data-formatter-diff-view-mode',
  OPTIONS: 'data-formatter-diff-options',
} as const;

/**
 * DiffPersistedData - 持久化資料結構
 *
 * 儲存於 localStorage 的資料
 */
export interface DiffPersistedData {
  originalJSON: string;
  modifiedJSON: string;
  viewMode: DiffViewMode;
  options: DiffOptions;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * DEFAULT_DIFF_OPTIONS - 預設比對選項
 */
export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  ignoreWhitespace: false,
  ignoreArrayOrder: false,
  ignoreCase: false,
  maxDifferences: 500,
  formatBeforeDiff: true,
};

/**
 * DEFAULT_DIFF_NAVIGATION - 預設導航狀態
 */
export const DEFAULT_DIFF_NAVIGATION: DiffNavigationState = {
  currentIndex: -1,
  totalCount: 0,
  highlightedChangeId: null,
  scrollPosition: 0,
  history: [],
};

/**
 * EMPTY_DIFF_SUMMARY - 空差異摘要
 */
export const EMPTY_DIFF_SUMMARY: DiffSummary = {
  totalChanges: 0,
  additionCount: 0,
  deletionCount: 0,
  modificationCount: 0,
  unchangedKeys: 0,
};

// ============================================================================
// Utility Types
// ============================================================================

/**
 * CreateDiffComparisonParams - 建立 DiffComparison 的參數
 */
export interface CreateDiffComparisonParams {
  originalJSON: string;
  modifiedJSON: string;
  options?: Partial<DiffOptions>;
}

/**
 * DiffCalculationResult - diff 計算結果
 *
 * Web Worker 回傳的結果格式
 */
export interface DiffCalculationResult {
  delta: Delta;
  differences: DiffChange[];
  summary: DiffSummary;
  calculationTime: number;
  error?: DiffError;
}

/**
 * ExportFormat - 匯出格式類型
 */
export type ExportFormat = 'html' | 'json-patch' | 'text';

/**
 * ExportOptions - 匯出選項
 */
export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  includeMetadata: boolean;
}

// ============================================================================
// Feature 007: JSON Diff UI Enhancements Types
// ============================================================================

/**
 * CharChange - 字元層級變更
 *
 * 表示單一字元層級差異區塊
 * @feature 007-json-diff-ui-enhancements
 */
export interface CharChange {
  /** 變更類型 */
  type: 'add' | 'remove' | 'equal';

  /** 變更的文字內容 */
  value: string;

  /** 在原始字串中的起始索引 (-1 表示不適用) */
  startIndex: number;

  /** 變更長度 */
  length: number;
}

/**
 * CharLevelDiffResult - 字元層級 diff 結果
 *
 * 表示單行的字元層級差異結果
 * @feature 007-json-diff-ui-enhancements
 */
export interface CharLevelDiffResult {
  /** 行索引 (0-based) */
  lineIndex: number;

  /** 原始行內容 */
  originalLine: string;

  /** 修改後行內容 */
  modifiedLine: string;

  /** 字元層級變更陣列 */
  charChanges: CharChange[];

  /** 該行是否有變更 */
  hasChanges: boolean;
}

/**
 * DiffHighlightStyle - Diff 高亮樣式
 *
 * 定義 diff 視覺化的顏色配置
 * @feature 007-json-diff-ui-enhancements
 */
export interface DiffHighlightStyle {
  /** 新增內容背景色 */
  additionColor: string;

  /** 刪除內容背景色 */
  deletionColor: string;

  /** 修改內容背景色 (line-level) */
  modificationColor: string;

  /** 字元層級變更的深色背景 */
  inlineChangeColor: string;

  /** 行號旁的符號 */
  symbolPrefix: '+' | '-' | '~';
}

/**
 * EnhancedDiffVisualization - 增強 Diff 視覺化設定
 *
 * 配置 diff 視覺化的進階選項
 * @feature 007-json-diff-ui-enhancements
 */
export interface EnhancedDiffVisualization {
  /** Diff 模式 */
  diffMode: 'line' | 'char' | 'both';

  /** 顯示行號 */
  showLineNumbers: boolean;

  /** 上下文行數 (未變更的行) */
  contextLines: number;

  /** 配色方案 */
  colorScheme: 'standard' | 'high-contrast' | 'colorblind-safe';

  /** JSON 語法高亮 */
  syntaxHighlighting: boolean;
}

/**
 * ClearBothAction - 清除兩側動作
 *
 * 追蹤清除兩側按鈕的狀態
 * @feature 007-json-diff-ui-enhancements
 */
export interface ClearBothAction {
  /** 是否正在清除 */
  isClearing: boolean;

  /** 是否需要確認對話框 (預留，目前未使用) */
  confirmationRequired: boolean;

  /** 最後清除時間戳 (Unix timestamp ms) */
  lastClearedAt: number | null;
}

/**
 * DEFAULT_COLOR_SCHEMES - 預設配色方案
 *
 * @feature 007-json-diff-ui-enhancements
 */
export const DEFAULT_COLOR_SCHEMES = {
  standard: {
    additionColor: '#d4f4dd',
    deletionColor: '#fdd',
    modificationColor: '#fff3cd',
    inlineChangeColor: '#acf2bd',
    symbolPrefix: '+' as const,
  },
  'high-contrast': {
    additionColor: '#00ff00',
    deletionColor: '#ff0000',
    modificationColor: '#ffff00',
    inlineChangeColor: '#00cc00',
    symbolPrefix: '+' as const,
  },
  'colorblind-safe': {
    additionColor: '#b3e0ff',
    deletionColor: '#ffe0b3',
    modificationColor: '#e0d4ff',
    inlineChangeColor: '#80c1ff',
    symbolPrefix: '+' as const,
  },
} as const;

/**
 * DEFAULT_ENHANCED_VISUALIZATION - 預設視覺化設定
 *
 * @feature 007-json-diff-ui-enhancements
 */
export const DEFAULT_ENHANCED_VISUALIZATION: EnhancedDiffVisualization = {
  diffMode: 'char',
  showLineNumbers: true,
  contextLines: 3,
  colorScheme: 'standard',
  syntaxHighlighting: true,
};
