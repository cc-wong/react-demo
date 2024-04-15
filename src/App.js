import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchScreen from './components/SearchScreen';
import NavBar from './components/NavBar';
import * as envUtils from './utils/EnvironmentUtils';

/**
 * The app's main component.
 */
export default function App() {
  console.info(`App version: ${envUtils.getAppVersionNumber()}`);
  return (
    <Router>
      <NavBar />
      <main className='MainContent'>
        <Routes>
          <Route path="/" element={<SearchScreen />} />
        </Routes>
      </main>
    </Router>
  );
}