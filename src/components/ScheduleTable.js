import "./ScheduleTable.css";

/**
 * Builds the results table listing the tournament schedule for the chosen year.
 * The table includes the following columns:
 * - Tournament: the name of the tournament, eg. Hatsu
 * - Month: the name of the month the tournament is held in
 * - Schedule: the schedule of the tournament as `MMMM D to MMMM D`,
 *   eg. January 8 to January 22
 * 
 * @returns the table component with name `schedule`
 */
export default function ScheduleTable() {
    const records = getDummyRecords();
    return (
        <table name="schedule" className="ScheduleTable">
            <thead>
                <tr>
                    <th>Tournament</th>
                    <th>Month</th>
                    <th>Schedule</th>
                </tr>
            </thead>
            <tbody>
                {records.map((record, i) => {
                    return (
                        <tr key={'basho-' + i + '-' + record.basho}>
                            <td>{printBasho(record)}</td>
                            <td>{printMonth(record)}</td>
                            <td>{printScheduleDates(record)}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
}

/**
 * Prints the name of the tournament.
 * 
 * @param record denotes the schedule of a tournament
 * @returns the tournament's full name 
 */
function printBasho(record) {
    return record.basho;
}

/**
 * Prints the month of the tournament.
 * 
 * @param record denotes the schedule of a tournament
 * @returns the name of the month of the tournament
 */
function printMonth(record) {
    return record.month;
}

/**
 * Prints the dates of the tournament.
 * 
 * @param record denotes the schedule of a tournament
 * @returns the dates as `MMMM D to MMMM D`, eg. January 8 to January 22
 */
function printScheduleDates(record) {
    return record.dates;
}

function getDummyRecords() {
    return [
        {
            basho: "Hatsu",
            month: "January",
            dates: "January 14 to January 28"
        },
        {
            basho: "Haru",
            month: "March",
            dates: "March 10 to March 24"
        },
        {
            basho: "Natsu",
            month: "May",
            dates: "May 12 to May 26"
        },
        {
            basho: "Nagoya",
            month: "July",
            dates: "July 14 to July 28"
        },
        {
            basho: "Aki",
            month: "September",
            dates: "September 8 to September 22"
        },
        {
            basho: "Kyushu",
            month: "November",
            dates: "November 10 to November 24"
        },
    ];
}  