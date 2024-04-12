import { getCurrentYear } from "../utils/DateUtils";
import config from '../conf/config.json';
import textConfig from '../conf/text-config.json';

/**
 * Builds a dropdown box with items denoting the current year
 * and the next several years.
 * 
 * The maximum number of years from the current year is configued by
 * `yearDropdown.maxYearsFromCurrent`.
 * 
 * @param {{selectedYear: number; onChangeEvent: ((event: any) => void)}} props
 *          the argument(s) to pass to this component
 * @returns the dropdown box component with a label saying "Year"
 */
export default function YearDropdown(props) {
    return (
        <>
            <label htmlFor="year">{textConfig.yearDropdown.label}</label>
            &nbsp;&nbsp;
            <select id="year" name="year"
                aria-required="true" aria-label="year"
                defaultValue={props.selectedYear}
                onChange={props.onChangeEvent}>
                {buildDropdownOptions()}
            </select>
        </>
    );
}

/**
 * Builds the dropdown box options.
 * 
 * @returns {any[]} a list of `<option>` elements for years from (current year)
 *                  to (current year + `yearDropdown.maxYearsFromCurrent`)
 */
const buildDropdownOptions = () => {
    var options = [];
    var year = getCurrentYear();
    var i = config.yearDropdown.maxYearsFromCurrent + 1;
    while (i--) {
        options.push(<option key={`year-${year.toString()}`} value={year}>{year}</option>);
        year++;
    }
    return options;
}