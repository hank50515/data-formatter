import { MAX_FILE_SIZE } from '../types';

/**
 * 計算字串的 UTF-8 byte size
 */
export function calculateByteSize(input: string): number {
  return new Blob([input]).size;
}

/**
 * 驗證輸入大小是否在限制內
 * @param input 輸入字串
 * @param maxSizeInBytes 最大大小（bytes），預設 1MB
 * @returns 是否在限制內
 */
export function validateSize(input: string, maxSizeInBytes: number = MAX_FILE_SIZE): boolean {
  const size = calculateByteSize(input);
  return size <= maxSizeInBytes;
}

/**
 * 計算文字統計資訊
 */
export function calculateStatistics(text: string) {
  const lines = text.split('\n');
  return {
    characterCount: text.length,
    lineCount: lines.length,
    sizeInBytes: calculateByteSize(text),
    wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
  };
}
