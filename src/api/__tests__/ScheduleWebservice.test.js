import { cleanup, act, waitFor } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as api from '../ScheduleWebservice';
import { APICallResult } from '../../types/APICallResult';

import testData from './ScheduleWebservice.test.json';

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
    test('API call returns empty result set.', async () => runHappyPathTestCase(2024, testData.emptySet));

    /**
     * Runs a happy path test case.
     * @param {number|string} year the year parameter value
     * @param {*} dataSet the test data set
     */
    const runHappyPathTestCase = (year, dataSet = testData.fullSet) => {
        mockGetAPIURL();
        mockApiCall({
            ok: true,
            status: 200,
            json: () => (dataSet.data),
        });

        api.fetchData(year).then((result) => {
            expect(result.success).toBe(true);
            expect(result.responseData).toEqual(utils.parseToTournament(dataSet.expected));
        });
        assertApiCall(year);
        assertEnvUtilityFunctionsCalled();
        expect(spyAbort).not.toHaveBeenCalled();
    }
});

describe('Unsuccessful API calls', () => {
    test('Unsuccessful response.', async () => {
        mockApiCall({
            ok: false,
            status: 400,
            statusText: 'BAD REQUEST',
            text: () => ('Test Unsuccessful Response.'),
        });
        testUnsuccessfulAPICall({
            type: APICallResult.FailType.UnsuccessfulResponse,
            statusCode: 400,
            statusText: 'BAD REQUEST',
            reason: 'Test Unsuccessful Response.'
        })
    });

    test('Error thrown.', async () => {
        const error = new TypeError("Load failed!!");
        spyFetch.mockRejectedValueOnce(error);
        testUnsuccessfulAPICall({ type: APICallResult.FailType.ErrorThrown, reason: error });
    });

    /**
     * Runs a test case where the API call ends in failure.
     * @param {{type: string; statusCode?: number}} error
     *              the expected error details in the returned result object
     */
    const testUnsuccessfulAPICall = async (error) => {
        mockGetAPIURL();
        api.fetchData(2026).then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual(error);
        });
        assertApiCall(2026);
        assertEnvUtilityFunctionsCalled();
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
        mockGetAPIURL();
        spyGetAPITimeout.mockReturnValue(60);
        utils.mockFunctionWithDelay(spyFetch, 60, timeoutError);

        const callApi = api.fetchData(2025);
        await act(() => utils.advanceTimersBySeconds(61));

        await waitFor(() => callApi.then((result) => {
            expect(result.success).toBe(false);
            expect(result.error).toEqual({ type: APICallResult.FailType.Timeout });
        }));
        assertApiCall(2025);
        assertEnvUtilityFunctionsCalled();
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
const assertEnvUtilityFunctionsCalled = () => {
    expect(spyGetAPIURL).toHaveBeenCalledWith('SUMOSCHEDULE');
    expect(spyGetAPITimeout).toHaveBeenCalled();
}

const mockApiUrl = "http://my-api-host.net/getSumoHonbashoSchedule?year=";
/**
 * Mocks getting the API URL from the environment utility function.
 */
const mockGetAPIURL = () => spyGetAPIURL.mockReturnValue(`${mockApiUrl}%YEAR%`);

/**
 * Mocks an API call that returns a response.
 * 
 * The response statuts status code may or may not be 200.
 * 
 * @param {*} response the response from the API call
 */
const mockApiCall = (response) => utils.mockFunctionToReturnValue(spyFetch, response);

/**
 * Asserts that a call has been made to the API URL.
 * 
 * @param {string|number} year the expected `year` parameter value
 */
const assertApiCall = (year) => expect(global.fetch).toHaveBeenCalledWith(mockApiUrl + year,
    expect.objectContaining({ signal: expect.any(AbortSignal) }));