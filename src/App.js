import './App.css';

import SearchScreen from './components/SearchScreen';
import textConfig from './conf/text-config.json';

/**
 * The app's main component.
 */
export default function App() {
  return (
    <div className="App">
      <h1>{textConfig.title}</h1>
      <SearchScreen />
    </div>
  );
}