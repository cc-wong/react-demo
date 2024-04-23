import './ScheduleTable.css';

import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next';

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
    var records = (props.data === undefined || props.data === null) ? [] : props.data;

    const { t, i18n } = useTranslation();
    return (
        <table name="schedule" aria-label="schedule" className="ScheduleTable">
            <thead>
                <tr>
                    <th className="Tournament">{t('sumoSchedLookup.column.tournament')}</th>
                    <th>{t('sumoSchedLookup.column.schedule')}</th>
                </tr>
            </thead>
            <tbody>{
                records.map(({ code, schedule }, i) => {
                    const tournamentKey = `sumoSchedLookup.tournament.${code}`;
                    if (!i18n.exists(tournamentKey)) console.warn(`No tournament name set for key "${code}"!`);
                    return (
                        <tr key={`tournament-${i}-${code}`}>
                            <td className="Tournament">
                                {(i18n.exists(tournamentKey) && t(tournamentKey)) || code}
                            </td>
                            <td>{parse(formatSchedule(schedule, t))}</td>
                        </tr>
                    )
                })}</tbody>
        </table>
    );
}

/**
 * Formats the schedule of a tournament for display.
 * @param {Date[]} schedule the dates of the tournament
 * @returns {string} the display text for the Schedule column; may contain HTML tags
 */
const formatSchedule = (schedule, t) => t('sumoSchedLookup.scheduleFormat',
    { 'day1': schedule.at(0), 'day15': schedule.at(14) });