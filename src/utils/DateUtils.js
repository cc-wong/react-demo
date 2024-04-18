/**
 * Returns the current year.
 * 
 * For example, if today is 10-10-2023, 2023 will be returned.
 * 
 * @returns {number} the current year number
 */
export const getCurrentYear = () => (new Date()).getFullYear();

const japanCalendarFormat = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { year: 'numeric' });
/**
 * Get the Japanese year of a given western year.
 * @param {number} year the western year
 * @returns {string[]}
 *    for a year of era change, the Japanese year at the start of the year as the first entry
 *      and that at the end of the year as the second entry;
 *      for other years, one single entry for the corresponding Japanese year
 */
export const getJapaneseYear = (year) => {
    const firstDay = japanCalendarFormat.format(new Date(`${year}-01-01`));
    const lastDay = japanCalendarFormat.format(new Date(`${year}-12-31`));
    return firstDay === lastDay ? [firstDay] : [firstDay, lastDay];
}