import { getApiUrl } from '../utils/EnvironmentUtils';
import { APICallResult } from '../types/APICallResult';

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
 * @param {number|string} year the year to retrieve data for
 * @returns {Promise<APICallResult>} Promise for the data object denoting the API call result;
 *              includes the schedule data if API call was successful,
 *              includes failure details otherwise
 */
export const fetchData = async (year) => {
    const url = getApiUrl().replace("%YEAR%", year.toString());
    console.debug(`API URL: ${url}`);

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
    const id = setTimeout(() => controller.abort(timeoutError), 60 * 1000);
    return { id: id, signal: controller.signal };
}

/**
 * Gets the body of the response data returned from an API call.
 * @param {*} response the response data
 * @returns {ScheduleData|{statusCode: number}} the JSON response body if `response.ok` is `true`;
 *              otherwise, a new JSON object with field `statusCode` as the status code returned
 */
const getResponseBody = async (response) => {
    console.debug(`Returned status code: ${response.status} (ok: ${response.ok})`);
    if (!response.ok) {
        console.error('Unsuccessful response!\n' +
            `Status code: ${response.status}; message: ${response.json()}`);
        return { statusCode: response.status };
    }
    return response.json();
}

/**
 * Parses the response body of an API call.
 * @param {ScheduleData|{statusCode: number}} json
 *          the API call response body or a JSON object containing the unsuccessful status code
 * @returns {APICallResult} a new result object set according to the result of the API call
 */
const parseResponseBody = (json) => json.result ?
    APICallResult.InitForSuccessfulResponse(json.result) :
    APICallResult.InitForUnsuccessfulResponse(json.statusCode);

/**
 * Handles an error thrown from an API call, due to timeout or otherwise.
 * @param {Error} error the error thrown; a timeout error should be uniquely identifiable
 * @returns {APICallResult} a new result object denoting the type of error
 */
const handleError = (error) => {
    console.error(`Error thrown:\n${error}`);
    console.debug(`Error name: ${error.name}\nIs DOMException? ${error instanceof DOMException}`);
    return isTimeout(error) ? APICallResult.InitForTimeout() : APICallResult.InitForErrorThrown();
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