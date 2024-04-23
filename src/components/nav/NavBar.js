import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

import LanguageSelector from './LanguageSelector';

import './NavBar.css';

/**
 * Renders the navigation bar at the top of the page.
 * @returns a new component for the navigation bar
 */
export default function NavBar() {
    const [showMenu, setShowMenu] = useState(false);

    /**
     * Event handler for showing or hiding the offcanvas menu which is available
     * when the browser width is less than a specified value.
     */
    const handleShowMenu = () => setShowMenu(!showMenu);

    return (
        <header className='header'>
            <nav className='nav'>
                <div className='NavHamburger'>
                    <button id='navHamburger' onClick={handleShowMenu}>
                        <FaBars name="NavHamburger" />
                    </button>
                </div>
                <div className='NavContainer'>
                    {appLogo()}
                    <div className={`NavMenu ${showMenu ? 'active' : ''}`}>
                        <ul>
                            <li><NavLink to="/">Sumo Schedule Lookup</NavLink></li>
                            <li><NavLink to="/about">About</NavLink></li>
                        </ul>
                    </div>
                </div>
                <LanguageSelector />
            </nav>
        </header>
    );
}

/**
 * Renders the app logo.
 * @returns a new element for the app logo
 */
const appLogo = () => {
    return (
        <div className='NavLogo'>React Demo</div>
    )
}