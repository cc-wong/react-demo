import './SearchScreen.css';

import { useRef, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
 */

/**
 * Populates the search screen which includes a dropdown for the year
 * and the results table.
 * 
 * @returns a wrapper component including the dropdown and table
 */
export default function SearchScreen() {
    var currentYear = (new Date()).getFullYear();
    const [year, setYear] = useState(currentYear);
    const [apiData, setApiData] = useState(getData(year));

    /**
     * Event handling for changing the value of the year dropdown.
     * 
     * @param {*} event the event
     */
    function handleChangeYear(event) {
        var year = event.target.value;
        setYear(year);
        setApiData(getData(year));
    }

    var yearForm = useRef();
    return (
        <div className='SearchScreen'>
            <form ref={yearForm} name='pickYear'>
                <YearDropdown selectedYear={year} onChangeEvent={handleChangeYear} />
            </form>
            <ScheduleTable data={apiData.result} />
        </div>
    );
}

/**
 * Gets the data for display.
 * 
 * @param {number} year the year to query
 * @returns {{result: BashoJson[]}} the data in JSON format
 */
function getData(year) {
    if (year % 2 === 0) {
        return require('./getSumoHonbashoSchedule-even.json');
    }
    return require('./getSumoHonbashoSchedule-odd.json');
}
