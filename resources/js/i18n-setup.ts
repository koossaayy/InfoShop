import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../lang/en.json';
import frTranslations from '../../lang/fr.json';
import ruTranslations from '../../lang/ru.json';
import deTranslations from '../../lang/de.json';
import jaTranslations from '../../lang/ja.json';
import arTranslations from '../../lang/ar.json';

const resources = {
    'en': { translation: enTranslations },
    'fr': { translation: frTranslations },
    'ru': { translation: ruTranslations },
    'de': { translation: deTranslations },
    'ja': { translation: jaTranslations },
    'ar': { translation: arTranslations },
};

// Start from the visitor's saved choice, else their browser language,
// else the project's primary language. SSR-safe: both checks are guarded.
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null;
const browser = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : null;
const initialLng = [stored, browser].find((l) => l && l in resources) ?? 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;