import './App.css';

import YearDropdown from './components/YearDropdown';
import ScheduleTable from './components/ScheduleTable';

/**
 * The app's main function.
 * 
 * @returns the page components
 */
function App() {
  return (
    <div className="App">
      <h1>Grand Sumo Tournament Schedule</h1>
      <form>
        <YearDropdown />
      </form>
      <ScheduleTable />
    </div>
  );
}

export default App;
