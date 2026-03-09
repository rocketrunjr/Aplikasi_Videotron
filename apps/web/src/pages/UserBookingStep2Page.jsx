import React, { useState, useMemo, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUnit, useUnitAvailability } from '../hooks/useUnits';

const breadcrumbTitle = (
    <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-medium text-slate-900">Pesan Videotron</span>
    </div>
);

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_NAMES_SHORT = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}jt`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
    return `Rp ${amount}`;
};

const UserBookingStep2Page = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const unitId = searchParams.get('unitId') || sessionStorage.getItem('booking_unitId');

    // Current date for calendar initialization
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDates, setSelectedDates] = useState(() => {
        try {
            const saved = sessionStorage.getItem('booking_dates');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Fetch unit details
    const { data: unitData, isLoading: unitLoading } = useUnit(unitId);
    const unit = unitData?.data || unitData;

    // Fetch booked dates for current month
    const { data: availData } = useUnitAvailability(unitId, currentMonth, currentYear);
    const bookedDates = useMemo(() => {
        const raw = availData?.data || availData;
        // Handle nested bookedDates structure: { bookedDates: { maxSlots, dates: [...] } }
        const inner = raw?.bookedDates || raw;
        if (inner && inner.dates && Array.isArray(inner.dates)) {
            return inner.dates.filter(d => d.isFullyBooked).map(d => d.date);
        }
        // Fallback: flat array of date strings (old format)
        if (Array.isArray(inner)) {
            return inner.map(d => typeof d === 'string' ? d : '');
        }
        return [];
    }, [availData]);

    // Save unitId to sessionStorage
    useEffect(() => {
        if (unitId) sessionStorage.setItem('booking_unitId', unitId);
    }, [unitId]);

    // Redirect if no unit selected
    useEffect(() => {
        if (!unitId) navigate('/user/pesan');
    }, [unitId, navigate]);

    const pricePerDay = unit?.pricePerDay || 0;

    // Calendar computation
    const calendarData = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        const startDow = firstDay.getDay(); // 0 = Sunday

        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const days = [];
        // Empty cells before month start
        for (let i = 0; i < startDow; i++) {
            days.push({ type: 'empty' });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isPast = dateStr < todayStr;
            const isBooked = bookedDates.includes(dateStr);
            const dayOfWeek = new Date(currentYear, currentMonth - 1, d).getDay();

            days.push({
                type: 'day',
                day: d,
                dateStr,
                isPast,
                isBooked,
                dayOfWeek,
            });
        }

        return days;
    }, [currentMonth, currentYear, bookedDates, today]);

    // Toggle date selection
    const toggleDate = (dateStr) => {
        setSelectedDates(prev => {
            const next = prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr].sort();
            return next;
        });
    };

    const subtotal = selectedDates.length * pricePerDay;

    const prevMonth = () => {
        // Don't go before current month
        const nowMonth = today.getMonth() + 1;
        const nowYear = today.getFullYear();
        if (currentYear === nowYear && currentMonth <= nowMonth) return;
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const canGoPrev = !(currentYear === today.getFullYear() && currentMonth <= today.getMonth() + 1);

    const handleContinue = () => {
        sessionStorage.setItem('booking_dates', JSON.stringify(selectedDates));
        navigate(`/user/pesan/materi?unitId=${unitId}`);
    };

    // Format a date string to display name
    const formatDateDisplay = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getDayName = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return DAY_NAMES_FULL[d.getDay()];
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
                            <span className="text-sm font-medium text-green-600 text-center cursor-pointer hover:text-green-700"><Link to="/user/pesan">Pilih Videotron</Link></span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 rounded mx-2 relative"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold ring-4 ring-blue-100 shadow-md">2</div>
                            <span className="text-sm font-semibold text-[#2563EB] text-center">Pilih Tanggal</span>
                        </div>
                        <div className="h-1 flex-1 bg-slate-200 rounded mx-2"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-500 font-semibold">3</div>
                            <span className="text-sm font-medium text-slate-500 text-center">Upload Materi</span>
                        </div>
                        <div className="h-1 flex-1 bg-slate-200 rounded mx-2"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-500 font-semibold">4</div>
                            <span className="text-sm font-medium text-slate-500 text-center">Checkout</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Calendar Selection Column */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">{MONTH_NAMES[currentMonth - 1]} {currentYear}</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevMonth}
                                        disabled={!canGoPrev}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            <div className="w-full">
                                {/* Calendar Header */}
                                <div className="grid grid-cols-7 mb-2">
                                    {DAY_NAMES_SHORT.map(day => (
                                        <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">{day}</div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarData.map((cell, idx) => {
                                        if (cell.type === 'empty') {
                                            return <div key={`empty-${idx}`} className="aspect-square"></div>;
                                        }

                                        const { day, dateStr, isPast, isBooked } = cell;
                                        const isSelected = selectedDates.includes(dateStr);

                                        if (isPast) {
                                            return (
                                                <button key={dateStr} disabled className="aspect-square rounded-lg flex flex-col items-center justify-center text-slate-300 bg-slate-50 cursor-not-allowed border border-transparent">
                                                    <span className="text-sm font-medium">{day}</span>
                                                </button>
                                            );
                                        }

                                        if (isBooked) {
                                            return (
                                                <div key={dateStr} className="relative group aspect-square">
                                                    <button disabled className="w-full h-full rounded-lg flex flex-col items-center justify-center text-red-500 bg-red-50 cursor-not-allowed border border-red-200">
                                                        <span className="text-sm font-medium">{day}</span>
                                                        <span className="text-[10px] text-red-400 mt-1">Penuh</span>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-red-700 text-white text-xs rounded shadow-lg z-10">
                                                        Slot Penuh
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => toggleDate(dateStr)}
                                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${isSelected
                                                    ? 'text-white bg-[#2563EB] shadow-md shadow-blue-500/30 border border-[#2563EB] ring-2 ring-blue-200'
                                                    : 'text-slate-700 hover:bg-blue-50 hover:text-primary hover:border-primary border border-slate-200 bg-white shadow-sm'
                                                    }`}
                                            >
                                                <span className="text-sm font-bold">{day}</span>
                                                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-green-600'} mt-1`}>
                                                    {isSelected ? 'Dipilih' : formatCurrencyShort(pricePerDay)}
                                                </span>
                                                {isSelected && (
                                                    <div className="absolute top-1 right-1 bg-white text-[#2563EB] rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                                                        <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-white border border-slate-200"></div>
                                    <span className="text-xs text-slate-500">Tersedia</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-[#2563EB] border border-[#2563EB]"></div>
                                    <span className="text-xs text-slate-500">Dipilih</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-red-50 border border-red-200"></div>
                                    <span className="text-xs text-slate-500">Penuh / Dipesan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-slate-50 border border-transparent"></div>
                                    <span className="text-xs text-slate-500">Sudah Lewat</span>
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
                                <div className="mb-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Dipilih ({selectedDates.length})</span>
                                        {selectedDates.length > 0 && (
                                            <button onClick={() => setSelectedDates([])} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Hapus Semua</button>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {selectedDates.length === 0 ? (
                                            <div className="text-sm text-slate-400 italic py-2">Belum ada tanggal dipilih.</div>
                                        ) : selectedDates.map(dateStr => (
                                            <div key={dateStr} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{formatDateDisplay(dateStr)}</span>
                                                    <span className="text-xs text-slate-500">{getDayName(dateStr)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-slate-900">{formatCurrencyShort(pricePerDay)}</span>
                                                    <button onClick={() => toggleDate(dateStr)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
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
                        <Link to="/user/pesan" className="flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Kembali
                        </Link>
                        <button
                            onClick={handleContinue}
                            disabled={selectedDates.length === 0}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all sm:w-auto ${selectedDates.length > 0
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

export default UserBookingStep2Page;
