import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setLanguage(lng);
      localStorage.setItem('lang', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
