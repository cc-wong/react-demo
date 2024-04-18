import * as dateUtils from './utils/DateUtils';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import localesConfig from './locales/config.json';
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';
import translationJA from './locales/ja/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    zh: {
        translation: translationZH
    },
    ja: {
        translation: translationJA
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
 * Formats a date with the format string as defined by
 * `dateFormat.<options.format>.<lng>` in `locales/conf.json`.
 */
i18n.services.formatter.add('formatDate', (value, lng, options) => {
    const format = localesConfig.dateFormat[options.format][lng];
    return dateUtils.formatDate(value, format);
});

export default i18n;