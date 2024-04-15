import './LanguageSelector.css';

import { SlGlobe } from "react-icons/sl";
import { Menu } from '@headlessui/react';

/**
 * Available display languages (TBC).
 */
const languages = [
    {
        name: 'English',
        locale: 'en-us'
    },
    {
        name: '中文',
        locale: 'zh-hk'
    },
    {
        name: '日本語',
        locale: 'ja'
    }
];

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
                {languages.map(({ name, locale }) => {
                    return (
                        <Menu.Item key={locale}>
                            <button className="LanguageSelectorItem"
                                onClick={() => changeLanguage(locale, name)}
                                disabled={i18n.language === locale}>
                                {name}
                            </button>
                        </Menu.Item>
                    );
                })}
                {/* <Menu.Item key={lng.code}>
                    <button
                        className={classNames(
                            "flex items-center space-x-2 px-4 py-2 text-sm cursor-pointer"
                        )}
                        onClick={() => i18n.changeLanguage(lng.code)} // used to change language that needs to be rendered
                        disabled={i18n.language === lng.code}
                    >
                        <span class={`fi fi-${lng.country_code}`}></span>
                        <span>{lng.name}</span>
                    </button>
                </Menu.Item> */}
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