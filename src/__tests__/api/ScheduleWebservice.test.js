import { cleanup, act, waitFor } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as api from '../../api/ScheduleWebservice';
import { APIError } from '../../types/APIError';

import testData from './ScheduleWebservice.test.json';

const mockApiUrl = "http://my-api-host.net/getSumoHonbashoSchedule?year=";
const spyFetch = jest.spyOn(global, 'fetch');

beforeAll(() => {
    utils.mockCurrentDate('2025-10-10');
});
beforeEach(() => {
    const environmentUtils = require('../../utils/EnvironmentUtils');
    jest.spyOn(environmentUtils, 'getApiUrl').mockReturnValue(mockApiUrl + "%YEAR%");
});
afterEach(() => cleanup());

describe('Happy path test cases with data returned', () => {
    test('Year parameter value is a number.', async () => {
        mockSuccessfulApiCall(testData.data);

        api.getData(2025).then((json) => expect(json).toBe(testData.data));
        assertApiCall(1, [2025]);
    });

    test('Year parameter value is a string.', async () => {
        mockSuccessfulApiCall(testData.data);

        api.getData("2025").then((json) => expect(json).toBe(testData.data));
        assertApiCall(1, ["2025"]);
    });
});

describe('API call failure', () => {
    test('Unsuccessful response.', async () => {
        mockUnsuccessfulApiCallOnce(400, "Bad request.");
        api.getData(2025).then(() => { throw new Error("Not supposed to return normally!") })
            .catch((error) => assertAPIError(error, APIError.ErrorType.UnsuccessfulResponse,
                'API call returned status code: 400', 400));
        assertApiCall(1, [2025]);
    });

    test('Error thrown.', async () => {
        const error = new TypeError("Load failed");
        mockApiCallThrowErrorOnce(error);
        api.getData(2025).then(() => { throw new Error("Not supposed to return normally!") })
            .catch((error) => {
                expect(error).toBe(error)
            });
        assertApiCall(1, [2025]);
    });

    xtest('Timeout.', async () => {  // Still no idea how to test.
        utils.mockFunctionWithDelay(spyFetch, 61, new DOMException('DOMException: The operation timed out.', 'TimeoutError'));
        // Mock fetch() to reject with DOMException (AbortError or TimeoutError) after 60 seconds.
        // const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
        // const timeoutSpy = jest.spyOn(AbortSignal.prototype, 'timeout');

        let callApi = api.getData(2025);
        console.log("It is now: " + new Date());
        await act(() => utils.advanceTimersBySeconds(65));

        let errorThrown = false;
        await waitFor(() => {
            callApi.catch((error) => {
                assertAPIError(error, APIError.ErrorType.Timeout,
                    '');
                errorThrown = true;
            })
        });
        console.log("Error thrown? " + errorThrown);
        console.log(callApi);
        assertApiCall(1, [2025]);
        try {
            expect(errorThrown).toBe(true);
        } catch (e) {
            throw new Error('Timeout error should be thrown!');
        }
    });
});

/**
 * Mocks successful call(s) to the API with status code 200.
 * 
 * @param  {...any} responseJson the response JSON data returned in order
 */
const mockSuccessfulApiCall = (...responseJson) =>
    responseJson.forEach((json) => mockApiCall(initApiResponse(true, 200, json)));

/**
 * Mocks the API call to return an unsucessful response.
 * 
 * @param {number} statusCode the status code, eg. 400
 * @param {string} message the response body message
 */
const mockUnsuccessfulApiCallOnce = (statusCode, message) =>
    mockApiCall(initApiResponse(false, statusCode, message));

/**
 * Initializes a API JSON response with status code 200.
 * 
 * @param {boolean} successful whether this response is a successful one
 * @param {number} statusCode the response status code
 * @param {*|string} body the JSON data to set (for successful responses) or the message (otherwise)
 * @returns {{ok: boolean; status: number; json: *}} the new API response
 */
const initApiResponse = (successful, statusCode, body) => {
    return {
        ok: successful,
        status: statusCode,
        json: () => (body),
    }
}

/**
 * Mocks the API call to throw an error once.
 * 
 * @param {Error} error the error thrown
 */
const mockApiCallThrowErrorOnce = (error) => spyFetch.mockRejectedValueOnce(error);

/**
 * Mocks an API call that returns a response.
 * 
 * The response statuts status code may or may not be 200.
 * 
 * @param {*} response the response from the API call
 */
const mockApiCall = (response) => spyFetch.mockImplementationOnce(() => Promise.resolve(response));

/**
 * Asserts the calls to the API.
 * 
 * @param {number} times expected number of times called
 * @param {number[]} years the expected `year` parameter values in the order of API call
 */
const assertApiCall = (times, years) => {
    expect(global.fetch).toHaveBeenCalledTimes(times);
    years.forEach((year) => expect(global.fetch).toHaveBeenCalledWith(mockApiUrl + year, expect.anything()));
}

/**
 * Asserts an `APIError` object.
 * 
 * @param {APIError} error the error object to check
 * @param {string} type the expected error type; expects one of `APIError.ErrorType`
 * @param {string} message the expected error message
 * @param {number} statusCode (optional) the expected status code
 */
const assertAPIError = (error, type, message, statusCode = null) => {
    try {
        expect(error instanceof APIError).toBe(true);
    } catch (e) {
        throw new Error(`Error thrown is ${error.name}, message: ${error.message}`);
    }
    expect(error.name).toBe(type);
    if (statusCode) {
        expect(error.statusCode).toBe(statusCode);
    }
    expect(error.message).toBe(message);
}
