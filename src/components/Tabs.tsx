/**
 * T052: Tabs 元件 - 資料格式化工具的分頁切換介面
 *
 * 無障礙功能：
 * - role="tab": 符合 ARIA 標準，讓螢幕閱讀器識別為分頁按鈕
 * - aria-selected: 標示當前啟用的分頁，提供明確的狀態資訊
 * - 鍵盤導航：分頁按鈕可透過 Tab 鍵獲得焦點，Enter/Space 鍵啟動
 * - 視覺回饋：焦點狀態有明顯外框（:focus），符合 WCAG 2.1 Level AA 標準
 * - 減少動畫模式：透過 CSS @media (prefers-reduced-motion) 支援使用者偏好設定
 *
 * 效能優化：
 * - 使用 CSS transitions 而非 JavaScript 動畫，充分利用 GPU 加速
 * - 僅針對必要屬性使用過渡效果（transform, opacity, color 等）
 * - will-change 屬性提示瀏覽器優化動畫效能
 */
import './Tabs.css';
import type { FormatType } from '../types';

interface Tab {
  key: FormatType;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: FormatType;
  onTabChange: (tab: FormatType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tab ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          // 無障礙屬性：讓輔助技術（螢幕閱讀器）知道這是分頁按鈕
          aria-selected={activeTab === tab.key}
          role="tab"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
