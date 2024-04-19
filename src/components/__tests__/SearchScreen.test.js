import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as utils from '../../testUtils';

import SearchScreen from '../SearchScreen';

import testData from './SearchScreen.test.json';
import { APICallResult } from '../../types/APICallResult';

import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

const api = require('../../api/ScheduleWebservice');
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
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: 'year' })).toBeInTheDocument();
            expect(screen.getByRole('table', { name: 'schedule' })).toBeInTheDocument();
        });
    })

    test('English title.', async () => await testPageTitle('en', 'Sumo Tournament Schedule Lookup'));
    test('Chinese title.', async () => await testPageTitle('zh', '大相撲場地時間表查詢'));
    test('Chinese title.', async () => await testPageTitle('ja', '大相撲本場所スケジュール検索'));

    /**
     * Runs a test case on the page title text.
     * @param {string} languageCode the language code
     * @param {string} expected the expected title text
     */
    const testPageTitle = async (languageCode, expected) => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        i18n.changeLanguage(languageCode);
        await act(async () => renderComponent());

        await waitFor(() => {
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent(expected);
        });
    }
})

describe('On initial rendering', () => {
    test('Normal screen render (API call successful).', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords));
        renderComponent();

        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertScreen(2025, 6);
            assertErrorMessageNotExist();
        });
    });

    test('API call returns unsuccessful response.', async () => {
        mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400));
        renderComponent();

        await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025));
        assertApiCall(1, [2025]);
    });

    test('Error thrown on API call.', async () => {
        mockApiCalls(APICallResult.InitForErrorThrown());
        renderComponent();

        await waitFor(() => assertAPICallErrorThrown(2025));
        assertApiCall(1, [2025]);
    });
});

describe('Year dropdown value changed', () => {
    test('Successful API data retrieval (happy path).', async () => {
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

    test('API call failed on initial rendering but successful on year value change.', async () => {
        mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400),
            initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025));

        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('API call failure on year value change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords),
            APICallResult.InitForErrorThrown());
        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        await act(async () => fireChangeYearDropdownValueEvent(2026));
        await waitFor(() => assertAPICallErrorThrown(2026));

        assertApiCall(2, [2025, 2026]);
    });
});

describe('Network delay on API call', () => {
    test('Delay on initial rendering - English.', async () => testInitialRenderingDelay('en'));
    test('Delay on initial rendering - Chinese.', async () => testInitialRenderingDelay('zh'));
    test('Delay on initial rendering - Japanese.', async () => testInitialRenderingDelay('ja'));

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
            assertDisplayLoadingText(language);
        });

        await act(() => utils.advanceTimersBySeconds(35));
        assertScreen(2025, 6);
        assertNotDisplayLoadingText();
    }

    test('Unsuccessful response after delay.', async () => {
        mockApiCallWithDelay(20, APICallResult.InitForUnsuccessfulResponse(400));

        await act(() => renderComponent());
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

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText();
        });

        await act(() => utils.advanceTimersBySeconds(55));
        assertAPICallErrorThrown(2025);
    });

    test('API call timeout after delay - English.', async () =>
        testAPICallTimeout('en', 'Request timed out. Please try again.'));
    test('API call timeout after delay - Chinese.', async () =>
        testAPICallTimeout('zh', 'API 通訊已逾時，請重新嘗試。'));
    test('API call timeout after delay - Japanese.', async () =>
        testAPICallTimeout('ja', 'APIサービスでタイムアウトが発生しました。もう一度お試しください。'));

    /**
     * Runs a test case on API call timeout.
     * @param {string} language the language code
     * @param {string} errorMessage the expected error message
     */
    const testAPICallTimeout = async (language, errorMessage) => {
        i18n.changeLanguage(language);
        mockApiCallWithDelay(60, APICallResult.InitForTimeout());

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText(language);
        });

        await act(() => utils.advanceTimersBySeconds(61));
        assertScreenWithError(2025, language, errorMessage);
    }

    test('Delay on Year dropdown change.', async () => {
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
});

/**
 * Initializes a result object for a successful API call.
 * @param {{code: string; schedule: string[]}[]} data test data from the JSON file
 * @returns the new result object
 */
const initSuccessfulAPICallResult = (data) =>
    APICallResult.InitForSuccessfulResponse(utils.parseToTournament(data));

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
const renderComponent = () => render(<I18nextProvider i18n={i18n}><SearchScreen /></I18nextProvider>);

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
 * @param {string} language the language code; default `en` if not provided
 */
const assertUnsuccessfulAPIResponse = (statusCode, expectedYear, language = 'en') =>
    assertScreenWithError(expectedYear, language, `Could not retrieve data (returned status code ${statusCode})`);

/**
 * Asserts the screen for a test case where the API call throws (non-timeout) error.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 * @param {string} language the language code; default `en` if not provided
 */
const assertAPICallErrorThrown = (expectedYear, language = 'en') =>
    assertScreenWithError(expectedYear, language, 'Could not retrieve data (error on making API call)');

/**
 * Asserts the screen for a test case with an error message displaying due to an unsuccessful API call.
 * @param {number} expectedYear the expected selected value in the Year dropdown box
 * @param {string} language the language code
 * @param {string} message the expected message displayed in the error box
 */
const assertScreenWithError = (expectedYear, language, message) => {
    const errorMessageBox = document.querySelector('#errorMessage');
    expect(errorMessageBox).toBeInTheDocument();
    expect(errorMessageBox.innerHTML)
        .toMatch(new RegExp(`${getExpectedErrorHeading(language)}.*${utils.escapeRegex(message)}`));

    assertScreen(expectedYear, 0);
    assertNotDisplayLoadingText();
}

/**
 * Gets the expected error heading.
 * @param {string} language the language code
 * @returns the error heading for the language
 */
const getExpectedErrorHeading = (language) => {
    switch (language) {
        case 'zh': return '發生錯誤';
        case 'ja': return 'エラー';
        default: return 'ERROR';
    }
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
 * Asserts that the error message box is not present in the screen.
 */
const assertErrorMessageNotExist = () => expect(document.querySelector('#errorMessage')).toBeNull();
/**
 * Asserts that the "Loading..." text is on the screen.
 * @param {string} language the language code; default `en` if not provided
 */
const assertDisplayLoadingText = (language = 'en') => {
    const loadingTextDiv = document.querySelector('#loadingText');
    expect(loadingTextDiv).toBeInTheDocument();
    expect(loadingTextDiv).toHaveTextContent(getExpectedLoadingText(language));
}

/**
 * Gets the expected Loading text.
 * @param {string} language the language code
 * @returns the expected Loading text for the language
 */
const getExpectedLoadingText = (language) => {
    switch (language) {
        case 'zh': return '載入中...';
        case 'ja': return 'ロード中...';
        default: return 'Loading...';
    }
}

/**
 * Asserts that the "Loading..." text is not on the screen.
 */
const assertNotDisplayLoadingText = () => expect(document.querySelector('#loadingText')).toBeNull();