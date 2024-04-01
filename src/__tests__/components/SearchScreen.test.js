import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SearchScreen from '../../components/SearchScreen';

import testData from './SearchScreen.test.json';


beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2025-10-10')));
const mockApiUrl = "http://my-api-host.net/getSumoHonbashoSchedule?year=";
beforeEach(() => {
    const environmentUtils = require('../../utils/EnvironmentUtils');
    jest.spyOn(environmentUtils, 'getApiUrl').mockReturnValue(mockApiUrl + "%YEAR%");
});
afterEach(() => cleanup());

/**
 * About fixing the "not wrapped in act(...)" warning:
 * https://github.com/testing-library/react-testing-library/issues/1051
 * (Exact comment:
 * https://github.com/testing-library/react-testing-library/issues/1051#issuecomment-1149569930)
 */

describe('Integration tests on the search screen module', () => {
    describe('On initial rendering', () => {
        test('Normal screen render (API call successful).', async () => {
            mockSuccessfulApiCall(testData.sixRecords);
            render(<SearchScreen />);

            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertScreen(2025, 6);
                assertErrorMessageNotExist();
            });
        });

        test('API call returns non-200 status code.', async () => {
            mockBadRequestApiCallOnce();
            render(<SearchScreen />);

            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageBox("Could not retrieve data (returned status code 400)");
                assertScreen(2025, 0);
            });
        });

        test('Error thrown on API call.', async () => {
            mockApiCallThrowErrorOnce();
            render(<SearchScreen />);

            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageBox("Could not retrieve data (error on making API call)");
                assertScreen(2025, 0);
            });
        });
    });

    describe('Year dropdown value changed', () => {
        test('Successful API data retrieval (happy path).', async () => {
            mockSuccessfulApiCall(testData.oneRecord, testData.sixRecords);

            await act(async () => render(<SearchScreen />));
            await waitFor(() => {
                assertScreen(2025, 1);
                assertErrorMessageNotExist();
            });

            await act(async () => fireChangeYearDropdownValueEvent(2028));
            await waitFor(() => {
                assertScreen(2028, 6);
                assertErrorMessageNotExist();
            });

            assertApiCall(2, [2025, 2028]);
        });

        test('API call failed on initial rendering but successful on year value change.', async () => {
            mockBadRequestApiCallOnce();
            mockSuccessfulApiCall(testData.sixRecords);

            await act(async () => render(<SearchScreen />));
            await waitFor(() => {
                assertErrorMessageBox("Could not retrieve data (returned status code 400)");
                assertScreen(2025, 0);
            });

            await act(async () => fireChangeYearDropdownValueEvent(2030));
            await waitFor(() => {
                assertScreen(2030, 6);
                assertErrorMessageNotExist();
            });

            assertApiCall(2, [2025, 2030]);
        });

        test('API call failure on year value change.', async () => {
            mockSuccessfulApiCall(testData.sixRecords);
            mockApiCallThrowErrorOnce();
            await act(async () => render(<SearchScreen />));
            await waitFor(() => {
                assertScreen(2025, 6);
                assertErrorMessageNotExist();
            });

            await act(async () => fireChangeYearDropdownValueEvent(2026));
            await waitFor(() => {
                assertErrorMessageBox("Could not retrieve data (error on making API call)");
                assertScreen(2026, 0);
            });

            assertApiCall(2, [2025, 2026]);
        });
    });

    describe('Network delay on API call', () => {
        test('Delay on initial rendering.', async () => {
            mockApiCallWithDelay(30, initSuccessfulApiResponse(testData.sixRecords));

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => advanceTimersBySeconds(35));
            assertScreen(2025, 6);
            assertNotDisplayLoadingText();
        });

        test('Non-200 response after delay.', async () => {
            mockApiCallWithDelay(60, initBadRequestApiResponse());

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => advanceTimersBySeconds(65));
            assertErrorMessageBox("Could not retrieve data (returned status code 400)");
            assertScreen(2025, 0);
            assertNotDisplayLoadingText();
        });

        test('API error after delay.', async () => {
            mockApiCallWithDelay(60, new TypeError("Error"));

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => advanceTimersBySeconds(65));
            assertErrorMessageBox("Could not retrieve data (error on making API call)");
            assertScreen(2025, 0);
            assertNotDisplayLoadingText();
        });

        test('Delay on Year dropdown change.', async () => {
            mockSuccessfulApiCall(testData.oneRecord);
            mockApiCallWithDelay(30, initSuccessfulApiResponse(testData.sixRecords));

            await act(async () => render(<SearchScreen />));
            await waitFor(() => {
                assertScreen(2025, 1);
                assertErrorMessageNotExist();
                assertNotDisplayLoadingText();
            });

            await act(async () => fireChangeYearDropdownValueEvent(2028));
            await waitFor(() => {
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });
            await act(() => advanceTimersBySeconds(35));
            assertScreen(2028, 6);

            assertApiCall(2, [2025, 2028]);
            assertNotDisplayLoadingText();
        });

    });

    /**
     * Mocks an API call with a given amount of time in delay.
     * 
     * @param {number} seconds the delay in seconds
     * @param {*} response either the API call response or the error thrown
     */
    const mockApiCallWithDelay = (seconds, response) => {
        jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
            new Promise((resolve, reject) => setTimeout(
                () => { response instanceof Error ? reject(response) : resolve(response) },
                seconds * 1000)));
    }

    /**
     * Simulates the advancement of time in a test case
     * by advancing the timer by a given amount of time.
     * 
     * @param {number} seconds time to advance in seconds
     */
    const advanceTimersBySeconds = async (seconds) => {
        jest.advanceTimersByTime(seconds * 1000);
        await new Promise(jest.requireActual('timers').setImmediate);
    }
});

/**
 * Mocks successful call(s) to the API with status code 200.
 * 
 * @param  {...any} responseJson the response JSON data returned in order
 */
const mockSuccessfulApiCall = (...responseJson) => {
    responseJson.forEach((json) => {
        mockApiCall(initSuccessfulApiResponse(json))
    });
}

/**
 * Initializes a API JSON response with status code 200.
 * 
 * @param {*} json the JSON data to set
 * @returns the new API JSON response
 */
const initSuccessfulApiResponse = (json) => {
    return {
        ok: true,
        status: 200,
        json: () => (json),
    }
}

/**
 * Initializes a API JSON response with status code 400.
 * 
 * @returns the new API JSON response
 */
const initBadRequestApiResponse = () => {
    return {
        ok: false,
        status: 400,
        json: () => ("Bad request.")
    }
};

/**
 * Mocks the API call to return a 400 bad request response once.
 */
const mockBadRequestApiCallOnce = () => mockApiCall(initBadRequestApiResponse());

/**
 * Mocks the API call to throw an error once.
 */
const mockApiCallThrowErrorOnce = () => jest.spyOn(global, 'fetch')
    .mockRejectedValueOnce(new TypeError("Load failed"));

/**
 * Mocks an API call that returns a response.
 * 
 * The response statuts status code may or may not be 200.
 * 
 * @param {*} response the response from the API call
 */
const mockApiCall = (response) => jest.spyOn(global, 'fetch')
    .mockImplementationOnce(() => Promise.resolve(response));

/**
 * Fires an event for changing the value of the Year dropdown.
 * 
 * @param {number} year the new dropdown value
 */
const fireChangeYearDropdownValueEvent = (year) =>
    fireEvent.change(screen.getByRole('combobox', { name: 'year' }), {
        target: { value: year }
    });

/**
 * Asserts the calls to the API.
 * 
 * @param {number} times expected number of times called
 * @param {number[]} years the expected `year` parameter values in the order of API call
 */
const assertApiCall = (times, years) => {
    expect(global.fetch).toHaveBeenCalledTimes(times);
    years.forEach((year) => expect(global.fetch).toHaveBeenCalledWith(mockApiUrl + year));
}

/**
 * Asserts the screen at the end of the test.
 * 
 * @param {number} expectedYear the expected selected value of the Year dropdown
 * @param {number} recordCount the expected number of records in the results table
 */
const assertScreen = (expectedYear, recordCount) => {
    expect(screen.getByRole('option', { name: expectedYear }).selected).toBe(true);
    expect(screen.getAllByRole('row').length).toBe(recordCount + 1);
}

/**
 * Regex escape function.
 * 
 * @param {string} text the text to escape regex for
 * @returns the escaped text
 */
const escapeRegex = (text) => text.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
/**
 * Asserts that the error message box is present in the screen.
 * 
 * @param {string} message the expected error message text excluding the heading
 */
const assertErrorMessageBox = (message) => {
    const errorMessageBox = document.querySelector('#errorMessage');
    expect(errorMessageBox).toBeInTheDocument();

    const errorTextRegex = new RegExp(`ERROR.*${escapeRegex(message)}`);
    expect(errorTextRegex.test(errorMessageBox.innerHTML)).toBe(true);
}

/**
 * Asserts that the error message box is not present in the screen.
 */
const assertErrorMessageNotExist = () => expect(document.querySelector('#errorMessage')).toBeNull();
/**
 * Asserts that the "Loading..." text is on the screen.
 */
const assertDisplayLoadingText = () => {
    const loadingTextDiv = document.querySelector('#loadingText');
    expect(loadingTextDiv).toBeInTheDocument();
    expect(loadingTextDiv).toHaveTextContent("Loading...");
}

/**
 * Asserts that the "Loading..." text is not on the screen.
 */
const assertNotDisplayLoadingText = () => {
    const loadingTextDiv = document.querySelector('#loadingText');
    expect(loadingTextDiv).toBeNull();
}
