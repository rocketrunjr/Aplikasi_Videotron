import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../hooks/useAuth';
import { useProfile, useUpdateProfile, useUploadFile } from '../hooks/useUploads';

const AdminProfilePage = () => {
    const { user } = useAuth();
    const { data: profileData, isLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const uploadFileMutation = useUploadFile();

    const profile = profileData?.data || profileData;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const p = profile || user;
        if (p) {
            setFormData({
                name: p.name || '',
                email: p.email || '',
                phone: p.phone || '',
                company: p.company || '',
                address: p.address || '',
            });
        }
    }, [profile, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        updateProfileMutation.mutate(formData, {
            onSuccess: () => {
                setSuccessMessage('Profil berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (err) => {
                setErrorMessage(err.message || 'Gagal memperbarui profil');
                setTimeout(() => setErrorMessage(''), 5000);
            },
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('Password baru tidak cocok');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setErrorMessage('Password minimal 6 karakter');
            return;
        }

        try {
            const { authClient } = await import('../lib/auth-client');
            await authClient.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setSuccessMessage('Password berhasil diubah!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.message || 'Gagal mengubah password');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', 'avatar');

        uploadFileMutation.mutate(fd, {
            onSuccess: (res) => {
                const url = res?.data?.url || res?.url;
                if (url) {
                    updateProfileMutation.mutate({ ...formData, image: url }, {
                        onSuccess: () => {
                            setSuccessMessage('Foto profil berhasil diperbarui!');
                            setTimeout(() => setSuccessMessage(''), 3000);
                            window.location.reload();
                        },
                    });
                }
            },
            onError: (err) => {
                setErrorMessage(err.message || 'Gagal mengunggah foto');
                setTimeout(() => setErrorMessage(''), 5000);
            },
        });
    };

    const initials = (formData.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    if (isLoading) {
        return (
            <AdminLayout title="Profil">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                        Memuat profil...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Profil">
            <div className="mx-auto w-full max-w-3xl">
                <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Profil Admin</h2>
                    <p className="text-slate-500">Kelola informasi pribadi dan keamanan akun Anda.</p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                        <span className="text-sm text-emerald-800 font-medium">{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <span className="text-sm text-red-800 font-medium">{errorMessage}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
                    <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-4">
                        <div className="relative group">
                            {user?.image ? (
                                <div className="h-16 w-16 rounded-full bg-cover bg-center ring-4 ring-slate-100"
                                    style={{ backgroundImage: `url('${user.image}')` }}></div>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-bold ring-4 ring-blue-100">
                                    {initials}
                                </div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{formData.name}</h3>
                            <p className="text-sm text-slate-500">{formData.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                    placeholder="Nama lengkap"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full h-11 bg-slate-100 border border-slate-200 rounded-lg px-4 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">No. WhatsApp</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Perusahaan</label>
                                <input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                    placeholder="Nama perusahaan (opsional)"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Alamat</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 resize-none"
                                placeholder="Alamat lengkap"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Section */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900">Keamanan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Ubah password akun Anda</p>
                        </div>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-sm font-medium text-primary hover:text-primary-hover"
                        >
                            {showPasswordForm ? 'Batal' : 'Ubah Password'}
                        </button>
                    </div>
                    {showPasswordForm && (
                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Password Saat Ini</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Password Baru</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                                >
                                    Ubah Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfilePage;
