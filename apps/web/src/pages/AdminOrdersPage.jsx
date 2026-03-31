import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAdminOrders, useDeleteOrder } from '../hooks/useAdmin';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const statusFilterTabs = [
    { key: '', label: 'Semua' },
    { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
    { key: 'sudah_bayar', label: 'Sudah Bayar' },
    { key: 'tayang', label: 'Tayang' },
    { key: 'selesai', label: 'Selesai' },
];

const statusMap = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-purple-100 text-purple-800' },
    tayang: { label: 'Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const ITEMS_PER_PAGE = 10;

const AdminOrdersPage = () => {
    const [activeFilter, setActiveFilter] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const { data, isLoading, error } = useAdminOrders({
        status: activeFilter || undefined,
        search: search || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
    });

    const deleteOrderMutation = useDeleteOrder();

    const orders = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleFilterChange = (key) => {
        setActiveFilter(key);
        setPage(1);
    };



    const handleDelete = (orderId) => {
        setConfirmAction({
            type: 'delete',
            orderId,
            title: 'Hapus Pesanan',
            message: 'Apakah Anda yakin ingin menghapus pesanan ini? Data akan dihapus permanen dan tidak bisa dikembalikan.',
        });
    };

    const executeConfirm = () => {
        if (!confirmAction) return;
        const { orderId } = confirmAction;
        setConfirmAction(null);
        setDeletingId(orderId);
        deleteOrderMutation.mutate(orderId, {
            onSuccess: () => setDeletingId(null),
            onError: () => setDeletingId(null),
        });
    };

    const handleExport = () => {
        if (!orders.length) return;
        const headers = ['ID Pesanan', 'Nama User', 'Email', 'Lokasi', 'Total', 'Status'];
        const rows = orders.map(item => [
            item.order.orderNumber,
            item.user?.name || '',
            item.user?.email || '',
            item.unit?.name || '',
            item.order.totalAmount,
            item.order.status,
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pesanan-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <AdminLayout title="Kelola Pesanan">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daftar Pesanan</h2>
                    <p className="text-slate-500">Kelola dan verifikasi pesanan yang masuk dari pengguna.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-1 min-h-[500px] flex flex-col">
                {/* Filters */}
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {statusFilterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleFilterChange(tab.key)}
                                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeFilter === tab.key
                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined text-lg">search</span>
                            </span>
                            <input
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                                placeholder="Cari ID atau Nama User..."
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID Pesanan</th>
                                <th className="px-6 py-4 font-semibold">Nama User</th>
                                <th className="px-6 py-4 font-semibold">Lokasi Videotron</th>
                                <th className="px-6 py-4 font-semibold">Total Bayar</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                    <p className="mt-2">Memuat data pesanan...</p>
                                </td></tr>
                            ) : error ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-red-500">Gagal memuat: {error.message}</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl">inbox</span>
                                    <p className="mt-2">Belum ada pesanan</p>
                                </td></tr>
                            ) : orders.map((item) => {
                                const order = item.order;
                                const unit = item.unit;
                                const usr = item.user;
                                const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
                                const initials = (usr?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const isDeleting = deletingId === order.id;

                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">#{order.orderNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{usr?.name || '-'}</span>
                                                    <span className="text-xs text-slate-500">{usr?.email || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{unit?.name || '-'}</span>
                                                <span className="text-xs text-slate-500">{unit?.location || ''}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{formatCurrency(order.totalAmount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/pesanan/detail/${order.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    Detail
                                                </Link>
                                                {order.status === 'menunggu_verifikasi' && (
                                                    <Link
                                                        to={`/admin/pesanan/verify/${order.id}`}
                                                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                                                        title="Verifikasi"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">verified</span>
                                                        Verifikasi
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    disabled={isDeleting}
                                                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Hapus Pesanan"
                                                >
                                                    <span className="material-symbols-outlined text-sm">{isDeleting ? 'progress_activity' : 'delete'}</span>
                                                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} dari {total} pesanan</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">Sebelumnya</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">Selanjutnya</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={!!confirmAction}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                variant="danger"
                confirmText="Ya, Hapus"
                onConfirm={executeConfirm}
                onCancel={() => setConfirmAction(null)}
            />
        </AdminLayout>
    );
};

export default AdminOrdersPage;
