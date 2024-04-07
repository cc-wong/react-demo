import { getApiUrl } from '../utils/EnvironmentUtils';
import { APIError } from '../types/APIError';

/**
 * Denotes the data returned by the API call.
 * 
 * @typedef {{result: BashoJson[]}} ScheduleData
 */

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
 */

/**
 * Makes an API call to retrieve the tournament schedule for a given year.
 * 
 * @param {number} year the year to retrieve data for
 * @returns {ScheduleData} the data returned by the API call
 * @throws `APIError` if the API call returns a response with a status code other than 200
 * @throws `Error` if an error occurs during the API call
 */
export const getData = async (year) => {
    const url = getApiUrl().replace("%YEAR%", year.toString());
    console.debug(`API URL: ${url}`);

    return fetch(url).then(getResponseBody);
}

/**
 * Gets the body of a given API call response.
 * 
 * @param {Response} response the response object returned from the call
 * @returns {Promise<BashoJson>} Promise for the response's JSON body
 * @throws `APIError` if the response's OK status is `false`, ie. not successful
 */
const getResponseBody = (response) => {
    console.debug(`Returned status code: ${response.status} (ok: ${response.ok})`);
    if (!response.ok) {
        console.error(response);
        throw new APIError(response.status);
    }
    return response.json();
}
