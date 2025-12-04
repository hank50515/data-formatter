/**
 * Statistics Panel Component
 * Displays structural statistics for JSON data
 * User Story 4: Search and Data Statistics
 */

import React, { useEffect, useState } from 'react';
import {
  calculateJSONStatistics,
  formatStatistics,
  calculateSizeMetrics,
} from '../../services/jsonStatistics';
import type { JSONStatistics } from '../../types/json-advanced';

interface StatisticsPanelProps {
  jsonText: string;
  isVisible?: boolean;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  jsonText,
  isVisible = true,
}) => {
  const [statistics, setStatistics] = useState<JSONStatistics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!jsonText.trim() || !isVisible) {
      setStatistics(null);
      return;
    }

    setIsCalculating(true);

    // Calculate statistics asynchronously to avoid blocking UI
    const timeoutId = setTimeout(() => {
      const stats = calculateJSONStatistics(jsonText);
      setStatistics(stats);
      setIsCalculating(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [jsonText, isVisible]);

  if (!isVisible) {
    return null;
  }

  if (!jsonText.trim()) {
    return (
      <div className="statistics-panel statistics-panel--empty">
        <h3 className="statistics-panel__title">📊 Statistics</h3>
        <p className="statistics-panel__empty-message">
          No data to analyze
        </p>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="statistics-panel">
        <h3 className="statistics-panel__title">📊 Statistics</h3>
        <div className="statistics-panel__loading">
          <span className="statistics-panel__spinner">⏳</span>
          <span>Calculating...</span>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="statistics-panel statistics-panel--error">
        <h3 className="statistics-panel__title">📊 Statistics</h3>
        <p className="statistics-panel__error-message">
          Unable to calculate statistics
        </p>
      </div>
    );
  }

  const formattedStats = formatStatistics(statistics);
  const sizeMetrics = calculateSizeMetrics(jsonText);

  return (
    <div className="statistics-panel">
      <h3 className="statistics-panel__title">📊 JSON Statistics</h3>

      <div className="statistics-panel__grid">
        {/* Structure stats */}
        <div className="statistics-panel__section">
          <h4 className="statistics-panel__section-title">Structure</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Objects:</span>
              <span className="statistics-panel__value">{formattedStats['Objects']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Arrays:</span>
              <span className="statistics-panel__value">{formattedStats['Arrays']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Key-Value Pairs:</span>
              <span className="statistics-panel__value">{formattedStats['Key-Value Pairs']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Max Depth:</span>
              <span className="statistics-panel__value">{formattedStats['Max Depth']}</span>
            </div>
          </div>
        </div>

        {/* Value types stats */}
        <div className="statistics-panel__section">
          <h4 className="statistics-panel__section-title">Value Types</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Strings:</span>
              <span className="statistics-panel__value">{formattedStats['Strings']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Numbers:</span>
              <span className="statistics-panel__value">{formattedStats['Numbers']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Booleans:</span>
              <span className="statistics-panel__value">{formattedStats['Booleans']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Nulls:</span>
              <span className="statistics-panel__value">{formattedStats['Nulls']}</span>
            </div>
          </div>
        </div>

        {/* Size stats */}
        <div className="statistics-panel__section statistics-panel__section--full">
          <h4 className="statistics-panel__section-title">Size</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Total Lines:</span>
              <span className="statistics-panel__value">{formattedStats['Total Lines']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">Characters:</span>
              <span className="statistics-panel__value">{sizeMetrics.characters.toLocaleString()}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">File Size:</span>
              <span className="statistics-panel__value">{sizeMetrics.sizeFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatisticsPanel);
