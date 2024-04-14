import moment from 'moment';

/**
 * Returns the current year.
 * 
 * For example, if today is 10-10-2023, 2023 will be returned.
 * 
 * @returns {number} the current year number
 */
export const getCurrentYear = () => (new Date()).getFullYear();


/**
 * Formats a date for display.
 * @param {Date|string} date the date to format; `YYYY-MM-DD` format for string input
 * @param {string} format the date format to use
 * @returns {string} a string representation of the date formatted as specified by `format`
 */
export const formatDate = (date, format) => moment(date).format(format);