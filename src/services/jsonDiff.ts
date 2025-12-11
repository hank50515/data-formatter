/**
 * jsonDiff.ts
 *
 * JSON Diff Service - 負責計算兩個 JSON 的差異
 * 使用 jsondiffpatch 進行語義化比對
 *
 * @feature 006-json-diff-compare
 */

import { diff } from 'jsondiffpatch';
import { diffChars, diffLines } from 'diff';
import type { Change } from 'diff';
import type {
  DiffComparison,
  DiffChange,
  DiffSummary,
  DiffOptions,
  Delta,
  DiffError,
  CharChange,
  CharLevelDiffResult,
} from '../types/diff';
import { DEFAULT_DIFF_OPTIONS, EMPTY_DIFF_SUMMARY } from '../types/diff';

/**
 * 驗證 JSON 字串是否有效
 */
export interface ValidationResult {
  isValid: boolean;
  parsed?: any;
  error?: string;
  errorLocation?: { line: number; column: number };
}

/**
 * 驗證 JSON 字串
 */
export function validateJSON(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      isValid: true,
      parsed,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * 解析 jsondiffpatch delta 為 DiffChange 陣列
 */
export function parseDeltaToDiffChanges(
  delta: Delta | null | undefined,
  original: any,
  modified: any
): DiffChange[] {
  const changes: DiffChange[] = [];

  if (!delta) {
    return changes;
  }

  // 遞迴解析 delta 結構
  function traverse(deltaNode: any, origNode: any, modNode: any, path: string[] = [], lineNum: number = 1): number {
    let currentLine = lineNum;

    for (const key in deltaNode) {
      if (key === '_t') continue; // 跳過陣列標記

      const currentPath = path.length > 0 ? [...path, key] : [key];
      const keyPath = currentPath.join('.');
      const value = deltaNode[key];

      // 判斷變更類型
      if (Array.isArray(value)) {
        if (value.length === 1) {
          // 新增 (addition): [newValue]
          changes.push({
            id: `diff-${changes.length}`,
            type: 'addition',
            keyPath,
            modifiedValue: value[0],
            lineNumber: { modified: currentLine },
            displayText: `${keyPath}: ${JSON.stringify(value[0])} (新增)`,
          });
          currentLine++;
        } else if (value.length === 2) {
          // 修改 (modification): [oldValue, newValue]
          changes.push({
            id: `diff-${changes.length}`,
            type: 'modification',
            keyPath,
            originalValue: value[0],
            modifiedValue: value[1],
            lineNumber: { original: currentLine, modified: currentLine },
            displayText: `${keyPath}: ${JSON.stringify(value[0])} → ${JSON.stringify(value[1])}`,
          });
          currentLine++;
        } else if (value.length === 3 && value[2] === 0) {
          // 刪除 (deletion): [oldValue, 0, 0]
          changes.push({
            id: `diff-${changes.length}`,
            type: 'deletion',
            keyPath,
            originalValue: value[0],
            lineNumber: { original: currentLine },
            displayText: `${keyPath}: ${JSON.stringify(value[0])} (刪除)`,
          });
          currentLine++;
        }
      } else if (typeof value === 'object' && value !== null) {
        // 遞迴處理巢狀物件
        const origChild = origNode?.[key];
        const modChild = modNode?.[key];
        currentLine = traverse(value, origChild, modChild, currentPath, currentLine);
      }
    }

    return currentLine;
  }

  traverse(delta, original, modified);
  return changes;
}

/**
 * 計算差異摘要統計
 */
export function calculateSummary(differences: DiffChange[]): DiffSummary {
  const summary: DiffSummary = {
    totalChanges: differences.length,
    additionCount: differences.filter((d) => d.type === 'addition').length,
    deletionCount: differences.filter((d) => d.type === 'deletion').length,
    modificationCount: differences.filter((d) => d.type === 'modification').length,
  };

  return summary;
}

/**
 * 同步計算 diff（適用於小型 JSON）
 */
export function calculateDiffSync(
  originalJSON: string,
  modifiedJSON: string,
  options: Partial<DiffOptions> = {}
): DiffComparison {
  const startTime = performance.now();
  const mergedOptions = { ...DEFAULT_DIFF_OPTIONS, ...options };

  // 驗證 JSON
  const originalValidation = validateJSON(originalJSON);
  if (!originalValidation.isValid) {
    const error: DiffError = {
      code: 'PARSE_ERROR_ORIGINAL',
      message: originalValidation.error || 'Invalid JSON',
      timestamp: new Date(),
    };

    return {
      id: Date.now().toString(),
      originalJSON,
      modifiedJSON,
      differences: [],
      summary: { ...EMPTY_DIFF_SUMMARY },
      options: mergedOptions,
      status: 'error',
      error,
      createdAt: new Date(),
    };
  }

  const modifiedValidation = validateJSON(modifiedJSON);
  if (!modifiedValidation.isValid) {
    const error: DiffError = {
      code: 'PARSE_ERROR_MODIFIED',
      message: modifiedValidation.error || 'Invalid JSON',
      timestamp: new Date(),
    };

    return {
      id: Date.now().toString(),
      originalJSON,
      modifiedJSON,
      differences: [],
      summary: { ...EMPTY_DIFF_SUMMARY },
      options: mergedOptions,
      status: 'error',
      error,
      createdAt: new Date(),
    };
  }

  const originalParsed = originalValidation.parsed;
  const modifiedParsed = modifiedValidation.parsed;

  // 計算 delta
  const delta = diff(originalParsed, modifiedParsed);

  // 解析 delta 為 DiffChange[]
  const differences = parseDeltaToDiffChanges(delta || {}, originalParsed, modifiedParsed);

  // 計算摘要
  const summary = calculateSummary(differences);

  const calculationTime = performance.now() - startTime;

  return {
    id: Date.now().toString(),
    originalJSON,
    modifiedJSON,
    originalParsed,
    modifiedParsed,
    delta,
    differences,
    summary,
    options: mergedOptions,
    status: 'completed',
    error: null,
    createdAt: new Date(),
    calculationTime,
  };
}

/**
 * 非同步計算 diff（支援 Web Worker for 大型 JSON）
 * TODO: 實作 Web Worker 支援
 */
export async function calculateDiff(
  originalJSON: string,
  modifiedJSON: string,
  options: Partial<DiffOptions> = {}
): Promise<DiffComparison> {
  // 目前使用同步版本，未來可加入 Web Worker
  return calculateDiffSync(originalJSON, modifiedJSON, options);
}

// ============================================================================
// Feature 007: Character-Level Diff Functions
// ============================================================================

/**
 * 將 diff 庫的 Change 格式轉換為 CharChange 格式
 * @feature 007-json-diff-ui-enhancements
 * @task T020
 */
function convertToCharChange(change: Change, startIndex: number): CharChange {
  return {
    type: change.added ? 'add' : change.removed ? 'remove' : 'equal',
    value: change.value,
    startIndex: change.added ? -1 : startIndex,
    length: change.value.length,
  };
}

/**
 * 計算兩個字串之間的字元層級差異
 * 使用 diff 庫的 diffChars 函數，支援 Unicode
 *
 * @feature 007-json-diff-ui-enhancements
 * @task T020, T022
 */
export function calculateCharLevelDiff(
  originalText: string,
  modifiedText: string
): CharChange[] {
  const changes = diffChars(originalText, modifiedText);
  const charChanges: CharChange[] = [];
  let currentIndex = 0;

  for (const change of changes) {
    charChanges.push(convertToCharChange(change, currentIndex));

    // 只有在非新增的情況下才增加索引
    if (!change.added) {
      currentIndex += change.value.length;
    }
  }

  return charChanges;
}

/**
 * 計算多行文本的字元層級差異
 * 逐行進行字元層級比對
 *
 * @feature 007-json-diff-ui-enhancements
 * @task T021
 */
export function calculateMultiLineCharDiff(
  originalText: string,
  modifiedText: string
): CharLevelDiffResult[] {
  const originalLines = originalText.split('\n');
  const modifiedLines = modifiedText.split('\n');

  // 先進行行級別的差異計算，找出哪些行有變化
  const lineChanges = diffLines(originalText, modifiedText);

  const results: CharLevelDiffResult[] = [];
  let originalLineIndex = 0;
  let modifiedLineIndex = 0;

  for (const lineChange of lineChanges) {
    const lines = lineChange.value.split('\n').filter(line => line !== '' || lineChange.value.endsWith('\n'));

    if (lineChange.added) {
      // 新增的行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        results.push({
          lineIndex: modifiedLineIndex,
          originalLine: '',
          modifiedLine: line,
          charChanges: [{
            type: 'add',
            value: line,
            startIndex: -1,
            length: line.length,
          }],
          hasChanges: true,
        });
        modifiedLineIndex++;
      }
    } else if (lineChange.removed) {
      // 刪除的行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        results.push({
          lineIndex: originalLineIndex,
          originalLine: line,
          modifiedLine: '',
          charChanges: [{
            type: 'remove',
            value: line,
            startIndex: 0,
            length: line.length,
          }],
          hasChanges: true,
        });
        originalLineIndex++;
      }
    } else {
      // 未變更的行，但仍然進行字元層級檢查
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const originalLine = originalLines[originalLineIndex] || '';
        const modifiedLine = modifiedLines[modifiedLineIndex] || line;

        // 如果行內容相同，標記為無變更
        if (originalLine === modifiedLine) {
          results.push({
            lineIndex: originalLineIndex,
            originalLine,
            modifiedLine,
            charChanges: [{
              type: 'equal',
              value: originalLine,
              startIndex: 0,
              length: originalLine.length,
            }],
            hasChanges: false,
          });
        } else {
          // 如果行內容不同，進行字元層級比對
          const charChanges = calculateCharLevelDiff(originalLine, modifiedLine);
          results.push({
            lineIndex: originalLineIndex,
            originalLine,
            modifiedLine,
            charChanges,
            hasChanges: charChanges.some(c => c.type !== 'equal'),
          });
        }

        originalLineIndex++;
        modifiedLineIndex++;
      }
    }
  }

  return results;
}
