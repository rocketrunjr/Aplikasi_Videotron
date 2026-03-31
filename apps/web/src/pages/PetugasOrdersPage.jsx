import React, { useState } from 'react';
import PetugasLayout from '../components/PetugasLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
const statusMap = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
    menunggu_verifikasi: { label: 'Verifikasi', color: 'bg-orange-100 text-orange-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-purple-100 text-purple-800' },
    tayang: { label: 'Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const PetugasOrdersPage = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['petugas', 'orders', statusFilter, page],
        queryFn: () => apiClient.get('/api/petugas/orders', { status: statusFilter || undefined, page, limit: 20 }),
    });

    const orders = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <PetugasLayout title="Pesanan">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pesanan</h2>
                <p className="text-slate-500">Daftar pesanan dari unit videotron yang Anda kelola.</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Status:</span>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                        <option value="sudah_bayar">Sudah Bayar</option>
                        <option value="tayang">Tayang</option>
                        <option value="selesai">Selesai</option>
                        <option value="ditolak">Ditolak</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">No. Pesanan</th>
                                <th className="px-6 py-3 font-medium">Tanggal</th>
                                <th className="px-6 py-3 font-medium">Pemesan</th>
                                <th className="px-6 py-3 font-medium">Unit</th>
                                <th className="px-6 py-3 font-medium text-right">Total</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                                <th className="px-6 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Belum ada pesanan</td></tr>
                            ) : orders.map((order) => {
                                const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-slate-500">{order.orderNumber}</td>
                                        <td className="px-6 py-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{order.userName || '-'}</td>
                                        <td className="px-6 py-3">{order.unitName || '-'}</td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-900">{formatCurrency(order.totalAmount)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.color}`}>{st.label}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <Link to={`/petugas/pesanan/${order.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="Detail">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Sebelumnya</button>
                    <span className="text-sm text-slate-500">Halaman {page} dari {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Selanjutnya</button>
                </div>
            )}
        </PetugasLayout>
    );
};

export default PetugasOrdersPage;
