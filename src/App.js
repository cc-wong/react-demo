import './App.css';

import YearDropdown from './components/YearDropdown';

function App() {
  return (
    <div className="App">
      <h1>Grand Sumo Tournament Schedule</h1>
      <form>
        <YearDropdown />
      </form>

      <table name="schedule">
        <thead>
          <tr>
            <th>Tournament</th>
            <th>Month</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hatsu</td>
            <td>January</td>
            <td>January 14 to January 28</td>
          </tr>
          <tr>
            <td>Haru</td>
            <td>March</td>
            <td>March 10 to March 24</td>
          </tr>
          <tr>
            <td>Natsu</td>
            <td>May</td>
            <td>May 12 to May 26</td>
          </tr>
          <tr>
            <td>Nagoya</td>
            <td>July</td>
            <td>July 14 to July 28</td>
          </tr>
          <tr>
            <td>Aki</td>
            <td>September</td>
            <td>September 8 to September 22</td>
          </tr>
          <tr>
            <td>Kyushu</td>
            <td>November</td>
            <td>November 10 to November 24</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
