import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import { useAdminDashboardStats, useAdminRecentOrders, useRevenueChart, useTopUnits } from '../hooks/useDashboard';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatCurrencyShort = (amount) => {
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    return formatCurrency(amount);
};

const statusMap = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
    menunggu_verifikasi: { label: 'Verifikasi', color: 'bg-orange-100 text-orange-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-purple-100 text-purple-800' },
    tayang: { label: 'Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const PERIOD_OPTIONS = [
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' },
];

const MEDAL_COLORS = [
    'from-yellow-400 to-amber-500 text-white',
    'from-slate-300 to-slate-400 text-white',
    'from-amber-600 to-amber-700 text-white',
];

const AdminDashboardPage = () => {
    const [chartPeriod, setChartPeriod] = useState('monthly');
    const { data: statsData, isLoading: statsLoading } = useAdminDashboardStats();
    const { data: ordersData, isLoading: ordersLoading } = useAdminRecentOrders();
    const { data: chartData, isLoading: chartLoading } = useRevenueChart(chartPeriod);
    const { data: topData, isLoading: topLoading } = useTopUnits(3);

    const stats = statsData?.data || statsData || {};
    const recentOrders = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
    const chartItems = Array.isArray(chartData?.data) ? chartData.data : Array.isArray(chartData) ? chartData : [];
    const topUnits = Array.isArray(topData?.data) ? topData.data : Array.isArray(topData) ? topData : [];

    const maxRevenue = Math.max(...chartItems.map(c => Number(c.revenue) || 0), 1);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Admin</h2>
                <p className="text-slate-500">Ringkasan performa dan aktivitas terbaru sistem pemesanan videotron.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <span className="material-symbols-outlined text-xl">payments</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pendapatan</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
                    </h3>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                            <span className="material-symbols-outlined text-xl">pending_actions</span>
                        </div>
                        {stats?.pendingVerification > 0 && (
                            <span className="flex items-center text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                Perlu Tindakan
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pesanan Verifikasi</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {statsLoading ? '...' : stats?.pendingVerification || 0}
                    </h3>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <span className="material-symbols-outlined text-xl">connected_tv</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Videotron Aktif</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {statsLoading ? '...' : `${stats?.activeUnits || 0}/${stats?.totalUnits || 0}`}
                    </h3>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <span className="material-symbols-outlined text-xl">group</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pengguna</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {statsLoading ? '...' : stats?.totalUsers || 0}
                    </h3>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Pendapatan</h3>
                        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
                            {PERIOD_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setChartPeriod(opt.value)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartPeriod === opt.value
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-6">
                        {chartLoading ? (
                            <div className="flex items-center justify-center h-48 text-slate-400">
                                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                Memuat grafik...
                            </div>
                        ) : chartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <span className="material-symbols-outlined text-3xl mb-2">bar_chart</span>
                                <p className="text-sm">Belum ada data pendapatan</p>
                            </div>
                        ) : (
                            <div className="flex h-64">
                                {/* Y-axis labels */}
                                <div className="flex flex-col justify-between pr-2 py-1 text-right min-w-[60px]">
                                    {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                                        <span key={i} className="text-[10px] text-slate-400 leading-none">
                                            {formatCurrencyShort(maxRevenue * ratio)}
                                        </span>
                                    ))}
                                </div>
                                {/* Chart area */}
                                <div className="flex-1 relative border-l border-b border-slate-200">
                                    {/* Grid lines */}
                                    {[0, 25, 50, 75].map((pct) => (
                                        <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{ bottom: `${pct}%` }}></div>
                                    ))}
                                    {/* Bars */}
                                    <div className="flex items-end h-full gap-1 px-1">
                                        {chartItems.map((item, i) => {
                                            const rev = Number(item.revenue) || 0;
                                            const height = Math.max((rev / maxRevenue) * 100, 2);
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                        {formatCurrency(rev)}
                                                    </div>
                                                    {/* Value label */}
                                                    <span className="text-[9px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                                                        {rev > 0 ? formatCurrency(rev) : ''}
                                                    </span>
                                                    {/* Bar */}
                                                    <div
                                                        className="w-full max-w-[48px] mx-auto rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500 hover:from-blue-700 hover:to-blue-500 min-h-[3px] cursor-pointer"
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                    {/* X-axis label */}
                                                    <span className="text-[10px] text-slate-500 mt-1.5 truncate w-full text-center">{item.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top 3 Videotron Revenue */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Top Videotron</h3>
                        <span className="material-symbols-outlined text-amber-500 text-lg">emoji_events</span>
                    </div>
                    <div className="p-4">
                        {topLoading ? (
                            <div className="flex items-center justify-center h-40 text-slate-400">
                                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                            </div>
                        ) : topUnits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <span className="material-symbols-outlined text-3xl mb-2">tv_off</span>
                                <p className="text-sm">Belum ada data</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {topUnits.map((unit, i) => (
                                    <div key={unit.unitId || i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${MEDAL_COLORS[i] || 'from-slate-200 to-slate-300 text-slate-600'} text-sm font-bold shadow-sm`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{unit.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{unit.location}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(unit.totalRevenue || 0)}</p>
                                            <p className="text-[10px] text-slate-400">{unit.totalOrders || 0} pesanan</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="flex flex-col gap-6 flex-1 min-h-0">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-none">
                    <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Pesanan Terakhir</h3>
                        <Link to="/admin/pesanan" className="text-xs font-medium text-primary hover:text-primary-hover hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-2.5 font-medium">ID Pesanan</th>
                                    <th className="px-6 py-2.5 font-medium">Pengguna</th>
                                    <th className="px-6 py-2.5 font-medium">Unit Videotron</th>
                                    <th className="px-6 py-2.5 font-medium text-right">Total (Rp)</th>
                                    <th className="px-6 py-2.5 font-medium text-center">Status</th>
                                    <th className="px-6 py-2.5 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {ordersLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
                                ) : !recentOrders || recentOrders.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada pesanan</td></tr>
                                ) : (
                                    recentOrders.map((item) => {
                                        const order = item.order;
                                        const unit = item.unit;
                                        const usr = item.user;
                                        const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-2.5 font-mono text-xs text-slate-500">#{order.orderNumber}</td>
                                                <td className="px-6 py-2.5 font-medium text-slate-900">{usr?.name || '-'}</td>
                                                <td className="px-6 py-2.5 text-xs">{unit?.name || '-'}</td>
                                                <td className="px-6 py-2.5 text-right font-medium text-slate-900">{new Intl.NumberFormat('id-ID').format(order.totalAmount)}</td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <Link to={order.status === 'menunggu_verifikasi' || order.status === 'pending' ? `/admin/pesanan/verify/${order.id}` : `/admin/pesanan/detail/${order.id}`} className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
