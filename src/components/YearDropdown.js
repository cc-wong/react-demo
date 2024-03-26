/**
 * Builds a dropdown box with items denoting the years from the current year
 * to 20 years after the current year.
 * 
 * @returns the dropdown box component with a label saying "Year"
 */
export default function YearDropdown() {
    const today = new Date();
    const thisYear = today.getFullYear();

    var options = [];
    for (var year = thisYear; year <= thisYear + 20; year++) {
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
            >
                {options}
            </select>
        </>
    );
}