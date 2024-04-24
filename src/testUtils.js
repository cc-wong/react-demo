import { Tournament } from "./types/Tournament";
import { APICallResult } from "./types/APICallResult";
import { screen, fireEvent } from "@testing-library/react";

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
 * Asserts the number of content (non-header) rows in a table.
 * @param {number} expected the expected number of rows
 * @param {boolean} hasHeader whether the table has a header
 */
export const assertTableRowCount = (expected, hasHeader = false) =>
    expect(screen.getAllByRole('row').length).toBe(expected + (hasHeader ? 1 : 0));

/**
 * Asserts the text in the non-header rows of a table, ie. the `<td>` elements.
 * @param {string[][]} expected
 *      the expected text in each row and column; expects an array of `rowCount` x `colCount` items
 * @param {number} rowCount expected row count; no content assertion if 0
 * @param {number} colCount expected column count
 * @param {boolean} checkExact
 *      whether to check the exact content of the cells; checks for HTML tags, etc. in the text if `true` (default)
 */
export const assertTableCells = (expected, rowCount, colCount, checkExact = true) => {
    const cells = screen.queryAllByRole('cell');
    expect(cells).toHaveLength(rowCount * colCount);
    if (rowCount > 0)
        expected.forEach((rowContent, r) => cells.slice(r * colCount, r * colCount + colCount)
            .forEach((cell, c) => {
                if (checkExact) {
                    expect(cell.innerHTML).toEqual(rowContent.at(c));
                } else {
                    expect(cell).toHaveTextContent(rowContent.at(c));
                }
            }));
}

/**
 * Fires a click event on a button.
 * @param {string|HTMLElement} target the button label or the HTML element representing the button
 */
export const fireClickButtonEvent = (target) => {
    let button;
    if (typeof target === 'string' || target instanceof String)
        button = screen.getByRole('button', { name: target })
    else button = target;
    fireEvent.click(button);
};

/**
 * Gets a dropdown box element (`<select>`) by the name attribute.
 * @param {string} name the name attribute value for matching
 * @returns the `HTMLElement` for the dropdown box
 */
export const getDropdownBoxElement = (name) => screen.getByRole('combobox', { name: name });

/**
 * Fires a change event on a given dropdown box.
 * @param {HTMLElement} dropdown the dropdown box element
 * @param {*} value the `value` attribute of the selected item
 */
export const fireChangeDropdownValueEvent = (dropdown, value) =>
    fireEvent.change(dropdown, { target: { value: value } });

/**
 * Fires a click event on a given link.
 * @param {string} text the link text
 */
export const fireClickLinkEvent = (text) => fireEvent.click(screen.getByRole('link', { name: text }));
/**
 * Gets a table element from the page.
 * @param {name} name
 *      the name attribute of the table element
 * @returns the table element with matching name attribute; if `name` is not provided,
 *      it is assumed that the page has only one table, which will be returned;
 *      returns `null` if the table is not found
 */
export const getTable = (name = null) => {
    var args = {};
    if (name) args.name = name;
    return screen.queryByRole('table', args);
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
export const mockFetchSuccessfulResponse = (jsonBody) => mockFetch(true, 200, 'OK', jsonBody);

/**
 * Mocks global function `fetch()` to return an unsuccessful response.
 * @param {number} statusCode the status code
 * @param {string} statusText the status text
 * @param {*} jsonBody the JSON response body
 */
export const mockFetchUnsuccessfulResponse = (statusCode, statusText, jsonBody) =>
    mockFetch(false, statusCode, statusText, jsonBody);

/**
 * Mocks global function `fetch()` to throw an error.
 * @param {Error} error the error to throw
 */
export const mockFetchThrowError = (error) => spyOnFetch().mockRejectedValueOnce(error);

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