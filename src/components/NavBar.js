import LanguageSelector from './LanguageSelector';
import './NavBar.css';

/**
 * Renders the navigation bar at the top of the page.
 * @returns a new component for the navigation bar
 */
export default function NavBar() {
    return (
        <header className='header'>
            <nav className='nav'>
                <div className='NavLogo'>React Demo</div>
                <div className='NavMenu'>
                    <LanguageSelector />
                </div>
            </nav>
        </header>
    );
}