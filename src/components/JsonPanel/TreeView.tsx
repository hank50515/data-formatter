import React, { useState, useMemo } from 'react';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface TreeViewProps {
  data: any;
  onError?: (error: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ data, onError }) => {
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
        Unable to display tree view. Please check your JSON syntax.
      </div>
    );
  }

  return (
    <div className="tree-view-container">
      <div className="tree-view-controls">
        <button
          onClick={handleExpandAll}
          className="tree-control-btn"
          title="Expand All Nodes"
        >
          <span className="icon">▼</span> Expand All
        </button>
        <button
          onClick={handleCollapseAll}
          className="tree-control-btn"
          title="Collapse All Nodes"
        >
          <span className="icon">▶</span> Collapse All
        </button>
      </div>
      <div className="tree-view-content">
        <JsonView
          data={parsedData}
          shouldExpandNode={shouldExpandNode}
          style={defaultStyles}
        />
      </div>
    </div>
  );
};

export default TreeView;
