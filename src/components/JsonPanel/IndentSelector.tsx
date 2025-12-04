/**
 * 縮排選擇器元件
 * 允許使用者選擇 2 或 4 空格縮排
 */

import { useEffect } from 'react';
import type { IndentSize } from '../../types/json-advanced';
import { saveIndentSize } from '../../utils/storage';

interface IndentSelectorProps {
  value: IndentSize;
  onChange: (size: IndentSize) => void;
  disabled?: boolean;
}

export function IndentSelector({
  value,
  onChange,
  disabled = false,
}: IndentSelectorProps) {
  // 當縮排大小改變時，儲存到 localStorage
  useEffect(() => {
    saveIndentSize(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value) as IndentSize;
    onChange(newSize);
  };

  return (
    <div className="indent-selector">
      <label htmlFor="indent-size" className="indent-selector__label">
        縮排：
      </label>
      <select
        id="indent-size"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="indent-selector__select"
        aria-label="選擇縮排空格數"
      >
        <option value={2}>2 空格</option>
        <option value={4}>4 空格</option>
      </select>
    </div>
  );
}
