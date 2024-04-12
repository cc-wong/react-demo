import './ScheduleTable.css';
import textConfig from '../conf/text-config.json';

import moment from 'moment';
import parse from 'html-react-parser';

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month?: number; month_name?: string;}} BashoJson
 */

/**
 * Builds the results table listing the tournament schedule for the chosen year.
 * 
 * The table includes the following columns:
 * - Tournament: the description of the tournament, eg. January (Hatsu)
 * - Month: the name of the month the tournament is held in
 * - Schedule: the schedule of the tournament
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
                    <th className="Tournament">{textConfig.scheduleTable.columnNames.TOURNAMENT}</th>
                    <th>{textConfig.scheduleTable.columnNames.SCHEDULE}</th>
                </tr>
            </thead>
            <tbody>
                {records.map(({ basho, dates }, i) => {
                    return (
                        <tr key={`basho-${i}-${basho}`}>
                            <td className="Tournament">{textConfig.bashoNameMap[basho]}</td>
                            <td>{parse(printSchedule(dates))}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
}

/**
 * Prints the schedule of a tournament.
 * 
 * @param {string[]} dates the dates of the tournament as `YYYY-MM-DD` strings
 * @returns {string} the display text for the Schedule column; may contain HTML tags\
 *                      see text configuration `scheduleTable.scheduleFormat` for the content format
 *                      and `scheduleTable.dateDisplayFormat` for the date format
 */
const printSchedule = (dates) => textConfig.scheduleTable.scheduleFormat
    .replace("%DAY1%", formatDate(dates.at(0)))
    .replace("%DAY15%", formatDate(dates.at(14)));

/**
 * Formats a date from the API JSON data for display.
 * 
 * @param {string} date the date as a `YYYY-MM-DD` string
 * @returns {string} a string representation of the date formatted as configured 
 *          by `scheduleTable.dateDisplayFormat` in the text configurations
 */
const formatDate = (date) => moment(date).format(textConfig.scheduleTable.dateDisplayFormat);