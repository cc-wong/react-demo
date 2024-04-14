import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import * as utils from './testUtils';

import App from './App';

import testData from './App.test.json'

const spyFetch = jest.spyOn(global, 'fetch');

beforeAll(() => utils.mockCurrentDate('2024-04-11'));
afterEach(() => cleanup());

describe('Integration tests - Sumo Tournament Schedule Lookup', () => {
  test('Page load - Data load success.', async () => {
    mockSuccessfulAPICall(testData.input.year2024);

    await act(() => render(<App />));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertTableContent(testData.expected.year2024);
    });
  });

  test('Page load - API call throws error.', async () => {
    spyFetch.mockImplementationOnce(() => Promise.reject(new Error('Arbitrary error.')));
    await act(() => render(<App />));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage('Could not retrieve data (error on making API call)');
      assertTableContent();
    });
  });

  test('Page load - API call timeout.', async () => {
    var timeoutError = new Error('API call timed out!');
    timeoutError.name = 'APITimeoutError';
    utils.mockFunctionWithDelay(spyFetch, 60, timeoutError);

    await act(() => render(<App />));
    expect(document.querySelector('#loadingText')).toHaveTextContent("Loading...");

    await act(() => utils.advanceTimersBySeconds(61));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertErrorMessage('Request timed out. Please try again.');
      expect(document.querySelector('#loadingText')).toBeNull();
      assertTableContent();
    });
  });

  test('Select year from dropdown.', async () => {
    mockSuccessfulAPICall(testData.input.year2024);
    mockSuccessfulAPICall(testData.input.year2026);

    await act(() => render(<App />));
    await waitFor(() => {
      assertDropdownValue(2024);
      assertTableContent(testData.expected.year2024);
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