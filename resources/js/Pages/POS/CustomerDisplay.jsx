import React, { useState, useContext, useRef, useEffect } from "react";
import {
    Box,
    Divider,
    IconButton,
    TextField,
    Autocomplete,
    Typography,
} from "@mui/material";

import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import { Head } from "@inertiajs/react";

import { useTranslation } from 'react-i18next';
import { SalesProvider, useSales as useCart } from "@/Context/SalesContext";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    ...theme.applyStyles("dark", {
        backgroundColor: "#1A2027",
    }),
}));

const CartComponent = () => {
    const { t } = useTranslation();
    // Destructure cartState and addToCart from the context
    const { cartState, cartTotal } = useCart();

    return (
        <Box sx={{ padding: 3 }}>
            <Stack sx={{ width: "100%" }} spacing={2}>
                {cartState.map((item) => (
                    <Item
                        variant="outlined"
                        key={item.id}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: 2,
                        }}
                    >
                        <Typography variant="h4" color="initial">
                            {t('{{0}} | Qty.{{1}}', { 0: item.name, 1: item.quantity })}
                        </Typography>
                        <Typography variant="h4" color="initial">
                         <b>{t('RS.{{0}}', { 0: ((item.price-item.discount) * item.quantity).toFixed(2) })}</b>
                        </Typography>
                    </Item>
                ))}
                <Item variant="outlined" sx={{justifyContent:'space-between',  display: "flex", padding: 2,}}>
                    <Typography variant="h4" color="initial">
                        <strong>{t('Total')}</strong>
                    </Typography>
                    <Typography variant="h4" color="initial">
                    <strong>{t('Rs.{{0}}', { 0: (cartTotal).toFixed(2) })}</strong>
                    </Typography>
                </Item>
            </Stack>

            <ul></ul>
        </Box>
    );
};

const CustomerDisplay = () => {
    const { t } = useTranslation();
    return (
    <SalesProvider>
        <Head title={t('Customer Display')} />
        <CartComponent />
    </SalesProvider>
);
};

export default CustomerDisplay;
