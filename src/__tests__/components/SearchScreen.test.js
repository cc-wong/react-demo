import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SearchScreen from '../../components/SearchScreen';

describe('Integration tests on the search screen module', () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date('2025-10-10'));
    });
    afterEach(() => {
        cleanup();
    });

    /**
     * About fixing the dreaded "not wrapped in act(...)" warning:
     * https://github.com/testing-library/react-testing-library/issues/1051
     * (Exact comment:
     * https://github.com/testing-library/react-testing-library/issues/1051#issuecomment-1149569930)
     */

    test('<SearchScreen /> rendered', async () => {
        mockSuccessfulApiCall({
            result: [
                {
                    "basho": "HATSU",
                    "dates": [
                        "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16",
                        "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-01-21",
                        "2025-01-22", "2025-01-23", "2025-01-24", "2025-01-25", "2025-01-26"
                    ],
                    "month": 1,
                    "month_name": "January"
                },
                {
                    "basho": "HARU",
                    "dates": [
                        "2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13",
                        "2025-03-14", "2025-03-15", "2025-03-16", "2025-03-17", "2025-03-18",
                        "2025-03-19", "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23"
                    ],
                    "month": 3,
                    "month_name": "March"
                }
            ]
        });
        render(<SearchScreen />);

        await act(async () => {
            expect(screen.getByRole('combobox')).toHaveAttribute("name", "year");
            expect(screen.getByRole('table')).toHaveAttribute("name", "schedule");

            assertApiCall(1, 2025);
        });
        await waitFor(() => {
            assertScreen(2025, 2);
            assertErrorMessageNotExist();
        });
    });

    test('Assert year dropdown onChange event.', async () => {
        mockSuccessfulApiCall({ result: [] }, {
            result: [
                {
                    "basho": "HATSU",
                    "dates": [
                        "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16",
                        "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-01-21",
                        "2025-01-22", "2025-01-23", "2025-01-24", "2025-01-25", "2025-01-26"
                    ],
                    "month": 1,
                    "month_name": "January"
                },
                {
                    "basho": "HARU",
                    "dates": [
                        "2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13",
                        "2025-03-14", "2025-03-15", "2025-03-16", "2025-03-17", "2025-03-18",
                        "2025-03-19", "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23"
                    ],
                    "month": 3,
                    "month_name": "March"
                },
                {
                    "basho": "NATSU",
                    "dates": [
                        "2025-05-11", "2025-05-12", "2025-05-13", "2025-05-14", "2025-05-15",
                        "2025-05-16", "2025-05-17", "2025-05-18", "2025-05-19", "2025-05-20",
                        "2025-05-21", "2025-05-22", "2025-05-23", "2025-05-24", "2025-05-25"
                    ],
                    "month": 5,
                    "month_name": "May"
                },
                {
                    "basho": "NAGOYA",
                    "dates": [
                        "2025-07-13", "2025-07-14", "2025-07-15", "2025-07-16", "2025-07-17",
                        "2025-07-18", "2025-07-19", "2025-07-20", "2025-07-21", "2025-07-22",
                        "2025-07-23", "2025-07-24", "2025-07-25", "2025-07-26", "2025-07-27"
                    ],
                    "month": 7,
                    "month_name": "July"
                },
                {
                    "basho": "AKI",
                    "dates": [
                        "2025-09-14", "2025-09-15", "2025-09-16", "2025-09-17", "2025-09-18",
                        "2025-09-19", "2025-09-20", "2025-09-21", "2025-09-22", "2025-09-23",
                        "2025-09-24", "2025-09-25", "2025-09-26", "2025-09-27", "2025-09-28"
                    ],
                    "month": 9,
                    "month_name": "September"
                },
                {
                    "basho": "KYUSHU",
                    "dates": [
                        "2025-11-09", "2025-11-10", "2025-11-11", "2025-11-12", "2025-11-13",
                        "2025-11-14", "2025-11-15", "2025-11-16", "2025-11-17", "2025-11-18",
                        "2025-11-19", "2025-11-20", "2025-11-21", "2025-11-22", "2025-11-23"
                    ],
                    "month": 11,
                    "month_name": "November"
                }
            ]
        });
        await act(async () => {
            render(<SearchScreen />);
        });
        fireChangeYearDropdownValueEvent(2028);

        await act(async () => {
            assertApiCall(2, 2028);
        });
        await waitFor(() => {
            assertScreen(2028, 6);
            assertErrorMessageNotExist();
        });
    });

    test('Assert bad request for API call.', async () => {
        mockApiCall({
            ok: false,
            status: 400,
            json: () => ("Bad request.")
        });
        render(<SearchScreen />);

        await act(async () => {
            assertApiCall(1, 2025);
        });
        await waitFor(() => {
            assertErrorMessage(/ERROR.*Error\: Cannot retrieve data \(status code\: 400\)\./);
            assertScreen(2025, 0);
        });
    });

    test('Assert error thrown on API call.', async () => {
        jest.spyOn(global, 'fetch')
            .mockRejectedValueOnce(new TypeError("NetworkError when attempting to fetch resource."));
        render(<SearchScreen />);

        await act(async () => {
            assertApiCall(1, 2025);
        });
        await waitFor(() => {
            assertErrorMessage(/ERROR.*TypeError\: NetworkError when attempting to fetch resource\./);
            assertScreen(2025, 0);
        });
    });

    test('Assert error message is cleared on successful API data retrieval.', async () => {
        mockApiCall({
            ok: false,
            status: 400,
            json: () => ("Bad request.")
        });
        mockSuccessfulApiCall({
            result: [{
                "basho": "HATSU",
                "dates": [
                    "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16",
                    "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-01-21",
                    "2025-01-22", "2025-01-23", "2025-01-24", "2025-01-25", "2025-01-26"
                ],
                "month": 1,
                "month_name": "January"
            }]
        });
        await act(async () => {
            render(<SearchScreen />);
        });
        fireChangeYearDropdownValueEvent(2030);

        await act(async () => {
            assertApiCall(2, 2030);
        });
        await waitFor(() => {
            assertScreen(2030, 1);
            assertErrorMessageNotExist();
        });
    });

    test('Assert results table is cleared on API call failure.', async () => {
        mockSuccessfulApiCall({
            result: [{
                "basho": "HATSU",
                "dates": [
                    "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16",
                    "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-01-21",
                    "2025-01-22", "2025-01-23", "2025-01-24", "2025-01-25", "2025-01-26"
                ],
                "month": 1,
                "month_name": "January"
            }]
        });
        jest.spyOn(global, 'fetch')
            .mockRejectedValueOnce(new TypeError("NetworkError when attempting to fetch resource."));
        await act(async () => {
            render(<SearchScreen />);
        });
        fireChangeYearDropdownValueEvent(2026);

        await act(async () => {
            assertApiCall(2, 2026);
        });
        await waitFor(() => {
            assertErrorMessage(/ERROR.*TypeError\: NetworkError when attempting to fetch resource\./);
            assertScreen(2026, 0);
        });
    });

    /**
     * Fires an event for changing the value of the Year dropdown.
     * 
     * @param {number} year the new dropdown value
     */
    const fireChangeYearDropdownValueEvent = (year) => {
        fireEvent.change(screen.getByRole('combobox', { name: 'year' }), {
            target: { value: year }
        });
    }

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
     * Mocks an API call that returns a response.
     * 
     * The response statuts status code may or may not be 200.
     * 
     * @param {*} response the response from the API call
     */
    const mockApiCall = (response) => {
        jest.spyOn(global, 'fetch').mockImplementationOnce(() => {
            return Promise.resolve(response)
        });
    }

    const apiBaseUrl = "http://localhost:5000";

    /**
     * Asserts the calls to the API.
     * 
     * @param {number} times expected number of times called
     * @param {number} year the expected `year` parameter value
     */
    const assertApiCall = (times, year) => {
        expect(global.fetch).toHaveBeenCalledTimes(times);
        expect(global.fetch).toHaveBeenCalledWith(`${apiBaseUrl}/getSumoHonbashoSchedule?year=${year.toString()}`);
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
     * @param {*} errorTextRegex regular expression for matching the error message text
     */
    const assertErrorMessage = (errorTextRegex) => {
        const errorMessageBox = document.querySelector('#errorMessage');
        expect(errorMessageBox).toBeInTheDocument();
        expect(errorTextRegex.test(errorMessageBox.innerHTML)).toBe(true);
    }

    /**
     * Asserts that the error message box is not present in the screen.
     */
    const assertErrorMessageNotExist = () => {
        expect(document.querySelector('#errorMessage')).toBeNull();
    }

});