import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAllBankSettings, useCreateBankSetting, useUpdateBankSetting, useDeleteBankSetting } from '../hooks/useSettings';

const AdminSettingsPage = () => {
    const { data: bankSettings, isLoading, error } = useAllBankSettings();
    const createMutation = useCreateBankSetting();
    const updateMutation = useUpdateBankSetting();
    const deleteMutation = useDeleteBankSetting();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ bankName: '', accountNumber: '', accountHolder: '', isActive: true });
    const [successMsg, setSuccessMsg] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const banks = Array.isArray(bankSettings?.data) ? bankSettings.data : Array.isArray(bankSettings) ? bankSettings : [];

    const openAdd = () => {
        setEditingId(null);
        setFormData({ bankName: '', accountNumber: '', accountHolder: '', isActive: true });
        setShowForm(true);
    };

    const openEdit = (bank) => {
        setEditingId(bank.id);
        setFormData({ bankName: bank.bankName, accountNumber: bank.accountNumber, accountHolder: bank.accountHolder, isActive: bank.isActive });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, ...formData }, {
                onSuccess: () => { setShowForm(false); setSuccessMsg('Berhasil diperbarui!'); setTimeout(() => setSuccessMsg(''), 3000); },
                onError: (err) => alert('Gagal: ' + err.message),
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => { setShowForm(false); setSuccessMsg('Berhasil ditambahkan!'); setTimeout(() => setSuccessMsg(''), 3000); },
                onError: (err) => alert('Gagal: ' + err.message),
            });
        }
    };

    const handleDelete = (id) => {
        setConfirmAction({
            type: 'delete',
            id,
            title: 'Hapus Rekening Bank',
            message: 'Apakah Anda yakin ingin menghapus rekening ini? Tindakan ini tidak bisa dikembalikan.',
        });
    };

    const executeConfirm = () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        setConfirmAction(null);
        deleteMutation.mutate(id);
    };

    return (
        <AdminLayout title="Pengaturan">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Rekening Bank</h2>
                <p className="text-slate-500">Kelola rekening bank untuk menerima pembayaran dari pengguna.</p>
            </div>

            {successMsg && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span className="text-sm text-emerald-800 font-medium">{successMsg}</span>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Rekening</h3>
                    <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Tambah Rekening
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nama Bank</th>
                                <th className="px-6 py-4 font-medium">No. Rekening</th>
                                <th className="px-6 py-4 font-medium">Atas Nama</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-red-500">Gagal: {error.message}</td></tr>
                            ) : banks.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada rekening bank</td></tr>
                            ) : banks.map((bank) => (
                                <tr key={bank.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">account_balance</span>
                                            </div>
                                            {bank.bankName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">{bank.accountNumber}</td>
                                    <td className="px-6 py-4">{bank.accountHolder}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${bank.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {bank.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(bank)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(bank.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Hapus">
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

            {/* Add/Edit Form */}
            {showForm && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{editingId ? 'Edit Rekening' : 'Tambah Rekening Baru'}</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nama Bank</label>
                                <input value={formData.bankName} onChange={(e) => setFormData(p => ({ ...p, bankName: e.target.value }))} required
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Bank Kaltimtara" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">No. Rekening</label>
                                <input value={formData.accountNumber} onChange={(e) => setFormData(p => ({ ...p, accountNumber: e.target.value }))} required
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="0012345678901" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Atas Nama</label>
                                <input value={formData.accountHolder} onChange={(e) => setFormData(p => ({ ...p, accountHolder: e.target.value }))} required
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Dinas Kominfo Bontang" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                            <label htmlFor="isActive" className="text-sm text-slate-700">Rekening Aktif</label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50">
                                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
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

export default AdminSettingsPage;
