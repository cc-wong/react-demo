import './App.css';

import SearchScreen from './components/SearchScreen';
import textConfig from './conf/text-config.json';
import * as envUtils from './utils/EnvironmentUtils';

/**
 * The app's main component.
 */
export default function App() {
  console.info(`App version: ${envUtils.getAppVersionNumber()}`);
  return (
    <div className="App">
      <h1>{textConfig.title}</h1>
      <SearchScreen />
    </div>
  );
}