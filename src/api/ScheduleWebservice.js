import * as baseAPIService from './AbstractAPIService';

import { Tournament } from '../types/Tournament';

/**
 * Makes an API call to retrieve the tournament schedule for a given year.
 * 
 * @param {number|string} year the year to retrieve data for
 * @returns {Promise}
 *      Promise for the result object including the schedule data if API call was successful;
 *      otherwise, the object includes failure details instead
 */
export const fetchData = async (year) =>
    baseAPIService.fetchData(parseToTournament, 'SUMOSCHEDULE', { 'YEAR': year.toString() });

/**
 * Parses the response body of a successful API call into `Tournament` objects.
 * @param {{result: {basho: string; dates: string[]; month: number; month_name: string;}[]}} json
 *          the the API call response body
 * @returns a list of transformed `Tournament` objects
 */
const parseToTournament = (json) => json.result.map(({ basho, dates }) =>
    new Tournament(basho, dates.map((date) => new Date(date))));