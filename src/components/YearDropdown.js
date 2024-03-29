import { getCurrentYear } from "../utils/DateUtils";
import config from '../conf/config.json';
import textConfig from '../conf/text-config.json';

/**
 * Builds a dropdown box with items denoting the years from the current year
 * to 20 years after the current year.
 * 
 * @param {{selectedYear: number; onChangeEvent: ((event: any) => void)}} props
 *          the argument(s) to pass to this component
 * @returns the dropdown box component with a label saying "Year"
 */
export default function YearDropdown(props) {
    var thisYear = getCurrentYear();
    var selectedYear = props.selectedYear;

    var options = [];
    for (var year = thisYear; year <= thisYear + config.yearDropdown.maxYearsFromCurrent; year++) {
        options.push(
            <option key={'year' + year.toString()} value={year}>{year}</option>
        );
    }
    return (
        <>
            <label htmlFor="year">{textConfig.yearDropdown.label}</label>
            &nbsp;&nbsp;
            <select id="year" name="year"
                aria-required="true" aria-label="year"
                defaultValue={selectedYear}
                onChange={props.onChangeEvent}>
                {options}
            </select>
        </>
    );
}