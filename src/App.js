import './App.css';

import SearchScreen from './components/SearchScreen';

/**
 * The app's main function.
 * 
 * @returns the page components
 * 
 */
function App() {
  return (
    <div className="App">
      <h1>Grand Sumo Tournament Schedule</h1>
      <SearchScreen />
    </div>
  );
}

export default App;
