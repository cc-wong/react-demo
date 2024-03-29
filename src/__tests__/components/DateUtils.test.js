import { getCurrentYear } from "../../components/DateUtils";

test('Assert get current year', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
    expect(getCurrentYear()).toBe(2023);
});