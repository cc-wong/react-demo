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
        expect(headers.length).toBe(3);
        const expectedHeaderLabels = ["Tournament", "Month", "Schedule"];
        expectedHeaderLabels.forEach((label, i) => {
            expect(headers.at(i)).toHaveTextContent(label);
        });
    });

    test("Table with records.", () => {
        assertTableRecords(testData.dataFromApi, 6);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(18);
        assertRecordRow(cells.slice(0, 3), "Hatsu", "January", "January 12 to January 26");
        assertRecordRow(cells.slice(3, 6), "Haru", "March", "March 9 to March 23");
        assertRecordRow(cells.slice(6, 9), "Natsu", "May", "May 11 to May 25");
        assertRecordRow(cells.slice(9, 12), "Nagoya", "July", "July 13 to July 27");
        assertRecordRow(cells.slice(12, 15), "Aki", "September", "September 14 to September 28");
        assertRecordRow(cells.slice(15, 18), "Kyushu", "November", "November 9 to November 23");
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
     * @param {string} month the expected text of the Month column
     * @param {string} dates the expected text of the Schedule column
     */
    function assertRecordRow(rowCells, basho, month, dates) {
        expect(rowCells.at(0)).toHaveTextContent(basho);
        expect(rowCells.at(1)).toHaveTextContent(month);
        expect(rowCells.at(2)).toHaveTextContent(dates);
    }

});