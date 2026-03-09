import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'videotron_cms_settings';
const DEFAULT_RESET_BANNER = "https://lh3.googleusercontent.com/aida-public/AB6AXuB3ltw167FPXbyNIbxQ78uSs1Wb1O55O12N74RQlfiOSzRwF-EIx_U6BjuLhNRaTfwwKzOGSN6pe_Eq3nn-s9XTICJLg2ovOr21CIo0MMuqYvdxtk1NmqX6INfHAPtKCtiOoIAjkRhjd5cuaHk9uzzkax7w3_90rXbOU8UMWlARutaS7ZUq3eopbxZ_Ax-9zc7s58KMSLqSiANY2dQDHtk5Ux43UiPVRk9KzgKTtgabUxqCGF76EZe6cNmkFjujFHl8PbgwkKJNnJ8";
function loadCms() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch { /* ignore */ } return {}; }

function validatePassword(pw) {
    return [
        { ok: pw.length >= 8, label: 'Minimal 8 karakter' },
        { ok: /[a-zA-Z]/.test(pw), label: 'Mengandung huruf' },
        { ok: /[0-9]/.test(pw), label: 'Mengandung angka' },
        { ok: /[^a-zA-Z0-9]/.test(pw), label: 'Mengandung karakter khusus (!@#$%...)' },
    ];
}

const ResetPasswordPage = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [cms] = useState(loadCms);
    const resetBanner = cms.bannerResetPassword || DEFAULT_RESET_BANNER;

    const pwChecks = validatePassword(newPassword);
    const allPass = pwChecks.every(c => c.ok);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!allPass) {
            setError('Kata sandi harus memenuhi semua kebijakan di bawah.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Kata sandi baru dan konfirmasi tidak cocok.');
            return;
        }
        // TODO: API call for reset password
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <div className="flex flex-1 justify-center items-center py-5 px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40">
                        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 w-full bg-white dark:bg-[#1a202c] rounded-2xl shadow-xl overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[600px]">
                                {/* Left Side: Visual */}
                                <div
                                    className="relative hidden lg:flex flex-col justify-end p-10 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${resetBanner}')` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div className="relative z-10 text-white">
                                        <h3 className="text-3xl font-bold mb-2">Kelola Iklan Anda</h3>
                                        <p className="text-slate-200 text-lg">Platform pemesanan videotron resmi Pemerintah Kota Bontang.</p>
                                    </div>
                                </div>

                                {/* Right Side: Form */}
                                <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-white dark:bg-[#1a202c]">
                                    <div className="w-full max-w-md mx-auto space-y-8">
                                        <div className="space-y-2">
                                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                                Atur Ulang Kata Sandi
                                            </h1>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Silakan masukkan kata sandi baru Anda di bawah ini.
                                            </p>
                                        </div>

                                        {/* Error Alert */}
                                        {error && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">error</span>
                                                {error}
                                            </div>
                                        )}

                                        <form className="space-y-6" onSubmit={handleSubmit}>
                                            {/* New Password Field */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="new-password">
                                                    Kata Sandi Baru
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                                                    </div>
                                                    <input
                                                        className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                                                        id="new-password"
                                                        name="new-password"
                                                        placeholder="••••••••"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                    <div
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                                            {showNewPassword ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Confirm Password Field */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="confirm-password">
                                                    Konfirmasi Kata Sandi Baru
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_reset</span>
                                                    </div>
                                                    <input
                                                        className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500"
                                                        id="confirm-password"
                                                        name="confirm-password"
                                                        placeholder="••••••••"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                    <div
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Password Policy Info */}
                                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">info</span>
                                                    Kebijakan Kata Sandi
                                                </p>
                                                <ul className="space-y-1">
                                                    {pwChecks.map((check, i) => (
                                                        <li key={i} className={`flex items-center gap-2 text-xs ${check.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            <span className="material-symbols-outlined text-sm">{check.ok ? 'check_circle' : 'cancel'}</span>
                                                            {check.label}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={!allPass || newPassword !== confirmPassword}
                                                className="flex w-full justify-center items-center rounded-lg bg-primary px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                Simpan Kata Sandi Baru
                                            </button>
                                        </form>

                                        <div className="mt-10 border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                                            <p className="text-xs text-slate-400">© 2026 Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
