import React, { useState } from 'react';
import UserLayout from '../components/UserLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useActiveUnits } from '../hooks/useUnits';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const breadcrumbTitle = (
    <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-medium text-slate-900">Pesan Videotron</span>
    </div>
);

const UserBookingStep1Page = () => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const navigate = useNavigate();
    const { data: units, isLoading, error } = useActiveUnits();

    const unitList = Array.isArray(units?.data) ? units.data : Array.isArray(units) ? units : [];

    return (
        <UserLayout title={breadcrumbTitle}>
            <div className="mx-auto w-full max-w-5xl pb-32">
                {/* Stepper Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold ring-4 ring-blue-100 shadow-md">1</div>
                            <span className="text-sm font-semibold text-[#2563EB] text-center">Pilih Videotron</span>
                        </div>
                        <div className="h-1 flex-1 bg-slate-200 rounded mx-2 relative"></div>
                        <div className="flex flex-col items-center gap-2 w-1/4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-300 text-slate-500 font-semibold">2</div>
                            <span className="text-sm font-medium text-slate-500 text-center">Pilih Tanggal</span>
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

                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pilih Lokasi Videotron</h2>
                        <p className="mt-1 text-slate-500">Silakan pilih titik lokasi videotron yang ingin Anda sewa dari daftar di bawah ini.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                                Memuat daftar unit videotron...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20 text-red-500">Gagal memuat data: {error.message}</div>
                    ) : unitList.length === 0 ? (
                        <div className="flex items-center justify-center py-20 text-slate-400">
                            <div className="flex flex-col items-center gap-3">
                                <span className="material-symbols-outlined text-4xl">tv_off</span>
                                Belum ada unit videotron yang tersedia
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {unitList.map((unit) => (
                                <div
                                    key={unit.id}
                                    onClick={() => setSelectedUnit(unit.id)}
                                    className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm border-2 transition-all cursor-pointer ${selectedUnit === unit.id ? 'border-[#2563EB] ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                                >
                                    <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                                        {selectedUnit === unit.id && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="inline-flex items-center rounded-full bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                    Terpilih
                                                    <span className="material-symbols-outlined ml-1 text-sm">check_circle</span>
                                                </span>
                                            </div>
                                        )}
                                        <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={unit.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : { backgroundColor: '#e2e8f0' }}></div>
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${selectedUnit === unit.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}></div>
                                        <div className="absolute bottom-3 left-3 text-white">
                                            <div className="flex items-center gap-1 text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                                                <span className="material-symbols-outlined text-sm">aspect_ratio</span>
                                                {unit.aspectRatio || '16:9'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="mb-3">
                                            <h3 className="text-lg font-bold text-slate-900">{unit.name}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {unit.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 uppercase font-semibold">Ukuran</span>
                                                <span className="text-sm font-medium text-slate-900">{unit.size || '-'}</span>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 uppercase font-semibold">Tipe</span>
                                                <span className="text-sm font-medium text-slate-900 capitalize">{unit.type || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-slate-500">Mulai dari</span>
                                                <p className={`text-lg font-bold ${selectedUnit === unit.id ? 'text-[#2563EB]' : 'text-slate-900'}`}>
                                                    {formatCurrency(unit.pricePerDay)}
                                                    <span className="text-xs font-normal text-slate-500">/hari</span>
                                                </p>
                                            </div>
                                            {selectedUnit === unit.id ? (
                                                <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </div>
                                            ) : (
                                                <button className="text-slate-400 group-hover:text-[#2563EB] transition-colors">
                                                    <span className="material-symbols-outlined">arrow_forward</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 border-t border-slate-200 bg-white p-4 lg:px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-500">Estimasi Total</p>
                        <p className="text-xl font-bold text-slate-900">
                            {selectedUnit ? formatCurrency(unitList.find(u => u.id === selectedUnit)?.pricePerDay || 0) : 'Rp 0'}
                        </p>
                    </div>
                    <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                        <button className="hidden rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:block">Batal</button>
                        <button
                            onClick={() => {
                                if (selectedUnit) {
                                    sessionStorage.setItem('booking_unitId', selectedUnit);
                                    sessionStorage.removeItem('booking_dates');
                                    navigate(`/user/pesan/tanggal?unitId=${selectedUnit}`);
                                }
                            }}
                            disabled={!selectedUnit}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all sm:w-auto ${selectedUnit
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

export default UserBookingStep1Page;
