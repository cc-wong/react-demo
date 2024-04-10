import { cleanup, act, waitFor } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as api from '../../api/ScheduleWebservice';
import { APICallResult } from '../../types/APICallResult';

import testData from './ScheduleWebservice.test.json';

const mockApiUrl = "http://my-api-host.net/getSumoHonbashoSchedule?year=";
const spyFetch = jest.spyOn(global, 'fetch');
const spyAbort = jest.spyOn(AbortController.prototype, 'abort');

const environmentUtils = require('../../utils/EnvironmentUtils');
const spyGetAPIURL = jest.spyOn(environmentUtils, 'getAPIURL');
const spyGetAPITimeout = jest.spyOn(environmentUtils, 'getAPITimeout');

beforeAll(() => jest.useFakeTimers());
beforeEach(() => {
    spyGetAPITimeout.mockReturnValue(100);
});
afterEach(() => cleanup());

describe('Successful API calls', () => {
    test('Year parameter value is a number.', async () => runHappyPathTestCase(2024));
    test('Year parameter value is a string.', async () => runHappyPathTestCase("2024"));

    /**
     * Runs a happy path test case.
     * @param {number|string} year the year parameter value
     */
    const runHappyPathTestCase = (year) => {
        mockGetAPIURL(year);
        mockSuccessfulApiCallOnce(testData.data);

        api.fetchData(year).then((result) => {
            expect(result.success).toBe(true);
            expect(result.data).toEqual(testData.data.result);
        });
        assertApiCall(year);
        assertEnvUtilityFunctionsCalled(year);
        expect(spyAbort).not.toHaveBeenCalled();
    }
});

describe('Unsuccessful API calls', () => {
    test('Unsuccessful response.', async () => {
        mockUnsuccessfulApiCallOnce(400, "Bad request.");
        testUnsuccessfulAPICall({
            type: APICallResult.FailType.UnsuccessfulResponse,
            statusCode: 400
        })
    });

    test('Error thrown.', async () => {
        mockApiCallThrowErrorOnce(new TypeError("Load failed"));
        testUnsuccessfulAPICall({ type: APICallResult.FailType.ErrorThrown });
    });

    /**
     * Runs a test case where the API call ends in failure.
     * @param {{type: string; statusCode?: number}} error
     *              the expected error details in the returned result object
     */
    const testUnsuccessfulAPICall = async (error) => {
        mockGetAPIURL(2026);
        api.fetchData(2026).then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual(error);
        });
        assertApiCall(2026);
        assertEnvUtilityFunctionsCalled(2026);
        expect(spyAbort).not.toHaveBeenCalled();
    }

    test('Timeout - Firefox (throws the APITimeoutError passed to abort()).', async () => {
        var timeoutError = new Error('API call timed out!');
        timeoutError.name = 'APITimeoutError';
        await testTimeoutAPICall(timeoutError);
    })

    test('Timeout - Safari/Chrome (throws AbortError anyway).', async () =>
        await testTimeoutAPICall(new DOMException('The user aborted a request.', 'AbortError')));

    /**
     * Runs an API call timeout test case.
     * @param {Error|DOMException} timeoutError the error thrown by `fetch()` on timeout
     */
    const testTimeoutAPICall = async (timeoutError) => {
        mockGetAPIURL(2025);
        spyGetAPITimeout.mockReturnValue(60);
        utils.mockFunctionWithDelay(spyFetch, 60, timeoutError);

        const callApi = api.fetchData(2025);
        await act(() => utils.advanceTimersBySeconds(61));

        await waitFor(() => callApi.then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.Timeout });
        }));
        assertApiCall(2025);
        assertEnvUtilityFunctionsCalled(2025);
        expect(spyAbort).toHaveBeenCalledTimes(1);
        expect(spyAbort).toHaveBeenCalledWith(expect.objectContaining({
            name: 'APITimeoutError',
            message: 'API call timed out!'
        }));
    }
});

/**
 * Mocks getting the API URL from the environment utility function.
 * @param {number|string} year the year argument in the API call
 */
const mockGetAPIURL = (year) => spyGetAPIURL.mockReturnValue(mockApiUrl + year.toString());

/**
 * Asserts that the environment utility functions related to the API have been called.
 * @param {number|string} year the expected year argument for getting the API URL
 */
const assertEnvUtilityFunctionsCalled = (year) => {
    expect(spyGetAPIURL).toHaveBeenCalledWith(year);
    expect(spyGetAPITimeout).toHaveBeenCalled();
}

/**
 * Mocks an API call to return a successful response.
 * 
 * @param  {*} json the response JSON data returned
 */
const mockSuccessfulApiCallOnce = (json) => mockApiCall(initApiResponse(true, 200, json));

/**
 * Mocks an API call to return an unsucessful response.
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
 * Asserts that a call has been made to the API URL.
 * 
 * @param {string|number} year the expected `year` parameter value
 */
const assertApiCall = (year) => expect(global.fetch).toHaveBeenCalledWith(mockApiUrl + year,
    expect.objectContaining({ signal: expect.any(AbortSignal) }));