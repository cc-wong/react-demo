import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SearchScreen from '../../components/SearchScreen';

import testData from './SearchScreen.test.json';

describe('Integration tests on the search screen module', () => {
    beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2025-10-10')));
    afterEach(() => cleanup());

    /**
     * About fixing the (dreaded) "not wrapped in act(...)" warning:
     * https://github.com/testing-library/react-testing-library/issues/1051
     * (Exact comment:
     * https://github.com/testing-library/react-testing-library/issues/1051#issuecomment-1149569930)
     */

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

        /**
         * Fires an event for changing the value of the Year dropdown.
         * 
         * @param {number} year the new dropdown value
         */
        const fireChangeYearDropdownValueEvent = (year) =>
            fireEvent.change(screen.getByRole('combobox', { name: 'year' }), {
                target: { value: year }
            });
    });

    /**
     * Mocks successful call(s) to the API with status code 200.
     * 
     * @param  {...any} responseJson the response JSON data returned in order
     */
    const mockSuccessfulApiCall = (...responseJson) => {
        responseJson.forEach((json) => {
            mockApiCall({
                ok: true,
                status: 200,
                json: () => (json),
            })
        });
    }

    /**
     * Mocks the API call to return a 400 bad request response once.
     */
    const mockBadRequestApiCallOnce = () => mockApiCall({
        ok: false,
        status: 400,
        json: () => ("Bad request.")
    });

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

    const apiBaseUrl = "http://localhost:5000";
    /**
     * Asserts the calls to the API.
     * 
     * @param {number} times expected number of times called
     * @param {number[]} years the expected `year` parameter values in the order of API call
     */
    const assertApiCall = (times, years) => {
        expect(global.fetch).toHaveBeenCalledTimes(times);
        years.forEach((year) => expect(global.fetch).toHaveBeenCalledWith(
            `${apiBaseUrl}/getSumoHonbashoSchedule?year=${year.toString()}`));
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

});