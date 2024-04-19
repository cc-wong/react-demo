import { getAPIURL, getAPITimeout } from '../utils/EnvironmentUtils';
import { APICallResult } from '../types/APICallResult';
import { Tournament } from '../types/Tournament';

/**
 * Denotes the API call response body, ie. the data returned.
 * 
 * @typedef {{result: {basho: string; dates: string[]; month: number; month_name: string;}[]}} ResponseBody
 */

/**
 * Makes an API call to retrieve the tournament schedule for a given year.
 * 
 * @param {number|string} year the year to retrieve data for
 * @returns {Promise<APICallResult>} Promise for the data object denoting the API call result;
 *              includes the schedule data if API call was successful,
 *              includes failure details otherwise
 */
export const fetchData = async (year) => {
    const url = getAPIURL(year);
    console.debug(`API URL: ${url}\nTimeout: ${getAPITimeout()} second(s)`);

    const { id, signal } = initTimeout();
    return await fetch(url, { signal: signal }).then(getResponseBody).then(parseResponseBody)
        .catch(handleError)
        .finally(() => {
            clearTimeout(id);
            console.debug('Timeout cleared.');
        });
}

/**
 * Initializes timeout mechanism for an API call.
 * 
 * If the API call does not respond after the time configured,
 * an `Error` with `name` as `APITimeError` is thrown by `fetch()`.
 * 
 * @returns {{id: NodeJS.Timeout, signal: AbortSignal}}
 *          the timeout object and the signal object to provide to the API call
 */
const initTimeout = () => {
    var timeoutError = new Error('API call timed out!');
    timeoutError.name = 'APITimeoutError';

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(timeoutError), getAPITimeout() * 1000);
    return { id: id, signal: controller.signal };
}

/**
 * Gets the body of the response returned from an API call.
 * @param {*} response the API call response
 * @returns {ResponseBody|{statusCode: number}} the JSON response body if `response.ok` is `true`;
 *              otherwise, a new JSON object with field `statusCode` as the status code returned
 */
const getResponseBody = async (response) => {
    console.debug(`Returned status code: ${response.status} (ok: ${response.ok})`);
    if (!response.ok) {
        console.debug(response);
        const message = await response.text();
        console.error('Unsuccessful response!\n' +
            `Status code: ${response.status} (${response.statusText})\n` +
            `Message: ${message}`);
        return { statusCode: response.status, statusText: response.statusText, reason: message };
    }
    return response.json();
}

/**
 * Parses the response body of an API call.
 * @param {ResponseBody|{statusCode: number}} json
 *          the API call response body or a JSON object containing the unsuccessful status code
 * @returns {APICallResult} a new result object set according to the result of the API call
 */
const parseResponseBody = (json) => json.result ?
    APICallResult.InitForSuccessfulResponse(parseToTournament(json.result)) :
    APICallResult.InitForUnsuccessfulResponse(json);

/**
 * Parses the response body of a successful API call into `Tournament` objects.
 * @param {{basho: string; dates: string[]; month: number; month_name: string;}[]} json 
 *          tournament entries from the the API call response body
 * @returns a list of transformed `Tournament` objects
 */
const parseToTournament = (json) => json.map(({ basho, dates }) =>
    new Tournament(basho, dates.map((date) => new Date(date))));

/**
 * Handles an error thrown from an API call, due to timeout or otherwise.
 * @param {Error} error the error thrown; a timeout error should be uniquely identifiable
 * @returns {APICallResult} a new result object denoting the type of error
 */
const handleError = (error) => {
    console.error(`Error thrown:\n${error}`);
    console.debug(`Error name: ${error.name}\nIs DOMException? ${error instanceof DOMException}`);
    return isTimeout(error) ? APICallResult.InitForTimeout() : APICallResult.InitForErrorThrown(error);
}

/**
 * Determines whether an error indicates an API call timeout.
 * 
 * NOTE:\
 * Even when the `reason` parameter is passed to `AbortController.abort()`,
 * the default `AbortError` (`DOMException`) is thrown anyway in Safari and Chrome.\
 * eg. The error in Chrome is "AbortError: The user aborted a request.""
 * @param {Error|DOMException} error the error object to check
 * @returns {boolean} whether the error indicates timeout
 */
const isTimeout = (error) => error.name.match(/^APITimeoutError$/) ||
    (error instanceof DOMException && error.name.match(/^AbortError$/));