import { cleanup, act, waitFor } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as api from '../../api/ScheduleWebservice';
import { APICallResult } from '../../types/APICallResult';

import testData from './ScheduleWebservice.test.json';

const mockApiUrl = "http://my-api-host.net/getSumoHonbashoSchedule?year=";
const spyFetch = jest.spyOn(global, 'fetch');
const spyAbort = jest.spyOn(AbortController.prototype, 'abort');

beforeAll(() => utils.mockCurrentDate('2025-10-10'));
beforeEach(() => {
    const environmentUtils = require('../../utils/EnvironmentUtils');
    jest.spyOn(environmentUtils, 'getApiUrl').mockReturnValue(mockApiUrl + "%YEAR%");
});
afterEach(() => cleanup());

describe('Successful API calls', () => {
    test('Year parameter value is a number.', async () => runHappyPathTestCase(2025));
    test('Year parameter value is a string.', async () => runHappyPathTestCase("2025"));

    /**
     * Runs a happy path test case.
     * @param {number|string} year the year parameter value
     */
    const runHappyPathTestCase = (year) => {
        mockSuccessfulApiCallOnce(testData.data);

        api.fetchData(year).then((result) => {
            expect(result.success).toBe(true);
            expect(result.data).toEqual(testData.data.result);
        });
        assertApiCall(year);
        expect(spyAbort).not.toHaveBeenCalled();
    }
});

describe('Unsuccessful API calls', () => {
    test('Unsuccessful response.', async () => {
        mockUnsuccessfulApiCallOnce(400, "Bad request.");
        api.fetchData(2025).then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({
                type: APICallResult.FailType.UnsuccessfulResponse, statusCode: 400
            });
        })
        assertApiCall(2025);
        expect(spyAbort).not.toHaveBeenCalled();
    });

    test('Error thrown.', async () => {
        const error = new TypeError("Load failed");
        mockApiCallThrowErrorOnce(error);
        api.fetchData(2025).then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.ErrorThrown });
        })
        assertApiCall(2025);
        expect(spyAbort).not.toHaveBeenCalled();
    });

    test('Timeout - Firefox (throws the APITimeoutError defined in the abort() call).', async () => {
        var timeoutError = new Error('API call timed out!');
        timeoutError.name = 'APITimeoutError';
        utils.mockFunctionWithDelay(spyFetch, 61, timeoutError);

        const callApi = api.fetchData(2025);
        await act(() => utils.advanceTimersBySeconds(65));

        await waitFor(() => callApi.then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.Timeout });
        }));
        assertApiCall(2025);
        expect(spyAbort).toHaveBeenCalledTimes(1);
        expect(spyAbort).toHaveBeenCalledWith(expect.objectContaining({
            name: 'APITimeoutError',
            message: 'API call timed out!'
        }));
    })

    test('Timeout - Safari/Chrome (throws AbortError anyway).', async () => {
        var timeoutError = new DOMException('The user aborted a request.', 'AbortError');
        // timeoutError.name = 'APITimeoutError';
        utils.mockFunctionWithDelay(spyFetch, 61, timeoutError);

        const callApi = api.fetchData(2025);
        await act(() => utils.advanceTimersBySeconds(65));

        await waitFor(() => callApi.then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.Timeout });
        }));
        assertApiCall(2025);
        expect(spyAbort).toHaveBeenCalledTimes(1);
        expect(spyAbort).toHaveBeenCalledWith(expect.objectContaining({
            name: 'APITimeoutError',
            message: 'API call timed out!'
        }));
    })
});

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
 * @param {number} year the expected `year` parameter value
 */
const assertApiCall = (year) => expect(global.fetch).toHaveBeenCalledWith(mockApiUrl + year,
    expect.objectContaining({ signal: expect.any(AbortSignal) }));