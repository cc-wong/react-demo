import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            sumoSchedLookup: {
                title: 'Sumo Tournament Schedule Lookup',
                column: {
                    tournament: 'Tournament',
                    schedule: 'Schedule'
                },
                scheduleFormat: '{{day1}}<wbr> to<br> {{day15}}',
                dateDisplayFormat: 'MMMM D (dddd)'
            }
        }
    },
    zh: {
        translation: {
            sumoSchedLookup: {
                title: '大相撲場地時間表查詢',
                column: {
                    tournament: '場地',
                    schedule: '日期'
                },
                scheduleFormat: '{{day1}}<wbr> to<br> {{day15}}',
                dateDisplayFormat: 'MMMM D (dddd)'
            }
        }
    },
    ja: {
        translation: {
            sumoSchedLookup: {
                title: '大相撲本場所スケジュール検索',
                column: {
                    tournament: '場所',
                    schedule: '日付'
                },
                scheduleFormat: '{{day1}}<wbr> to<br> {{day15}}',
                dateDisplayFormat: 'MMMM D (dddd)'
            }
        }
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
export default i18n;