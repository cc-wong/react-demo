import { getCurrentYear } from "./DateUtils";

/**
 * The dropdown box will have values
 * from the current year to this number of years from the current year.
 */
const maxNumOfYearsFromCurrentYear = 20;

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
    for (var year = thisYear; year <= thisYear + maxNumOfYearsFromCurrentYear; year++) {
        options.push(
            <option key={'year' + year.toString()} value={year}>{year}</option>
        );
    }
    return (
        <>
            <label htmlFor="year">Year</label>
            &nbsp;&nbsp;
            <select id="year" name="year"
                aria-required="true" aria-label="Year"
                defaultValue={selectedYear}
                onChange={props.onChangeEvent}
            >
                {options}
            </select>
        </>
    );
}