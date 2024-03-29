import { getCurrentYear } from "../../components/DateUtils";

describe('Unit test(s) on the date utility function(s)', () => {

    test('Get current year number.', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });

});