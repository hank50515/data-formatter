/**
 * DiffExport.tsx
 *
 * 差異匯出元件 - 提供複製、匯出 HTML、生成 JSON Patch 功能
 *
 * @feature 006-json-diff-compare
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffComparison } from '../../types/diff';
import { copyToClipboard, exportAsHTML, generateJSONPatch } from '../../services/diffExport';

interface DiffExportProps {
  comparison: DiffComparison;
}

const DiffExport: React.FC<DiffExportProps> = ({ comparison }) => {
  const { t } = useTranslation();
  const [notification, setNotification] = useState<string | null>(null);

  // 顯示成功通知
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // 處理複製到剪貼簿
  const handleCopyDiff = async () => {
    const success = await copyToClipboard(comparison);
    if (success) {
      showNotification(t('diff.export.copied'));
    } else {
      showNotification(t('diff.errors.exportFailed'));
    }
  };

  // 處理匯出為 HTML
  const handleExportHTML = async () => {
    try {
      const blob = await exportAsHTML(comparison);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `json-diff-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(t('diff.export.exported'));
    } catch (error) {
      console.error('Export HTML error:', error);
      showNotification(t('diff.errors.exportFailed'));
    }
  };

  // 處理生成 JSON Patch
  const handleGenerateJSONPatch = () => {
    try {
      const patch = generateJSONPatch(comparison);
      const blob = new Blob([JSON.stringify(patch, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `json-patch-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(t('diff.export.exported'));
    } catch (error) {
      console.error('Generate JSON Patch error:', error);
      showNotification(t('diff.errors.exportFailed'));
    }
  };

  return (
    <div className="diff-export">
      <h3 className="diff-export__title">{t('diff.export.title', { defaultValue: '匯出' })}</h3>

      <div className="diff-export__buttons">
        <button
          className="diff-export__button diff-export__button--copy"
          onClick={handleCopyDiff}
          title={t('diff.export.copyDiff')}
        >
          📋 {t('diff.export.copyDiff')}
        </button>

        <button
          className="diff-export__button diff-export__button--html"
          onClick={handleExportHTML}
          title={t('diff.export.exportHtml')}
        >
          📄 {t('diff.export.exportHtml')}
        </button>

        <button
          className="diff-export__button diff-export__button--patch"
          onClick={handleGenerateJSONPatch}
          title={t('diff.export.generatePatch')}
        >
          🔧 {t('diff.export.generatePatch')}
        </button>
      </div>

      {notification && (
        <div className="diff-export__notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default DiffExport;
