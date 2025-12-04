/**
 * i18n 設定
 * 初始化 i18next，支援繁體中文與英文
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

i18n
  // 使用語言偵測器
  .use(LanguageDetector)
  // 傳遞 i18n 實例給 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources: {
      'zh-TW': {
        translation: zhTW,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: 'zh-TW', // 預設語言為繁體中文
    debug: false, // 生產環境設為 false
    interpolation: {
      escapeValue: false, // React 已處理 XSS
    },
    detection: {
      // 語言偵測順序：localStorage > navigator
      order: ['localStorage', 'navigator'],
      // 快取使用者選擇的語言
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
