import { cleanup } from '@testing-library/react';

import { getCurrentYear, getJapaneseYear } from "../DateUtils";

afterEach(() => cleanup());

describe('Get current year', () => {
    test('Normal case.', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });
});

describe('Get Japanese year', () => {
    test('Ordinary year - Reiwa.', () => testGetJapaneseYear(2024, ['令和6年']));
    test('Ordinary year - Heisei.', () => testGetJapaneseYear(1991, ['平成3年']));
    test('Ordinary year - Showa.', () => testGetJapaneseYear(1980, ['昭和55年']));

    test('Year 2019 (Heisei -> Reiwa).', () => testGetJapaneseYear(2019, ['平成31年', '令和元年']));
    test('Year 1989 (Showa -> Heisei).', () => testGetJapaneseYear(1989, ['昭和64年', '平成元年']));

    const testGetJapaneseYear = (year, expected) => expect(getJapaneseYear(year)).toEqual(expected);
})