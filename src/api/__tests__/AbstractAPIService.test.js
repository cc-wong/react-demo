import { cleanup, act, waitFor } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as baseAPIService from '../AbstractAPIService';

import { APICallResult } from '../../types/APICallResult';

const environmentUtils = require('../../utils/EnvironmentUtils');
const spyGetAPIURL = jest.spyOn(environmentUtils, 'getAPIURL');
const spyGetAPITimeout = jest.spyOn(environmentUtils, 'getAPITimeout');

const apiURL = "http://my-api-host.net/myService1";

/**
 * The mock function for `parseResponseBody(json)`.
 */
const parseResponseBody = jest.fn();
/**
 * Test API fetch data function with no parameters in the URL.
 */
const fetchDataNoParams = async () => baseAPIService.fetchData(parseResponseBody, 'SERVICE1');

beforeAll(() => jest.useFakeTimers());
beforeEach(() => spyGetAPITimeout.mockReturnValue(60));
afterEach(() => cleanup());

describe('Successful API calls', () => {
    test('No request parameters.', async () => {
        const responseBody = { key: 'value1' };
        mockAPICallAndResponseParsing(apiURL, responseBody);

        await fetchDataNoParams().then(assertAPICallResult);
        assertFunctionsCalls(apiURL, 'SERVICE1', responseBody);
    });

    /**
     * Test API fetch data function with parameters in the URL.
     */
    const fetchDataWithParams = async (param1, param2) =>
        baseAPIService.fetchData(parseResponseBody, 'SERVICE2', { 'PARAM1': param1, 'PARAM2': param2 });

    test('With request parameters.', async () => {
        const responseBody = { key: 'value2' };
        mockAPICallAndResponseParsing(
            'http://my-api-host.net/myService2?param1=%PARAM1%&param2=%PARAM2%', responseBody);

        await fetchDataWithParams('val1', 'val2').then((assertAPICallResult));
        assertFunctionsCalls(
            'http://my-api-host.net/myService2?param1=val1&param2=val2', 'SERVICE2', responseBody);
    });

    /**
     * Mocks the API call and the response parsing function.
     * @param {string} urlFormat the URL format for the API call
     * @param {*} responseBody the mock API call response body
     */
    const mockAPICallAndResponseParsing = (urlFormat, responseBody) => {
        spyGetAPIURL.mockReturnValue(urlFormat);
        utils.mockFetchSuccessfulResponse(responseBody);
        parseResponseBody.mockReturnValue('RESPONSE_DATA');
    }

    /**
     * Asserts the API call result object returned.
     * @param {APICallResult} result the result object to check
     */
    const assertAPICallResult = (result) => utils.assertAPISuccessfulResponse(result, 'RESPONSE_DATA');

    /**
     * Asserts the function calls.
     * @param {string} url the expected URL used for the API call
     * @param {string} urlCode the expected URL code for URL format retrieval
     * @param {*} responseBody the expected API call response body
     */
    const assertFunctionsCalls = (url, urlCode, responseBody) => {
        utils.assertApiCall(url);
        assertEnvUtilityFunctionsCalled(urlCode);
        expect(parseResponseBody.mock.calls).toEqual([[responseBody]]);
        utils.assertAPICallNotAborted();
    }
});

describe('Unsuccessful API calls', () => {
    test('Unsuccessful response.', async () => {
        utils.mockFetchUnsuccessfulResponse(400, 'BAD REQUEST', { message: 'Test reason.' });
        testUnsuccessfulAPICall(fetchDataNoParams,
            utils.initUnsuccessfulResponseErrorData(400, 'BAD REQUEST', { message: 'Test reason.' }));
    });

    test('Error thrown.', async () => {
        const error = new TypeError("Load failed!!");
        utils.spyOnFetch().mockRejectedValueOnce(error);
        testUnsuccessfulAPICall(fetchDataNoParams, { type: APICallResult.FailType.ErrorThrown, reason: error });
    });

    /**
     * Runs a test case where the API call ends in failure.
     * @param {Function} fetchData the API data fetch funtion to use in the test case
     * @param {{type: string; statusCode?: number}} error
     *              the expected error details in the returned result object
     */
    const testUnsuccessfulAPICall = async (fetchData, error) => {
        spyGetAPIURL.mockReturnValue(apiURL);
        fetchData().then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual(error);
        });
        utils.assertApiCall(apiURL);
        assertEnvUtilityFunctionsCalled('SERVICE1');
        expect(parseResponseBody.mock.calls).toHaveLength(0);
        utils.assertAPICallNotAborted();
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
        spyGetAPIURL.mockReturnValue(apiURL);
        utils.mockFunctionWithDelay(utils.spyOnFetch(), 60, timeoutError);

        const callApi = fetchDataNoParams();
        await act(() => utils.advanceTimersBySeconds(61));

        await waitFor(() => callApi.then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.Timeout });
        }));
        utils.assertApiCall(apiURL);
        assertEnvUtilityFunctionsCalled('SERVICE1');
        expect(parseResponseBody.mock.calls).toHaveLength(0);

        const spyAbort = jest.spyOn(AbortController.prototype, 'abort');
        expect(spyAbort).toHaveBeenCalledTimes(1);
        expect(spyAbort).toHaveBeenCalledWith(expect.objectContaining({
            name: 'APITimeoutError',
            message: 'API call timed out!'
        }));
    }
});

/**
 * Asserts that the environment utility functions related to the API have been called.
 */
const assertEnvUtilityFunctionsCalled = (urlCode) => {
    expect(spyGetAPIURL).toHaveBeenCalledWith(urlCode);
    expect(spyGetAPITimeout).toHaveBeenCalled();
}