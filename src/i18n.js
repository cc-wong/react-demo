import * as dateUtils from './utils/DateUtils';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import localesConfig from './locales/config.json';

import moment from 'moment';
/**
 * A locale must be imported explicitly to include it
 * since Create React App excludes moment locales by default.
 * References:
 * - https://stackoverflow.com/questions/49788259/moment-js-change-locale-not-working
 * - https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
 */
import 'moment/locale/zh-hk';
import 'moment/locale/ja';

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
 * Formats a date according to the locale corresponding to the currently selected language
 * with the format string as defined by `dateFormat.<options.format>.<lng>` in `locales/config.json`.
 */
i18n.services.formatter.add('formatDate', (value, lng, options) => {
    moment.locale(localesConfig.language[lng].localeCode);
    const format = localesConfig.dateFormat[options.format][lng];
    return dateUtils.formatDate(value, format);
});

export default i18n;