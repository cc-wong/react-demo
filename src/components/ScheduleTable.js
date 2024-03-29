import "./ScheduleTable.css";
import textConfig from '../conf/text-config.json';

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
        <table name="schedule" aria-label="schedule" className="ScheduleTable">
            <thead>
                <tr>
                    <th>{textConfig.scheduleTable.columnNames.TOURNAMENT}</th>
                    <th>{textConfig.scheduleTable.columnNames.MONTH}</th>
                    <th>{textConfig.scheduleTable.columnNames.SCHEDULE}</th>
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
 * @param {BashoJson} record denotes the schedule of a tournament
 * @returns the tournament's full name 
 */
function printBasho(record) {
    return textConfig.bashoNameMap[record.basho];
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
 * Prints the dates of the tournament.
 * 
 * @param {BashoJson} record denotes the schedule of a tournament
 * @returns {string} the dates as `MMMM D to MMMM D`, eg. January 8 to January 22
 */
function printScheduleDates(record) {
    var day1 = formatDate(record.dates.at(0));
    var day15 = formatDate(record.dates.at(14));
    return `${day1} to ${day15}`;
}

/**
 * Formats a date from the API JSON data for display.
 * 
 * @param {string} date the date as a `YYYY-MM-DD` string
 * @returns {string} a string representation of the date formatted as configured 
 *          by `scheduleTable.dateDisplayFormat` in the text configurations
 */
const formatDate = (date) => moment(date).format(textConfig.scheduleTable.dateDisplayFormat);