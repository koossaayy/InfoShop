import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { locale = 'en', locales = ['en', 'fr', 'ru', 'de', 'ja', 'ar'] } = usePage().props;
    const { t } = useTranslation();

    const switchTo = (event) => {
        const next = event.target.value;
        if (next !== locale) router.get(`/locale/${next}`);
    };

    return (
        <select value={locale} onChange={switchTo} aria-label={t('Language')}>
            {locales.map((code) => (
                <option key={code} value={code}>{code.toUpperCase()}</option>
            ))}
        </select>
    );
}