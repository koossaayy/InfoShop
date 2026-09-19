import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import Grid from "@mui/material/Grid";
import {
    Button,
    Box,
    TextField,
    IconButton,
    Chip
} from "@mui/material";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "axios";
import numeral from "numeral";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CustomPagination from "@/Components/CustomPagination";
import i18next from 'i18next';

const columns = (handleRowClick) => [
    { field: 'id', get headerName() { return i18next.t('ID'); }, width: 90 },
    {
        field: 'transaction_date', get headerName() { return i18next.t('Date'); }, width: 150,
        renderCell: (params) => dayjs(params.value).format('DD MMM YYYY')
    },
    {
        field: 'name', get headerName() { return i18next.t('Name'); }, width: 150,
        renderCell: (params) => <span className="hover:underline cursor-pointer font-bold" onClick={() => handleRowClick(params.row, 'edit_inventory_item')}>{params.value}</span>
    },
    {
        field: "reason", get headerName() { return i18next.t('Description'); }, width: 300
    },
    {
        field: 'quantity',
        get headerName() { return i18next.t('Quantity'); },
        width: 150,
        renderCell: (params) => (
            <span className="hover:underline cursor-pointer font-bold" onClick={() => handleRowClick(params.row, 'inventory_transaction')}>
                {numeral(params.value).format('0,0.00')} <span className="italic">{params.row.unit_type}</span>
            </span>
        )
    },
    // {
    //     field: 'actions',
    //     type: 'actions',
    //     headerName: 'Actions',
    //     width: 100,
    //     getActions: (params) => [
    //         <Grid size={12}>
    //             <IconButton
    //                 color="error"
    //                 onClick={() => { handleRowClick(params.row, "delete_inventory_item") }}
    //             >
    //                 <DeleteIcon />
    //             </IconButton>
    //         </Grid>
    //     ]
    // },
];

const InventoryLog = ({ inventory_log, stores }) => {
    const { t } = useTranslation();
    const [dataInventoryLog, setDataInventoryLog] = useState(inventory_log);
    const [selectedInventoryItem, setSelectedInventoryItem] = useState({});
    const [searchTerms, setSearchTerms] = useState({});

    const refreshInventoryItems = (url) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["inventory_items"], // Only reload specified properties
            onSuccess: (response) => {
                setDataInventoryLog(response.props.inventory_log);
            },
        };
        router.get(url, searchTerms, options);
    };

    const handleRowClick = (inventory_item, action) => {
        if (action === 'delete_inventory_item') {
            deleteInventoryItem(inventory_item.id);
        } else if (action === 'edit_inventory_item') {
            setSelectedInventoryItem(inventory_item);
            setInventoryItemModalOpen(true);
        }
        else if (action === 'inventory_transaction') {
            setSelectedInventoryItem(inventory_item);
            setInventoryTransactionModalOpen(true);
        }
    };

    const deleteInventoryItem = (inventory_item_id) => {
        Swal.fire({
            title: t('Are you sure?'),
            text: t('You won\'t be able to revert this!'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('Yes, delete it!')
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`/inventory-items/${inventory_item_id}`, {
                    _method: 'DELETE'
                }).then((response) => {
                    Swal.fire(
                        t('Deleted!'),
                        t('Inventory item has been deleted.'),
                        'success'
                    );
                    refreshInventoryItems(window.location.href);
                }).catch((error) => {
                    Swal.fire(
                        t('Error!'),
                        t('Something went wrong.'),
                        'error'
                    );
                });
            }
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('Inventory')} />
            <Grid
                container
                spacing={2}
                sx={{ alignItems: "center", width: "100%", justifyContent: "end" }}
                size={12}
            >

                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        label={t('Search...')}
                        name="search_query"
                        placeholder={t('Start typing...')}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 4, sm: 1 }}>
                    <Button
                        variant="contained"
                        sx={{ height: "100%" }}
                        size="large"
                        fullWidth

                    >
                        <FindReplaceIcon />
                    </Button>
                </Grid>
            </Grid>

            <Box
                className="py-6 w-full"
                sx={{ display: "grid", gridTemplateColumns: "1fr", height: "calc(100vh - 200px)", }}
            >
                <DataGrid
                    rows={dataInventoryLog?.data ?? []} //.}
                    columns={columns(handleRowClick)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    hideFooter
                />
            </Box>
            <Grid size={12} container sx={{ justifyContent: "end" }}>
                {/* <Chip size="large" label={'Total:' + numeral(totalExpense).format('0,0')} color="primary" /> */}
                <CustomPagination
                    dataLinks={dataInventoryLog?.links}
                    refreshTable={refreshInventoryItems}
                    dataLastPage={dataInventoryLog?.last_page}
                ></CustomPagination>
            </Grid>
        </AuthenticatedLayout>
    );
};

export default InventoryLog;
