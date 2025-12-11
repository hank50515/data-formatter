/**
 * StatisticsPanel 元件
 * 顯示 JSON 資料的結構統計資訊（結構、值類型、大小）
 *
 * @component
 * @example
 * ```tsx
 * <StatisticsPanel jsonText={jsonString} isVisible={true} />
 * ```
 *
 * 統計資訊包含：
 * - 結構：物件數量、陣列數量、鍵值總數、最大深度
 * - 值類型：字串、數字、布林值、空值計數
 * - 大小：總行數、字元數、檔案大小
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  calculateJSONStatistics,
  formatStatistics,
  calculateSizeMetrics,
} from '../../services/jsonStatistics';
import type { JSONStatistics } from '../../types/json-advanced';

interface StatisticsPanelProps {
  /** JSON 文字內容 */
  jsonText: string;
  /** 是否顯示面板（預設：true） */
  isVisible?: boolean;
}

/**
 * StatisticsPanel 元件實作
 * 非同步計算統計資訊（100ms 延遲），避免阻塞 UI
 * 使用 React.memo 優化效能
 *
 * @param {StatisticsPanelProps} props - 元件屬性
 * @returns {React.ReactElement | null} StatisticsPanel 元件
 */
const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  jsonText,
  isVisible = true,
}) => {
  const { t } = useTranslation();
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
        <h3 className="statistics-panel__title">📊 {t('statistics.title')}</h3>
        <p className="statistics-panel__empty-message">
          {t('treeView.noData')}
        </p>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="statistics-panel">
        <h3 className="statistics-panel__title">📊 {t('statistics.title')}</h3>
        <div className="statistics-panel__loading">
          <span className="statistics-panel__spinner">⏳</span>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="statistics-panel statistics-panel--error">
        <h3 className="statistics-panel__title">📊 {t('statistics.title')}</h3>
        <p className="statistics-panel__error-message">
          {t('common.error')}
        </p>
      </div>
    );
  }

  const formattedStats = formatStatistics(statistics);
  const sizeMetrics = calculateSizeMetrics(jsonText);

  return (
    <div className="statistics-panel" role="region" aria-label={t('statistics.title')}>
      <h3 className="statistics-panel__title" id="stats-title">📊 {t('statistics.title')}</h3>

      <div className="statistics-panel__grid" role="group" aria-labelledby="stats-title">
        {/* Structure stats */}
        <div className="statistics-panel__section" role="group" aria-labelledby="stats-structure">
          <h4 className="statistics-panel__section-title" id="stats-structure">{t('statistics.structure')}</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.objectCount')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Objects']} ${t('statistics.objectCount')}`}>{formattedStats['Objects']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.arrayCount')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Arrays']} ${t('statistics.arrayCount')}`}>{formattedStats['Arrays']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.totalKeys')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Key-Value Pairs']} ${t('statistics.totalKeys')}`}>{formattedStats['Key-Value Pairs']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.maxDepth')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Max Depth']} ${t('statistics.maxDepth')}`}>{formattedStats['Max Depth']}</span>
            </div>
          </div>
        </div>

        {/* Value types stats */}
        <div className="statistics-panel__section" role="group" aria-labelledby="stats-types">
          <h4 className="statistics-panel__section-title" id="stats-types">{t('statistics.valueTypes')}</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.strings')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Strings']} ${t('statistics.strings')}`}>{formattedStats['Strings']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.numbers')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Numbers']} ${t('statistics.numbers')}`}>{formattedStats['Numbers']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.booleans')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Booleans']} ${t('statistics.booleans')}`}>{formattedStats['Booleans']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.nulls')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Nulls']} ${t('statistics.nulls')}`}>{formattedStats['Nulls']}</span>
            </div>
          </div>
        </div>

        {/* Size stats */}
        <div className="statistics-panel__section statistics-panel__section--full" role="group" aria-labelledby="stats-size">
          <h4 className="statistics-panel__section-title" id="stats-size">{t('statistics.size')}</h4>
          <div className="statistics-panel__items">
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('output.lines')}:</span>
              <span className="statistics-panel__value" aria-label={`${formattedStats['Total Lines']} ${t('output.lines')}`}>{formattedStats['Total Lines']}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.characters')}:</span>
              <span className="statistics-panel__value" aria-label={`${sizeMetrics.characters.toLocaleString()} ${t('statistics.characters')}`}>{sizeMetrics.characters.toLocaleString()}</span>
            </div>
            <div className="statistics-panel__item">
              <span className="statistics-panel__label">{t('statistics.rawSize')}:</span>
              <span className="statistics-panel__value" aria-label={`${sizeMetrics.sizeFormatted} ${t('statistics.rawSize')}`}>{sizeMetrics.sizeFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatisticsPanel);
