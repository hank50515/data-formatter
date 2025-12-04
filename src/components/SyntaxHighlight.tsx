/**
 * 語法高亮元件
 * 使用 react-syntax-highlighter 顯示格式化後的程式碼
 */

import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { FormatType } from '../types';

interface SyntaxHighlightProps {
  code: string;
  language: FormatType;
}

export default function SyntaxHighlight({ code, language }: SyntaxHighlightProps) {
  const { t } = useTranslation();
  // 將 FormatType 轉換為 SyntaxHighlighter 支援的語言
  const getLang = (format: FormatType): string => {
    switch (format) {
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'yaml':
        return 'yaml';
      case 'csv':
        return 'csv';
      case 'sql':
        return 'sql';
      default:
        return 'text';
    }
  };

  if (!code) {
    return (
      <div style={{ padding: '1rem', color: '#999', fontStyle: 'italic' }}>
        {t('output.empty')}
      </div>
    );
  }

  return (
    <SyntaxHighlighter
      language={getLang(language)}
      style={tomorrow}
      customStyle={{
        margin: 0,
        padding: '1rem',
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
      showLineNumbers={true}
      wrapLines={true}
    >
      {code}
    </SyntaxHighlighter>
  );
}
