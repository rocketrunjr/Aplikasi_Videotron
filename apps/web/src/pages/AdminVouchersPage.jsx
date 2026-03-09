import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAllVouchers, useCreateVoucher, useToggleVoucher, useDeleteVoucher } from '../hooks/useVouchers';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

const AdminVouchersPage = () => {
    const { data: vouchersData, isLoading } = useAllVouchers();
    const createMutation = useCreateVoucher();
    const toggleMutation = useToggleVoucher();
    const deleteMutation = useDeleteVoucher();

    const [showModal, setShowModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [form, setForm] = useState({
        code: '',
        discountAmount: '',
        discountType: 'fixed',
        usageLimit: '',
        validFrom: '',
        validUntil: '',
    });

    const vouchers = Array.isArray(vouchersData?.data) ? vouchersData.data : [];

    const openModal = () => {
        setForm({ code: generateRandomCode(), discountAmount: '', discountType: 'fixed', usageLimit: '', validFrom: '', validUntil: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountAmount) return;
        createMutation.mutate({
            code: form.code,
            discountAmount: Number(form.discountAmount),
            discountType: form.discountType,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
            validFrom: form.validFrom || undefined,
            validUntil: form.validUntil || undefined,
        }, {
            onSuccess: () => setShowModal(false),
            onError: (err) => alert(err.message || 'Gagal membuat voucher'),
        });
    };

    const handleDelete = (id) => {
        setConfirmAction({
            type: 'delete',
            id,
            title: 'Hapus Voucher',
            message: 'Apakah Anda yakin ingin menghapus voucher ini? Tindakan ini tidak bisa dikembalikan.',
        });
    };

    const executeConfirm = () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        setConfirmAction(null);
        deleteMutation.mutate(id);
    };

    return (
        <AdminLayout title="Voucher">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Kelola Voucher</h1>
                        <p className="text-slate-500 mt-1">Buat dan kelola kode voucher diskon.</p>
                    </div>
                    <button onClick={openModal}
                        className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Generate Voucher
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4">Kode</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Nominal</th>
                                    <th className="px-6 py-4">Penggunaan</th>
                                    <th className="px-6 py-4">Berlaku</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Memuat data...</td></tr>
                                ) : vouchers.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Belum ada voucher</td></tr>
                                ) : vouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs">{v.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v.discountType === 'percentage' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {v.discountType === 'percentage' ? 'Persen' : 'Nominal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {v.discountType === 'percentage' ? `${v.discountAmount}%` : formatCurrency(v.discountAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {v.usedCount}/{v.usageLimit === 0 ? '∞' : v.usageLimit}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {v.validFrom ? new Date(v.validFrom).toLocaleDateString('id-ID') : '-'} s/d {v.validUntil ? new Date(v.validUntil).toLocaleDateString('id-ID') : 'Selamanya'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {v.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => toggleMutation.mutate(v.id)} title={v.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                    className={`rounded-lg p-1.5 transition-colors ${v.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                                                    <span className="material-symbols-outlined text-lg">{v.isActive ? 'toggle_on' : 'toggle_off'}</span>
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} title="Hapus"
                                                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Generate Voucher Baru</h2>
                        <p className="text-sm text-slate-500 mb-6">Buat kode voucher diskon baru.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Voucher</label>
                                <div className="flex gap-2">
                                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <button type="button" onClick={() => setForm({ ...form, code: generateRandomCode() })}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 transition-colors" title="Generate ulang">
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Diskon</label>
                                    <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="fixed">Nominal (Rp)</option>
                                        <option value="percentage">Persen (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {form.discountType === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)'}
                                    </label>
                                    <input type="number" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder={form.discountType === 'percentage' ? 'misal: 10' : 'misal: 50000'} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batas Penggunaan (0 = tidak terbatas)</label>
                                <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="0" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Berlaku Dari</label>
                                    <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Berlaku Sampai</label>
                                    <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Batal</button>
                                <button type="submit" disabled={createMutation.isPending}
                                    className="rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all disabled:opacity-50">
                                    {createMutation.isPending ? 'Menyimpan...' : 'Buat Voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default AdminVouchersPage;
