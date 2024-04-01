import './App.css';

import SearchScreen from './components/SearchScreen';
import textConfig from './conf/text-config.json';
import { getApiUrl } from './utils/EnvironmentUtils';

/**
 * The app's main component.
 */
export default function App() {
  console.debug(`API URL format: ${getApiUrl()}`)
  return (
    <div className="App">
      <h1>{textConfig.title}</h1>
      <SearchScreen />
    </div>
  );
}