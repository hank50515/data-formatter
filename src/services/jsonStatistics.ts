/**
 * JSON Statistics Service
 * Calculates structural statistics for JSON data
 * User Story 4: Search and Data Statistics
 */

import type { JSONStatistics } from '../types/json-advanced';

const MAX_DEPTH = 20; // Prevent infinite recursion

/**
 * Calculate comprehensive statistics for JSON data
 */
export function calculateJSONStatistics(jsonText: string): JSONStatistics | null {
  try {
    const parsed = JSON.parse(jsonText);
    const lineCount = jsonText.split('\n').length;

    const stats: JSONStatistics = {
      lineCount,
      objectCount: 0,
      arrayCount: 0,
      keyValuePairCount: 0,
      maxDepth: 0,
      stringCount: 0,
      numberCount: 0,
      booleanCount: 0,
      nullCount: 0,
    };

    const currentDepth = 0;
    traverseJSON(parsed, stats, currentDepth);

    return stats;
  } catch (error) {
    console.error('Failed to calculate statistics:', error);
    return null;
  }
}

/**
 * Recursively traverse JSON structure to count elements
 */
function traverseJSON(
  value: any,
  stats: JSONStatistics,
  depth: number
): void {
  // Prevent infinite recursion
  if (depth > MAX_DEPTH) {
    return;
  }

  // Update max depth
  stats.maxDepth = Math.max(stats.maxDepth, depth);

  if (value === null) {
    stats.nullCount++;
  } else if (typeof value === 'boolean') {
    stats.booleanCount++;
  } else if (typeof value === 'number') {
    stats.numberCount++;
  } else if (typeof value === 'string') {
    stats.stringCount++;
  } else if (Array.isArray(value)) {
    stats.arrayCount++;
    value.forEach((item) => traverseJSON(item, stats, depth + 1));
  } else if (typeof value === 'object') {
    stats.objectCount++;
    const keys = Object.keys(value);
    stats.keyValuePairCount += keys.length;

    keys.forEach((key) => {
      traverseJSON(value[key], stats, depth + 1);
    });
  }
}

/**
 * Format statistics for display
 */
export function formatStatistics(stats: JSONStatistics): Record<string, string> {
  return {
    'Total Lines': stats.lineCount.toLocaleString(),
    'Objects': stats.objectCount.toLocaleString(),
    'Arrays': stats.arrayCount.toLocaleString(),
    'Key-Value Pairs': stats.keyValuePairCount.toLocaleString(),
    'Max Depth': stats.maxDepth.toString(),
    'Strings': stats.stringCount.toLocaleString(),
    'Numbers': stats.numberCount.toLocaleString(),
    'Booleans': stats.booleanCount.toLocaleString(),
    'Nulls': stats.nullCount.toLocaleString(),
  };
}

/**
 * Get statistics summary (concise version)
 */
export function getStatisticsSummary(stats: JSONStatistics): string {
  const totalValues =
    stats.stringCount +
    stats.numberCount +
    stats.booleanCount +
    stats.nullCount;

  return `${stats.lineCount} lines, ${stats.objectCount} objects, ${stats.arrayCount} arrays, ${totalValues} values`;
}

/**
 * Calculate size metrics
 */
export function calculateSizeMetrics(jsonText: string): {
  characters: number;
  bytes: number;
  sizeFormatted: string;
} {
  const characters = jsonText.length;
  const bytes = new Blob([jsonText]).size;

  let sizeFormatted: string;
  if (bytes < 1024) {
    sizeFormatted = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    sizeFormatted = `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    sizeFormatted = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return { characters, bytes, sizeFormatted };
}
