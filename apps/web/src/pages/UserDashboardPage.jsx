import React from 'react';
import UserLayout from '../components/UserLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserDashboardStats, useUserRecentOrders } from '../hooks/useDashboard';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatCurrencyShort = (amount) => {
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
    return `Rp ${amount}`;
};

const statusMap = {
    pending: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-800' },
    menunggu_verifikasi: { label: 'Verifikasi', color: 'bg-yellow-100 text-yellow-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-purple-100 text-purple-800' },
    tayang: { label: 'Sedang Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-800' },
};

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { data: statsData, isLoading: statsLoading } = useUserDashboardStats();
    const { data: ordersData, isLoading: ordersLoading } = useUserRecentOrders();

    const stats = statsData?.data || statsData || {};
    const recentOrders = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];

    const firstName = user?.name?.split(' ')[0] || 'User';

    return (
        <UserLayout title="Dashboard">
            <div className="mx-auto w-full max-w-7xl">
                <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Selamat Datang, {firstName}! 👋</h2>
                    <p className="text-slate-500">Berikut adalah ringkasan aktivitas penyewaan videotron Anda.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Pesanan</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {statsLoading ? '...' : stats?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <span className="material-symbols-outlined">shopping_cart</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Sedang Tayang</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {statsLoading ? '...' : stats?.currentlyBroadcasting || 0}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <span className="material-symbols-outlined">play_circle</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className="text-slate-500">{stats?.currentlyBroadcasting || 0} Lokasi aktif saat ini</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Menunggu Pembayaran</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {statsLoading ? '...' : stats?.awaitingPayment || 0}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            {stats?.awaitingPayment > 0 && (
                                <span className="text-amber-600 font-medium">Segera selesaikan</span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Pengeluaran</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {statsLoading ? '...' : formatCurrencyShort(stats?.totalSpending || 0)}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h3 className="text-base font-semibold text-slate-900">Pesanan Terbaru</h3>
                        <Link to="/user/riwayat" className="text-sm font-medium text-primary hover:text-primary-hover">Lihat Semua</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">ID Pesanan</th>
                                    <th className="px-6 py-4 font-medium">Lokasi Videotron</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Total Harga</th>
                                    <th className="px-6 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {ordersLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
                                ) : !recentOrders || recentOrders.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Belum ada pesanan</td></tr>
                                ) : (
                                    recentOrders.map((item) => {
                                        const order = item.order;
                                        const unit = item.unit;
                                        const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">#{order.orderNumber}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-200 bg-cover bg-center flex-shrink-0"
                                                            style={unit?.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">{unit?.name || 'Unit'}</span>
                                                            <span className="text-xs text-slate-500">{unit?.location || ''}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/user/riwayat/${order.id}`} className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined">visibility</span>
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
        </UserLayout>
    );
};

export default UserDashboardPage;
