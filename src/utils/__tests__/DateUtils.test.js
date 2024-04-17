import { cleanup } from '@testing-library/react';

import { getCurrentYear, formatDate } from "../DateUtils";

import moment from 'moment';

afterEach(() => cleanup());

describe('Get current year', () => {
    test('Normal case.', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });
});

describe('Format date', () => {
    test('Lcale: en; input: Date', () =>
        testFormatDate('en', new Date('2024-03-09'), 'MMMM D (dddd)', 'March 9 (Saturday)'));

    test('Lcale: en; input: string', () =>
        testFormatDate('en', '2023-10-10', 'MMMM D (dddd)', 'October 10 (Tuesday)'));

    test('Lcale: zh-hk; input: Date', () =>
        testFormatDate('zh-hk', new Date('2024-03-09'), 'MMMDo(dddd)', '3月9日(星期六)'));

    test('Lcale: zh-hk; input: string', () =>
        testFormatDate('zh-hk', '2023-10-10', 'MMMDo(dddd)', '10月10日(星期二)'));

    test('Lcale: ja; input: Date', () =>
        testFormatDate('ja', new Date('2024-03-09'), 'MMMDo(dddd)', '3月9日(土曜日)'));

    test('Lcale: ja; input: string', () =>
        testFormatDate('ja', '2023-10-10', 'MMMDo(dddd)', '10月10日(火曜日)'));

    /**
     * Runs a test case on `formatDate(date, format)`.
     * @param {string} locale the locale to test with
     * @param {Date|string} date the date argument
     * @param {string} format the format argument
     * @param {string} expected the expected result
     */
    const testFormatDate = (locale, date, format, expected) => {
        moment.locale(locale);
        expect(formatDate(date, format)).toBe(expected);
    }
});