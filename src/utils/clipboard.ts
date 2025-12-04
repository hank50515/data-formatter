/**
 * 剪貼簿工具函數
 * 使用現代 Clipboard API 複製文字到剪貼簿
 */

/**
 * 複製文字到剪貼簿
 * @param text - 要複製的文字
 * @returns Promise<void> - 成功或失敗
 * @throws 當複製失敗時拋出錯誤
 */
export async function copyToClipboard(text: string): Promise<void> {
  // 檢查瀏覽器是否支援 Clipboard API
  if (!navigator.clipboard) {
    // 降級到舊方法（如果需要）
    return fallbackCopyToClipboard(text);
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('複製失敗:', error);
    throw new Error('無法複製到剪貼簿');
  }
}

/**
 * 降級方法：使用 execCommand 複製文字
 * 僅在 Clipboard API 不可用時使用
 * @param text - 要複製的文字
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 建立臨時 textarea 元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // 避免捲動問題
    textarea.style.opacity = '0'; // 隱藏元素
    document.body.appendChild(textarea);

    try {
      // 選取文字
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      // 執行複製指令
      const successful = document.execCommand('copy');

      // 移除臨時元素
      document.body.removeChild(textarea);

      if (successful) {
        resolve();
      } else {
        reject(new Error('execCommand 複製失敗'));
      }
    } catch (error) {
      // 移除臨時元素
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}

/**
 * 檢查是否支援 Clipboard API
 * @returns 是否支援
 */
export function isClipboardSupported(): boolean {
  return !!navigator.clipboard;
}
