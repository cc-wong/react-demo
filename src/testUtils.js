import { Tournament } from "./types/Tournament";
import { APICallResult } from "./types/APICallResult";
import { screen } from "@testing-library/react";

/**
 * Initializes a fixture for an environment variable.
 * 
 * @param {*} key the environment variable key
 * @see Mocking environment variables: <https://greenonsoftware.com/courses/react-testing-spellbook/mastering-unit-testing/mocking-environment-variables/>
 */
export const environmentFixture = (key) => {
    const initValue = process.env[key];

    return {
        mock: (value) => {
            process.env[key] = value;
        },
        restore: () => {
            process.env[key] = initValue;
        },
        delete: () => {
            delete process.env[key];
        }
    }
}

/**
 * Asserts the text in the non-header rows of a table, ie. the `<td>` elements.
 * @param {string[][]} expected
 *      the expected text in each row and column; expects an array of `rowCount` x `colCount` items
 * @param {number} rowCount expected row count
 * @param {number} colCount expected column count
 */
export const assertTableCells = (expected, rowCount, colCount) => {
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(rowCount * colCount);
    expected.forEach((rowContent, r) => cells.slice(r * colCount, r * colCount + colCount)
        .forEach((cell, c) => expect(cell.innerHTML).toEqual(rowContent.at(c))));
}

/**
 * Regex escape function.
 * 
 * @param {string} text the text to escape regex for
 * @returns the escaped text
 */
export const escapeRegex = (text) => text.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * Uses `jest.useFakeTimers()` to mock the "current" date.
 * 
 * @param {string} date the mock current date in `YYYY-MM-DD` format
 */
export const mockCurrentDate = (date) => jest.useFakeTimers().setSystemTime(new Date(date));

/**
 * Mocks a function to return a value.
 * @param {jest.SpyInstance<*} spyFunction the function to mock
 * @param {*} result the function's return value
 */
export const mockFunctionToReturnValue = (spyFunction, returnValue) =>
    spyFunction.mockImplementationOnce(() => Promise.resolve(returnValue));

/**
 * Mocks a function with a given amount of time in delay.
 * 
 * @param {jest.SpyInstance<*>} spyFunction the function to mock
 * @param {number} seconds the delay in seconds
 * @param {*} valueOrError the value to return or the error to throw after the delay
 */
export const mockFunctionWithDelay = (spyFunction, seconds, valueOrError) =>
    spyFunction.mockImplementationOnce(() => new Promise((resolve, reject) => setTimeout(() => {
        valueOrError instanceof Error ? reject(valueOrError) : resolve(valueOrError)
    }, seconds * 1000)));

/**
 * Gets a spy instance of the global `fetch()` function.
 * @returns the spy instance
 */
export const spyOnFetch = () => jest.spyOn(global, 'fetch');

/**
 * Mocks global function `fetch()` to return a successful response.
 * @param {*} jsonBody the JSON response body
 */
export const mockFetchSuccessfulResponse = (jsonBody) =>
    mockFunctionToReturnValue(spyOnFetch(), mockFetch(true, 200, 'OK', jsonBody));

/**
 * Mocks global function `fetch()` to return an unsuccessful response.
 * @param {number} statusCode the status code
 * @param {string} statusText the status text
 * @param {*} jsonBody the JSON response body
 */
export const mockFetchUnsuccessfulResponse = (statusCode, statusText, jsonBody) =>
    mockFunctionToReturnValue(spyOnFetch(), mockFetch(false, statusCode, statusText, jsonBody));

/**
 * Mocks global function `fetch()` to return a response.
 * @param {boolean} isOk the value of field `ok`
 * @param {number} statusCode the status code
 * @param {string} statusText the status text
 * @param {*} jsonBody the JSON response body
 */
const mockFetch = (isOk, statusCode, statusText, jsonBody) => mockFunctionToReturnValue(spyOnFetch(), {
    ok: isOk,
    status: statusCode,
    statusText: statusText,
    json: () => (jsonBody),
});

/**
 * Asserts the API call result on a successful call.
 * @param {APICallResult} result the API call result object to check
 * @param {*} responseData the expected response data
 */
export const assertAPISuccessfulResponse = (result, responseData) => {
    expect(result.success).toBe(true);
    expect(result.responseData).toEqual(responseData);
}

/**
 *  Asserts the API call result on a call that returns an unsuccessful response.
 * @param {APICallResult} result the result object to check
 * @param {number} statusCode the expected status code
 * @param {string} statusText the expected status text
 * @param {*} reason the expected reason data
 */
export const assertAPIUnsuccessfulResponse = (result, statusCode, statusText, reason) => {
    expect(result.success).toBe(false);
    expect(result.error).toEqual(initUnsuccessfulResponseErrorData(statusCode, statusText, reason));
}

/**
 * Initialize the error data of an unsuccessful response API call result.
 * @param {number} statusCode the status code
 * @param {string} statusText the status text
 * @param {*} reason the reason data
 * @returns a JSON object for the data to be set to `APICallResult.error`
 */
export const initUnsuccessfulResponseErrorData = (statusCode, statusText, reason) => {
    return {
        type: APICallResult.FailType.UnsuccessfulResponse,
        statusCode: statusCode,
        statusText: statusText,
        reason: reason
    };
}

/**
 * Asserts that a call has been made to a given API.
 * @param {string} url the API URL
 */
export const assertApiCall = (url) => expect(global.fetch).toHaveBeenCalledWith(url,
    expect.objectContaining({ signal: expect.any(AbortSignal) }));

/**
 * Mocks getting the API URL from the environment utility function.
 * @param {string} url the URL (format) to return
 * @returns the spy object on function `EnvironmentUtils.getAPIURL()`
 */
export const mockGetAPIURL = (url) => {
    const spy = jest.spyOn(require('./utils/EnvironmentUtils'), 'getAPIURL');
    spy.mockReturnValue(url);
    return spy;
}

/**
 * Asserts that the API call has not been aborted.
 */
export const assertAPICallNotAborted = () =>
    expect(jest.spyOn(AbortController.prototype, 'abort')).not.toHaveBeenCalled();

/**
 * Simulates the advancement of time in a test case
 * by advancing the timer by a given amount of time.
 * 
 * @param {number} seconds time to advance in seconds
 */
export const advanceTimersBySeconds = async (seconds) => {
    jest.advanceTimersByTime(seconds * 1000);
    await new Promise(jest.requireActual('timers').setImmediate);
}

/**
 * Parses test data from a JSON file to a `Tournament` object.
 * 
 * The JSON data must follow the format as specified by the parameter.
 * @param {{code: string; schedule: string[]}[]} data
 *          test data from a JSON file; `schedule` is a list of dates in `YYYY-MM-DD` format
 * @returns {Tournament[]} the list of transformed `Tournament` objects
 */
export const parseToTournament = (data) => data.map(({ code, schedule }) => Tournament.Init(code, schedule));