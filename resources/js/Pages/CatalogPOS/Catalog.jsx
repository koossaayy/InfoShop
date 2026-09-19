import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Badge } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { useSales as useCart } from '@/Context/SalesContext';
import { Banknote, CheckCircle2, ShoppingCart } from 'lucide-react';
import numeral from 'numeral';
import PaymentsCheckoutDialog from '@/Components/PaymentsCheckoutDialog';
import dayjs from 'dayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const Catalog = ({ open, id, onClose }) => {
    const { t } = useTranslation();
    const [searchProduct, setSearchProduct] = useState("");
    const [products, setProducts] = useState([]);
    const [value, setValue] = useState('products');

    const { cartState, addToCart, removeFromCart, updateCartItem } = useCart();

    const handleChange = (event, newValue) => setValue(newValue);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.post('/pos/filter', { all_products: true });
                setProducts(data);
            } catch (error) {
                console.error('Failed to load POS products', error);
                setProducts([]);
            }
        })();
    }, []);

    const getCartItem = (product) => {
        const index = cartState.findIndex(
            (item) => item.id === product.id && item.batch_id === product.batch_id
        );
        if (index === -1) return { item: null, index: -1 };
        return { item: cartState[index], index };
    };

    const handleUpdateCart = (product, field, val) => {
        const { item: cartItem, index } = getCartItem(product);

        const quantity = parseInt(field === "quantity" ? val : cartItem?.quantity || 0, 10);
        const free_quantity = parseInt(field === "free_quantity" ? val : cartItem?.free_quantity || 0, 10);
        const flat_discount = parseFloat(field === "flat_discount" ? val : cartItem?.flat_discount || 0);

        console.log("quantity", quantity)

        if (!quantity && !free_quantity) {
            removeFromCart(index);
        } else if (cartItem) {
            updateCartItem({ ...cartItem, quantity, free_quantity, flat_discount });
        } else {
            addToCart({
                ...product,
                free_quantity: free_quantity || product.free_quantity || 0,
                flat_discount: flat_discount || product.flat_discount || 0,
            }, quantity);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle>
                <Tabs value={value} onChange={handleChange} variant="fullWidth">
                    <Tab value="products" label={t('PRODUCTS')} wrapped />
                    <Tab
                        value="cart"
                        label={
                            <Badge badgeContent={cartState.length} color="error">
                                <ShoppingCart size={20} />
                            </Badge>
                        }
                    />
                </Tabs>
            </DialogTitle>
            <DialogContent>
                {value === 'products' && (
                    <>
                        <TextField
                            label={t('Search')}
                            size="small"
                            fullWidth
                            value={searchProduct}
                            onChange={(e) => setSearchProduct(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                        <ul className="faded-bottom no-scrollbar grid gap-2 overflow-auto pt-1 pb-1 w-full">
                            {products
                                .filter((product) =>
                                    product.name.toLowerCase().includes(searchProduct.toLowerCase())
                                )
                                .map((product) => {
                                    const { item: cartItem } = getCartItem(product);
                                    return (
                                        <li key={product.id + product.batch_number} className="p-2 w-full shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="uppercase tracking-wide text-sm text-blue-900 font-semibold">
                                                    {t('{{0}} Rs. {{1}}', { 0: product.name, 1: product.price })}
                                                </div>
                                                <div className="flex ml-2">
                                                    {numeral(product.stock_quantity).format("0,0")}
                                                </div>
                                            </div>
                                            <div className="mt-2 grid grid-cols-[30px_1fr_1fr_1fr] gap-4 items-center">
                                                <div>
                                                    <CheckCircle2
                                                        size={30}
                                                        color={cartItem ? "green" : "gray"}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">{t('Qty')}</div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="border border-gray-300 rounded-md py-1 px-2 w-15"
                                                        value={cartItem?.quantity || ""}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => handleUpdateCart(product, "quantity", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">{t('Free Qty')}</div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="border border-gray-300 rounded-md py-1 px-2 w-15"
                                                        value={cartItem?.free_quantity || ""}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => handleUpdateCart(product, "free_quantity", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">{t('Disc')}</div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="border border-gray-300 rounded-md py-1 px-2 w-15"
                                                        value={cartItem?.flat_discount || ""}
                                                        disabled={!cartItem}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => handleUpdateCart(product, "flat_discount", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                        </ul>
                    </>
                )}
                {value === 'cart' && <Cart cartState={cartState} contact_id={id} useCart={useCart} />}
            </DialogContent>
            <DialogActions>
                <Button fullWidth onClick={onClose}>{t('Close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Catalog;

const Cart = ({ cartState, contact_id, useCart }) => {
    const { t } = useTranslation();
    const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
    const [sale_date, setSaleDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [sale_time, setSaleTime] = useState(dayjs().format("HH:mm"));
    if (!cartState.length) return <div className="p-4">{t('Your cart is empty')}</div>;
    const { cartTotal } = useCart();
    return (
        <>
            <ul className="overflow-auto p-0 space-y-2">
                {cartState.map((item, index) => {
                    const total = (parseFloat(item.price) * item.quantity) - item.flat_discount;

                    return (
                        <li
                            key={`${item.id}-${item.batch_id}`}
                            className="p-3 border rounded-md shadow-sm bg-white"
                        >
                            {/* Top row: Name + Total */}
                            <div className="grid grid-cols-[2fr_1fr] items-center mb-2">
                                <div className="font-semibold text-sm">
                                    #{index + 1} | {item.name}
                                </div>
                                <div className="text-sm font-bold text-right">{t('Rs. {{0}}', { 0: numeral(total).format("0,0.00") })}</div>
                            </div>

                            {/* Breakdown row */}
                            <div className="grid grid-cols-[1fr_2fr] gap-2 items-center">
                                <div>
                                    <div className="text-gray-500 text-xs">{t('Details')}</div>
                                </div>

                                <div>
                                    <div className="text-gray-500 text-xs text-right">{t('({{0}} x {{1}}) - {{2}} = Rs. {{3}}', { 0: item.price, 1: item.quantity, 2: item.flat_discount, 3: numeral(total).format("0,0.00") })}</div>
                                </div>
                            </div>
                        </li>
                    );
                })}
                <li className="p-3 border rounded-md shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-sm">{t('Item Discount')}</div>
                        <div className="text-sm font-bold">
                            {numeral(cartState.reduce((acc, item) => acc + (item.discount * item.quantity + item.flat_discount), 0)).format("0,0.00")}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="font-semibold text-sm">{t('Total')}</div>
                        <div className="text-sm font-bold">{t('Rs. {{0}}', { 0: numeral(cartTotal).format("0,0.00") })}</div>
                    </div>
                </li>
            </ul>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex justify-center mt-5 flex-col gap-2">
                    <TextField
                        type="date"
                        label={t('Date')}
                        variant="outlined"
                        size="small"
                        value={sale_date}
                        onChange={(e) => setSaleDate(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <MobileTimePicker
                        label={t('Time')}
                        value={sale_time ? dayjs(`2000-01-01 ${sale_time}`, 'YYYY-MM-DD HH:mm') : null}
                        onChange={(newValue) => {
                            if (newValue) {
                                setSaleTime(newValue.format('HH:mm'));
                            }
                        }}
                        format="hh:mm A"
                        views={['hours', 'minutes']}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                            },
                            popper: {
                                placement: 'bottom-start',
                            },
                        }}
                        ampm={true}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        endIcon={<Banknote />}
                        onClick={() => setPaymentsModalOpen(true)}
                    >
                        {t('PAYMENTS')}
                    </Button>
                </div>
            </LocalizationProvider>

            <PaymentsCheckoutDialog
                useCart={useCart}
                open={paymentsModalOpen}
                setOpen={setPaymentsModalOpen}
                selectedContact={{ id: contact_id }}
                is_sale={true}
                formData={{ sale_date: sale_date, sale_time: sale_time }}
            />
        </>
    );
};
