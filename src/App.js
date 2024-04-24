import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from './components/nav/NavBar';
import SumoScheduleLookup from './components/SumoScheduleLookup';
import About from './components/About';

import { getAppVersionNumber } from './utils/EnvironmentUtils';

import config from './conf/config.json';

/**
 * The app's main component.
 */
export default function App() {
  console.info(`App version: ${getAppVersionNumber()}`);
  const elements = {
    sumoSchedule: (<SumoScheduleLookup />),
    about: (<About />)
  };
  return (
    <Router>
      <NavBar />
      <main className='MainContent'>
        <Routes>
          {config.routes.map((route) =>
            (<Route key={`route-${route.code}`} path={route.path} element={elements[route.code]} />))}
        </Routes>
      </main>
    </Router>
  );
}