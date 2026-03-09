import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAdminUnits, useCreateUnit, useUpdateUnit, useToggleUnitStatus, useDeleteUnit } from '../hooks/useAdmin';
import { useUploadFile } from '../hooks/useUploads';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const AdminUnitsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '', code: '', location: '', city: 'Bontang', size: '', type: 'outdoor', aspectRatio: '16:9', pricePerDay: '', maxSlotsPerDay: '1',
    });
    const [imageFile, setImageFile] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const { data, isLoading, error } = useAdminUnits({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
    });

    const createMutation = useCreateUnit();
    const updateMutation = useUpdateUnit();
    const toggleStatusMutation = useToggleUnitStatus();
    const deleteMutation = useDeleteUnit();
    const uploadFileMutation = useUploadFile();

    const units = data?.data || data || [];

    const openAddModal = () => {
        setEditingUnit(null);
        setFormData({ name: '', code: '', location: '', city: 'Bontang', size: '', type: 'outdoor', aspectRatio: '16:9', pricePerDay: '', maxSlotsPerDay: '1' });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (unit) => {
        setEditingUnit(unit);
        setFormData({
            name: unit.name || '', code: unit.code || '', location: unit.location || '', city: unit.city || 'Bontang',
            size: unit.size || '', type: unit.type || 'outdoor', aspectRatio: unit.aspectRatio || '16:9',
            pricePerDay: unit.pricePerDay?.toString() || '',
            maxSlotsPerDay: unit.maxSlotsPerDay?.toString() || '1',
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        let imageUrl = editingUnit?.imageUrl || null;

        if (imageFile) {
            try {
                const uploadRes = await uploadFileMutation.mutateAsync({ type: 'unit-image', file: imageFile });
                imageUrl = uploadRes?.data?.url || uploadRes?.url || uploadRes?.data?.fileUrl || uploadRes?.fileUrl;
            } catch (err) {
                alert('Gagal upload gambar: ' + err.message);
                return;
            }
        }

        const payload = {
            ...formData,
            pricePerDay: parseInt(formData.pricePerDay) || 0,
            maxSlotsPerDay: parseInt(formData.maxSlotsPerDay) || 1,
            imageUrl,
        };

        if (editingUnit) {
            updateMutation.mutate({ id: editingUnit.id, ...payload }, {
                onSuccess: () => setIsModalOpen(false),
                onError: (err) => alert('Gagal: ' + err.message),
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => setIsModalOpen(false),
                onError: (err) => alert('Gagal: ' + err.message),
            });
        }
    };

    const handleDelete = (unitId) => {
        setConfirmAction({
            type: 'delete',
            unitId,
            title: 'Hapus Unit Videotron',
            message: 'Apakah Anda yakin ingin menghapus unit ini? Unit yang memiliki pesanan terkait tidak bisa dihapus.',
        });
    };

    const executeConfirm = () => {
        if (!confirmAction) return;
        const { unitId } = confirmAction;
        setConfirmAction(null);
        deleteMutation.mutate(unitId, {
            onError: (err) => alert('Gagal menghapus unit: ' + (err?.message || 'Unit mungkin memiliki pesanan terkait')),
        });
    };

    const handleToggle = (unitId) => {
        toggleStatusMutation.mutate(unitId, {
            onError: (err) => alert('Gagal mengubah status unit: ' + (err?.message || 'Terjadi kesalahan')),
        });
    };

    return (
        <AdminLayout title="Kelola Unit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kelola Unit Videotron</h2>
                    <p className="text-slate-500 text-sm">Manajemen daftar inventaris dan status unit videotron.</p>
                </div>
                <button onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm hover:shadow transition-all focus:ring-4 focus:ring-blue-100">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Tambah Unit Baru
                </button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-72">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="material-symbols-outlined text-lg">search</span>
                    </span>
                    <input
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                        placeholder="Cari nama unit atau lokasi..."
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Status:</span>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-24">Gambar</th>
                                <th className="px-6 py-4 font-semibold">Nama Unit</th>
                                <th className="px-6 py-4 font-semibold">Lokasi</th>
                                <th className="px-6 py-4 font-semibold">Ukuran</th>
                                <th className="px-6 py-4 font-semibold text-right">Harga / Hari</th>
                                <th className="px-6 py-4 font-semibold text-center">Slot/Hari</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-center w-36">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                    <p className="mt-2">Memuat data unit...</p>
                                </td></tr>
                            ) : error ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-red-500">Gagal memuat: {error.message}</td></tr>
                            ) : units.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl">tv_off</span>
                                    <p className="mt-2">Belum ada unit videotron</p>
                                </td></tr>
                            ) : units.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="h-16 w-24 rounded-lg bg-slate-200 bg-cover bg-center border border-slate-300 shadow-sm"
                                            style={unit.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{unit.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">ID: {unit.code}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                                            {unit.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{unit.size || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(unit.pricePerDay)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">{unit.maxSlotsPerDay || 1}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input checked={unit.isActive} onChange={() => handleToggle(unit.id)} className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEditModal(unit)} className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Edit Unit">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(unit.id)} className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Hapus Unit">
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

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-[60] overflow-y-auto" role="dialog">
                    <div className="fixed inset-0 bg-gray-900/75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 pointer-events-none">
                        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl pointer-events-auto">
                            <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">{editingUnit ? 'Edit Unit Videotron' : 'Tambah Unit Videotron'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none" type="button">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="px-4 py-6 sm:p-6 bg-white">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Foto Unit</label>
                                        <div className="flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="text-center">
                                                <span className="material-symbols-outlined mx-auto h-12 w-12 text-slate-300 group-hover:text-primary transition-colors">image</span>
                                                <div className="mt-2 flex text-sm leading-6 text-slate-600 justify-center">
                                                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none hover:text-primary-hover">
                                                        <span>{imageFile ? imageFile.name : 'Upload foto'}</span>
                                                        <input className="sr-only" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                                                    </label>
                                                    {!imageFile && <p className="pl-1">atau drag and drop</p>}
                                                </div>
                                                <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF hingga 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium leading-6 text-slate-900">Kode Unit</label>
                                            <input value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="VT-BTG-006" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium leading-6 text-slate-900">Nama Unit</label>
                                            <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="Nama videotron" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-slate-900">Lokasi</label>
                                        <input value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                            className="mt-1 block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="Alamat lokasi pemasangan" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium leading-6 text-slate-900">Ukuran</label>
                                            <input value={formData.size} onChange={(e) => setFormData(p => ({ ...p, size: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="12m x 6m" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium leading-6 text-slate-900">Harga per Hari</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-500 sm:text-sm">Rp</span>
                                                </div>
                                                <input value={formData.pricePerDay} onChange={(e) => setFormData(p => ({ ...p, pricePerDay: e.target.value }))}
                                                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="0" type="number" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium leading-6 text-slate-900">Maks Tayangan/Hari</label>
                                            <input value={formData.maxSlotsPerDay} onChange={(e) => setFormData(p => ({ ...p, maxSlotsPerDay: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" placeholder="1" type="number" min="1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100">
                                <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || uploadFileMutation.isPending}
                                    className="inline-flex w-full justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover sm:ml-3 sm:w-auto transition-colors disabled:opacity-50">
                                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Unit'}
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors" type="button">Batal</button>
                            </div>
                        </div>
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

export default AdminUnitsPage;
