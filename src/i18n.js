import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import localesConfig from './locales/config.json';

const resources = {
    en: {
        translation: require('./locales/en/translation.json')
    },
    zh: {
        translation: require('./locales/zh/translation.json')
    },
    ja: {
        translation: require('./locales/ja/translation.json')
    }
}

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    initImmediate: false,
    interpolation: {
        escapeValue: false,
    },
});
/**
 * Formats a date/time according to the locale corresponding to the currently selected language
 * with options as defined by `formatOptions.<options.format>` in `locales/config.json`.
 */
i18n.services.formatter.add('formatDateTime', (value, lng, options) => {
    const formatOptions = localesConfig.formatOptions[options.format];
    return Intl.DateTimeFormat(localesConfig.language[lng].localeCode, formatOptions).format(value);
});

export default i18n;