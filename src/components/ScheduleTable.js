import "./ScheduleTable.css";

import moment from "moment";

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
 */

/**
 * Builds the results table listing the tournament schedule for the chosen year.
 * 
 * The table includes the following columns:
 * - Tournament: the name of the tournament, eg. Hatsu
 * - Month: the name of the month the tournament is held in
 * - Schedule: the schedule of the tournament as `MMMM D to MMMM D`,
 *   eg. January 8 to January 22
 * 
 * @param {{data: BashoJson[]}} props input arguments to this component
 * 
 * @returns the table component with name `schedule`
 */
export default function ScheduleTable(props) {
    var records = props.data === undefined || props.data === null ? [] : props.data;
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
 * Mapping for the tournament name.
 */
const bashoNameMap = {
    HATSU: "Hatsu",
    HARU: "Haru",
    NATSU: "Natsu",
    NAGOYA: "Nagoya",
    AKI: "Aki",
    KYUSHU: "Kyushu"
};

/**
 * Prints the name of the tournament.
 * 
 * @param {BashoJson} record denotes the schedule of a tournament
 * @returns the tournament's full name 
 */
function printBasho(record) {
    return bashoNameMap[record.basho];
}

/**
 * Prints the month of the tournament.
 * 
 * @param {BashoJson} record denotes the schedule of a tournament
 * @returns the name of the month of the tournament
 */
function printMonth(record) {
    return record.month_name;
}

/**
 * The format for displaying dates at the screen.
 * 
 * Example: 22-1-2024 -> January 22
 */
const dateDisplayFormat = "MMMM D";
/**
 * Prints the dates of the tournament.
 * 
 * @param {BashoJson} record denotes the schedule of a tournament
 * @returns {string} the dates as `MMMM D to MMMM D`, eg. January 8 to January 22
 */
function printScheduleDates(record) {
    var day1 = moment(record.dates.at(0)).format(dateDisplayFormat);
    var day15 = moment(record.dates.at(14)).format(dateDisplayFormat);
    return `${day1} to ${day15}`;
}