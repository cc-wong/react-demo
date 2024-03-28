import './SearchScreen.css';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import { getCurrentYear } from './DateUtils';

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
    const [year, setYear] = useState(getCurrentYear);
    const [apiData, setApiData] = useState({ result: [] });

    useEffect(() => {
        var data = getData(year);
        setApiData(data);
    }, [year]);

    return (
        <div className='SearchScreen'>
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={((event) => {
                        setYear(event.target.value);
                    })} />
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
