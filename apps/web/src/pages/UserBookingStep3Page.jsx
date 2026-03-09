import React, { useState, useMemo, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUnit } from '../hooks/useUnits';

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

const getDayName = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return DAY_NAMES_FULL[d.getDay()];
};

const UserBookingStep3Page = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const unitId = searchParams.get('unitId') || sessionStorage.getItem('booking_unitId');

    // Interactive state for file dragging
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [driveLink, setDriveLink] = useState('');

    // Load selected dates from sessionStorage
    const selectedDates = useMemo(() => {
        try {
            const saved = sessionStorage.getItem('booking_dates');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }, []);

    // Fetch unit details
    const { data: unitData, isLoading: unitLoading } = useUnit(unitId);
    const unit = unitData?.data || unitData;
    const pricePerDay = unit?.pricePerDay || 0;
    const subtotal = selectedDates.length * pricePerDay;

    // Redirect if no unit or dates
    useEffect(() => {
        if (!unitId) { navigate('/user/pesan'); return; }
        if (selectedDates.length === 0) { navigate(`/user/pesan/tanggal?unitId=${unitId}`); }
    }, [unitId, selectedDates.length, navigate]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFileName(e.dataTransfer.files[0].name);
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setFile(e.target.files[0]);
        }
    };

    const handleContinue = () => {
        // Save material info to sessionStorage
        if (driveLink) sessionStorage.setItem('booking_driveLink', driveLink);
        else sessionStorage.removeItem('booking_driveLink');

        if (file) {
            // We store a flag; the actual file will need to be re-selected or we pass it via context in a full app
            sessionStorage.setItem('booking_materialFileName', fileName);
        }

        navigate(`/user/pesan/checkout?unitId=${unitId}`);
    };

    if (!unitId) return null;

    return (
        <UserLayout title={breadcrumbTitle}>
            <div className="mx-auto w-full max-w-6xl pb-32">
                {/* Stepper Header */}
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold ring-4 ring-blue-100 shadow-md">3</div>
                            <span className="text-sm font-semibold text-[#2563EB] text-center">Upload Materi</span>
                        </div>
                        <div className="h-1 flex-1 bg-slate-200 rounded mx-2"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-500 font-semibold">4</div>
                            <span className="text-sm font-medium text-slate-500 text-center">Checkout</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Form Column */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Materi Iklan</h2>
                            <p className="text-sm text-slate-500 mb-6">Unggah file video atau gambar yang ingin ditampilkan pada videotron. Pastikan format dan resolusi sesuai.</p>

                            <div className="w-full">
                                {/* Drag and Drop Area */}
                                <label
                                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors group ${isDragging ? 'bg-blue-50 border-[#2563EB]' : 'bg-slate-50 hover:bg-slate-100 border-slate-300'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    htmlFor="dropzone-file"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className={`flex items-center justify-center h-16 w-16 rounded-full mb-4 transition-transform group-hover:scale-110 ${fileName ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-[#2563EB]'
                                            }`}>
                                            <span className="material-symbols-outlined text-4xl">
                                                {fileName ? 'check_circle' : 'cloud_upload'}
                                            </span>
                                        </div>
                                        <p className="mb-2 text-lg font-medium text-slate-700">
                                            {fileName ? fileName : 'Drag & drop file disini'}
                                        </p>
                                        <p className="text-sm text-slate-500 mb-4">
                                            {fileName ? 'File siap diupload' : 'atau klik untuk memilih file'}
                                        </p>
                                        {!fileName && (
                                            <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                <span className="bg-white border border-slate-200 px-2 py-1 rounded">MP4</span>
                                                <span className="bg-white border border-slate-200 px-2 py-1 rounded">AVI</span>
                                                <span className="bg-white border border-slate-200 px-2 py-1 rounded">MOV</span>
                                                <span className="bg-white border border-slate-200 px-2 py-1 rounded">JPG</span>
                                                <span className="bg-white border border-slate-200 px-2 py-1 rounded">PNG</span>
                                            </div>
                                        )}
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                                </label>

                                <div className="relative flex py-6 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Untuk file berukuran besar</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                {/* External Link Input */}
                                <div className="space-y-2">
                                    <label htmlFor="gdrive-link" className="block text-sm font-medium text-slate-700">Link Google Drive / Dropbox</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400">link</span>
                                        </div>
                                        <input
                                            type="url"
                                            id="gdrive-link"
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] sm:text-sm transition-shadow"
                                            placeholder="https://drive.google.com/file/d/..."
                                            value={driveLink}
                                            onChange={(e) => setDriveLink(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Pastikan link dapat diakses oleh publik (Anyone with the link).</p>
                                </div>

                                {/* Info Box */}
                                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                                    <span className="material-symbols-outlined text-[#2563EB] mt-1">info</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 mb-1">Panduan Materi</h4>
                                        <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                                            <li>Resolusi rekomendasi: <strong>1920x1080 px</strong> (Landscape)</li>
                                            <li>Durasi maksimal video: <strong>15 detik</strong> per slot</li>
                                            <li>Ukuran file maksimal upload langsung: <strong>50MB</strong></li>
                                            <li>Dilarang memuat konten SARA, Pornografi, dan Politik</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-900 text-white">
                                <h3 className="font-bold text-lg">Ringkasan Pesanan</h3>
                            </div>
                            <div className="p-5">
                                {/* Location Summary */}
                                <div className="mb-5 pb-5 border-b border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Videotron</span>
                                    {unitLoading ? (
                                        <div className="mt-3 text-sm text-slate-400">Memuat...</div>
                                    ) : unit ? (
                                        <div className="flex gap-3 mt-3">
                                            <div className="h-16 w-16 rounded-lg bg-cover bg-center bg-slate-200 flex-shrink-0"
                                                style={unit.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}></div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{unit.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{unit.location}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{unit.aspectRatio || '16:9'}</span>
                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{unit.size || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Selected Dates Summary */}
                                <div className="mb-5 border-b border-slate-100 pb-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Dipilih ({selectedDates.length})</span>
                                        <Link to={`/user/pesan/tanggal?unitId=${unitId}`} className="text-xs text-[#2563EB] hover:text-blue-700 font-medium">Ubah</Link>
                                    </div>

                                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {selectedDates.map(dateStr => (
                                            <div key={dateStr} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{formatDateDisplay(dateStr)}</span>
                                                    <span className="text-xs text-slate-500">{getDayName(dateStr)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-slate-900">{formatCurrencyShort(pricePerDay)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-500">Harga Sewa ({selectedDates.length} hari)</span>
                                        <span className="text-sm font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 my-3"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold text-slate-900">Subtotal</span>
                                        <span className="text-xl font-bold text-[#2563EB]">{formatCurrency(subtotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Fixed Bottom Footer Container */}
            <div className="fixed bottom-0 right-0 z-40 w-full lg:w-[calc(100%-16rem)] border-t border-slate-200 bg-white p-4 lg:px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-500">Total Pembayaran</p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(subtotal)}</p>
                    </div>
                    <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                        <Link to={`/user/pesan/tanggal?unitId=${unitId}`} className="flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Kembali
                        </Link>
                        <button
                            onClick={handleContinue}
                            disabled={!fileName && !driveLink}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all sm:w-auto ${(fileName || driveLink)
                                ? 'bg-[#2563EB] shadow-blue-500/25 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-95'
                                : 'bg-slate-300 shadow-none cursor-not-allowed pointer-events-none'
                                }`}
                        >
                            Lanjutkan
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserBookingStep3Page;
