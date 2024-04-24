import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import * as utils from './testUtils';

import App from './App';

import testData from './App.test.json'
import expectedVals from './testData-expecteds.json';

import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

beforeEach(() => utils.mockCurrentDate('2024-04-11'));
afterEach(() => cleanup());

describe('Integration tests - Sumo Tournament Schedule Lookup', () => {
  test('Page load - Data load success - English.', async () => testDataLoadSuccess('en'));
  test('Page load - Data load success - Chinese.', async () => testDataLoadSuccess('zh'));
  test('Page load - Data load success - Japanese.', async () => testDataLoadSuccess('ja'));

  test('Change language with language selector.', async () => {
    await testDataLoadSuccess('en');

    mockSuccessfulAPICall(testData.input.year2024);
    act(() => utils.fireClickButtonEvent('Language: EN'));
    await act(() => fireEvent.click(screen.getByRole('menuitem', { name: '日本語' })));
    await waitFor(() => assertTableContent(testData.expected.year2024.ja));
  });

  /**
   * Runs a test case on data load success on page load.
   * @param {string} language the language code
   */
  const testDataLoadSuccess = async (language) => {
    i18n.changeLanguage(language);
    mockSuccessfulAPICall(testData.input.year2024);

    await act(() => renderComponent());
    await waitFor(() => {
      assertDropdownValue(2024);
      assertTableContent(testData.expected.year2024[language]);
    });
  }

  test('Page load - Unsuccessful response - English.', async () => testAPIUnsuccessfulResponse('en'));
  test('Page load - Unsuccessful response - Chinese.', async () => testAPIUnsuccessfulResponse('zh'));
  test('Page load - Unsuccessful response - Japanese.', async () => testAPIUnsuccessfulResponse('ja'));
  /**
   * Runs a test case where the API call returns an response with status code 400 (BAD REQUEST)
   * and failure message "Test Unsuccessful Response.".
   * @param {string} language the language code
   */
  const testAPIUnsuccessfulResponse = async (language) => {
    i18n.changeLanguage(language);
    utils.mockFetchUnsuccessfulResponse(400, 'BAD REQUEST', {
      code: 400,
      message: 'Test Unsuccessful Response.'
    });
    await act(() => renderComponent());
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage(expectedVals.errorMessage.unsuccessfulAPIResponse.header[language],
        '400 BAD REQUEST - Test Unsuccessful Response.');
      assertTableContent();
    });
  }

  test('Page load - API call throws error - English.', async () => testAPICallErrorThrown('en'));
  test('Page load - API call throws error - Chinese.', async () => testAPICallErrorThrown('zh'));
  test('Page load - API call throws error - Japanese.', async () => testAPICallErrorThrown('ja'));
  /**
   * Runs a test case where the API call throws an `Error` with message "Arbitrary error.".
   * @param {string} language the language code
   */
  const testAPICallErrorThrown = async (language) => {
    i18n.changeLanguage(language);
    utils.mockFetchThrowError(new Error('Arbitrary error.'));
    await act(() => renderComponent());
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage(expectedVals.errorMessage.apiErrorThrown.header[language], 'Error: Arbitrary error.');
      assertTableContent();
    });
  }

  test('Page load - API call timeout - English.', async () => testAPICallTimeout('en'));
  test('Page load - API call timeout - Chinese.', async () => testAPICallTimeout('zh'));
  test('Page load - API call timeout - Japanese.', async () => testAPICallTimeout('ja'));
  /**
   * Runs a test case where the API call times out.
   * @param {string} language the language code
   */
  const testAPICallTimeout = async (language) => {
    i18n.changeLanguage(language);
    var timeoutError = new Error('API call timed out!');
    timeoutError.name = 'APITimeoutError';
    utils.mockFunctionWithDelay(utils.spyOnFetch(), 60, timeoutError);

    const loadingTextPattern = `>${expectedVals.loading[language]}<`;

    await act(() => renderComponent());
    console.log(document.body.innerHTML);
    expect(document.body.innerHTML).toMatch(loadingTextPattern);

    await act(() => utils.advanceTimersBySeconds(61));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage(expectedVals.errorMessage.apiTimeout.header[language],
        expectedVals.errorMessage.apiTimeout.body[language]);
      expect(document.body.innerHTML).not.toMatch(loadingTextPattern);
      assertTableContent();
    });
  }

  test('Select year from dropdown.', async () => {
    i18n.changeLanguage('en');
    mockSuccessfulAPICall(testData.input.year2024);
    mockSuccessfulAPICall(testData.input.year2026);

    await act(() => renderComponent());
    await waitFor(() => {
      assertDropdownValue(2024);
      assertTableContent(testData.expected.year2024.en);
    });

    await act(() => utils.fireChangeDropdownValueEvent(utils.getDropdownBoxElement('year'), 2026));
    await waitFor(() => {
      assertDropdownValue(2026);
      assertTableContent(testData.expected.year2026);
    });
  });

  test('Click navigation link - English.', async () => testClickLink('en'));
  test('Click navigation link - Chinese.', async () => testClickLink('zh'));
  test('Click navigation link - Japanese.', async () => testClickLink('ja'));
  /**
   * Runs a test case on clicking the navigation link to the Sumo Schedule Lookup page.
   * @param {string} language the language code
   */
  const testClickLink = async (language) => {
    i18n.changeLanguage(language);
    mockSuccessfulAPICall([]);
    mockSuccessfulAPICall(testData.year2024);

    await act(() => renderComponent());
    await act(() => clickNavLinkAbout(language));
    await waitFor(() => expect(utils.getTable('schedule')).not.toBeInTheDocument());
    await act(() => clickNavLinkSumo(language));
    await waitFor(() => expect(utils.getTable('schedule')).toBeInTheDocument());
  }
})

describe('Integration tests - About', () => {
  test('Open About page - English.', async () => testAbout('en'));
  test('Open About page - Chinese.', async () => testAbout('zh'));
  test('Open About page - Japanese.', async () => testAbout('ja'));
  /**
   * Runs a test case on the About page.
   * @param {string} language the language code
   */
  const testAbout = async (language) => {
    i18n.changeLanguage(language);
    mockSuccessfulAPICall([]);

    await act(() => renderComponent());
    await act(() => clickNavLinkAbout(language));
    await waitFor(() => expect(utils.getTable('about')).toHaveTextContent(
      new RegExp(`^.*${expectedVals.about.fieldLabel.version[language]}.*:.*v\\d+\\.\\d+\\.\\d+.*` +
        `${expectedVals.about.fieldLabel.author[language]}.*:.*Cecilia Wong.*$`)));
  }
})

/**
 * Fires a click event on a navigation link.
 * @param {string} page indicates the link's corresponding page
 * @param {string} language the language code
 */
const clickNavLink = (page, language) => utils.fireClickLinkEvent(expectedVals.navLinkText[page][language]);
/**
 * Fires a click event on the navigation link to the About page.
 * @param {string} language the language code
 */
const clickNavLinkAbout = (language) => clickNavLink('about', language);
/**
 * Fires a click event on the navigation link to the Sumo Schedule Lookup page.
 * @param {string} language the language code
 */
const clickNavLinkSumo = (language) => clickNavLink('sumoSchedule', language);

/**
 * Renders the component for testing.
 */
const renderComponent = () => render(<I18nextProvider i18n={i18n}><App /></I18nextProvider>);

/**
 * Mocks a successful API call.
 * @param {any[]} schedule the tournament schedule to be returned
 */
const mockSuccessfulAPICall = (schedule) => utils.mockFetchSuccessfulResponse(({ result: schedule }));
/**
 * Asserts the selected value of the Year dropdown box.
 * @param {number} year the expected selected year
 */
const assertDropdownValue = (year) => screen.getAllByRole('option').forEach((option) =>
  expect(option.selected).toBe(option.value === year.toString()));

/**
 * Asserts the schedules table content.
 * @param {{tournament: string; schedule: string}[]} tableContent the expected table content
 */
const assertTableContent = (tableContent = []) => {
  utils.assertTableRowCount(tableContent.length, true);
  utils.assertTableCells(tableContent.map(({ tournament, schedule }) => [tournament, schedule]),
    tableContent.length, 2, false);
}

/**
 * Asserts the error message displayed.
 * @param {string} header the expected message header
 * @param {string} body the expected message body
 */
const assertErrorMessage = (header, body) => {
  const errorMessageBox = document.querySelector('#errorMessage');
  expect(errorMessageBox.textContent).toMatch(new RegExp(utils.escapeRegex(header + body)));
}