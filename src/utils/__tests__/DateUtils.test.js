import { cleanup } from '@testing-library/react';

import { getCurrentYear } from "../DateUtils";

afterEach(() => cleanup());

describe('Get current year', () => {
    test('Normal case.', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });
});