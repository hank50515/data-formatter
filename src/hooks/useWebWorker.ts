import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkerRequest, WorkerResponse } from '../types/json-advanced';

/**
 * useWebWorker Hook
 * 管理 Web Worker 的生命週期和通訊
 *
 * @param workerUrl - Worker 腳本的 URL
 * @returns Worker 介面物件
 */
export function useWebWorker(workerUrl: string) {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbacksRef = useRef<Map<string, (response: WorkerResponse) => void>>(
    new Map()
  );

  useEffect(() => {
    try {
      // 建立 Worker 實例
      const worker = new Worker(workerUrl, { type: 'module' });
      workerRef.current = worker;

      // Worker 準備就緒
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        const callback = callbacksRef.current.get(response.id);

        if (callback) {
          callback(response);
          callbacksRef.current.delete(response.id);
        }
      };

      // Worker 錯誤處理
      worker.onerror = (event) => {
        setError(event.message);
        console.error('Worker error:', event);
      };

      setIsReady(true);

      // 清理函數：元件卸載時終止 Worker
      return () => {
        worker.terminate();
        workerRef.current = null;
        setIsReady(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create worker');
      console.error('Failed to create worker:', err);
    }
  }, [workerUrl]);

  /**
   * 向 Worker 發送訊息並等待回應
   */
  const postMessage = useCallback(
    <T = any>(request: Omit<WorkerRequest, 'id'>): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady) {
          reject(new Error('Worker not ready'));
          return;
        }

        const id = `${Date.now()}-${Math.random()}`;
        const fullRequest: WorkerRequest = { ...request, id };

        // 註冊回調函數
        callbacksRef.current.set(id, (response: WorkerResponse) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.payload as T);
          }
        });

        // 發送訊息給 Worker
        workerRef.current.postMessage(fullRequest);
      });
    },
    [isReady]
  );

  /**
   * 終止 Worker
   */
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
      callbacksRef.current.clear();
    }
  }, []);

  return {
    isReady,
    error,
    postMessage,
    terminate,
  };
}
