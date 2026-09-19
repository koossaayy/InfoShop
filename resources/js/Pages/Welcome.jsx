import { Link, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Guest from '@/Layouts/GuestLayout';

export default function Welcome({ auth }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Welcome')} />
        </>
    );
}
