/**
 * TreeView 元件
 * 以樹狀結構顯示 JSON 資料，支援展開/收合節點
 *
 * @component
 * @example
 * ```tsx
 * <TreeView data={jsonData} onError={handleError} />
 * ```
 */
import React, { useState, useMemo } from 'react';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { useTranslation } from 'react-i18next';

interface TreeViewProps {
  /** JSON 資料（字串或物件） */
  data: any;
  /** 錯誤處理回調函數 */
  onError?: (error: string) => void;
}

/**
 * TreeView 元件實作
 * 提供 JSON 資料的樹狀檢視，包含全部展開/收合功能
 *
 * @param {TreeViewProps} props - 元件屬性
 * @returns {React.ReactElement} TreeView 元件
 */
const TreeView: React.FC<TreeViewProps> = ({ data, onError }) => {
  const { t } = useTranslation();
  const [shouldExpandNode, setShouldExpandNode] = useState<(level: number, value: any, field?: string) => boolean>(
    () => () => true
  );

  // Parse data if it's a string
  const parsedData = useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Failed to parse JSON');
        return null;
      }
    }
    return data;
  }, [data, onError]);

  const handleCollapseAll = () => {
    setShouldExpandNode(() => () => false);
  };

  const handleExpandAll = () => {
    setShouldExpandNode(() => () => true);
  };

  if (!parsedData) {
    return (
      <div style={{ padding: '1rem', color: '#dc2626' }}>
        {t('treeView.noData')}
      </div>
    );
  }

  return (
    <div className="tree-view-container" role="region" aria-label={t('treeView.switchToTree')}>
      <div className="tree-view-controls" role="toolbar" aria-label="Tree view controls">
        <button
          onClick={handleExpandAll}
          className="tree-control-btn"
          title={t('treeView.expandAll')}
          aria-label={t('treeView.expandAll')}
          aria-expanded="false"
          tabIndex={0}
        >
          <span className="icon" aria-hidden="true">▼</span> {t('treeView.expandAll')}
        </button>
        <button
          onClick={handleCollapseAll}
          className="tree-control-btn"
          title={t('treeView.collapseAll')}
          aria-label={t('treeView.collapseAll')}
          aria-expanded="true"
          tabIndex={0}
        >
          <span className="icon" aria-hidden="true">▶</span> {t('treeView.collapseAll')}
        </button>
      </div>
      <div
        className="tree-view-content"
        role="tree"
        aria-label="JSON tree structure"
        tabIndex={0}
      >
        <JsonView
          data={parsedData}
          shouldExpandNode={shouldExpandNode}
          style={defaultStyles}
        />
      </div>
    </div>
  );
};

// T071: Performance optimization - Memoize TreeView to prevent unnecessary re-renders
export default React.memo(TreeView);
