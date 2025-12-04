import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../../src/components/Tabs';
import type { FormatType } from '../../src/types';

describe('Tabs Component', () => {
  const mockTabs = [
    { key: 'json' as FormatType, label: 'JSON' },
    { key: 'xml' as FormatType, label: 'XML' },
    { key: 'yaml' as FormatType, label: 'YAML' },
    { key: 'csv' as FormatType, label: 'CSV' },
    { key: 'sql' as FormatType, label: 'SQL' },
  ];

  // T010: 測試應用 active 類別到選中的 tab
  it('should apply active class to selected tab', () => {
    const handleTabChange = vi.fn();
    const { rerender } = render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 驗證 JSON tab 有 active 類別
    const jsonButton = screen.getByRole('tab', { name: 'JSON' });
    expect(jsonButton).toHaveClass('active');

    // 驗證其他 tab 沒有 active 類別
    const xmlButton = screen.getByRole('tab', { name: 'XML' });
    expect(xmlButton).not.toHaveClass('active');

    // 切換到 XML 並重新渲染
    rerender(
      <Tabs tabs={mockTabs} activeTab="xml" onTabChange={handleTabChange} />
    );

    // 驗證 XML tab 現在有 active 類別
    expect(xmlButton).toHaveClass('active');
    expect(jsonButton).not.toHaveClass('active');
  });

  // T011: 測試點擊時應呼叫 onTabChange
  it('should call onTabChange when tab is clicked', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 點擊 XML tab
    const xmlButton = screen.getByRole('tab', { name: 'XML' });
    fireEvent.click(xmlButton);

    // 驗證 callback 被呼叫且參數正確
    expect(handleTabChange).toHaveBeenCalledTimes(1);
    expect(handleTabChange).toHaveBeenCalledWith('xml');
  });

  // T012: 測試應用正確的 ARIA 屬性
  it('should apply correct aria-selected attributes', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 驗證所有 tab 都有 role="tab"
    const allTabs = screen.getAllByRole('tab');
    expect(allTabs).toHaveLength(5);

    // 驗證 active tab 的 aria-selected="true"
    const jsonButton = screen.getByRole('tab', { name: 'JSON' });
    expect(jsonButton).toHaveAttribute('aria-selected', 'true');

    // 驗證其他 tab 的 aria-selected="false"
    const xmlButton = screen.getByRole('tab', { name: 'XML' });
    const yamlButton = screen.getByRole('tab', { name: 'YAML' });
    const csvButton = screen.getByRole('tab', { name: 'CSV' });
    const sqlButton = screen.getByRole('tab', { name: 'SQL' });

    expect(xmlButton).toHaveAttribute('aria-selected', 'false');
    expect(yamlButton).toHaveAttribute('aria-selected', 'false');
    expect(csvButton).toHaveAttribute('aria-selected', 'false');
    expect(sqlButton).toHaveAttribute('aria-selected', 'false');
  });

  // 額外測試：渲染所有 tab 按鈕
  it('should render all tab buttons', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 驗證所有 5 個 tab 都被渲染
    expect(screen.getByRole('tab', { name: 'JSON' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'XML' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'YAML' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'CSV' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'SQL' })).toBeInTheDocument();
  });

  // T019: 測試應用不同視覺屬性到 active tab（背景、邊框、顏色）
  it('should apply distinct visual properties to active tab', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    const jsonButton = screen.getByRole('tab', { name: 'JSON' });
    const xmlButton = screen.getByRole('tab', { name: 'XML' });

    // 驗證 active tab 有 active 類別（包含所有視覺屬性）
    expect(jsonButton).toHaveClass('tab', 'active');
    // 驗證非 active tab 只有 tab 類別
    expect(xmlButton).toHaveClass('tab');
    expect(xmlButton).not.toHaveClass('active');
  });

  // T020: 測試視覺區別在使用者切換後仍保持
  it('should maintain visual distinction when user returns to app', () => {
    const handleTabChange = vi.fn();
    const { rerender } = render(
      <Tabs tabs={mockTabs} activeTab="yaml" onTabChange={handleTabChange} />
    );

    // 初始狀態：YAML 是 active
    let yamlButton = screen.getByRole('tab', { name: 'YAML' });
    expect(yamlButton).toHaveClass('active');

    // 模擬使用者離開並返回（重新渲染相同狀態）
    rerender(
      <Tabs tabs={mockTabs} activeTab="yaml" onTabChange={handleTabChange} />
    );

    // 驗證 YAML 仍然是 active
    yamlButton = screen.getByRole('tab', { name: 'YAML' });
    expect(yamlButton).toHaveClass('active');
    expect(yamlButton).toHaveAttribute('aria-selected', 'true');
  });

  // T027: 測試桌面裝置上非啟用 tab 的懸停樣式
  it('should have hover styles defined for inactive tabs', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    const xmlButton = screen.getByRole('tab', { name: 'XML' });

    // 驗證按鈕有正確的類別（懸停樣式在 CSS 中通過 @media query 定義）
    expect(xmlButton).toHaveClass('tab');
    expect(xmlButton).not.toHaveClass('active');

    // 注意：實際的懸停行為由 CSS @media (hover: hover) 控制
    // 此測試驗證元件結構支援懸停功能
  });

  // T028: 驗證組件結構不會干擾觸控裝置（CSS 媒體查詢處理）
  it('should have proper structure for touch devices', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 驗證所有 tab 都可點擊（對觸控和滑鼠都有效）
    const allTabs = screen.getAllByRole('tab');
    allTabs.forEach(tab => {
      expect(tab).toBeInTheDocument();
      expect(tab.tagName).toBe('BUTTON');
    });
  });

  // T029: 測試快速滑鼠移動不會造成問題（結構測試）
  it('should handle rapid interaction without structural issues', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="json" onTabChange={handleTabChange} />
    );

    // 快速點擊多個 tab
    const xmlButton = screen.getByRole('tab', { name: 'XML' });
    const yamlButton = screen.getByRole('tab', { name: 'YAML' });
    const csvButton = screen.getByRole('tab', { name: 'CSV' });

    fireEvent.click(xmlButton);
    fireEvent.click(yamlButton);
    fireEvent.click(csvButton);

    // 驗證每次點擊都觸發了回調
    expect(handleTabChange).toHaveBeenCalledTimes(3);
    expect(handleTabChange).toHaveBeenNthCalledWith(1, 'xml');
    expect(handleTabChange).toHaveBeenNthCalledWith(2, 'yaml');
    expect(handleTabChange).toHaveBeenNthCalledWith(3, 'csv');
  });
});
