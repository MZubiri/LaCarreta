import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslation from './es.json';
import enTranslation from './en.json';

const resources = {
  es: {
    translation: esTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

const savedLanguage = localStorage.getItem('lang') || 'es';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
