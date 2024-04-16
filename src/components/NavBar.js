import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

import LanguageSelector from './LanguageSelector';

import './NavBar.css';

/**
 * Renders the navigation bar at the top of the page.
 * @returns a new component for the navigation bar
 */
export default function NavBar() {
    const [showMenu, setShowMenu] = useState(false);

    const handleShowMenu = () => setShowMenu(!showMenu);

    return (
        <header className='header'>
            <nav className='nav'>
                <div className='NavHamburger' onClick={handleShowMenu}>
                    <FaBars name="NavHamburger" />
                </div>
                <div className='NavContainer'>
                    {appLogo()}
                    <div className={`NavMenu ${showMenu ? 'active' : ''}`}>
                        <ul>
                            <li>Sumo Tournament Lookup</li>
                            <li>Airport-to-HKI (TBC)</li>
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