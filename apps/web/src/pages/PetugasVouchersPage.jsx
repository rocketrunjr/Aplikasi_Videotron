import React, { useState } from 'react';
import PetugasLayout from '../components/PetugasLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const PetugasVouchersPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [formData, setFormData] = useState({
        code: '', discountAmount: '', discountType: 'fixed', usageLimit: '0', validFrom: '', validUntil: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['petugas', 'vouchers'],
        queryFn: () => apiClient.get('/api/petugas/vouchers'),
    });
    const vouchers = data?.data || [];

    const createMutation = useMutation({ mutationFn: (body) => apiClient.post('/api/petugas/vouchers', body), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['petugas', 'vouchers'] }); setIsModalOpen(false); } });
    const updateMutation = useMutation({ mutationFn: ({ id, ...body }) => apiClient.patch(`/api/petugas/vouchers/${id}`, body), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['petugas', 'vouchers'] }); setIsModalOpen(false); } });
    const deleteMutation = useMutation({ mutationFn: (id) => apiClient.delete(`/api/petugas/vouchers/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['petugas', 'vouchers'] }) });

    const openAddModal = () => {
        setEditingVoucher(null);
        setFormData({ code: '', discountAmount: '', discountType: 'fixed', usageLimit: '0', validFrom: '', validUntil: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (v) => {
        setEditingVoucher(v);
        setFormData({
            code: v.code || '', discountAmount: v.discountAmount?.toString() || '',
            discountType: v.discountType || 'fixed', usageLimit: v.usageLimit?.toString() || '0',
            validFrom: v.validFrom ? new Date(v.validFrom).toISOString().slice(0, 10) : '',
            validUntil: v.validUntil ? new Date(v.validUntil).toISOString().slice(0, 10) : '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        const payload = { ...formData, discountAmount: parseInt(formData.discountAmount) || 0, usageLimit: parseInt(formData.usageLimit) || 0 };
        if (editingVoucher) { updateMutation.mutate({ id: editingVoucher.id, ...payload }); }
        else { createMutation.mutate(payload); }
    };

    const handleToggle = (v) => {
        updateMutation.mutate({ id: v.id, isActive: !v.isActive });
    };

    return (
        <PetugasLayout title="Voucher">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kelola Voucher</h2>
                    <p className="text-slate-500 text-sm">Buat dan kelola kode voucher diskon.</p>
                </div>
                <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm">
                    <span className="material-symbols-outlined text-lg">add</span>Tambah Voucher
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Kode</th>
                                <th className="px-6 py-3 font-medium">Diskon</th>
                                <th className="px-6 py-3 font-medium">Tipe</th>
                                <th className="px-6 py-3 font-medium text-center">Penggunaan</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                                <th className="px-6 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Memuat...</td></tr>
                            ) : vouchers.length === 0 ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada voucher</td></tr>
                            ) : vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/80">
                                    <td className="px-6 py-3 font-mono font-bold text-slate-900">{v.code}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900">{v.discountType === 'percentage' ? `${v.discountAmount}%` : formatCurrency(v.discountAmount)}</td>
                                    <td className="px-6 py-3 capitalize">{v.discountType}</td>
                                    <td className="px-6 py-3 text-center">{v.usedCount || 0}{v.usageLimit > 0 ? ` / ${v.usageLimit}` : ' / ∞'}</td>
                                    <td className="px-6 py-3 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input checked={v.isActive} onChange={() => handleToggle(v)} className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEditModal(v)} className="w-8 h-8 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all inline-flex items-center justify-center"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            <button onClick={() => setConfirmAction({ id: v.id, title: 'Hapus Voucher', message: `Hapus voucher ${v.code}?` })} className="w-8 h-8 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all inline-flex items-center justify-center"><span className="material-symbols-outlined text-lg">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/75" onClick={() => setIsModalOpen(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4 pointer-events-none">
                        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg pointer-events-auto">
                            <div className="border-b px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-slate-900">{editingVoucher ? 'Edit Voucher' : 'Tambah Voucher'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500"><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <div className="px-6 py-6 space-y-4">
                                <div><label className="block text-sm font-medium text-slate-900 mb-1">Kode Voucher</label>
                                    <input value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm font-mono" placeholder="DISKON20" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-900 mb-1">Jumlah Diskon</label>
                                        <input type="number" value={formData.discountAmount} onChange={(e) => setFormData(p => ({ ...p, discountAmount: e.target.value }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm" placeholder="0" /></div>
                                    <div><label className="block text-sm font-medium text-slate-900 mb-1">Tipe</label>
                                        <select value={formData.discountType} onChange={(e) => setFormData(p => ({ ...p, discountType: e.target.value }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm">
                                            <option value="fixed">Fixed (Rp)</option><option value="percentage">Persentase (%)</option>
                                        </select></div>
                                </div>
                                <div><label className="block text-sm font-medium text-slate-900 mb-1">Batas Penggunaan (0 = tidak terbatas)</label>
                                    <input type="number" value={formData.usageLimit} onChange={(e) => setFormData(p => ({ ...p, usageLimit: e.target.value }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm" min="0" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-900 mb-1">Berlaku Dari</label>
                                        <input type="date" value={formData.validFrom} onChange={(e) => setFormData(p => ({ ...p, validFrom: e.target.value }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm" /></div>
                                    <div><label className="block text-sm font-medium text-slate-900 mb-1">Berlaku Sampai</label>
                                        <input type="date" value={formData.validUntil} onChange={(e) => setFormData(p => ({ ...p, validUntil: e.target.value }))} className="w-full rounded-md border-0 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-primary text-sm" /></div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 border-t">
                                <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">{createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}</button>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50">Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog open={!!confirmAction} title={confirmAction?.title || ''} message={confirmAction?.message || ''} variant="danger" confirmText="Ya, Hapus"
                onConfirm={() => { deleteMutation.mutate(confirmAction.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />
        </PetugasLayout>
    );
};

export default PetugasVouchersPage;
