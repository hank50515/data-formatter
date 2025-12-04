import { useEffect, useState } from 'react';

/**
 * useDebounce Hook
 * 延遲更新值，用於減少高頻事件（如輸入、搜尋）的處理次數
 *
 * @param value - 要防抖動的值
 * @param delay - 延遲時間（毫秒），預設 500ms
 * @returns 防抖動後的值
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 設定計時器，延遲更新值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函數：在下次 effect 執行前或元件卸載時清除計時器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
