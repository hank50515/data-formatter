/**
 * 輸出面板元件
 * 顯示格式化後的結果
 * 支援即時驗證與自動修復 (User Story 2)
 */

import { useTranslation } from 'react-i18next';
import SyntaxHighlight from './SyntaxHighlight';
import CopyButton from './CopyButton';
import ErrorDisplay from './ErrorDisplay';
import type { FormatterState } from '../types';
import type { ValidationResult } from '../types/json-advanced';

interface OutputPanelProps {
  output: FormatterState['output'];
  validationResult?: ValidationResult | null;
  onAutoFix?: () => void;
  isFixing?: boolean;
}

export default function OutputPanel({
  output,
  validationResult = null,
  onAutoFix,
  isFixing = false,
}: OutputPanelProps) {
  const { t } = useTranslation();
  const hasContent = output.formattedText.length > 0;

  // 使用驗證結果（如果有的話）
  const canAutoFix = validationResult?.canAutoFix || false;

  return (
    <div className="panel output-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('output.title')}</h2>
        <CopyButton text={output.formattedText} disabled={!hasContent} />
      </div>

      <ErrorDisplay
        error={output.error}
        canAutoFix={canAutoFix}
        onAutoFix={onAutoFix}
        isFixing={isFixing}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <SyntaxHighlight code={output.formattedText} language={output.format} />
      </div>

      {hasContent && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {t('output.format', { format: output.format.toUpperCase() })} | {t('output.lines', { count: output.lineCount })}
          </span>
          <span>{t('output.characters', { count: output.characterCount })}</span>
        </div>
      )}
    </div>
  );
}
