import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { useUserOrders } from '../hooks/useOrders';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const statusTabs = ['Semua', 'Verifikasi', 'Dibayar', 'Tayang', 'Selesai'];

const statusMap = {
    pending: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-800' },
    menunggu_verifikasi: { label: 'Verifikasi', color: 'bg-yellow-100 text-yellow-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-emerald-100 text-emerald-800' },
    tayang: { label: 'Sedang Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const ITEMS_PER_PAGE = 10;

const UserOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('Semua');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useUserOrders({
        status: activeTab,
        search: search || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
    });

    const orders = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <UserLayout title="Riwayat Pesanan">
            <div className="flex flex-col gap-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Pesanan</h2>
                <p className="text-slate-500">Lihat dan kelola semua pesanan penyewaan videotron Anda.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col flex-1">
                {/* Tabs & Search */}
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined text-lg">search</span>
                            </span>
                            <input
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                placeholder="Cari ID Pesanan atau Lokasi..."
                                type="text"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID Pesanan</th>
                                <th className="px-6 py-4 font-medium">Lokasi Videotron</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Total Harga</th>
                                <th className="px-6 py-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                            Memuat data pesanan...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-red-500">
                                        Gagal memuat data: {error.message}
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl">inbox</span>
                                            Belum ada pesanan
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((item) => {
                                    const order = item.order;
                                    const unit = item.unit;
                                    const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">#{order.orderNumber}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-10 w-10 rounded-lg bg-slate-200 bg-cover bg-center flex-shrink-0"
                                                        style={unit?.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}
                                                    ></div>
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
                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    to={`/user/riwayat/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} dari {total} pesanan
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

export default UserOrdersPage;
