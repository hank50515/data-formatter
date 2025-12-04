import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormatType, FormatterState, FormatterError } from './types';
import type { IndentSize, ValidationResult, ViewMode } from './types/json-advanced';
import { MAX_FILE_SIZE } from './types';
import { calculateByteSize } from './utils/validation';
import {
  formatJSON,
  parseJSONError,
  minifyJSON,
  validateJSON,
} from './services/jsonFormatter';
import { autoFixJSON } from './services/jsonRepair';
import { formatXML } from './services/xmlFormatter';
import { formatYAML } from './services/yamlFormatter';
import { formatCSV } from './services/csvFormatter';
import { formatSQL } from './services/sqlFormatter';
import { loadIndentSize, loadViewMode, saveViewMode } from './utils/storage';
import { useDebounce } from './hooks/useDebounce';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Tabs } from './components/Tabs';
import { ControlBar } from './components/JsonPanel/ControlBar';
import ViewModeSwitcher from './components/JsonPanel/ViewModeSwitcher';
import './index.css';

const createInitialFormatterState = (format: FormatType): FormatterState => ({
  input: { rawText: '', characterCount: 0, sizeInBytes: 0 },
  output: { formattedText: '', format, error: null, lineCount: 0, characterCount: 0 },
  isFormatting: false,
});

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FormatType>('json');
  const [indentSize, setIndentSize] = useState<IndentSize>(() => loadIndentSize());
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [formatters, setFormatters] = useState<Record<FormatType, FormatterState>>({
    json: createInitialFormatterState('json'),
    xml: createInitialFormatterState('xml'),
    yaml: createInitialFormatterState('yaml'),
    csv: createInitialFormatterState('csv'),
    sql: createInitialFormatterState('sql'),
  });

  // User Story 2: 即時驗證狀態
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  // User Story 3: 持久化檢視模式
  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    const saved = localStorage.getItem('data-formatter-active-tab');
    if (saved && ['json', 'xml', 'yaml', 'csv', 'sql'].includes(saved)) {
      setActiveTab(saved as FormatType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('data-formatter-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const formats: FormatType[] = ['json', 'xml', 'yaml', 'csv', 'sql'];
    const restored: Record<FormatType, FormatterState> = { ...formatters };
    formats.forEach(format => {
      const savedInput = localStorage.getItem('data-formatter-input-' + format);
      if (savedInput) {
        restored[format] = {
          ...restored[format],
          input: { rawText: savedInput, characterCount: savedInput.length, sizeInBytes: calculateByteSize(savedInput) },
        };
      }
    });
    setFormatters(restored);
  }, []);

  const currentFormatter = formatters[activeTab];

  const handleInputChange = (value: string) => {
    setFormatters(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        input: { rawText: value, characterCount: value.length, sizeInBytes: calculateByteSize(value) },
      },
    }));
    localStorage.setItem('data-formatter-input-' + activeTab, value);
  };

  useEffect(() => {
    const rawText = currentFormatter.input.rawText;

    if (!rawText.trim()) {
      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: '', format: activeTab, error: null, lineCount: 0, characterCount: 0 },
        },
      }));
      return;
    }

    const sizeInBytes = currentFormatter.input.sizeInBytes;
    if (sizeInBytes > MAX_FILE_SIZE) {
      const error: FormatterError = {
        message: t('error.sizeLimit', { size: (sizeInBytes / 1024 / 1024).toFixed(2) }),
        type: 'size_limit',
      };
      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: '', format: activeTab, error, lineCount: 0, characterCount: 0 },
        },
      }));
      return;
    }

    // 根據不同的 tab 執行對應的格式化
    let formattedText = '';
    let formatterError: FormatterError | null = null;

    try {
      if (activeTab === 'json') {
        formattedText = formatJSON(rawText, indentSize);
      } else if (activeTab === 'xml') {
        const result = formatXML(rawText);
        formattedText = result.formattedText;
        formatterError = result.error;
      } else if (activeTab === 'yaml') {
        const result = formatYAML(rawText);
        formattedText = result.formattedText;
        formatterError = result.error;
      } else if (activeTab === 'csv') {
        const result = formatCSV(rawText);
        formattedText = result.formattedText;
        formatterError = result.error;
      } else if (activeTab === 'sql') {
        const result = formatSQL(rawText);
        formattedText = result.formattedText;
        formatterError = result.error;
      }

      // 如果格式化成功，更新輸出
      if (!formatterError) {
        const lineCount = formattedText.split('\n').length;
        const characterCount = formattedText.length;

        setFormatters(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            output: { formattedText, format: activeTab, error: null, lineCount, characterCount },
          },
        }));
      } else {
        // 格式化失敗，顯示錯誤
        setFormatters(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            output: { formattedText: '', format: activeTab, error: formatterError, lineCount: 0, characterCount: 0 },
          },
        }));
      }
    } catch (error) {
      // 處理例外錯誤
      let errorMessage = '';
      if (activeTab === 'json') {
        formatterError = parseJSONError(error, rawText);
      } else {
        errorMessage = error instanceof Error ? error.message : `${activeTab.toUpperCase()} 格式化失敗`;
        formatterError = {
          message: errorMessage,
          type: 'format_error',
        };
      }

      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: '', format: activeTab, error: formatterError, lineCount: 0, characterCount: 0 },
        },
      }));
    }
  }, [currentFormatter.input.rawText, activeTab, indentSize, t]);

  // 手動操作處理函數 (User Story 1)
  const handleClear = () => {
    setFormatters(prev => ({
      ...prev,
      [activeTab]: createInitialFormatterState(activeTab),
    }));
    localStorage.removeItem('data-formatter-input-' + activeTab);
  };

  const handleManualFormat = () => {
    const rawText = currentFormatter.input.rawText;
    if (!rawText.trim()) return;

    try {
      const formattedText = formatJSON(rawText, indentSize);
      const lineCount = formattedText.split('\n').length;
      const characterCount = formattedText.length;

      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText, format: activeTab, error: null, lineCount, characterCount },
        },
      }));
    } catch (error) {
      const formatterError = parseJSONError(error, rawText);
      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: '', format: activeTab, error: formatterError, lineCount: 0, characterCount: 0 },
        },
      }));
    }
  };

  const handleMinify = () => {
    const rawText = currentFormatter.input.rawText;
    if (!rawText.trim()) return;

    try {
      const minified = minifyJSON(rawText);
      const lineCount = 1; // 壓縮後只有一行
      const characterCount = minified.length;

      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: minified, format: activeTab, error: null, lineCount, characterCount },
        },
      }));
    } catch (error) {
      const formatterError = parseJSONError(error, rawText);
      setFormatters(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          output: { formattedText: '', format: activeTab, error: formatterError, lineCount: 0, characterCount: 0 },
        },
      }));
    }
  };

  // User Story 2: 自動修復處理函數
  const handleAutoFix = async () => {
    const rawText = currentFormatter.input.rawText;
    if (!rawText.trim()) return;

    setIsFixing(true);

    try {
      const result = autoFixJSON(rawText);

      if (result.isValid && result.fixedJSON) {
        // 修復成功，更新輸入
        handleInputChange(result.fixedJSON);

        // 自動格式化修復後的 JSON
        const formattedText = formatJSON(result.fixedJSON, indentSize);
        const lineCount = formattedText.split('\n').length;
        const characterCount = formattedText.length;

        setFormatters(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            output: {
              formattedText,
              format: activeTab,
              error: null,
              lineCount,
              characterCount,
            },
          },
        }));

        setValidationResult(null);
      } else {
        // 無法修復，顯示錯誤
        const errorMessage = result.error?.message || '自動修復失敗';
        const formatterError: FormatterError = {
          message: errorMessage,
          type: 'parse_error',
          line: result.error?.line,
          column: result.error?.column,
        };

        setFormatters(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            output: {
              formattedText: '',
              format: activeTab,
              error: formatterError,
              lineCount: 0,
              characterCount: 0,
            },
          },
        }));
      }
    } catch (error) {
      console.error('Auto-fix error:', error);
    } finally {
      setIsFixing(false);
    }
  };

  // User Story 2: 防抖動的即時驗證（僅用於 JSON）
  const debouncedInput = useDebounce(currentFormatter.input.rawText, 500);

  useEffect(() => {
    if (activeTab !== 'json') {
      setValidationResult(null);
      return;
    }

    const rawText = debouncedInput.trim();
    if (!rawText) {
      setValidationResult(null);
      return;
    }

    // 執行即時驗證
    const result = validateJSON(rawText);
    setValidationResult(result);
  }, [debouncedInput, activeTab]);

  const tabs = [
    { key: 'json' as FormatType, label: t('tabs.json') },
    { key: 'xml' as FormatType, label: t('tabs.xml') },
    { key: 'yaml' as FormatType, label: t('tabs.yaml') },
    { key: 'csv' as FormatType, label: t('tabs.csv') },
    { key: 'sql' as FormatType, label: t('tabs.sql') },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 僅在 JSON tab 顯示 ControlBar 和 ViewModeSwitcher (User Stories 1 & 3) */}
      {activeTab === 'json' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <ControlBar
              indentSize={indentSize}
              onIndentChange={setIndentSize}
              onClear={handleClear}
              onFormat={handleManualFormat}
              onMinify={handleMinify}
              disabled={currentFormatter.isFormatting}
              hasInput={!!currentFormatter.input.rawText.trim()}
            />
            <ViewModeSwitcher
              currentMode={viewMode}
              onModeChange={setViewMode}
            />
          </div>
        </div>
      )}

      <main className="app-main">
        <div className="panel-container">
          <InputPanel
            value={currentFormatter.input.rawText}
            onChange={handleInputChange}
            placeholder={t('input.placeholder')}
          />
          <OutputPanel
            output={currentFormatter.output}
            validationResult={activeTab === 'json' ? validationResult : null}
            onAutoFix={activeTab === 'json' ? handleAutoFix : undefined}
            isFixing={isFixing}
            viewMode={activeTab === 'json' ? viewMode : 'code'}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
}

export default App;
