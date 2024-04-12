import { render, screen, cleanup } from '@testing-library/react';
import { parseToTournament } from '../../testUtils';

import ScheduleTable from '../ScheduleTable';

import testData from './ScheduleTable.test.json';

describe('Unit tests on the table displaying the retrieved schedule for the year', () => {
    afterEach(() => cleanup());

    test("Table headings.", () => {
        render(<ScheduleTable data={[]} />);

        const headers = screen.getAllByRole('columnheader');
        const expectedHeaderLabels = ["Tournament", "Schedule"];
        expect(headers.length).toBe(expectedHeaderLabels.length);
        expectedHeaderLabels.forEach((label, i) => {
            expect(headers.at(i)).toHaveTextContent(label);
        });
    });

    test("Table with records.", () => {
        assertTableRecords(parseToTournament(testData.dataFromApi), 6);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(2 * testData.expected.length);
        testData.expected.forEach(({ tournament, schedule }, i) =>
            assertRecordRow(cells.slice(i * 2, i * 2 + 2), tournament, schedule));
    });

    describe('Table with no records', () => {
        test("Property 'data' is an empty list.", () => assertTableRecords([], 0));
        test("Property 'data' is undefined.", () => assertTableRecords(undefined, 0));
        test("Property 'data' is null.", () => assertTableRecords(null, 0));
    })

    /**
     * Runs a test case on populating table records.
     * 
     * @param {any[]} dataFromApi the records from the API call
     * @param {number} expectedRecordCount the expected number of records in the table
     */
    function assertTableRecords(dataFromApi, expectedRecordCount) {
        render(<ScheduleTable data={dataFromApi} />);

        const rows = screen.getAllByRole('row');
        expect(rows.length - 1).toBe(expectedRecordCount);
    }

    /**
     * Verifies a given record row.
     * 
     * @param {Array} rowCells the cells of the row to check
     * @param {string} tournament the expected text of the Tournament column
     * @param {string} schedule the expected text of the Schedule column
     */
    function assertRecordRow(rowCells, tournament, schedule) {
        expect(rowCells.at(0)).toHaveTextContent(tournament);
        expect(rowCells.at(1)).toHaveTextContent(schedule);
    }
});