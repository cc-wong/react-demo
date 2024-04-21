import { cleanup } from '@testing-library/react';
import * as utils from '../../testUtils';

import * as api from '../ScheduleWebservice';

import testData from './ScheduleWebservice.test.json';

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
        const spyGetAPIURL = mockGetAPIURL();
        utils.mockFetchSuccessfulResponse(dataSet.data);
        api.fetchData(year).then((result) => utils.assertAPISuccessfulResponse(result,
            utils.parseToTournament(dataSet.expected)));
        assertGetAPIURL(spyGetAPIURL);
        assertApiCall(year);
        utils.assertAPICallNotAborted();
    }
});

test('Unsuccessful response returned.', async () => {
    utils.mockFetchUnsuccessfulResponse(400, 'BAD REQUEST', {
        code: 400,
        message: 'Test Unsuccessful Response.'
    });
    const spyGetAPIURL = mockGetAPIURL();
    api.fetchData(2026).then((result) => utils.assertAPIUnsuccessfulResponse(result, 400, 'BAD REQUEST', {
        code: 400,
        message: 'Test Unsuccessful Response.'
    }));
    assertGetAPIURL(spyGetAPIURL);
    assertApiCall(2026);
    utils.assertAPICallNotAborted();
});

const url = "http://my-api-host.net/getSumoHonbashoSchedule?year=";

/**
 * Mocks getting the API URL from the environment utility function.
 * @returns a spy object on function `EnvironmentUtils.getAPIURL()`
 */
const mockGetAPIURL = () => utils.mockGetAPIURL(`${url}%YEAR%`);

/**
 * Asserts that the environment utility function to get the API URL has been called.
 */
const assertGetAPIURL = (spyGetAPIURL) => expect(spyGetAPIURL).toHaveBeenCalledWith('SUMOSCHEDULE');

/**
 * Asserts that a call has been made to the API URL.
 * 
 * @param {string|number} year the expected `year` parameter value
 */
const assertApiCall = (year) => utils.assertApiCall(url + year);