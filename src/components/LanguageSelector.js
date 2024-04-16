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
        language: 'en'
    }

    return (
        <Menu as="div">
            <Menu.Button className="LanguageSelectorButton"><SlGlobe /></Menu.Button>
            <Menu.Items className="LanguageSelectorDropdown">
                {config.displayLanguages.map(({ name, language, countryCode }) => {
                    return (
                        <Menu.Item key={`lang_${language}`}>
                            <button className="LanguageSelectorItem"
                                onClick={() => changeLanguage(language, name)}
                                disabled={i18n.language === language}>
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
 * @param {string} languageCode the language code
 * @param {string} name the language name
 */
const changeLanguage = (languageCode, name) => {
    console.log(`Switch to ${name} (${languageCode}).`);
}