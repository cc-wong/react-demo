import { render, screen, cleanup } from '@testing-library/react';
import ScheduleTable from '../../components/ScheduleTable';

describe('Unit tests on the table displaying the retrieved schedule for the year', () => {
    afterEach(() => {
        cleanup();
    })

    test("Assert table name.", () => {
        render(<ScheduleTable data={[]} />);
        const table = screen.getByRole('table');
        expect(table).toHaveAttribute("name", "schedule");
    });

    test("Assert table headings.", () => {
        render(<ScheduleTable data={[]} />);

        const headers = screen.getAllByRole('columnheader');
        expect(headers.length).toBe(3);
        const expectedHeaderLabels = ["Tournament", "Month", "Schedule"];
        expectedHeaderLabels.forEach((label, i) => {
            expect(headers.at(i)).toHaveTextContent(label);
        });
    });

    test("Assert table with records.", () => {
        const dataFromApi = [
            {
                "basho": "HATSU",
                "dates": [
                    "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16",
                    "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-01-21",
                    "2025-01-22", "2025-01-23", "2025-01-24", "2025-01-25", "2025-01-26"
                ],
                "month": 1,
                "month_name": "January"
            },
            {
                "basho": "HARU",
                "dates": [
                    "2025-03-09", "2025-03-10", "2025-03-11", "2025-03-12", "2025-03-13",
                    "2025-03-14", "2025-03-15", "2025-03-16", "2025-03-17", "2025-03-18",
                    "2025-03-19", "2025-03-20", "2025-03-21", "2025-03-22", "2025-03-23"
                ],
                "month": 3,
                "month_name": "March"
            },
            {
                "basho": "NATSU",
                "dates": [
                    "2025-05-11", "2025-05-12", "2025-05-13", "2025-05-14", "2025-05-15",
                    "2025-05-16", "2025-05-17", "2025-05-18", "2025-05-19", "2025-05-20",
                    "2025-05-21", "2025-05-22", "2025-05-23", "2025-05-24", "2025-05-25"
                ],
                "month": 5,
                "month_name": "May"
            },
            {
                "basho": "NAGOYA",
                "dates": [
                    "2025-07-13", "2025-07-14", "2025-07-15", "2025-07-16", "2025-07-17",
                    "2025-07-18", "2025-07-19", "2025-07-20", "2025-07-21", "2025-07-22",
                    "2025-07-23", "2025-07-24", "2025-07-25", "2025-07-26", "2025-07-27"
                ],
                "month": 7,
                "month_name": "July"
            },
            {
                "basho": "AKI",
                "dates": [
                    "2025-09-14", "2025-09-15", "2025-09-16", "2025-09-17", "2025-09-18",
                    "2025-09-19", "2025-09-20", "2025-09-21", "2025-09-22", "2025-09-23",
                    "2025-09-24", "2025-09-25", "2025-09-26", "2025-09-27", "2025-09-28"
                ],
                "month": 9,
                "month_name": "September"
            },
            {
                "basho": "KYUSHU",
                "dates": [
                    "2025-11-09", "2025-11-10", "2025-11-11", "2025-11-12", "2025-11-13",
                    "2025-11-14", "2025-11-15", "2025-11-16", "2025-11-17", "2025-11-18",
                    "2025-11-19", "2025-11-20", "2025-11-21", "2025-11-22", "2025-11-23"
                ],
                "month": 11,
                "month_name": "November"
            }
        ];
        assertTableRecords(dataFromApi, 6);

        const cells = screen.getAllByRole('cell');
        expect(cells.length).toBe(18);
        assertRecordRow(cells.slice(0, 3), "Hatsu", "January", "January 12 to January 26");
        assertRecordRow(cells.slice(3, 6), "Haru", "March", "March 9 to March 23");
        assertRecordRow(cells.slice(6, 9), "Natsu", "May", "May 11 to May 25");
        assertRecordRow(cells.slice(9, 12), "Nagoya", "July", "July 13 to July 27");
        assertRecordRow(cells.slice(12, 15), "Aki", "September", "September 14 to September 28");
        assertRecordRow(cells.slice(15, 18), "Kyushu", "November", "November 9 to November 23");
    });

    test("Assert table with no records.", () => {
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