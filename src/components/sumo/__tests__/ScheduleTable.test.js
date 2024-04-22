import { render, screen, cleanup } from '@testing-library/react';
import { parseToTournament } from '../../../testUtils';

import ScheduleTable from '../ScheduleTable';

import i18n from '../../../i18n';
import { I18nextProvider } from 'react-i18next';

import testData from './ScheduleTable.test.json';

afterEach(() => cleanup());

describe('Verify screen components', () => {
    test("Table headings - English.", () => testTableHeadings('en', 'Tournament', 'Schedule'));
    test("Table headings - Chinese.", () => testTableHeadings('zh', '場地', '日期'));
    test("Table headings - Japanese.", () => testTableHeadings('ja', '場所', '日付'));

    /**
     * Runs a test case on the table headings.
     * @param {string} tournament expected heading of the Tournament column
     * @param {string} schedule expected heading of the Schedule column
     */
    const testTableHeadings = (languageCode, tournament, schedule) => {
        i18n.changeLanguage(languageCode);
        renderComponent([]);
        expect(screen.getAllByRole('columnheader').map((header) => header.innerHTML))
            .toEqual([tournament, schedule]);
    }
})

describe('Verify table content', () => {
    test('With records - normal case - English.', () => testNormalCase('en'));
    test('With records - normal case - Chinese.', () => testNormalCase('zh'));
    test('With records - normal case - Japanese.', () => testNormalCase('ja'));
    test('With records - invalid tournament code - English.', () => testInvalidTournamentCode('en'));
    test('With records - invalid tournament code - Chinese.', () => testInvalidTournamentCode('zh'));
    test('With records - invalid tournament code - Japanese.', () => testInvalidTournamentCode('ja'));

    const testNormalCase = (languageCode) => testTableWithRecords(languageCode, testData.normal);
    const testInvalidTournamentCode = (languageCode) =>
        testTableWithRecords(languageCode, testData.invalidTournamentCode);

    /**
     * Runs a test case expecting a table with records.
     * @param {string} languageCode the language code
     * @param {any} data test data
     */
    const testTableWithRecords = (languageCode, data) => {
        i18n.changeLanguage(languageCode);
        assertTableRecords(parseToTournament(data.dataFromApi), data.expected[languageCode].length);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(2 * data.expected[languageCode].length);
        data.expected[languageCode].forEach((expectedText, i) =>
            assertRecordRow(cells.slice(i * 2, i * 2 + 2), expectedText));
    }

    describe('With no records.', () => {
        test("Property 'data' is an empty list.", () => assertTableRecords([], 0));
        test("Property 'data' is undefined.", () => assertTableRecords(undefined, 0));
        test("Property 'data' is null.", () => assertTableRecords(null, 0));
    })
});

/**
 * Renders the component for testing.
 * @param {any[]} data the schedule data to pass to the component
 */
const renderComponent = (data) =>
    render(<I18nextProvider i18n={i18n}><ScheduleTable data={data} /></I18nextProvider>);

/**
 * Runs a test case on populating table records.
 * 
 * @param {any[]} dataFromApi the records from the API call
 * @param {number} expectedRecordCount the expected number of records in the table
 */
const assertTableRecords = (dataFromApi, expectedRecordCount) => {
    renderComponent(dataFromApi);
    expect(screen.getAllByRole('row').length - 1).toBe(expectedRecordCount);
}

/**
 * Verifies a given record row.
 * @param {any[]} rowCells  the cells of the row to check
 * @param {{tournament: string; schedule: string}} text the expected text of the columns 
 */
const assertRecordRow = (rowCells, { tournament, schedule }) => {
    expect(rowCells.at(0)).toHaveTextContent(tournament);
    expect(rowCells.at(1)).toHaveTextContent(schedule);
}