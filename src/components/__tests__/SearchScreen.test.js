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

    test('English title is correct.', async () => await testPageTitle('en', 'Sumo Tournament Schedule Lookup'));
    test('Chinese title is correct.', async () => await testPageTitle('zh', '大相撲場地時間表查詢'));
    test('Chinese title is correct.', async () => await testPageTitle('ja', '大相撲本場所スケジュール検索'));

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
            assertDisplayLoadingText(language);
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
        mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400));
        renderComponent();
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025, language));
        assertApiCall(1, [2025]);
    }

    test('API call delay on initial rendering.', async () => {
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

    test('Failure on initial rendering, success on year value change.', async () => {
        mockApiCalls(APICallResult.InitForUnsuccessfulResponse(400));
        mockApiCallWithDelay(3, initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 2025));

        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        await act(() => utils.advanceTimersBySeconds(4));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('Success on initial rendering, failure on year value change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords),
            APICallResult.InitForUnsuccessfulResponse(400));

        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        await act(async () => fireChangeYearDropdownValueEvent(2026));
        await waitFor(() => assertUnsuccessfulAPIResponse(400, 2026));

        assertApiCall(2, [2025, 2026]);
    });

    /**
     * Asserts the screen for a test case with unsuccessful API response.
     * @param {number} statusCode the response status code
     * @param {number} expectedYear the expected selected value in the Year dropdown box
     * @param {string} language the language code; default `en` if not provided
     */
    const assertUnsuccessfulAPIResponse = (statusCode, expectedYear, language = 'en') => {
        var [header, body] = ['ERROR', `Could not retrieve data (returned status code ${statusCode})`];
        switch (language) {
            case 'zh':
                [header, body] = ['發生錯誤', `Could not retrieve data (returned status code ${statusCode})`];
                break;
            case 'ja':
                [header, body] = ['エラー', `Could not retrieve data (returned status code ${statusCode})`];
                break;
            default:
        }
        assertScreenWithError(expectedYear, header, body);
    }
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
        mockApiCalls(APICallResult.InitForErrorThrown());
        renderComponent();
        await waitFor(() => assertAPICallErrorThrown(2025, language));
        assertApiCall(1, [2025]);
    }

    test('API call delay on initial rendering.', async () => {
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

    test('Failure on initial rendering, success on year value change.', async () => {
        mockApiCalls(APICallResult.InitForErrorThrown());
        mockApiCallWithDelay(3, initSuccessfulAPICallResult(testData.sixRecords));

        await act(async () => renderComponent());
        await waitFor(() => assertAPICallErrorThrown(2025));

        await act(async () => fireChangeYearDropdownValueEvent(2030));
        await waitFor(() => assertErrorMessageNotExist());
        await act(() => utils.advanceTimersBySeconds(4));
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2030, 6);

        assertApiCall(2, [2025, 2030]);
    });

    test('Success on initial rendering, failure on year value change.', async () => {
        mockApiCalls(initSuccessfulAPICallResult(testData.sixRecords),
            APICallResult.InitForErrorThrown());

        await act(async () => renderComponent());
        await waitFor(() => assertErrorMessageNotExist());
        assertScreen(2025, 6);

        await act(async () => fireChangeYearDropdownValueEvent(2026));
        await waitFor(() => assertAPICallErrorThrown(2026));

        assertApiCall(2, [2025, 2026]);
    });

    /**
     * Asserts the screen for a test case where the API call throws (non-timeout) error.
     * @param {number} expectedYear the expected selected value in the Year dropdown box
     * @param {string} language the language code; default `en` if not provided
     */
    const assertAPICallErrorThrown = (expectedYear, language = 'en') => {
        var [header, body] = ['ERROR', 'Could not retrieve data (error on making API call)'];
        switch (language) {
            case 'zh':
                [header, body] = ['發生錯誤', 'Could not retrieve data (error on making API call)'];
                break;
            case 'ja':
                [header, body] = ['エラー', 'Could not retrieve data (error on making API call)'];
                break;
            default:
        }
        assertScreenWithError(expectedYear, header, body);
    }
});

describe('API call timeout', () => {
    test('On initial rendering - English.', async () =>
        testAPICallTimeout('en', 'Timeout error!', 'Please try again.'));
    test('On initial rendering - Chinese.', async () =>
        testAPICallTimeout('zh', '發生逾時錯誤！', '請重新嘗試。'));
    test('On initial rendering - Japanese.', async () =>
        testAPICallTimeout('ja', 'タイムアウトが発生しました!', 'もう一度お試しください。'));

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

    /**
     * Runs a test case on API call timeout.
     * @param {string} errorHeader
     *      the expected error message header; message text assertion is skipped if not provided
     * @param {string} errorBody
     *      the expected error message body; message text assertion is skipped if not provided
     */
    const testAPICallTimeout = async (language, errorHeader = null, errorBody = null) => {
        i18n.changeLanguage(language);
        mockApiCallWithDelay(60, APICallResult.InitForTimeout());

        await act(() => renderComponent());
        await waitFor(() => {
            assertApiCall(1, [2025]);
            assertErrorMessageNotExist();
            assertDisplayLoadingText(language);
        });

        await act(() => utils.advanceTimersBySeconds(61));
        errorHeader && errorBody && assertScreenWithError(2025, errorHeader, errorBody);
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