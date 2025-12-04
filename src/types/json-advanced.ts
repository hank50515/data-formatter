// 進階 JSON 格式化功能的類型定義

/**
 * 搜尋匹配結果
 */
export interface SearchMatch {
  line: number;
  column: number;
  length: number;
  text: string;
}

/**
 * 搜尋狀態
 */
export interface SearchState {
  query: string;
  matches: SearchMatch[];
  currentIndex: number;
  totalCount: number;
  isSearching: boolean;
}

/**
 * JSON 統計資料
 */
export interface JSONStatistics {
  lineCount: number;
  objectCount: number;
  arrayCount: number;
  keyValuePairCount: number;
  maxDepth: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

/**
 * 檢視模式
 */
export type ViewMode = 'code' | 'tree';

/**
 * 縮排大小
 */
export type IndentSize = 2 | 4;

/**
 * 轉換格式類型
 */
export type ConversionFormat =
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'typescript'
  | 'javascript';

/**
 * 驗證結果
 */
export interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line: number;
    column: number;
  };
  canAutoFix: boolean;
  fixedJSON?: string;
}

/**
 * 扁平化設定
 */
export interface FlattenConfig {
  separator: string;
  maxDepth: number;
  safe: boolean;
}

/**
 * 擴充的 JSON 格式化器狀態
 * 擴充既有的 FormatterState，添加進階功能所需的狀態
 */
export interface ExtendedJSONFormatterState {
  viewMode: ViewMode;
  indentSize: IndentSize;
  searchState: SearchState;
  statistics: JSONStatistics | null;
  isProcessing: boolean;
  validationResult: ValidationResult | null;
}

/**
 * Web Worker 訊息類型
 */
export type WorkerMessageType =
  | 'parse'
  | 'validate'
  | 'minify'
  | 'autofix'
  | 'flatten'
  | 'unflatten'
  | 'statistics'
  | 'search';

/**
 * Web Worker 請求訊息
 */
export interface WorkerRequest {
  type: WorkerMessageType;
  payload: any;
  id: string;
}

/**
 * Web Worker 回應訊息
 */
export interface WorkerResponse {
  type: WorkerMessageType;
  payload: any;
  id: string;
  error?: string;
}

/**
 * 儲存的使用者偏好設定
 */
export interface UserPreferences {
  indentSize: IndentSize;
  viewMode: ViewMode;
  theme?: string;
}
