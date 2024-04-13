import { getCurrentYear } from "../DateUtils";

import moment from 'moment';

describe('Unit test(s) on the date utility function(s)', () => {
    test('Get current year number.', () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-10-10'));
        expect(getCurrentYear()).toBe(2023);
    });
});

test('Print date for different locales.', () => {
    // Ref: https://momentjs.com/
    
    const date1 = new Date('2024-03-09');

    const formatEn = 'MMMM D (dddd)';
    moment.locale('en-us');
    console.log(moment(new Date()).format(formatEn) + '\n' + // October 10 (Tuesday)
        moment(date1).format(formatEn));  //  March 9 (Saturday)

    const formatCh = 'MMMDo(dddd)';
    moment.locale('zh-hk');
    console.log(moment(new Date()).format(formatCh) + '\n' +  // 10月10日(星期二)
        moment(date1).format(formatCh));  // 3月9日(星期六)

    const formatJp = 'MMMDo(dddd)';
    moment.locale('ja');
    console.log(moment(new Date()).format(formatJp) + '\n' +  // 10月10日(火曜日)
        moment(date1).format(formatJp));  // 3月9日(土曜日)
});