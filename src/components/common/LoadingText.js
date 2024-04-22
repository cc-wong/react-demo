import './LoadingText.css';

import { useTranslation } from "react-i18next";

/**
 * The component for the loading text.
 * @param {*} props the component attribute(s)
 * @param {boolean} props.isLoading the `loading` state of the corresponding component
 * @returns a `<div>` HTML component for the loading text (`id`=`loadingText`) if `isLoading` is `true`
 */
export default function LoadingText(props) {
    const { t } = useTranslation();
    if (props.isLoading) {
        return (<div className='LoadingText' id='loadingText'>{t('loading')}</div>);
    }
    return (<></>);
}