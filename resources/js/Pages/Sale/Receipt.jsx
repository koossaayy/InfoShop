import React from "react";
import { Head } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { ReceiptDisplay } from "./ReceiptDisplay";

export default function Receipt({ sale, salesItems, settings, user_name, credit_sale = false }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Sale Receipt')} />
            <ReceiptDisplay
                sale={sale}
                salesItems={salesItems}
                settings={settings}
                user_name={user_name}
                credit_sale={credit_sale}
                autoTriggerPrint={false}
                hideActionButtons={false}
            />
        </>
    );
}
