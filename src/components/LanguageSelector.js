import './LanguageSelector.css';

import { SlGlobe } from "react-icons/sl";
import { Menu } from '@headlessui/react';
import ReactCountryFlag from 'react-country-flag';

import config from '../conf/config.json';

/**
 * Renders the language selector.
 * @returns a new language selector menu component
 */
export default function LanguageSelector() {
    const i18n = {
        language: 'en-us'
    }

    return (
        <Menu as="div">
            <Menu.Button className="LanguageSelectorButton"><SlGlobe /></Menu.Button>
            <Menu.Items className="LanguageSelectorDropdown">
                {config.displayLanguages.map(({ name, locale, countryCode }) => {
                    return (
                        <Menu.Item key={locale}>
                            <button className="LanguageSelectorItem"
                                onClick={() => changeLanguage(locale, name)}
                                disabled={i18n.language === locale}>
                                <ReactCountryFlag countryCode={countryCode} svg />&nbsp;{name}
                            </button>
                        </Menu.Item>
                    );
                })}
            </Menu.Items>
        </Menu>
    );
}

/**
 * Changes the display language. (Placeholder)
 * @param {string} code the locale code
 * @param {string} name the language name
 */
const changeLanguage = (code, name) => {
    console.log(`Switch to ${name} (${code}).`);
}