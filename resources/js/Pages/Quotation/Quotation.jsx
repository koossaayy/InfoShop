import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, Link } from "@inertiajs/react";
import Grid from "@mui/material/Grid";
import {
    Button,
    Box,
    TextField,
    IconButton,
    Chip,
    MenuItem
} from "@mui/material";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/HighlightOff';
import PrintIcon from "@mui/icons-material/Print";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "axios";
import numeral from "numeral";

import { DataGrid } from "@mui/x-data-grid";
import CustomPagination from "@/Components/CustomPagination";
import i18next from 'i18next';

const columns = (handleRowClick) => [
    { field: "id", get headerName() { return i18next.t('ID'); }, width: 80 },
    {
        field: "quotation_number",
        get headerName() { return i18next.t('Quotation Number'); },
        width: 150,
    },

    {
        field: "contact_name",
        get headerName() { return i18next.t('Contact Name'); },
        width: 200,
    },
    {
        field: "quotation_date",
        get headerName() { return i18next.t('Quotation Date'); },
        width: 150,
        renderCell: (params) => dayjs(params.value).format("YYYY-MM-DD"),
    },
    {
        field: "expiry_date",
        get headerName() { return i18next.t('Expiry Date'); },
        width: 100,
        renderCell: (params) => dayjs(params.value).format("YYYY-MM-DD"),
    },
    {
        field: "total",
        get headerName() { return i18next.t('Total'); },
        width: 100,
        align: 'right', headerAlign: 'right',
        renderCell: (params) => numeral(params.value).format('0,0.00'),
    },
    {
        field: 'action',
        get headerName() { return i18next.t('Actions'); },
        width: 150, align: 'right', headerAlign: 'right',
        renderCell: (params) => (
            <>
                <Link href={`/quotations/${params.row.id}`}>
                    <IconButton sx={{ ml: '0.3rem' }} color="primary">
                        <PrintIcon />
                    </IconButton>
                </Link>
                <IconButton sx={{ ml: '0.3rem' }} color="error" onClick={() => handleRowClick(params.row, "delete_quotation")}>
                    <DeleteIcon />
                </IconButton>
            </>
        ),
    },
];

export default function Quotation({ quotations }) {
    const { t } = useTranslation();
    const [dataQuotations, setDataQuotations] = useState(quotations);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    const handleFilterChange = (input) => {
        if (input?.target) {
            // Handle regular inputs (e.g., TextField)
            const { name, value } = input.target;
            setSearchTerms((prev) => ({ ...prev, [name]: value }));
        } else {
            // Handle Select2 inputs (e.g., contact selection)
            setSearchTerms((prev) => ({
                ...prev,
                contact_id: input?.id, // Store selected contact or null
            }));
        }
    };

    const [searchTerms, setSearchTerms] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            store: 0,
            search_query: "",
            per_page: 100,
            contact_id: "",
        };
    });

    const handleRowClick = (quotation, action) => {
        setSelectedQuotation(quotation);
        if (action === 'print_quotation') {
            // Implement print functionality
        } else if (action === 'delete_quotation') {
            deleteQuotation(quotation.id);
        }
    };

    const deleteQuotation = (quotationID) => {
        Swal.fire({
            title: t('Do you want to remove the record?'),
            showDenyButton: true,
            confirmButtonText: t('YES'),
            denyButtonText: t('NO'),
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`/quotation/${quotationID}/delete`)
                    .then((response) => {
                        const updatedData = dataQuotations.data.filter((item) => item.id !== quotationID);
                        setDataQuotations({ ...dataQuotations, data: updatedData });
                        Swal.fire({
                            title: t('Success!'),
                            text: response.data.message,
                            icon: "success",
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        });
                    })
                    .catch((error) => {
                        console.error("Deletion failed with errors:", error);
                    });
            }
        });
    };

    const refreshQuotations = (url) => {
        const options = {
            preserveState: true,
            preserveScroll: true,
            only: ["quotations"],
            onSuccess: (response) => {
                setDataQuotations(response.props.quotations);
            },
        };
        router.get(url, searchTerms, options);
    };

    useEffect(() => {
        refreshQuotations(window.location.pathname);
    }, [searchTerms]);

    return (
        <AuthenticatedLayout>
            <Head title={t('Quotations')} />
            <Grid
                container
                spacing={2}
                sx={{ alignItems: "center", width: "100%", justifyContent: "end" }}
                size={12}
            >
                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        label={t('Search...')}
                        placeholder={t('Start typing...')}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 8, sm: 3, md: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => router.visit("/pos")}
                        sx={{ height: "100%" }}
                        startIcon={<AddCircleIcon />}
                        size="large"
                        fullWidth
                        color="success"
                    >
                        {t('QUOTATION')}
                    </Button>
                </Grid>
            </Grid>

            <Box
                className="py-6 w-full"
                sx={{ display: "grid", gridTemplateColumns: "1fr", height: '70vh' }}
            >
                <DataGrid
                    rows={dataQuotations?.data}
                    columns={columns(handleRowClick)}
                    hideFooter
                />
            </Box>
            <Grid size={12} container sx={{ justifyContent: "end" }}>
                <TextField
                    label={t('Per page')}
                    value={searchTerms.per_page}
                    onChange={handleFilterChange}
                    name="per_page"
                    select
                    size="small"
                    sx={{ minWidth: "100px" }}
                >
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200}>200</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                    <MenuItem value={400}>400</MenuItem>
                    <MenuItem value={500}>500</MenuItem>
                    <MenuItem value={1000}>1000</MenuItem>
                </TextField>
                <CustomPagination
                    refreshTable={refreshQuotations}
                    data={dataQuotations}
                    searchTerms={searchTerms}
                ></CustomPagination>
            </Grid>
        </AuthenticatedLayout>
    );
}
