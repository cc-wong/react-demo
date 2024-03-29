import { getCurrentYear } from "../../components/DateUtils";

describe('Unit tests on the date utility functions', () => {

    test('Assert get current year', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });

});