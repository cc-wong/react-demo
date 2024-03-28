import './SearchScreen.css';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import { getCurrentYear } from './DateUtils';

/**
 * The base URL for the API call.
 * 
 * Hard-coding is temporary. To be configurable later.
 */
const apiBaseUrl = "http://localhost:5000";
// const apiBaseUrl = "https://python-webservice-demo.onrender.com";

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
        const url = `${apiBaseUrl}/getSumoHonbashoSchedule?year=${year}`;
        console.debug(`API URL: ${url}`);
        fetch(url)
            .then((response) => {
                // console.debug(response.status+": "+response.ok);
                return response.json();
            })
            .then(setApiData);
    }, [year]);

    return (
        <div className='SearchScreen'>
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={((event) => setYear(event.target.value))} />
            </form>
            <ScheduleTable data={apiData.result} />
        </div>
    );
}