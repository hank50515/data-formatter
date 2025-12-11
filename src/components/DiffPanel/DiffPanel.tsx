/**
 * DiffPanel.tsx
 *
 * JSON Diff 主面板元件 - 整合輸入、計算、顯示差異功能
 *
 * @feature 006-json-diff-compare
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateDiff, calculateMultiLineCharDiff } from '../../services/jsonDiff';
import {
  saveDiffOriginalJSON,
  loadDiffOriginalJSON,
  saveDiffModifiedJSON,
  loadDiffModifiedJSON,
  saveDiffViewMode,
  loadDiffViewMode,
  saveDiffOptions,
  loadDiffOptions,
  clearDiffInputs,
} from '../../utils/storage';
import DiffInputPanel from './DiffInputPanel';
import DiffViewer from './DiffViewer';
import DiffSummary from './DiffSummary';
import DiffViewModeSwitcher from './DiffViewModeSwitcher';
import DiffNavigation from './DiffNavigation';
import DiffExport from './DiffExport';
import DiffColorSchemeSelector from './DiffColorSchemeSelector';
import type {
  DiffComparison,
  DiffViewMode,
  DiffOptions,
  ClearBothAction,
  EnhancedDiffVisualization,
  CharLevelDiffResult,
} from '../../types/diff';
import { DEFAULT_DIFF_OPTIONS, DEFAULT_ENHANCED_VISUALIZATION } from '../../types/diff';
import './DiffPanel.css';

const DiffPanel: React.FC = () => {
  const { t } = useTranslation();

  // State
  const [originalJSON, setOriginalJSON] = useState('');
  const [modifiedJSON, setModifiedJSON] = useState('');
  const [comparison, setComparison] = useState<DiffComparison | null>(null);
  const [viewMode, setViewMode] = useState<DiffViewMode>(() => {
    const saved = loadDiffViewMode();
    return (saved === 'side-by-side' || saved === 'unified') ? saved : 'side-by-side';
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentDiffIndex, setCurrentDiffIndex] = useState(-1);
  const [diffOptions, setDiffOptions] = useState<DiffOptions>(() => {
    const saved = loadDiffOptions();
    return saved || DEFAULT_DIFF_OPTIONS;
  });
  const [clearAction, setClearAction] = useState<ClearBothAction>({
    isClearing: false,
    confirmationRequired: false,
    lastClearedAt: null,
  });
  const [enhancedViz, setEnhancedViz] = useState<EnhancedDiffVisualization>(
    DEFAULT_ENHANCED_VISUALIZATION
  );

  // T023: 使用 useMemo 快取字元層級 diff 計算結果
  const charLevelDiffs = useMemo<CharLevelDiffResult[]>(() => {
    // 只在 char 或 both 模式且有輸入時計算
    if (
      (enhancedViz.diffMode === 'char' || enhancedViz.diffMode === 'both') &&
      originalJSON.trim() &&
      modifiedJSON.trim()
    ) {
      try {
        return calculateMultiLineCharDiff(originalJSON, modifiedJSON);
      } catch (error) {
        console.error('Character-level diff calculation error:', error);
        return [];
      }
    }
    return [];
  }, [originalJSON, modifiedJSON, enhancedViz.diffMode]);

  // 從 localStorage 載入資料
  useEffect(() => {
    const savedOriginal = loadDiffOriginalJSON();
    const savedModified = loadDiffModifiedJSON();

    if (savedOriginal) setOriginalJSON(savedOriginal);
    if (savedModified) setModifiedJSON(savedModified);
  }, []);

  // 持久化 viewMode 到 localStorage
  useEffect(() => {
    saveDiffViewMode(viewMode);
  }, [viewMode]);

  // 持久化 diffOptions 到 localStorage
  useEffect(() => {
    saveDiffOptions(diffOptions);
  }, [diffOptions]);

  // 當輸入變更時儲存到 localStorage 並計算 diff
  useEffect(() => {
    // 儲存到 localStorage
    if (originalJSON) saveDiffOriginalJSON(originalJSON);
    if (modifiedJSON) saveDiffModifiedJSON(modifiedJSON);

    // 若任一輸入為空，清除比對結果
    if (!originalJSON.trim() || !modifiedJSON.trim()) {
      setComparison(null);
      return;
    }

    // 計算 diff
    const performDiff = async () => {
      setIsCalculating(true);

      try {
        const result = await calculateDiff(originalJSON, modifiedJSON, diffOptions);
        setComparison(result);
      } catch (error) {
        console.error('Diff calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    performDiff();
  }, [originalJSON, modifiedJSON, diffOptions]);

  // 重置導航索引當 comparison 變更
  useEffect(() => {
    if (comparison && comparison.differences.length > 0) {
      setCurrentDiffIndex(0);
    } else {
      setCurrentDiffIndex(-1);
    }
  }, [comparison]);

  // 導航到下一個差異
  const navigateToNext = () => {
    if (!comparison || comparison.differences.length === 0) return;

    const nextIndex = (currentDiffIndex + 1) % comparison.differences.length;
    setCurrentDiffIndex(nextIndex);

    // 滾動到對應的差異行
    const diffId = comparison.differences[nextIndex].id;
    const element = document.querySelector(`[data-diff-id="${diffId}"]`);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });

      // 添加高亮效果
      element.classList.add('diff-line--highlight');
      setTimeout(() => {
        element.classList.remove('diff-line--highlight');
      }, 1500);
    }
  };

  // 導航到上一個差異
  const navigateToPrevious = () => {
    if (!comparison || comparison.differences.length === 0) return;

    const prevIndex = currentDiffIndex === 0
      ? comparison.differences.length - 1
      : currentDiffIndex - 1;
    setCurrentDiffIndex(prevIndex);

    // 滾動到對應的差異行
    const diffId = comparison.differences[prevIndex].id;
    const element = document.querySelector(`[data-diff-id="${diffId}"]`);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });

      // 添加高亮效果
      element.classList.add('diff-line--highlight');
      setTimeout(() => {
        element.classList.remove('diff-line--highlight');
      }, 1500);
    }
  };

  // 清除兩側輸入
  const handleClearBoth = () => {
    setClearAction({ isClearing: true, confirmationRequired: false, lastClearedAt: null });

    // 清除 localStorage
    clearDiffInputs();

    // 清除 state
    setOriginalJSON('');
    setModifiedJSON('');
    setComparison(null);
    setCurrentDiffIndex(-1);

    // 200ms 後重新啟用按鈕
    setTimeout(() => {
      setClearAction({
        isClearing: false,
        confirmationRequired: false,
        lastClearedAt: Date.now(),
      });
    }, 200);
  };

  // 鍵盤快捷鍵 (Alt+N, Alt+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        navigateToNext();
      } else if (e.altKey && e.key === 'p') {
        e.preventDefault();
        navigateToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDiffIndex, comparison]);

  return (
    <div className="diff-panel" role="main" aria-label={t('diff.title')}>
      <h2 className="diff-panel__title" id="diff-panel-title">{t('diff.title')}</h2>

      <DiffInputPanel
        originalJSON={originalJSON}
        modifiedJSON={modifiedJSON}
        onOriginalChange={setOriginalJSON}
        onModifiedChange={setModifiedJSON}
      />

      {/* Diff Options & Actions */}
      <div className="diff-options-and-actions">
        <div className="diff-options" role="group" aria-labelledby="diff-options-title">
          <span id="diff-options-title" className="sr-only">{t('diff.options.title', 'Diff Options')}</span>
          <label className="diff-options__option">
            <input
              type="checkbox"
              checked={diffOptions.ignoreWhitespace}
              onChange={(e) =>
                setDiffOptions({ ...diffOptions, ignoreWhitespace: e.target.checked })
              }
              aria-label={t('diff.options.ignoreWhitespace')}
              id="diff-option-whitespace"
            />
            <span>{t('diff.options.ignoreWhitespace')}</span>
          </label>

          <label className="diff-options__option">
            <input
              type="checkbox"
              checked={diffOptions.ignoreArrayOrder}
              onChange={(e) =>
                setDiffOptions({ ...diffOptions, ignoreArrayOrder: e.target.checked })
              }
              aria-label={t('diff.options.ignoreArrayOrder')}
              id="diff-option-array-order"
            />
            <span>{t('diff.options.ignoreArrayOrder')}</span>
          </label>
        </div>

        <div className="diff-actions">
          <button
            className="diff-actions__button diff-actions__button--clear-both"
            onClick={handleClearBoth}
            disabled={clearAction.isClearing || (!originalJSON && !modifiedJSON)}
            aria-label={t('diff.clearBoth')}
            title={t('diff.clearBoth')}
          >
            🗑️ {clearAction.isClearing ? t('diff.clearing') : t('diff.clearBoth')}
          </button>
        </div>
      </div>

      {isCalculating && (
        <div className="diff-panel__loading" role="status" aria-live="polite" aria-busy="true">
          <p>{t('diff.calculating')}</p>
        </div>
      )}

      {!isCalculating && !comparison && originalJSON && modifiedJSON && (
        <div className="diff-panel__placeholder" role="status" aria-live="polite">
          <p>{t('diff.noData')}</p>
        </div>
      )}

      {!isCalculating && comparison && (
        <>
          {comparison.status === 'error' && comparison.error && (
            <div className="diff-panel__error" role="alert" aria-live="assertive">
              <p>{comparison.error.message}</p>
            </div>
          )}

          {comparison.status === 'completed' && (
            <section aria-labelledby="diff-results-title">
              <h3 id="diff-results-title" className="sr-only">{t('diff.results', 'Diff Results')}</h3>

              <DiffSummary summary={comparison.summary} />

              <DiffNavigation
                currentIndex={currentDiffIndex}
                totalCount={comparison.differences.length}
                onNext={navigateToNext}
                onPrevious={navigateToPrevious}
                onClearBoth={handleClearBoth}
                isClearing={clearAction.isClearing}
              />

              <DiffViewModeSwitcher
                currentMode={viewMode}
                onModeChange={setViewMode}
                diffHighlightMode={enhancedViz.diffMode}
                onDiffModeChange={(mode) => setEnhancedViz({ ...enhancedViz, diffMode: mode })}
              />

              <DiffColorSchemeSelector
                currentScheme={enhancedViz.colorScheme}
                onSchemeChange={(scheme) => setEnhancedViz({ ...enhancedViz, colorScheme: scheme })}
              />

              <DiffViewer
                comparison={comparison}
                viewMode={viewMode}
                charLevelDiffs={charLevelDiffs}
                enhancedViz={enhancedViz}
              />

              <DiffExport comparison={comparison} />
            </section>
          )}
        </>
      )}

      {!originalJSON && !modifiedJSON && (
        <div className="diff-panel__placeholder" role="status" aria-live="polite">
          <p>{t('diff.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default DiffPanel;
