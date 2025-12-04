/**
 * Search Service
 * Provides search functionality for finding keys/values in JSON
 * User Story 4: Search and Data Statistics
 */

import type { SearchMatch } from '../types/json-advanced';

const MAX_MATCHES = 500; // Limit search results to prevent performance issues

/**
 * Search for a query string in JSON text
 * Returns matches with line, column, and text information
 */
export function searchInJSON(
  jsonText: string,
  query: string,
  caseSensitive: boolean = false
): SearchMatch[] {
  if (!query || !jsonText) {
    return [];
  }

  const matches: SearchMatch[] = [];
  const lines = jsonText.split('\n');
  const searchQuery = caseSensitive ? query : query.toLowerCase();

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const searchLine = caseSensitive ? line : line.toLowerCase();

    let columnIndex = 0;
    while (columnIndex < searchLine.length) {
      const matchIndex = searchLine.indexOf(searchQuery, columnIndex);

      if (matchIndex === -1) {
        break;
      }

      // Stop if we've reached the maximum number of matches
      if (matches.length >= MAX_MATCHES) {
        return matches;
      }

      matches.push({
        line: lineIndex + 1, // 1-indexed for display
        column: matchIndex + 1, // 1-indexed for display
        length: query.length,
        text: line.substring(matchIndex, matchIndex + query.length),
      });

      columnIndex = matchIndex + query.length;
    }
  }

  return matches;
}

/**
 * Get the total count of matches (including those beyond MAX_MATCHES)
 */
export function getTotalMatchCount(
  jsonText: string,
  query: string,
  caseSensitive: boolean = false
): number {
  if (!query || !jsonText) {
    return 0;
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchText = caseSensitive ? jsonText : jsonText.toLowerCase();

  let count = 0;
  let position = 0;

  while (position < searchText.length) {
    const matchIndex = searchText.indexOf(searchQuery, position);

    if (matchIndex === -1) {
      break;
    }

    count++;
    position = matchIndex + query.length;
  }

  return count;
}

/**
 * Find specific match by index
 */
export function getMatchAtIndex(
  matches: SearchMatch[],
  index: number
): SearchMatch | null {
  if (index < 0 || index >= matches.length) {
    return null;
  }
  return matches[index];
}

/**
 * Get match context (surrounding text)
 */
export function getMatchContext(
  jsonText: string,
  match: SearchMatch,
  contextLines: number = 2
): string {
  const lines = jsonText.split('\n');
  const startLine = Math.max(0, match.line - 1 - contextLines);
  const endLine = Math.min(lines.length - 1, match.line - 1 + contextLines);

  return lines.slice(startLine, endLine + 1).join('\n');
}
