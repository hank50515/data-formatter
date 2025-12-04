/**
 * 複製按鈕元件
 * 提供一鍵複製功能與視覺回饋
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../utils/clipboard';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export default function CopyButton({ text, disabled = false }: CopyButtonProps) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 複製成功後 2 秒自動重置狀態
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    if (!text || disabled) {
      return;
    }

    try {
      await copyToClipboard(text);
      setIsCopied(true);
      setError(null);
    } catch (err) {
      setError(t('copy.error'));
      console.error('複製錯誤:', err);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        onClick={handleCopy}
        disabled={disabled || !text}
        className="button"
        style={{
          opacity: disabled || !text ? 0.5 : 1,
        }}
      >
        {isCopied ? `✓ ${t('copy.success')}` : `📋 ${t('copy.button')}`}
      </button>

      {error && (
        <span style={{ color: 'var(--error-color)', fontSize: '0.875rem' }}>{error}</span>
      )}
    </div>
  );
}
