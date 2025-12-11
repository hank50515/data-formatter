/**
 * diffExport.ts
 *
 * Diff Export Service - 負責匯出 diff 結果
 * 支援 HTML、JSON Patch、純文字格式
 *
 * @feature 006-json-diff-compare
 */

import { compare } from 'fast-json-patch';
import type { DiffComparison } from '../types/diff';

/**
 * JSON Patch Operation 類型
 */
export interface JSONPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export type JSONPatch = JSONPatchOperation[];

/**
 * 生成 JSON Patch (RFC 6902)
 */
export function generateJSONPatch(comparison: DiffComparison): JSONPatch {
  if (!comparison.originalParsed || !comparison.modifiedParsed) {
    return [];
  }

  const patch = compare(comparison.originalParsed, comparison.modifiedParsed);
  return patch as JSONPatch;
}

/**
 * 格式化 diff 結果為純文字
 */
export function formatAsText(comparison: DiffComparison): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('JSON Diff Result');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`Total Changes: ${comparison.summary.totalChanges}`);
  lines.push(`  Additions: ${comparison.summary.additionCount}`);
  lines.push(`  Deletions: ${comparison.summary.deletionCount}`);
  lines.push(`  Modifications: ${comparison.summary.modificationCount}`);
  lines.push('');
  lines.push('-'.repeat(60));

  comparison.differences.forEach((change, index) => {
    lines.push(`[${index + 1}] ${change.type.toUpperCase()}: ${change.keyPath}`);
    lines.push(`    ${change.displayText}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * 匯出為 HTML
 */
export async function exportAsHTML(comparison: DiffComparison): Promise<Blob> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Diff Result</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .change {
      background-color: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 4px solid #ccc;
    }
    .change.addition {
      border-left-color: #28a745;
      background-color: #d4f4dd;
    }
    .change.deletion {
      border-left-color: #dc3545;
      background-color: #ffd7d5;
    }
    .change.modification {
      border-left-color: #ffc107;
      background-color: #fff3cd;
    }
    .change-type {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .change-path {
      font-family: 'Courier New', monospace;
      color: #333;
      margin-bottom: 5px;
    }
    .change-details {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>JSON Diff Result</h1>
    <p>Generated: ${new Date().toLocaleString('zh-TW')}</p>
  </div>

  <div class="summary">
    <h2>Summary</h2>
    <p>Total Changes: <strong>${comparison.summary.totalChanges}</strong></p>
    <ul>
      <li>Additions: ${comparison.summary.additionCount}</li>
      <li>Deletions: ${comparison.summary.deletionCount}</li>
      <li>Modifications: ${comparison.summary.modificationCount}</li>
    </ul>
  </div>

  <h2>Changes</h2>
  ${comparison.differences
    .map(
      (change) => `
    <div class="change ${change.type}">
      <div class="change-type">${change.type}</div>
      <div class="change-path">${change.keyPath}</div>
      <div class="change-details">${change.displayText}</div>
    </div>
  `
    )
    .join('')}
</body>
</html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
}

/**
 * 複製 diff 結果到剪貼簿
 */
export async function copyToClipboard(comparison: DiffComparison): Promise<boolean> {
  try {
    const text = formatAsText(comparison);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
