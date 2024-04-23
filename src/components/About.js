import './About.css';

import * as envUtils from '../utils/EnvironmentUtils';
import config from '../conf/config.json';
import { useTranslation } from 'react-i18next';

/**
 * The About page component.
 * @returns a `<div>` tag containing the information to display in the About page
 */
export default function About() {
    const textArgs = {
        'VERSION': envUtils.getAppVersionNumber()
    };
    const { t } = useTranslation();
    return (
        <div className="About" id='about'>
            <table>
                <tbody>
                    {config.about.map(({ label, text }, i) => {
                        return (
                            <tr key={`about-item-${i + 1}`}>
                                <td className='Label'>{t(`about.label.${label}`)}</td>
                                <td className='Colon'>:</td>
                                <td className='Text'>{replaceArgs(text, textArgs)}</td>
                            </tr>)
                    })}
                </tbody>
            </table>
        </div>);
}

/**
 * Replaces the arguments in a given text with the corresponding value(s).
 * @param {string} text the text to process
 * @param {*} args the map of argument keys and the values to replace
 */
const replaceArgs = (text, args) => {
    Object.keys(args).forEach((key) => text = text.replace(`{{${key}}}`, args[key]));
    return text;
}