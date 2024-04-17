import './LanguageSelector.css';

import { SlGlobe } from "react-icons/sl";
import { Menu } from '@headlessui/react';
import ReactCountryFlag from 'react-country-flag';

import config from '../conf/config.json';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

/**
 * Renders the language selector.
 * @returns a new language selector menu component
 */
export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const selectedLanguage = i18n.language;
    console.debug(`Language = ${selectedLanguage}`);

    /**
     * Changes the display language and locale.
     * @param {string} languageCode the language code
     * @param {string} locale the locale code
     */
    const changeLanguageAndLocale = (languageCode, locale) => {
        i18n.changeLanguage(languageCode);
        moment.locale(locale);
    }

    return (
        <Menu as="div" className="LanguageSelector">
            <Menu.Button className="LanguageSelectorButton" name="LanguageSelectorButton">
                <SlGlobe name="LanguageSelectorIcon" />
                <div className='LanguageSelectorLabel'>{`Language: ${selectedLanguage.toUpperCase()}`}</div>
            </Menu.Button>
            <Menu.Items className="LanguageSelectorDropdown">
                {config.displayLanguages.map(({ name, language, locale, countryCode }) => {
                    return (
                        <Menu.Item key={`lang_${language}`}>
                            <button className="LanguageSelectorItem"
                                onClick={() => changeLanguageAndLocale(language, locale)}
                                disabled={selectedLanguage === language}>
                                <ReactCountryFlag countryCode={countryCode} svg />&nbsp;{name}
                            </button>
                        </Menu.Item>
                    );
                })}
            </Menu.Items>
        </Menu>
    );
}