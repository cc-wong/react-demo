import { render, screen, cleanup } from '@testing-library/react';
import ScheduleTable from '../components/ScheduleTable';

// afterEach function runs after each test suite is executed
afterEach(() => {
    cleanup();
})

test("Assert table name.", () => {
    render(<ScheduleTable />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute("name", "schedule");
});

test("Assert table headings.", () => {
    render(<ScheduleTable />);
    const table = screen.getByRole('table');

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(3);
    const expectedHeaderLabels = ["Tournament", "Month", "Schedule"];
    expectedHeaderLabels.forEach((label, i) => {
        expect(headers.at(i)).toHaveTextContent(label);
    });
});

test("Assert load records.", () => {
    render(<ScheduleTable />);
    const table = screen.getByRole('table');

    const expectedRecordCount = 6;
    const rows = screen.getAllByRole('row');
    expect(rows.length - 1).toBe(expectedRecordCount);
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(expectedRecordCount * 3);

    assertRecordRow(cells.slice(0, 3), "Hatsu", "January", "January 14 to January 28");
    assertRecordRow(cells.slice(3, 6), "Haru", "March", "March 10 to March 24");
    assertRecordRow(cells.slice(6, 9), "Natsu", "May", "May 12 to May 26");
    assertRecordRow(cells.slice(9, 12), "Nagoya", "July", "July 14 to July 28");
    assertRecordRow(cells.slice(12, 15), "Aki", "September", "September 8 to September 22");
    assertRecordRow(cells.slice(15, 18), "Kyushu", "November", "November 10 to November 24");
});

function assertRecordRow(columns, basho, month, dates) {
    expect(columns.at(0)).toHaveTextContent(basho);
    expect(columns.at(1)).toHaveTextContent(month);
    expect(columns.at(2)).toHaveTextContent(dates);
}