/**
 * SearchBar 元件
 * 提供 JSON 搜尋功能，支援上/下一個匹配項導航與區分大小寫選項
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   jsonText={jsonString}
 *   onMatchesChange={handleMatchesChange}
 *   onCurrentMatchChange={handleCurrentMatch}
 * />
 * ```
 *
 * 鍵盤快捷鍵：
 * - Enter: 下一個搜尋結果
 * - Shift+Enter: 上一個搜尋結果
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../hooks/useDebounce';
import { searchInJSON, getTotalMatchCount } from '../../services/searchService';
import type { SearchMatch } from '../../types/json-advanced';

interface SearchBarProps {
  /** JSON 文字內容 */
  jsonText: string;
  /** 匹配項變更回調函數 */
  onMatchesChange: (matches: SearchMatch[], currentIndex: number) => void;
  /** 當前匹配項變更回調函數（可選） */
  onCurrentMatchChange?: (match: SearchMatch | null) => void;
}

/**
 * SearchBar 元件實作
 * 支援即時搜尋（300ms 防抖）、區分大小寫、鍵盤導航
 *
 * @param {SearchBarProps} props - 元件屬性
 * @returns {React.ReactElement} SearchBar 元件
 */
const SearchBar: React.FC<SearchBarProps> = ({
  jsonText,
  onMatchesChange,
  onCurrentMatchChange,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search query to avoid excessive searching
  const debouncedQuery = useDebounce(query, 300);

  // Perform search when debounced query or options change
  useEffect(() => {
    if (!debouncedQuery.trim() || !jsonText) {
      setMatches([]);
      setTotalCount(0);
      setCurrentIndex(0);
      onMatchesChange([], 0);
      onCurrentMatchChange?.(null);
      return;
    }

    const foundMatches = searchInJSON(jsonText, debouncedQuery, caseSensitive);
    const total = getTotalMatchCount(jsonText, debouncedQuery, caseSensitive);

    setMatches(foundMatches);
    setTotalCount(total);
    setCurrentIndex(foundMatches.length > 0 ? 0 : -1);

    onMatchesChange(foundMatches, foundMatches.length > 0 ? 0 : -1);
    onCurrentMatchChange?.(foundMatches.length > 0 ? foundMatches[0] : null);
  }, [debouncedQuery, jsonText, caseSensitive, onMatchesChange, onCurrentMatchChange]);

  // T074: Performance optimization - Memoize handlers to prevent re-renders
  const handlePrevious = useCallback(() => {
    if (matches.length === 0) return;

    const newIndex = currentIndex > 0 ? currentIndex - 1 : matches.length - 1;
    setCurrentIndex(newIndex);
    onMatchesChange(matches, newIndex);
    onCurrentMatchChange?.(matches[newIndex]);
  }, [matches, currentIndex, onMatchesChange, onCurrentMatchChange]);

  const handleNext = useCallback(() => {
    if (matches.length === 0) return;

    const newIndex = currentIndex < matches.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onMatchesChange(matches, newIndex);
    onCurrentMatchChange?.(matches[newIndex]);
  }, [matches, currentIndex, onMatchesChange, onCurrentMatchChange]);

  const handleClear = useCallback(() => {
    setQuery('');
    setMatches([]);
    setTotalCount(0);
    setCurrentIndex(0);
    onMatchesChange([], 0);
    onCurrentMatchChange?.(null);
  }, [onMatchesChange, onCurrentMatchChange]);

  // T059: Keyboard shortcuts - Enter for next, Shift+Enter for previous
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
  }, [handlePrevious, handleNext]);

  const hasMatches = matches.length > 0;
  const showingCount = Math.min(matches.length, 500);
  const hasMoreMatches = totalCount > matches.length;

  return (
    <div className="search-bar" role="search" aria-label="JSON search">
      <div className="search-bar__input-group">
        <input
          type="text"
          className="search-bar__input"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t('search.placeholder')}
          aria-describedby={query ? 'search-results' : undefined}
          aria-controls="search-results"
        />
        {query && (
          <button
            className="search-bar__clear-btn"
            onClick={handleClear}
            title={t('common.clear')}
            aria-label={t('common.clear')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="search-bar__options" role="group" aria-label="Search options">
        <label className="search-bar__checkbox-label">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            aria-label={t('search.caseSensitive')}
          />
          <span>{t('search.caseSensitive')}</span>
        </label>
      </div>

      {query && (
        <div
          className="search-bar__results"
          id="search-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {hasMatches ? (
            <>
              <span className="search-bar__count">
                {t('search.matchCount', { current: currentIndex + 1, total: showingCount })}
                {hasMoreMatches && ` (${totalCount} total)`}
              </span>
              <div className="search-bar__navigation" role="group" aria-label="Search navigation">
                <button
                  className="search-bar__nav-btn"
                  onClick={handlePrevious}
                  title={`${t('search.previous')} (Shift+Enter)`}
                  aria-label={`${t('search.previous')} (Shift+Enter)`}
                  disabled={matches.length === 0}
                >
                  ▲
                </button>
                <button
                  className="search-bar__nav-btn"
                  onClick={handleNext}
                  title={`${t('search.next')} (Enter)`}
                  aria-label={`${t('search.next')} (Enter)`}
                  disabled={matches.length === 0}
                >
                  ▼
                </button>
              </div>
            </>
          ) : (
            <span className="search-bar__no-results" role="alert">{t('search.noResults')}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
