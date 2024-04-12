import { render, screen, cleanup } from '@testing-library/react';
import { parseToTournament } from '../../testUtils';

import ScheduleTable from '../ScheduleTable';

import testData from './ScheduleTable.test.json';

afterEach(() => cleanup());

describe('Verify screen components', () => {
    test("Table headings.", () => {
        render(<ScheduleTable data={[]} />);

        const headers = screen.getAllByRole('columnheader');
        const headerLabels = ["Tournament", "Schedule"];
        expect(headers.length).toBe(headerLabels.length);
        headerLabels.forEach((label, i) => expect(headers.at(i)).toHaveTextContent(label));
    });
})

describe('Verify table content', () => {
    test('With records - normal case.', () => testTableWithRecords(testData.normal));
    test('With records - invalid tournament code.', () =>
        testTableWithRecords(testData.invalidTournamentCode));

    const testTableWithRecords = (data) => {
        assertTableRecords(parseToTournament(data.dataFromApi), data.expected.length);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(2 * data.expected.length);
        data.expected.forEach((expectedText, i) =>
            assertRecordRow(cells.slice(i * 2, i * 2 + 2), expectedText));
    }

    describe('With no records.', () => {
        test("Property 'data' is an empty list.", () => assertTableRecords([], 0));
        test("Property 'data' is undefined.", () => assertTableRecords(undefined, 0));
        test("Property 'data' is null.", () => assertTableRecords(null, 0));
    })
});

/**
 * Runs a test case on populating table records.
 * 
 * @param {any[]} dataFromApi the records from the API call
 * @param {number} expectedRecordCount the expected number of records in the table
 */
const assertTableRecords = (dataFromApi, expectedRecordCount) => {
    render(<ScheduleTable data={dataFromApi} />);

    const rows = screen.getAllByRole('row');
    expect(rows.length - 1).toBe(expectedRecordCount);
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