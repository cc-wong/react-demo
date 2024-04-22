import { getCurrentYear, getJapaneseYear } from "../../utils/DateUtils";
import config from '../../conf/config.json';
import { useTranslation } from "react-i18next";

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
    const { t, i18n } = useTranslation();
    return (
        <>
            <label htmlFor="year">{t('sumoSchedLookup.year')}</label>
            &nbsp;&nbsp;
            <select id="year" name="year"
                aria-required="true" aria-label="year"
                defaultValue={props.selectedYear}
                onChange={props.onChangeEvent}>
                {buildDropdownOptions(i18n.language)}
            </select>
        </>
    );
}

/**
 * Builds the dropdown box options.
 * @param {string} language the current language code
 * @returns {any[]} a list of `<option>` elements for years from (current year)
 *                  to (current year + `yearDropdown.maxYearsFromCurrent`);
 *                  if the current language is Japanese, the option label will
 *                  also include the corresponding Japanese year
 */
const buildDropdownOptions = (language) => {
    var options = [];
    var year = getCurrentYear();
    var i = config.yearDropdown.maxYearsFromCurrent + 1;
    while (i--) {
        options.push(
            <option key={`year-${year.toString()}`} value={year}>
                {language === 'ja' ? `${getJapaneseYear(year).join('/')} (${year})` : year}
            </option>);
        year++;
    }
    return options;
}