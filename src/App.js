import './App.css';

import SearchScreen from './components/SearchScreen';
import textConfig from './conf/text-config.json';
import * as envUtils from './utils/EnvironmentUtils';

import parse from 'html-react-parser';

/**
 * The app's main component.
 */
export default function App() {
  console.debug(`App version: ${envUtils.getAppVersionNumber()}\n` +
    `API URL format: ${envUtils.getApiUrl()}\n` +
    `Is remote API? ${envUtils.isRemoteApi()}`);
  return (
    <div className="App">
      <h1>{textConfig.title}</h1>
      <SearchScreen />
      {
        envUtils.isRemoteApi() &&
        (<div className="RemoteApiRemark" id="remoteApiRemark">
          {parse(textConfig.remoteApiRemark)}
        </div>)
      }
    </div>
  );
}