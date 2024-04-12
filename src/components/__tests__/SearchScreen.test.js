import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as utils from '../../testUtils';

import SearchScreen from '../SearchScreen';

import testData from './SearchScreen.test.json';
import { APICallResult } from '../../types/APICallResult';

const api = require('../../api/ScheduleWebservice');
const spyApi = jest.spyOn(api, 'fetchData');

beforeAll(() => utils.mockCurrentDate('2025-10-10'));
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
            mockApiCalls(APICallResult.InitForSuccessfulResponse(testData.sixRecords));
            render(<SearchScreen />);

            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertScreen(2025, 6);
                assertErrorMessageNotExist();
            });
        });

        test('API call returns unsuccessful response.', async () => {
            mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400));
            render(<SearchScreen />);

            await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025));
            assertApiCall(1, [2025]);
        });

        test('Error thrown on API call.', async () => {
            mockApiCalls(APICallResult.InitForErrorThrown());
            render(<SearchScreen />);

            await waitFor(() => assertAPICallErrorThrown(2025));
            assertApiCall(1, [2025]);
        });
    });

    describe('Year dropdown value changed', () => {
        test('Successful API data retrieval (happy path).', async () => {
            mockApiCalls(APICallResult.InitForSuccessfulResponse(testData.oneRecord),
                APICallResult.InitForSuccessfulResponse(testData.sixRecords));

            await act(async () => render(<SearchScreen />));
            await waitFor(() => assertErrorMessageNotExist());
            assertScreen(2025, 1);

            await act(async () => fireChangeYearDropdownValueEvent(2028));
            await waitFor(() => assertErrorMessageNotExist());
            assertScreen(2028, 6);

            assertApiCall(2, [2025, 2028]);
        });

        test('API call failed on initial rendering but successful on year value change.', async () => {
            mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400),
                APICallResult.InitForSuccessfulResponse(testData.sixRecords));

            await act(async () => render(<SearchScreen />));
            await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025));

            await act(async () => fireChangeYearDropdownValueEvent(2030));
            await waitFor(() => assertErrorMessageNotExist());
            assertScreen(2030, 6);

            assertApiCall(2, [2025, 2030]);
        });

        test('API call failure on year value change.', async () => {
            mockApiCalls(APICallResult.InitForSuccessfulResponse(testData.sixRecords),
                APICallResult.InitForErrorThrown());
            await act(async () => render(<SearchScreen />));
            await waitFor(() => assertErrorMessageNotExist());
            assertScreen(2025, 6);

            await act(async () => fireChangeYearDropdownValueEvent(2026));
            await waitFor(() => assertAPICallErrorThrown(2026));

            assertApiCall(2, [2025, 2026]);
        });
    });

    describe('Network delay on API call', () => {
        test('Delay on initial rendering.', async () => {
            mockApiCallWithDelay(30,
                APICallResult.InitForSuccessfulResponse(testData.sixRecords));

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => utils.advanceTimersBySeconds(35));
            assertScreen(2025, 6);
            assertNotDisplayLoadingText();
        });

        test('Unsuccessful response after delay.', async () => {
            mockApiCallWithDelay(20, APICallResult.InitForUnsuccessfulResponse(400));

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => utils.advanceTimersBySeconds(21));
            assertUnsuccessfulAPIResponse(400, 2025);
        });

        test('API call error after delay.', async () => {
            mockApiCallWithDelay(50, APICallResult.InitForErrorThrown());

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => utils.advanceTimersBySeconds(55));
            assertAPICallErrorThrown(2025);
        });

        test('API call timeout after delay.', async () => {
            mockApiCallWithDelay(60, APICallResult.InitForTimeout());

            await act(() => render(<SearchScreen />));
            await waitFor(() => {
                assertApiCall(1, [2025]);
                assertErrorMessageNotExist();
                assertDisplayLoadingText();
            });

            await act(() => utils.advanceTimersBySeconds(61));
            assertAPICallTimeout(2025);
        });

        test('Delay on Year dropdown change.', async () => {
            mockApiCalls(APICallResult.InitForSuccessfulResponse(testData.oneRecord));
            mockApiCallWithDelay(30,
                APICallResult.InitForSuccessfulResponse(testData.sixRecords));

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
            await act(() => utils.advanceTimersBySeconds(35));
            assertScreen(2028, 6);

            assertApiCall(2, [2025, 2028]);
            assertNotDisplayLoadingText();
        });
    });
});

/**
 * Mocks an API call with a given amount of time in delay.
 * 
 * @param {number} seconds the delay in seconds
 * @param {APICallResult} result the API call result object to return
 */
const mockApiCallWithDelay = (seconds, result) => utils.mockFunctionWithDelay(spyApi, seconds, result);

/**
 * Mocks calls to the API.
 * 
 * @param  {...APICallResult} results the API call result objects to return
 */
const mockApiCalls = (...results) => results.forEach((result) =>
    utils.mockFunctionToReturnValue(spyApi, result));

/**
 * Fires an event for changing the value of the Year dropdown.
 * 
 * @param {number} year the new dropdown value
 */
const fireChangeYearDropdownValueEvent = (year) =>
    fireEvent.change(screen.getByRole('combobox', { name: 'year' }), { target: { value: year } });

/**
 * Asserts the calls to the API.
 * 
 * @param {number} times expected number of times called
 * @param {number[]} years the expected `year` parameter values in the order of API call
 */
const assertApiCall = (times, years) => {
    expect(spyApi).toHaveBeenCalledTimes(times);
    years.forEach((year) => expect(spyApi).toHaveBeenCalledWith(year.toString()));
}

/**
 * Asserts the screen for a test case with unsuccessful API response.
 * @param {number} statusCode the response status code
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 */
const assertUnsuccessfulAPIResponse = (statusCode, expectedYear) =>
    assertScreenWithError(expectedYear, `Could not retrieve data (returned status code ${statusCode})`);

/**
 * Asserts the screen for a test case where the API call throws (non-timeout) error.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 */
const assertAPICallErrorThrown = (expectedYear) =>
    assertScreenWithError(expectedYear, 'Could not retrieve data (error on making API call)');

/**
 * Asserts the screen for a test case with API call timeout.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 */
const assertAPICallTimeout = (expectedYear) =>
    assertScreenWithError(expectedYear, 'Request timed out. Please try again.');

/**
 * Asserts the screen for a test case with an error message displaying due to an unsuccessful API call.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 * @param {string} message the expected message displayed in the error box
 */
const assertScreenWithError = (expectedYear, message) => {
    assertErrorMessageBox(message);
    assertScreen(expectedYear, 0);
    assertNotDisplayLoadingText();
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
 * Asserts that the error message box is present in the screen.
 * 
 * @param {string} message the expected error message text excluding the heading
 */
const assertErrorMessageBox = (message) => {
    const errorMessageBox = document.querySelector('#errorMessage');
    expect(errorMessageBox).toBeInTheDocument();
    expect(errorMessageBox.innerHTML).toMatch(new RegExp(`ERROR.*${utils.escapeRegex(message)}`));
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