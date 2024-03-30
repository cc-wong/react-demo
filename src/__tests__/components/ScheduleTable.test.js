import { render, screen, cleanup } from '@testing-library/react';
import ScheduleTable from '../../components/ScheduleTable';

import testData from './ScheduleTable.test.json';

describe('Unit tests on the table displaying the retrieved schedule for the year', () => {
    afterEach(() => {
        cleanup();
    })

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
        assertRecordRow(cells.slice(0, 2), "January (Hatsu)", "January 12 to January 26");
        assertRecordRow(cells.slice(2, 4), "March (Haru/Spring)", "March 9 to March 23");
        assertRecordRow(cells.slice(4, 6), "May (Natsu/Summer)", "May 11 to May 25");
        assertRecordRow(cells.slice(6, 8), "July (Nagoya)", "July 13 to July 27");
        assertRecordRow(cells.slice(8, 10), "September (Aki/Autumn)", "September 14 to September 28");
        assertRecordRow(cells.slice(10, 12), "November (Kyushu)", "November 9 to November 23");
    });

    test("Table with no records.", () => {
        assertTableRecords([], 0);
    });

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