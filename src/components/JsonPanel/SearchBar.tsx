/**
 * Search Bar Component
 * Provides search functionality with next/previous navigation
 * User Story 4: Search and Data Statistics
 */

import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchInJSON, getTotalMatchCount } from '../../services/searchService';
import type { SearchMatch } from '../../types/json-advanced';

interface SearchBarProps {
  jsonText: string;
  onMatchesChange: (matches: SearchMatch[], currentIndex: number) => void;
  onCurrentMatchChange?: (match: SearchMatch | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  jsonText,
  onMatchesChange,
  onCurrentMatchChange,
}) => {
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

  const handlePrevious = () => {
    if (matches.length === 0) return;

    const newIndex = currentIndex > 0 ? currentIndex - 1 : matches.length - 1;
    setCurrentIndex(newIndex);
    onMatchesChange(matches, newIndex);
    onCurrentMatchChange?.(matches[newIndex]);
  };

  const handleNext = () => {
    if (matches.length === 0) return;

    const newIndex = currentIndex < matches.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onMatchesChange(matches, newIndex);
    onCurrentMatchChange?.(matches[newIndex]);
  };

  const handleClear = () => {
    setQuery('');
    setMatches([]);
    setTotalCount(0);
    setCurrentIndex(0);
    onMatchesChange([], 0);
    onCurrentMatchChange?.(null);
  };

  const hasMatches = matches.length > 0;
  const showingCount = Math.min(matches.length, 500);
  const hasMoreMatches = totalCount > matches.length;

  return (
    <div className="search-bar">
      <div className="search-bar__input-group">
        <input
          type="text"
          className="search-bar__input"
          placeholder="Search in JSON..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="search-bar__clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="search-bar__options">
        <label className="search-bar__checkbox-label">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          <span>Case sensitive</span>
        </label>
      </div>

      {query && (
        <div className="search-bar__results">
          {hasMatches ? (
            <>
              <span className="search-bar__count">
                {currentIndex + 1} of {showingCount}
                {hasMoreMatches && ` (${totalCount} total)`}
              </span>
              <div className="search-bar__navigation">
                <button
                  className="search-bar__nav-btn"
                  onClick={handlePrevious}
                  title="Previous match (Shift+Enter)"
                >
                  ▲
                </button>
                <button
                  className="search-bar__nav-btn"
                  onClick={handleNext}
                  title="Next match (Enter)"
                >
                  ▼
                </button>
              </div>
            </>
          ) : (
            <span className="search-bar__no-results">No results found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
