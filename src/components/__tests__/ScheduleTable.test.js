import { render, screen, cleanup } from '@testing-library/react';
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
        assertTableRecords(testData.dataFromApi, 6);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(2 * 6);
        assertRecordRow(cells.slice(0, 2), "January (Hatsu)", "January 12 (Sunday) to January 26 (Sunday)");
        assertRecordRow(cells.slice(2, 4), "March (Haru/Spring)", "March 9 (Sunday) to March 23 (Sunday)");
        assertRecordRow(cells.slice(4, 6), "May (Natsu/Summer)", "May 11 (Sunday) to May 25 (Sunday)");
        assertRecordRow(cells.slice(6, 8), "July (Nagoya)", "July 13 (Sunday) to July 27 (Sunday)");
        assertRecordRow(cells.slice(8, 10), "September (Aki/Autumn)", "September 14 (Sunday) to September 28 (Sunday)");
        assertRecordRow(cells.slice(10, 12), "November (Kyushu)", "November 9 (Sunday) to November 23 (Sunday)");
    });

    describe('Table with no records', () => {
        test("Property 'data' is an empty list.", () => assertTableRecords([], 0));
        test("Property 'data' is undefined.", () => assertTableRecords(undefined, 0));
        test("Property 'data' is null.", () => assertTableRecords(null, 0));
    })

    /**
     * Runs a test case on populating table records.
     * 
     * @param {Array} dataFromApi the records from the API call
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
     * @param {string} basho the expected text of the Tournament column
     * @param {string} dates the expected text of the Schedule column
     */
    function assertRecordRow(rowCells, basho, dates) {
        expect(rowCells.at(0)).toHaveTextContent(basho);
        expect(rowCells.at(1)).toHaveTextContent(dates);
    }
});