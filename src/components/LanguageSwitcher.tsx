/**
 * LanguageSwitcher 元件
 * 提供語言切換功能（繁體中文 / English）
 */

import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="language-label">
        {t('language.switch')}:
      </label>
      <select
        id="language-select"
        className="language-select"
        value={i18n.language}
        onChange={handleLanguageChange}
      >
        <option value="zh-TW">{t('language.zhTW')}</option>
        <option value="en">{t('language.en')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
