import React, { useState } from 'react';
import { Drawer } from '@mui/material';
import { Banknote, CornerDownLeft, Edit, Eye, MoreVertical, Printer, Trash, X } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import numeral from 'numeral';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const SalesList = ({ sales, handleRowClick }) => {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    return (
        <>
            <ul className='faded-bottom no-scrollbar grid gap-2 overflow-auto pt-1 pb-1 w-full mt-1'>
                {sales.map((sale) => (
                    <li className="p-3 w-full shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-sm font-semibold text-gray-800">{sale.name}</h2>
                                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {sale.status}
                                </span>
                            </div>
                            <div className="flex flex-col items-end text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">#{sale.invoice_number}</span>
                                <span>{sale.sale_date}</span>
                            </div>
                        </div>
                        {/* Middle section with transaction details */}
                        <div className="grid grid-cols-3 gap-4 items-center mt-4">
                            <div>
                                <h3 className="text-base text-xs text-gray-500">{t('Total')}</h3>
                                <p className="text-sm font-bold text-gray-900 mt-1">{numeral(sale.total_amount).format("0,0.00")}</p>
                            </div>
                            <div onClick={() => handleRowClick(sale, "add_payment")}>
                                <h3 className="text-base text-xs text-gray-500">{t('Pending')}</h3>
                                <p className="text-sm font-bold text-gray-900 mt-1">{numeral(Number(sale.amount_received) - Number(sale.total_amount)).format("0,0.00")}</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <Link href={"/receipt/" + sale.id} className="text-gray-600">
                                    <Printer size={20} />
                                </Link>
                                <button aria-label={t('More options')} className="text-gray-600" onClick={() => {
                                    setSelectedSale(sale);
                                    setDrawerOpen(true);
                                }}>
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                    </li>
                ))}
            </ul>
            {selectedSale && (
                <Drawer
                    anchor="bottom"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": {
                            borderTopLeftRadius: "16px",
                            borderTopRightRadius: "16px",
                        },
                    }}
                >
                    <ul className="divide-y divide-gray-200 p-4 rounded-sm">
                        <li className="py-4 flex font-semibold text-gray-900 justify-between">
                            {t('More options')}
                            <button onClick={() => setDrawerOpen(false)}><X size={25} /></button>
                        </li>

                        <li className="py-4 flex" onClick={() => {
                            handleRowClick(selectedSale, "view_details");
                            setDrawerOpen(false);
                        }}>
                            <button className="flex items-center space-x-3 text-gray-700">
                                <Eye size={20} />
                                <span>{t('View Details')}</span>
                            </button>
                        </li>

                        <li className="py-4 flex" onClick={() => handleRowClick(selectedSale, "add_payment")}>
                            <button className="flex items-center space-x-3 text-gray-700">
                                <Banknote size={22} />
                                <span>{t('Add Payment')}</span>
                            </button>
                        </li>
                        

                        {dayjs(selectedSale.created_at).subtract(7, 'day') && (
                            <li className="py-4 flex" onClick={() => handleRowClick(selectedSale, "edit")}>
                                <button className="flex items-center space-x-3 text-gray-700">
                                    <Edit size={20} />
                                    <span>{t('Edit')}</span>
                                </button>
                            </li>
                        )}

                        {selectedSale.sale_type !== "return" && (
                            <li className="py-4 flex">
                                <Link href={`/pos/${selectedSale.id}/return`} className="flex items-center space-x-3 text-gray-700 w-full">
                                    <CornerDownLeft size={20} />
                                    <span>{t('Return')}</span>
                                </Link>
                            </li>
                        )}

                        <li className="py-4 flex">
                            <button onClick={() => handleRowClick(selectedSale, "delete")} className="flex items-center space-x-3 text-red-600 w-full">
                                <Trash size={20} />
                                <span>{t('Delete')}</span>
                            </button>
                        </li>

                    </ul>
                </Drawer>
            )}
        </>
    );
};

export default SalesList;
