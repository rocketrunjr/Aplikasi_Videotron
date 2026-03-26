import React from 'react';
import PetugasLayout from '../components/PetugasLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const PetugasDashboardPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['petugas', 'dashboard'],
        queryFn: () => apiClient.get('/api/petugas/dashboard'),
    });

    const dashboard = data?.data || {};
    const units = dashboard.units || [];

    return (
        <PetugasLayout title="Dashboard">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Ringkasan pesanan dan unit videotron yang Anda kelola.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pesanan</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{isLoading ? '...' : dashboard.totalOrders || 0}</h3>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pendapatan</p>
                    <h3 className="text-3xl font-bold text-emerald-600 mt-1">{isLoading ? '...' : formatCurrency(dashboard.totalRevenue)}</h3>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pesanan Aktif</p>
                    <h3 className="text-3xl font-bold text-blue-600 mt-1">{isLoading ? '...' : dashboard.activeOrders || 0}</h3>
                </div>
            </div>

            {/* Assigned Units */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-3 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Unit Videotron yang Dikelola</h3>
                </div>
                {isLoading ? (
                    <div className="px-6 py-8 text-center text-slate-400">Memuat data...</div>
                ) : units.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block">tv_off</span>
                        Belum ada unit yang di-assign ke Anda. Hubungi admin.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {units.map((unit) => (
                            <div key={unit.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
                                <div className="h-32 rounded-lg bg-slate-200 bg-cover bg-center mb-3"
                                    style={unit.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}></div>
                                <h4 className="font-bold text-slate-900">{unit.name}</h4>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {unit.location}
                                </p>
                                <div className="mt-2 text-sm font-medium text-primary">{formatCurrency(unit.pricePerDay)}<span className="text-xs text-slate-400">/hari</span></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
};

export default PetugasDashboardPage;
