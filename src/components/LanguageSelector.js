import './LanguageSelector.css';

import { SlGlobe } from "react-icons/sl";
import { Menu } from '@headlessui/react';
import ReactCountryFlag from 'react-country-flag';

import localesConfig from '../locales/config.json';
import { useTranslation } from 'react-i18next';

/**
 * Renders the language selector.
 * @returns a new language selector menu component
 */
export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const selectedLanguage = i18n.language;
    console.debug(`Language = ${selectedLanguage}`);

    /**
     * Changes the display language.
     * @param {string} languageCode the language code
     */
    const changeLanguage = (languageCode) => i18n.changeLanguage(languageCode);

    return (
        <Menu as="div" className="LanguageSelector">
            <Menu.Button className="LanguageSelectorButton" name="LanguageSelectorButton">
                <SlGlobe name="LanguageSelectorIcon" />
                <div className='LanguageSelectorLabel'>{`Language: ${selectedLanguage.toUpperCase()}`}</div>
            </Menu.Button>
            <Menu.Items className="LanguageSelectorDropdown">
                {Object.keys(localesConfig.language).map((languageCode) => {
                    const { name, countryCode } = localesConfig.language[languageCode];
                    return (
                        <Menu.Item key={`lang_${languageCode}`}>
                            <button className="LanguageSelectorItem"
                                onClick={() => changeLanguage(languageCode)}
                                disabled={selectedLanguage === languageCode}>
                                <ReactCountryFlag countryCode={countryCode} svg />&nbsp;{name}
                            </button>
                        </Menu.Item>
                    );
                })}
            </Menu.Items>
        </Menu>
    );
}