import { getAPIURL, getAPITimeout } from '../utils/EnvironmentUtils';
import { APICallResult } from '../types/APICallResult';

/**
 * Abstract function to make an API call to retrieve data.\
 * (Currently supports GET requests only.)
 * @param {Function} parseResponseBody
 *      the function to parse the response body on successful API calls;
 *      should take 1 (one) argument for the JSON response body
 *      and return the parsed data to set to the `APICallResult` object
 * @param {string} urlCode the code for retrieving configurations to build the API URL
 * @param {*} urlArgs
 *      the map of arguments for the API URL; no need to sandwich the key with `%`s
 * @returns {Promise<APICallResult>} Promise for the data object denoting the API call result;
 *              includes data from the response if API call was successful,
 *              includes failure details otherwise
 */
export const fetchData = async (parseResponseBody, urlCode, urlArgs = {}) => {
    var url = getAPIURL(urlCode)
    Object.keys(urlArgs).forEach((key) => url = url.replace(`%${key}%`, urlArgs[key]));
    console.debug(`API URL: ${url}\nTimeout: ${getAPITimeout()} second(s)`);

    const { id, signal } = initTimeout();
    return await fetch(url, { signal: signal }).then(getResponseBody)
        .then((json) => json.unsuccessful ? APICallResult.InitForUnsuccessfulResponse(json) :
            APICallResult.InitForSuccessfulResponse(parseResponseBody(json)))
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
 * @returns {*|{unsuccessful: boolean; statusCode: number; statusText: string; reason: string}}
 *              the JSON response body if `response.ok` is `true`;
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
        return { unsuccessful: true, statusCode: response.status, statusText: response.statusText, reason: message };
    }
    return response.json();
}

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