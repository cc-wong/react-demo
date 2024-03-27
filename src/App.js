import './App.css';

import YearDropdown from './components/YearDropdown';
import ScheduleTable from './components/ScheduleTable';

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
 */

/**
 * The app's main function.
 * 
 * @returns the page components
 * 
 */
function App() {
  // TODO: Get year from form, or use current year.
  var year = (new Date()).getFullYear();

  // Get data from API call.
  var apiData = getData();

  return (
    <div className="App">
      <h1>Grand Sumo Tournament Schedule</h1>
      <form id="pickYear" name="pickYear" method='GET'>
        <YearDropdown selectedYear={year} />
      </form>
      <ScheduleTable data={apiData.result} />
    </div>
  );
}

/**
 * Gets the data for display.
 * 
 * @returns {{result: BashoJson[]}} the data in JSON format
 */
function getData() {
  return require('./data/getSumoHonbashoSchedule.json');
}

export default App;
