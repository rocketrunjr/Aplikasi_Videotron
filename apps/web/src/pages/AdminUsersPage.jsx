import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAllUsers, useSuspendUser, useActivateUser, useDeleteUser, useUpdateUser, useResetUserPassword } from '../hooks/useUsers';

const ITEMS_PER_PAGE = 10;

const AdminUsersPage = () => {
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAccountType, setFilterAccountType] = useState('');
    const [page, setPage] = useState(1);
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', role: '', phone: '', company: '', accountType: '' });
    const [editSuccess, setEditSuccess] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // { type, userId, title, message }

    const { data, isLoading, error } = useAllUsers({
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        accountType: filterAccountType || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
    });

    const suspendMutation = useSuspendUser();
    const activateMutation = useActivateUser();
    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();
    const resetPasswordMutation = useResetUserPassword();

    const users = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    const total = data?.total || data?.meta?.total || users.length;

    const handleSuspend = (userId) => {
        setConfirmAction({
            type: 'suspend',
            userId,
            title: 'Tangguhkan Pengguna',
            message: 'Apakah Anda yakin ingin menangguhkan pengguna ini? Pengguna yang ditangguhkan tidak akan bisa login.',
            variant: 'warning',
        });
    };

    const handleActivate = (userId) => {
        setConfirmAction({
            type: 'activate',
            userId,
            title: 'Aktifkan Pengguna',
            message: 'Apakah Anda yakin ingin mengaktifkan kembali pengguna ini?',
            variant: 'info',
        });
    };

    const handleDelete = (userId) => {
        setConfirmAction({
            type: 'delete',
            userId,
            title: 'Hapus Pengguna',
            message: 'Apakah Anda yakin ingin menghapus pengguna ini? Data akan dihapus permanen dan tidak bisa dikembalikan.',
            variant: 'danger',
        });
    };

    const executeConfirm = () => {
        if (!confirmAction) return;
        const { type, userId } = confirmAction;
        setConfirmAction(null);
        if (type === 'suspend') {
            suspendMutation.mutate(userId);
        } else if (type === 'activate') {
            activateMutation.mutate(userId);
        } else if (type === 'delete') {
            deleteMutation.mutate(userId);
        }
    };

    const openEditModal = (u) => {
        setEditUser(u);
        setEditForm({
            name: u.name || '',
            role: u.role || 'user',
            phone: u.phone || '',
            company: u.company || '',
            accountType: u.accountType || 'pribadi',
        });
        setEditSuccess('');
        setNewPassword('');
        setPasswordMsg('');
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate({ id: editUser.id, ...editForm }, {
            onSuccess: () => {
                setEditSuccess('Data pengguna berhasil diperbarui.');
                setTimeout(() => { setEditUser(null); setEditSuccess(''); }, 1500);
            },
        });
    };

    const colors = ['bg-slate-200 text-slate-600', 'bg-indigo-100 text-indigo-600', 'bg-orange-100 text-orange-600', 'bg-emerald-100 text-emerald-600'];

    return (
        <AdminLayout title="Manajemen Pengguna">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Pengguna</h2>
                <p className="text-slate-500">Kelola akses dan aktivitas pengguna terdaftar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                <div className="md:col-span-5 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </div>
                    <input className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                        placeholder="Cari nama, email, atau perusahaan..." type="text" value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div className="md:col-span-2">
                    <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                        className="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        <option value="">Semua Role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="petugas">Petugas</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        className="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="suspended">Ditangguhkan</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <select value={filterAccountType} onChange={(e) => { setFilterAccountType(e.target.value); setPage(1); }}
                        className="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        <option value="">Semua Tipe Akun</option>
                        <option value="pribadi">Pribadi</option>
                        <option value="perusahaan">Perusahaan</option>
                        <option value="pemerintah">Pemerintah</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nama</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium text-center">Role</th>
                                <th className="px-6 py-4 font-medium text-center">Tipe</th>
                                <th className="px-6 py-4 font-medium">No. HP</th>
                                <th className="px-6 py-4 font-medium">Perusahaan</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-red-500">Gagal: {error.message}</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Belum ada pengguna</td></tr>
                            ) : users.map((u) => {
                                const initials = (u.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const isBanned = u.banned || u.status === 'suspended';
                                const ci = Math.abs(u.name?.charCodeAt(0) || 0) % colors.length;
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${colors[ci]}`}>{initials}</div>
                                                <span className={`font-medium ${isBanned ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'petugas' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                                                {u.role === 'admin' ? 'Admin' : u.role === 'petugas' ? 'Petugas' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.accountType === 'perusahaan' ? 'bg-blue-100 text-blue-800' : u.accountType === 'pemerintah' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {u.accountType?.charAt(0).toUpperCase() + u.accountType?.slice(1) || 'Pribadi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.phone || '-'}</td>
                                        <td className="px-6 py-4">{u.company || <span className="text-slate-400 italic">-</span>}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${isBanned ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {isBanned ? 'Ditangguhkan' : 'Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {isBanned ? (
                                                    <button onClick={() => handleActivate(u.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Aktifkan">
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSuspend(u.id)} className="p-1 text-orange-500 hover:bg-orange-50 rounded" title="Tangguhkan">
                                                        <span className="material-symbols-outlined text-lg">block</span>
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(u.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Hapus">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {total > 0 && (
                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-white rounded-b-xl">
                    <span className="text-sm text-slate-500">
                        Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} dari {total} pengguna
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
                            onClick={() => setPage(p => Math.min(Math.ceil(total / ITEMS_PER_PAGE), p + 1))}
                            disabled={page >= Math.ceil(total / ITEMS_PER_PAGE)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditUser(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-900">Edit Pengguna</h3>
                            <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {editSuccess && (
                            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                {editSuccess}
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                                <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select value={editForm.role} onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                                    <option value="user">User</option>
                                    <option value="petugas">Petugas</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Akun</label>
                                <select value={editForm.accountType} onChange={(e) => setEditForm(p => ({ ...p, accountType: e.target.value }))}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                                    <option value="pribadi">Pribadi</option>
                                    <option value="perusahaan">Perusahaan</option>
                                    <option value="pemerintah">Pemerintah</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
                                <input type="text" value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Perusahaan</label>
                                <input type="text" value={editForm.company} onChange={(e) => setEditForm(p => ({ ...p, company: e.target.value }))}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditUser(null)}
                                    className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Batal</button>
                                <button type="submit" disabled={updateMutation.isPending}
                                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
                                    {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>

                        {/* Password Reset Section */}
                        <div className="mt-5 pt-5 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-slate-400">lock_reset</span>
                                Reset Password
                            </h4>
                            {passwordMsg && (
                                <div className={`mb-3 rounded-lg p-3 text-xs flex items-center gap-2 ${passwordMsg.includes('berhasil') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                    <span className="material-symbols-outlined text-sm">{passwordMsg.includes('berhasil') ? 'check_circle' : 'error'}</span>
                                    {passwordMsg}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Password baru (min. 5 karakter)"
                                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                                <button
                                    type="button"
                                    disabled={resetPasswordMutation.isPending || newPassword.length < 5}
                                    onClick={() => {
                                        resetPasswordMutation.mutate({ id: editUser.id, password: newPassword }, {
                                            onSuccess: () => {
                                                setPasswordMsg('Password berhasil direset!');
                                                setNewPassword('');
                                            },
                                            onError: (err) => {
                                                setPasswordMsg(err.message || 'Gagal mereset password');
                                            },
                                        });
                                    }}
                                    className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    {resetPasswordMutation.isPending ? '...' : 'Reset'}
                                </button>
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
                variant={confirmAction?.variant || 'danger'}
                confirmText={confirmAction?.type === 'delete' ? 'Ya, Hapus' : confirmAction?.type === 'suspend' ? 'Ya, Tangguhkan' : 'Ya, Aktifkan'}
                onConfirm={executeConfirm}
                onCancel={() => setConfirmAction(null)}
            />
        </AdminLayout>
    );
};

export default AdminUsersPage;
