import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as utils from '../../testUtils';

import SumoScheduleLookup from '../SumoScheduleLookup';

import testData from './SumoScheduleLookup.test.json';
import expecteds from '../../testData-expecteds.json';
import { APICallResult } from '../../types/APICallResult';

import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

const api = require('../../api/SumoScheduleService');
const spyApi = jest.spyOn(api, 'fetchData');

beforeAll(() => utils.mockCurrentDate('2025-10-10'));
beforeEach(() => i18n.changeLanguage('en'));  // Use English unless otherwise stated.
afterEach(() => cleanup());

/**
 * About fixing the "not wrapped in act(...)" warning:
 * https://github.com/testing-library/react-testing-library/issues/1051
 * (Exact comment:
 * https://github.com/testing-library/react-testing-library/issues/1051#issuecomment-1149569930)
 */

describe('Verify screen', () => {
    test('Screen components are rendered.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        await act(async () => renderComponent());
        await waitFor(() => {
            expect(utils.getHeading(1)).toBeInTheDocument();
            expect(getYearDropdown()).toBeInTheDocument();
            expect(screen.getByRole('table', { name: 'schedule' })).toBeInTheDocument();
        });
    })

    test('English title is correct.', async () => await testPageTitle('en', 'Sumo Tournament Schedule Lookup'));
    test('Chinese title is correct.', async () => await testPageTitle('zh', '大相撲場地時間表查詢'));
    test('Chinese title is correct.', async () => await testPageTitle('ja', '大相撲本場所日程検索'));

    /**
     * Runs a test case on the page title text.
     * @param {string} languageCode the language code
     * @param {string} expected the expected title text
     */
    const testPageTitle = async (languageCode, expected) => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        i18n.changeLanguage(languageCode);
        await act(async () => renderComponent());
        await waitFor(() => expect(utils.getHeading(1)).toHaveTextContent(expected));
    }
})

describe('Happy path (API calls successful)', () => {
    test('No API call delay on intial rendering.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        renderComponent();
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertScreen(2025, 6);
            assertErrorMessageNotExist();
        });
    });

    test('Change Year dropdown value.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.oneRecord),
            initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 1);

        await act(async () => fireChangeYearDropdownValueEvent(2028));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2028, 6);

        assertApiCall(2, [2025, 2028]);
    });

    test('API call delay on initial rendering - English.', async () => testInitialRenderingDelay('en'));
    test('API call delay on initial rendering - Chinese.', async () => testInitialRenderingDelay('zh'));
    test('API call delay on initial rendering - Japanese.', async () => testInitialRenderingDelay('ja'));
    /**
     * Runs a test case with a API call delay on initial rendering.
     * @param {string} language the language code
     */
    const testInitialRenderingDelay = async (language) => {
        i18n.changeLanguage(language);
        mockApiCallWithDelay(30, initSuccessfulAPICallResult(testData.sixRecords));

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText();
        });

        await act(() => utils.advanceTimersBySeconds(35));
        assertScreen(2025, 6);
        assertNotDisplayLoadingText();
    }

    test('API call delay on Year dropdown change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.oneRecord));
        mockApiCallWithDelay(30, initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
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
})

describe('API unsuccessful response', () => {
    test('No API call delay on initial rendering - English.', async () => await testInitialRendering('en'));
    test('No API call delay on initial rendering - Chinese.', async () => await testInitialRendering('zh'));
    test('No API call delay on initial rendering - Japanese.', async () => await testInitialRendering('ja'));
    /**
     * Runs a test case with an unsuccessful API response on initial rendering.
     * @param {string} language the language code
     */
    const testInitialRendering = async (language) => {
        i18n.changeLanguage(language);
        mockApiCalls(initUnsuccessfulAPICallResult(400, 'BAD REQUEST', 'Test reason 1.'));
        renderComponent();
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 'BAD REQUEST', 'Test reason 1.', 2025, language));
        assertApiCall(1, [2025]);
    }

    test('API call delay on initial rendering.', async () => {
        mockApiCallWithDelay(20, initUnsuccessfulAPICallResult(400, 'BAD REQUEST', 'Test reason 2.'));

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText();
        });

        await act(() => utils.advanceTimersBySeconds(21));
        assertUnsuccessfulAPIResponse(400, 'BAD REQUEST', 'Test reason 2.', 2025);
    });

    test('Failure on initial rendering, success on year value change.', async () => {
        mockApiCalls(initUnsuccessfulAPICallResult(400, 'BAD REQUEST', 'Test reason 3.'));
        mockApiCallWithDelay(3, initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 'BAD REQUEST', 'Test reason 3.', 2025));

        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        await act(() => utils.advanceTimersBySeconds(4));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('Success on initial rendering, failure on year value change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords),
            initUnsuccessfulAPICallResult(400, 'BAD REQUEST', 'Test reason 4.'));

        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        await act(async () => fireChangeYearDropdownValueEvent(2026));
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 'BAD REQUEST', 'Test reason 4.', 2026));

        assertApiCall(2, [2025, 2026]);
    });

    /**
     * Asserts the screen for a test case with unsuccessful API response.
     * @param {number} statusCode the response status code
     * @param {string} statusText the response status text
     * @param {string} message the failure message from the response
     * @param {number} expectedYear the expected selected value in the Year dropdown box
     * @param {string} language the language code; default `en` if not provided
     */
    const assertUnsuccessfulAPIResponse = (statusCode, statusText, message, expectedYear, language = 'en') =>
        assertScreenWithError(expectedYear,
            expecteds.errorMessage.unsuccessfulAPIResponse.header[language],
            `${statusCode} ${statusText} - ${message}`);
})

describe('API call throws error', () => {
    test('No API call delay on initial rendering - English.', async () => await testInitialRendering('en'));
    test('No API call delay on initial rendering - Chinese.', async () => await testInitialRendering('zh'));
    test('No API call delay on initial rendering - Japanese.', async () => await testInitialRendering('ja'));
    /**
     * Runs a test case where the API call throws error on initial rendering.
     * @param {string} language the language code
     */
    const testInitialRendering = async (language) => {
        i18n.changeLanguage(language);
        mockApiCalls(APICallResult.InitForErrorThrown(new Error('Test Thrown Error 1.')));
        renderComponent();
        await waitFor(() => assertAPICallErrorThrown(2025, 'Error: Test Thrown Error 1.', language));
        assertApiCall(1, [2025]);
    }

    test('API call delay on initial rendering.', async () => {
        mockApiCallWithDelay(50, APICallResult.InitForErrorThrown(new Error('Test Thrown Error 2.')));

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText();
        });

        await act(() => utils.advanceTimersBySeconds(55));
        assertAPICallErrorThrown(2025, 'Error: Test Thrown Error 2.');
    });

    test('Failure on initial rendering, success on year value change.', async () => {
        mockApiCalls(APICallResult.InitForErrorThrown(new Error('Test Thrown Error 3.')));
        mockApiCallWithDelay(3, initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertAPICallErrorThrown(2025, 'Error: Test Thrown Error 3.'));

        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        await act(() => utils.advanceTimersBySeconds(4));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('Success on initial rendering, failure on year value change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords),
            APICallResult.InitForErrorThrown(new Error('Test Thrown Error 4.')));

        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        await act(async () => fireChangeYearDropdownValueEvent(2026));
        await waitFor(() => assertAPICallErrorThrown(2026, 'Error: Test Thrown Error 4.'));

        assertApiCall(2, [2025, 2026]);
    });

    /**
     * Asserts the screen for a test case where the API call throws (non-timeout) error.
     * @param {number} year the expected selected value in the Year dropdown box
     * @param {string} errorBody the expected error message body
     * @param {string} language the language code; default `en` if not provided
     */
    const assertAPICallErrorThrown = (year, errorBody, language = 'en') =>
        assertScreenWithError(year, expecteds.errorMessage.apiErrorThrown.header[language], errorBody);
});

describe('API call timeout', () => {
    test('On initial rendering - English.', async () => testAPICallTimeout('en'));
    test('On initial rendering - Chinese.', async () => testAPICallTimeout('zh'));
    test('On initial rendering - Japanese.', async () => testAPICallTimeout('ja'));

    test('Failure on initial rendering, success on year value change.', async () => {
        await testAPICallTimeout('en');
        expect(document.querySelector('#errorMessage')).toBeInTheDocument();

        mockApiCallWithDelay(3, initSuccessfulAPICallResult(testData.sixRecords));
        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        await act(() => utils.advanceTimersBySeconds(4));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('Click reload button - English.', async () => await testReload('en'));
    test('Click reload button - Chinese.', async () => await testReload('zh'));
    test('Click reload button - Japanese.', async () => await testReload('ja'));
    /**
     * Runs a test case on clicking the reload button in the error message box.
     * @param {string} language the language code
     */
    const testReload = async (language) => {
        await testAPICallTimeout(language);
        expect(document.querySelector('#errorMessage')).toBeInTheDocument();

        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        await act(async () =>
            utils.fireClickButtonEvent(expecteds.errorMessage.apiTimeout.reloadButtonLabel[language]));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        assertApiCall(2, [2025, 2025]);
    }

    /**
     * Runs a test case on API call timeout.
     * @param {string} language the language code
     */
    const testAPICallTimeout = async (language) => {
        i18n.changeLanguage(language);
        mockApiCallWithDelay(60, APICallResult.InitForTimeout());

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText();
        });

        await act(() => utils.advanceTimersBySeconds(61));
        assertScreenWithError(2025, expecteds.errorMessage.apiTimeout.header[language],
            expecteds.errorMessage.apiTimeout.body[language]);
    }
});

/**
 * Initializes a result object for a successful API call.
 * @param {{code: string; schedule: string[]}[]} data test data from the JSON file
 * @returns the new result object
 */
const initSuccessfulAPICallResult = (data) =>
    APICallResult.InitForSuccessfulResponse(utils.parseToTournament(data));

/**
 * Initializes a result object for an unsuccessful API call.
 * @param {number} statusCode the response status code
 * @param {string} statusText the status text corresponding to `statusCode`, eg. BAD REQUEST for 400
 * @param {string} message the error/failure message from the response body
 * @returns the new result object
 */
const initUnsuccessfulAPICallResult = (statusCode, statusText, message) =>
    APICallResult.InitForUnsuccessfulResponse({
        statusCode: statusCode,
        statusText: statusText,
        reason: {
            code: statusCode,
            message: message
        }
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
 * Renders the component.
 */
const renderComponent = () => render(<I18nextProvider i18n={i18n}><SumoScheduleLookup /></I18nextProvider>);

/**
 * Gets the Year dropdown box.
 * @returns the `HTMLElement` for the Year dropdown box
 */
const getYearDropdown = () => utils.getDropdownBoxElement('year');

/**
 * Fires an event for changing the value of the Year dropdown.
 * @param {number} year the new dropdown value
 */
const fireChangeYearDropdownValueEvent = (year) => utils.fireChangeDropdownValueEvent(getYearDropdown(), year);

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
 * Asserts the screen for a test case with an error message displaying due to an unsuccessful API call.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 * @param {string} messageHeader the expected error message header
 * @param {string} message the expected message body, HTML tags for line breaks, etc. included
 */
const assertScreenWithError = (expectedYear, messageHeader, messageBody) => {
    const errorMessageBox = document.querySelector('#errorMessage');
    expect(errorMessageBox).toBeInTheDocument();
    expect(errorMessageBox.innerHTML)
        .toMatch(new RegExp(`${utils.escapeRegex(messageHeader)}.*${utils.escapeRegex(messageBody)}`));

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
    screen.getAllByRole('option').forEach((option) =>
        expect(option.selected).toBe(option.value === expectedYear.toString()));
    utils.assertTableRowCount(recordCount, true);
}

/**
 * Asserts that the error message box is not present in the screen.
 */
const assertErrorMessageNotExist = () => expect(document.querySelector('#errorMessage')).toBeNull();

/**
 * Asserts that the loading text is on the screen.
 */
const assertDisplayLoadingText = () => expect(document.querySelector('#loadingText')).toBeInTheDocument();

/**
 * Asserts that the loading text is not on the screen.
 */
const assertNotDisplayLoadingText = () => expect(document.querySelector('#loadingText')).toBeNull();