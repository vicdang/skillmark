import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const version = Date.now()

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation'],
    debug: true,
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${version}`,
      addPath: `/locales/add/{{lng}}/{{ns}}`,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  }, (err, t) => {
    if (err) console.error('i18n init error:', err)
    else console.log('i18n initialized successfully')
  });

export default i18n;
