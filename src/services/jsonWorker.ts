/**
 * JSON Worker
 * 處理大型 JSON 檔案的重量級運算，避免阻塞主執行緒
 * 僅在檔案大小 > 500KB 時使用
 */

import type { WorkerRequest, WorkerResponse } from '../types/json-advanced';
import { jsonrepair } from 'jsonrepair';
import { flatten, unflatten } from 'flat';

// Worker 訊息處理器
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, payload, id } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'parse':
        result = JSON.parse(payload);
        break;

      case 'validate':
        try {
          JSON.parse(payload);
          result = { isValid: true };
        } catch (error) {
          result = {
            isValid: false,
            error: {
              message: error instanceof Error ? error.message : 'Invalid JSON',
              line: extractLineNumber(error),
              column: extractColumnNumber(error),
            },
          };
        }
        break;

      case 'minify':
        const parsed = JSON.parse(payload);
        result = JSON.stringify(parsed);
        break;

      case 'autofix':
        result = jsonrepair(payload);
        break;

      case 'flatten':
        const objToFlatten = JSON.parse(payload);
        result = JSON.stringify(
          flatten(objToFlatten, { maxDepth: 20, safe: true })
        );
        break;

      case 'unflatten':
        const objToUnflatten = JSON.parse(payload);
        result = JSON.stringify(unflatten(objToUnflatten));
        break;

      case 'statistics':
        const data = JSON.parse(payload);
        result = calculateStatistics(data);
        break;

      case 'search':
        result = performSearch(payload.text, payload.query);
        break;

      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }

    const response: WorkerResponse = {
      type,
      payload: result,
      id,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type,
      payload: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(response);
  }
};

/**
 * 從錯誤訊息中提取行號
 */
function extractLineNumber(error: any): number {
  if (!error || !error.message) return 0;

  const lineMatch = error.message.match(/line (\d+)/i);
  if (lineMatch) return parseInt(lineMatch[1], 10);

  const posMatch = error.message.match(/position (\d+)/i);
  if (posMatch) {
    // 嘗試從位置計算行號（簡化版本）
    return 1;
  }

  return 1;
}

/**
 * 從錯誤訊息中提取列號
 */
function extractColumnNumber(error: any): number {
  if (!error || !error.message) return 0;

  const colMatch = error.message.match(/column (\d+)/i);
  if (colMatch) return parseInt(colMatch[1], 10);

  return 1;
}

/**
 * 計算 JSON 統計資料
 */
function calculateStatistics(data: any): any {
  const stats = {
    lineCount: 0, // 由主執行緒計算
    objectCount: 0,
    arrayCount: 0,
    keyValuePairCount: 0,
    maxDepth: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
  };

  function traverse(obj: any, depth: number = 0): void {
    if (depth > 20) return; // 防止無限遞迴

    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (obj === null) {
      stats.nullCount++;
      return;
    }

    switch (typeof obj) {
      case 'string':
        stats.stringCount++;
        break;
      case 'number':
        stats.numberCount++;
        break;
      case 'boolean':
        stats.booleanCount++;
        break;
      case 'object':
        if (Array.isArray(obj)) {
          stats.arrayCount++;
          obj.forEach((item) => traverse(item, depth + 1));
        } else {
          stats.objectCount++;
          const keys = Object.keys(obj);
          stats.keyValuePairCount += keys.length;
          keys.forEach((key) => traverse(obj[key], depth + 1));
        }
        break;
    }
  }

  traverse(data, 0);
  return stats;
}

/**
 * 執行搜尋
 */
function performSearch(text: string, query: string): any[] {
  if (!query) return [];

  const matches: any[] = [];
  const lines = text.split('\n');
  const searchLower = query.toLowerCase();
  const maxMatches = 500; // 限制最多 500 個匹配

  for (let i = 0; i < lines.length && matches.length < maxMatches; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    let columnIndex = 0;

    while (
      columnIndex < line.length &&
      matches.length < maxMatches
    ) {
      const matchIndex = lineLower.indexOf(searchLower, columnIndex);
      if (matchIndex === -1) break;

      matches.push({
        line: i + 1,
        column: matchIndex + 1,
        length: query.length,
        text: line.substring(matchIndex, matchIndex + query.length),
      });

      columnIndex = matchIndex + 1;
    }
  }

  return matches;
}

export {};
