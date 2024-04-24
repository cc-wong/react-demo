import './NavBar.css';

import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LanguageSelector from './LanguageSelector';

import config from '../../conf/config.json';

/**
 * Renders the navigation bar at the top of the page.
 * @returns a new component for the navigation bar
 */
export default function NavBar() {
    const [showMenu, setShowMenu] = useState(false);

    /**
     * Event handler for showing or hiding the sidebar menu which is available
     * when the browser width is less than a specified value.
     */
    const handleShowMenu = () => setShowMenu(!showMenu);

    /**
     * Event handler for hiding the sidebar menu.
     */
    const handleCloseMenu = () => setShowMenu(false);

    const { t, i18n } = useTranslation();
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
                    <div className={`NavMenu${showMenu ? ' active' : ''}`} id="navMenu">
                        <ul className={`Menu-${i18n.language}`}>
                            {config.routes.map((route) =>
                            (<li key={`navLink-${route.code}`}>
                                <NavLink to={route.path} onClick={handleCloseMenu}>
                                    {t(route.navLinkName)}
                                </NavLink>
                            </li>))}
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