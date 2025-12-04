/**
 * 輸入面板元件
 * 提供文字輸入區域
 */

import { useTranslation } from 'react-i18next';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function InputPanel({
  value,
  onChange,
  placeholder,
}: InputPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="panel input-panel">
      <h2>{t('input.title')}</h2>
      <textarea
        className="input-textarea"
        placeholder={placeholder || t('input.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{t('input.characters', { count: value.length })}</span>
        {value.length > 0 && (
          <span>{t('input.size', { size: (value.length / 1024).toFixed(2) })}</span>
        )}
      </div>
    </div>
  );
}
