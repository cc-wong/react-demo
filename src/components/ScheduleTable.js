import './ScheduleTable.css';
import textConfig from '../conf/text-config.json';

import parse from 'html-react-parser';
import { formatDate } from '../utils/DateUtils';

/**
 * Builds the results table listing the tournament schedule for the chosen year.
 * 
 * The table includes the following columns:
 * - Tournament: the description of the tournament, eg. January (Hatsu)
 * - Schedule: the schedule of the tournament
 * 
 * @param {{data: Tournament[]}} props input arguments to this component
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
                {records.map(({ code, schedule }, i) => {
                    return (
                        <tr key={`tournament-${i}-${code}`}>
                            <td className="Tournament">{printName(code)}</td>
                            <td>{parse(printSchedule(schedule))}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
}

/**
 * Prints the tournament name configured in `text-config.json` for a given code.
 * @param {string} code the tournament code
 * @returns the configured name; if the code is not a valid one,
 *          print a warning in the console and return the code
 */
const printName = (code) => {
    if (code in textConfig.tournamentNameMap) return textConfig.tournamentNameMap[code];
    console.warn(`Unrecognized tournament code: ${code}`);
    return code;
}

/**
 * Prints the schedule of a tournament.
 * 
 * @param {Date[]} schedule the dates of the tournament
 * @returns {string} the display text for the Schedule column; may contain HTML tags\
 *                      see text configuration `scheduleTable.scheduleFormat` for the content format
 *                      and `scheduleTable.dateDisplayFormat` for the date format
 */
const printSchedule = (schedule) => textConfig.scheduleTable.scheduleFormat
    .replace("%DAY1%", formatDate(schedule.at(0), textConfig.scheduleTable.dateDisplayFormat))
    .replace("%DAY15%", formatDate(schedule.at(14), textConfig.scheduleTable.dateDisplayFormat));