import React, { useState, useMemo, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useActiveBankSettings } from '../hooks/useSettings';
import { useCreateOrder } from '../hooks/useOrders';
import { useUploadFile } from '../hooks/useUploads';
import { useUnit } from '../hooks/useUnits';
import { useValidateVoucher } from '../hooks/useVouchers';

const breadcrumbTitle = (
    <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-medium text-slate-900">Pesan Videotron</span>
    </div>
);

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}jt`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
    return `Rp ${amount}`;
};

const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};



const UserBookingStep4Page = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const unitId = searchParams.get('unitId') || sessionStorage.getItem('booking_unitId');

    const [paymentFileName, setPaymentFileName] = useState('');
    const [paymentFile, setPaymentFile] = useState(null);
    const [paymentPreview, setPaymentPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [voucherError, setVoucherError] = useState('');

    // Load booking data from sessionStorage
    const selectedDates = useMemo(() => {
        try {
            const saved = sessionStorage.getItem('booking_dates');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }, []);

    const materialDriveLink = sessionStorage.getItem('booking_driveLink') || '';
    const materialFileName = sessionStorage.getItem('booking_materialFileName') || '';

    // Fetch unit details 
    const { data: unitData } = useUnit(unitId);
    const unit = unitData?.data || unitData;
    const pricePerDay = unit?.pricePerDay || 0;
    const subtotal = selectedDates.length * pricePerDay;
    const finalAmount = subtotal - voucherDiscount;

    const { data: bankSettingsData, isLoading: banksLoading } = useActiveBankSettings();
    const createOrderMutation = useCreateOrder();
    const uploadFileMutation = useUploadFile();
    const validateVoucherMutation = useValidateVoucher();

    const banks = Array.isArray(bankSettingsData?.data) ? bankSettingsData.data : Array.isArray(bankSettingsData) ? bankSettingsData : [];

    // Redirect if missing data
    useEffect(() => {
        if (!unitId) { navigate('/user/pesan'); return; }
        if (selectedDates.length === 0) { navigate(`/user/pesan/tanggal?unitId=${unitId}`); }
    }, [unitId, selectedDates.length, navigate]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Disalin: ${text}`);
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherError('');
        setVoucherApplied(false);
        setVoucherDiscount(0);
        try {
            const res = await validateVoucherMutation.mutateAsync({ code: voucherCode, orderAmount: subtotal });
            const result = res?.data || res;
            setVoucherDiscount(result.calculatedDiscount || 0);
            setVoucherApplied(true);
        } catch (err) {
            setVoucherError(err.message || 'Voucher tidak valid');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setPaymentFileName(file.name);
            setPaymentFile(file);
            // Create preview for images
            if (file.type.startsWith('image/')) {
                setPaymentPreview(URL.createObjectURL(file));
            } else {
                setPaymentPreview(null);
            }
        }
    };

    const handleConfirm = async () => {
        if (!paymentFile) return;
        setIsSubmitting(true);
        setSubmitError('');
        try {
            // Step 1: Upload payment proof file
            const uploadRes = await uploadFileMutation.mutateAsync({ type: 'payment-proof', file: paymentFile });
            const paymentProofUrl = uploadRes?.data?.url || uploadRes?.url || uploadRes?.data?.fileUrl || uploadRes?.fileUrl || '';

            // Step 2: Create the order with payment proof included
            await createOrderMutation.mutateAsync({
                unitId,
                dates: selectedDates,
                materialFileUrl: materialFileName || undefined,
                materialDriveLink: materialDriveLink || undefined,
                paymentProofUrl: paymentProofUrl || undefined,
                voucherCode: voucherCode || undefined,
            });

            // Clean up sessionStorage
            sessionStorage.removeItem('booking_unitId');
            sessionStorage.removeItem('booking_dates');
            sessionStorage.removeItem('booking_driveLink');
            sessionStorage.removeItem('booking_materialFileName');

            alert("Pesanan berhasil dibuat! Bukti pembayaran Anda akan diverifikasi oleh admin.");
            navigate('/user/riwayat');
        } catch (err) {
            setSubmitError(err.message || 'Terjadi kesalahan saat memproses pesanan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!unitId) return null;

    return (
        <UserLayout title={breadcrumbTitle}>
            <div className="mx-auto w-full max-w-6xl pb-10">
                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <Link to="/user/pesan" className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition-colors">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </Link>
                            <span className="text-sm font-medium text-green-600 text-center cursor-pointer hover:text-green-700">
                                <Link to="/user/pesan">Pilih Videotron</Link>
                            </span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 rounded mx-2 relative"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <Link to={`/user/pesan/tanggal?unitId=${unitId}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition-colors">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </Link>
                            <span className="text-sm font-medium text-green-600 text-center cursor-pointer hover:text-green-700">
                                <Link to={`/user/pesan/tanggal?unitId=${unitId}`}>Pilih Tanggal</Link>
                            </span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 rounded mx-2 relative"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <Link to={`/user/pesan/materi?unitId=${unitId}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition-colors">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </Link>
                            <span className="text-sm font-medium text-green-600 text-center cursor-pointer hover:text-green-700">
                                <Link to={`/user/pesan/materi?unitId=${unitId}`}>Upload Materi</Link>
                            </span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 rounded mx-2 relative"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold ring-4 ring-blue-100 shadow-md">4</div>
                            <span className="text-sm font-semibold text-[#2563EB] text-center">Checkout</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">
                        {/* Bank Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Rekening Pembayaran</h2>
                            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
                                <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                                <p className="text-sm leading-relaxed font-medium">
                                    Silakan transfer sesuai nominal <strong>{formatCurrency(finalAmount)}</strong> ke rekening berikut untuk menyelesaikan pesanan Anda.
                                </p>
                            </div>

                            {banksLoading ? (
                                <div className="text-center py-8 text-slate-400">Memuat info rekening...</div>
                            ) : banks.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">Belum ada rekening bank yang tersedia</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {banks.map((bank) => (
                                        <div key={bank.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                                                    <span className="material-symbols-outlined text-[#2563EB] text-2xl">account_balance</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bank Transfer</p>
                                                    <p className="text-base font-bold text-slate-900">{bank.bankName}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Nomor Rekening</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-mono font-bold text-slate-900">{bank.accountNumber}</span>
                                                        <button onClick={() => handleCopy(bank.accountNumber)} className="text-[#2563EB] hover:text-blue-700 transition-colors" title="Salin">
                                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                                                        <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                                        <strong>Tuliskan judul deskripsi / keterangan saat transfer:</strong> {unit?.name || 'Nama Videotron'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Nama Pemilik Rekening</p>
                                                    <p className="text-base font-semibold text-slate-900">{bank.accountHolder}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upload Transfer Receipt */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">Upload Bukti Transfer</h2>
                            <p className="text-slate-500 text-sm mb-4">Unggah foto atau screenshot bukti transfer pembayaran Anda.</p>

                            {submitError && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {submitError}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <label className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group py-4 px-4">
                                    <div className="flex flex-row items-center justify-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-110 transition-transform flex-shrink-0 ${paymentFileName ? 'bg-green-50 text-green-500' : 'bg-white text-[#2563EB]'}`}>
                                            <span className="material-symbols-outlined text-lg">{paymentFileName ? 'check' : 'cloud_upload'}</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-slate-900">{paymentFileName ? paymentFileName : 'Klik untuk upload bukti'}</p>
                                            {!paymentFileName && <p className="text-xs text-slate-500">JPG, PNG, PDF (Max. 5MB)</p>}
                                        </div>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/jpeg, image/png, application/pdf" />
                                </label>
                            </div>
                            {/* Image Preview */}
                            {paymentPreview && (
                                <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                                    <img src={paymentPreview} alt="Preview bukti transfer" className="w-full max-h-64 object-contain bg-slate-50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Ringkasan Pesanan</h3>
                                    <span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-200">Final</span>
                                </div>
                                <div className="p-5">
                                    {/* Unit Summary */}
                                    {unit && (
                                        <div className="mb-4 pb-4 border-b border-slate-100">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi</span>
                                            <div className="flex gap-3 mt-2">
                                                <div className="h-12 w-12 rounded-lg bg-cover bg-center bg-slate-200 flex-shrink-0"
                                                    style={unit.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{unit.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">{unit.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dates Summary */}
                                    <div className="mb-4 pb-4 border-b border-slate-100">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal ({selectedDates.length} hari)</span>
                                        <div className="flex flex-col gap-1.5 mt-2 max-h-32 overflow-y-auto">
                                            {selectedDates.map(dateStr => (
                                                <div key={dateStr} className="flex justify-between text-sm">
                                                    <span className="text-slate-600">{formatDateDisplay(dateStr)}</span>
                                                    <span className="font-medium text-slate-900">{formatCurrencyShort(pricePerDay)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-500">Sewa ({selectedDates.length} hari)</span>
                                            <span className="text-sm font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                                        </div>
                                        {voucherApplied && voucherDiscount > 0 && (
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-green-600">Diskon Voucher</span>
                                                <span className="text-sm font-medium text-green-600">-{formatCurrency(voucherDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-200 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-bold text-slate-900">Total</span>
                                            <span className="text-xl font-bold text-[#2563EB]">{formatCurrency(finalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Voucher Promo */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Punya Kode Voucher?</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherApplied(false); setVoucherError(''); }}
                                                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-mono" placeholder="Kode promo" />
                                            </div>
                                            <button onClick={handleApplyVoucher} disabled={validateVoucherMutation.isPending || !voucherCode.trim()}
                                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50">
                                                {validateVoucherMutation.isPending ? '...' : 'Terapkan'}
                                            </button>
                                        </div>
                                        {voucherApplied && (
                                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Voucher diterapkan! Diskon {formatCurrency(voucherDiscount)}
                                            </p>
                                        )}
                                        {voucherError && (
                                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                {voucherError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-slate-100 pt-5 space-y-4">
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={handleConfirm}
                                                disabled={!paymentFileName || isSubmitting}
                                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all ${paymentFileName && !isSubmitting
                                                    ? 'bg-[#2563EB] shadow-blue-500/25 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-95'
                                                    : 'bg-slate-300 shadow-none cursor-not-allowed text-slate-100'
                                                    }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                        Konfirmasi Pesanan
                                                    </>
                                                )}
                                            </button>
                                            <Link to={`/user/pesan/materi?unitId=${unitId}`} className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                                Kembali
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserBookingStep4Page;
