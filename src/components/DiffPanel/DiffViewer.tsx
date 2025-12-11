/**
 * DiffViewer.tsx
 *
 * Diff 檢視器元件 - 顯示差異結果（side-by-side 或 unified 模式）
 * Enhanced with character-level diff visualization
 *
 * @feature 006-json-diff-compare
 * @feature 007-json-diff-ui-enhancements
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type {
  DiffComparison,
  DiffViewMode,
  CharLevelDiffResult,
  EnhancedDiffVisualization,
  CharChange,
} from '../../types/diff';

interface DiffViewerProps {
  comparison: DiffComparison;
  viewMode: DiffViewMode;
  charLevelDiffs?: CharLevelDiffResult[];
  enhancedViz?: EnhancedDiffVisualization;
}

/**
 * Helper function to render character-level diff highlighting
 * T025: renderCharLevelDiff() implementation
 * @feature 007-json-diff-ui-enhancements
 */
function renderCharLevelDiff(charChanges: CharChange[]): React.ReactNode {
  return charChanges.map((change, index) => {
    const className =
      change.type === 'add'
        ? 'diff-char--added'
        : change.type === 'remove'
        ? 'diff-char--removed'
        : 'diff-char--unchanged';

    return (
      <span key={index} className={className}>
        {change.value}
      </span>
    );
  });
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  comparison,
  viewMode,
  charLevelDiffs = [],
  enhancedViz,
}) => {
  const { t } = useTranslation();

  // Determine if we should show character-level diffs
  const showCharDiff =
    enhancedViz &&
    (enhancedViz.diffMode === 'char' || enhancedViz.diffMode === 'both') &&
    charLevelDiffs.length > 0;

  if (comparison.differences.length === 0) {
    return (
      <div className="diff-viewer" role="region" aria-label={t('diff.viewer', 'Diff Viewer')}>
        <p className="diff-viewer__no-data">{t('diff.noDifferences')}</p>
      </div>
    );
  }

  // Apply color scheme class
  const colorSchemeClass = enhancedViz?.colorScheme
    ? `diff-viewer--${enhancedViz.colorScheme}`
    : '';

  // Side-by-side view (並排檢視)
  if (viewMode === 'side-by-side') {
    return (
      <div className={`diff-viewer diff-viewer--side-by-side ${colorSchemeClass}`.trim()} role="region" aria-label={t('diff.sideBySideView', 'Side by Side Diff View')}>
        <div className="diff-viewer__panel diff-viewer__panel--original" role="article" aria-label={t('diff.original')}>
          <h4 className="diff-viewer__panel-title" id="diff-original-title">{t('diff.original')}</h4>
          <div className="diff-viewer__content" aria-labelledby="diff-original-title">
            {showCharDiff ? (
              <div className="diff-viewer__char-level">
                {charLevelDiffs.map((lineDiff, idx) => (
                  <div key={idx} className="diff-viewer__line">
                    {enhancedViz?.showLineNumbers && (
                      <span className="diff-viewer__line-number">{idx + 1}</span>
                    )}
                    <span className="diff-viewer__line-content">
                      {renderCharLevelDiff(lineDiff.charChanges)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <pre>{JSON.stringify(comparison.originalParsed, null, 2)}</pre>
            )}
          </div>
        </div>

        <div className="diff-viewer__panel diff-viewer__panel--modified" role="article" aria-label={t('diff.modified')}>
          <h4 className="diff-viewer__panel-title" id="diff-modified-title">{t('diff.modified')}</h4>
          <div className="diff-viewer__content" aria-labelledby="diff-modified-title">
            {showCharDiff ? (
              <div className="diff-viewer__char-level">
                {charLevelDiffs.map((lineDiff, idx) => (
                  <div key={idx} className="diff-viewer__line">
                    {enhancedViz?.showLineNumbers && (
                      <span className="diff-viewer__line-number">{idx + 1}</span>
                    )}
                    <span className="diff-viewer__line-content">
                      {renderCharLevelDiff(lineDiff.charChanges)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <pre>{JSON.stringify(comparison.modifiedParsed, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Unified view (統一檢視)
  return (
    <div className={`diff-viewer diff-viewer--unified ${colorSchemeClass}`.trim()} role="region" aria-label={t('diff.unifiedView', 'Unified Diff View')}>
      <h4 className="diff-viewer__title">{t('diff.title')}</h4>
      <div className="diff-viewer__changes" role="list" aria-label={t('diff.changesList', 'List of changes')}>
        {comparison.differences.map((change) => {
          const markerSymbol =
            change.type === 'addition' ? '+' : change.type === 'deletion' ? '-' : '~';

          const ariaLabel =
            change.type === 'addition'
              ? t('diff.aria.addition', `Addition: ${change.displayText}`, { text: change.displayText })
              : change.type === 'deletion'
              ? t('diff.aria.deletion', `Deletion: ${change.displayText}`, { text: change.displayText })
              : t('diff.aria.modification', `Modification: ${change.displayText}`, { text: change.displayText });

          return (
            <div
              key={change.id}
              className={`diff-line diff-line--${change.type}`}
              data-diff-id={change.id}
              role="listitem"
              aria-label={ariaLabel}
            >
              <span className="diff-line__marker" aria-hidden="true">{markerSymbol}</span>
              <span className="diff-line__content">{change.displayText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiffViewer;
