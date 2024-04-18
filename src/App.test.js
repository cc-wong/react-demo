import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import * as utils from './testUtils';

import App from './App';

import testData from './App.test.json'

import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

const spyFetch = jest.spyOn(global, 'fetch');

beforeAll(() => utils.mockCurrentDate('2024-04-11'));
afterEach(() => cleanup());

describe('Integration tests - Sumo Tournament Schedule Lookup', () => {
  test('Page load - Data load success - English.', async () => testDataLoadSuccess('en'));
  test('Page load - Data load success - Chinese.', async () => testDataLoadSuccess('zh'));
  test('Page load - Data load success - Japanese.', async () => testDataLoadSuccess('ja'));

  test('Change language with language selector.', async () => {
    await testDataLoadSuccess('en');

    mockSuccessfulAPICall(testData.input.year2024);
    await act(() => fireEvent.click(screen.getByRole('button', { name: 'Language: EN' })));
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

  test('Page load - API call throws error - English.', async () =>
    testAPICallErrorThrown('en', 'Could not retrieve data (error on making API call)'));
  test('Page load - API call throws error - Chinese.', async () =>
    testAPICallErrorThrown('zh', 'Could not retrieve data (error on making API call)'));
  test('Page load - API call throws error - Japanese.', async () =>
    testAPICallErrorThrown('ja', 'Could not retrieve data (error on making API call)'));

  /**
   * Runs a test case where the API call throws an error with message "Arbitrary error.".
   * @param {string} language the language code
   * @param {*} errorMessage the expected error message
   */
  const testAPICallErrorThrown = async (language, errorMessage) => {
    i18n.changeLanguage(language);
    spyFetch.mockImplementationOnce(() => Promise.reject(new Error('Arbitrary error.')));
    await act(() => renderComponent());
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage(errorMessage);
      assertTableContent();
    });
  }

  test('Page load - API call timeout - English.', async () =>
    testAPICallTimeout('en', 'Loading...', 'Request timed out. Please try again.'));
  test('Page load - API call timeout - Chinese.', async () =>
    testAPICallTimeout('zh', 'Loading...', 'Request timed out. Please try again.'));
  test('Page load - API call timeout - Japanese.', async () =>
    testAPICallTimeout('ja', 'Loading...', 'Request timed out. Please try again.'));

  /**
   * Runs a test case where the API call times out.
   * @param {string} language the language code
   * @param {string} loadingText the expected loading text
   * @param {string} errorMessage the expected error message
   */
  const testAPICallTimeout = async (language, loadingText, errorMessage) => {
    i18n.changeLanguage(language);
    var timeoutError = new Error('API call timed out!');
    timeoutError.name = 'APITimeoutError';
    utils.mockFunctionWithDelay(spyFetch, 60, timeoutError);

    await act(() => renderComponent());
    expect(document.querySelector('#loadingText')).toHaveTextContent(loadingText);

    await act(() => utils.advanceTimersBySeconds(61));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage(errorMessage);
      expect(document.querySelector('#loadingText')).toBeNull();
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

    await act(() =>
      fireEvent.change(screen.getByRole('combobox', { name: 'year' }), { target: { value: 2026 } }));
    await waitFor(() => {
      assertDropdownValue(2026);
      assertTableContent(testData.expected.year2026);
    });
  });

})

/**
 * Renders the component for testing.
 */
const renderComponent = () => render(<I18nextProvider i18n={i18n}><App /></I18nextProvider>);

/**
 * Mocks a successful API call.
 * @param {any[]} schedule the tournament schedule to be returned
 */
const mockSuccessfulAPICall = (schedule) => utils.mockFunctionToReturnValue(spyFetch, {
  ok: true,
  status: 200,
  json: () => ({ result: schedule }),
});

/**
 * Asserts the selected value of the Year dropdown box.
 * @param {number} year the expected selected year
 */
const assertDropdownValue = (year) =>
  expect(screen.getByRole('option', { name: year }).selected).toBe(true);

/**
 * Asserts the schedules table content.
 * @param {{tournament: string; schedule: string}[]} tableContent the expected table content
 */
const assertTableContent = (tableContent = []) => {
  expect(screen.getAllByRole('row').length).toBe(tableContent.length + 1);
  if (tableContent.length > 0) {
    const cells = screen.getAllByRole('cell');
    tableContent.forEach((row, i) => {
      expect(cells.at(i * 2)).toHaveTextContent(row.tournament);
      expect(cells.at(i * 2 + 1)).toHaveTextContent(row.schedule);
    })
  }
}

/**
 * Asserts the error message displayed.
 * 
 * @param {string} message the expected error message
 */
const assertErrorMessage = (message) => {
  const errorMessageBox = document.querySelector('#errorMessage');
  expect(errorMessageBox.textContent).toMatch(new RegExp(utils.escapeRegex(message)));
}