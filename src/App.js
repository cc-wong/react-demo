import './App.css';

import SearchScreen from './components/SearchScreen';
import textConfig from './conf/text-config.json';

/**
 * The app's main function.
 * 
 * @returns the page components
 * 
 */
function App() {
  return (
    <div className="App">
      <h1>{textConfig.title}</h1>
      <SearchScreen />
    </div>
  );
}

export default App;
