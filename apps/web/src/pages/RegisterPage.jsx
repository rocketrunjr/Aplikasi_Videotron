import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp, useAuth } from '../hooks/useAuth';
import CloudflareTurnstile from '../components/CloudflareTurnstile';
import AppLogo from '../components/AppLogo';

const STORAGE_KEY = 'videotron_cms_settings';
const DEFAULT_REGISTER_BANNER = "https://lh3.googleusercontent.com/aida-public/AB6AXuCCn_IRLOgFqsDrMBTkFgBju3RL1n7izDclTebr9VHUUwqQ2m3JfoQnYLXXJgAmfgQEicefEQFXton4AiB2Y7bgmF3foU5mnyTaICrDtadeydt08lkbSSxV5lZBLYTz4pQs54s8VHkgarCIY21dm45qzkm-jD6Q4WYpylYy7lBiSAlHrxXAzjp6JEwR3UTMlerI1p9D3avZFmqG56gxBLLb9ggCc1rYkEHa1z0nE4OBIMXAPUgJ2VUZJ9u65Ng1GNWrzuiPkvhI6dY";
function loadCms() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch { /* ignore */ } return {}; }

function validatePassword(pw) {
    const checks = [
        { ok: pw.length >= 8, label: 'Minimal 8 karakter' },
        { ok: /[a-zA-Z]/.test(pw), label: 'Mengandung huruf' },
        { ok: /[0-9]/.test(pw), label: 'Mengandung angka' },
        { ok: /[^a-zA-Z0-9]/.test(pw), label: 'Mengandung karakter khusus (!@#$%...)' },
    ];
    return checks;
}

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        accountType: 'pribadi',
        terms: false,
    });
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [cms] = useState(loadCms);
    const registerBanner = cms.bannerRegister || DEFAULT_REGISTER_BANNER;
    const navigate = useNavigate();
    const signUpMutation = useSignUp();
    const { user } = useAuth();

    // If already logged in, redirect
    React.useEffect(() => {
        if (user) {
            navigate('/user/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Kata sandi dan konfirmasi tidak cocok.');
            return;
        }
        if (!formData.terms) {
            setError('Anda harus menyetujui syarat & ketentuan.');
            return;
        }

        // Password policy validation
        const pwChecks = validatePassword(formData.password);
        const allPass = pwChecks.every(c => c.ok);
        if (!allPass) {
            setError('Kata sandi harus minimal 8 karakter, mengandung huruf, angka, dan karakter khusus.');
            return;
        }

        try {
            const result = await signUpMutation.mutateAsync({
                name: formData.fullname,
                email: formData.email,
                password: formData.password,
                phone: formData.whatsapp,
                accountType: formData.accountType,
                captchaToken: captchaToken,
            });
            if (result?.error) {
                setError(result.error.message || 'Registrasi gagal.');
                return;
            }
            // Auto-login after sign up, redirect will happen via useEffect
        } catch (err) {
            setError(err?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            {/* Header / Navbar (Simplified for Auth Page) */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 lg:px-10 py-3">
                <Link to="/" className="flex items-center gap-3">
                    <AppLogo size="md" />
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Videotron Booking</h2>
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500 hidden sm:block">Sudah punya akun?</span>
                    <Link
                        to="/login"
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                        <span className="truncate">Login</span>
                    </Link>
                </div>
            </header>

            {/* Main Content: Split Screen */}
            <main className="flex-1 flex flex-col lg:flex-row h-full">
                {/* Left Side: Visual / Branding */}
                <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center"
                        style={{ backgroundImage: `url('${registerBanner}')` }}
                    ></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    <div className="relative z-20 px-12 max-w-lg text-center lg:text-left">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/10">
                            <span className="material-symbols-outlined text-white text-3xl">ad_units</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                            Jangkau Jutaan Mata dengan Videotron.
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            Platform pemesanan videotron #1 di Indonesia. Pilih lokasi strategis, atur jadwal, dan pantau performa iklan Anda secara real-time.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span className="text-white text-sm font-medium">Lokasi Premium</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span className="text-white text-sm font-medium">Harga Transparan</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span className="text-white text-sm font-medium">Laporan Real-time</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span className="text-white text-sm font-medium">Support 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-background-dark overflow-y-auto">
                    <div className="w-full max-w-md space-y-8">
                        {/* Form Header */}
                        <div className="text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daftar Akun Baru</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Lengkapi data diri Anda untuk mulai memesan spot videotron.
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
                            {/* Account Type Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipe Akun</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['pribadi', 'perusahaan', 'pemerintah'].map((type) => (
                                        <label key={type} className="cursor-pointer group">
                                            <input
                                                className="peer sr-only"
                                                name="accountType"
                                                type="radio"
                                                value={type}
                                                checked={formData.accountType === type}
                                                onChange={handleChange}
                                            />
                                            <div className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm font-medium text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary peer-checked:text-primary transition-all">
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Personal Information Inputs */}
                            <div className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="fullname">Nama Lengkap</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                                        </div>
                                        <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" id="fullname" name="fullname" placeholder="Masukkan nama lengkap Anda" required type="text" value={formData.fullname} onChange={handleChange} disabled={signUpMutation.isPending} />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                                        </div>
                                        <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" id="email" name="email" placeholder="contoh@email.com" required type="email" value={formData.email} onChange={handleChange} disabled={signUpMutation.isPending} />
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="whatsapp">No. WhatsApp</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">chat</span>
                                        </div>
                                        <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" id="whatsapp" name="whatsapp" placeholder="0812xxxxxx" required type="tel" value={formData.whatsapp} onChange={handleChange} disabled={signUpMutation.isPending} />
                                    </div>
                                </div>

                                {/* Password Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">Kata Sandi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                                            </div>
                                            <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" id="password" name="password" placeholder="••••••••" required type="password" value={formData.password} onChange={handleChange} disabled={signUpMutation.isPending} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirmPassword">Konfirmasi Sandi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_reset</span>
                                            </div>
                                            <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required type="password" value={formData.confirmPassword} onChange={handleChange} disabled={signUpMutation.isPending} />
                                        </div>
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
                                    {validatePassword(formData.password).map((check, i) => (
                                        <li key={i} className={`flex items-center gap-2 text-xs ${check.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-sm">{check.ok ? 'check_circle' : 'cancel'}</span>
                                            {check.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700" id="terms" name="terms" required type="checkbox" checked={formData.terms} onChange={handleChange} />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label className="font-medium text-slate-700 dark:text-slate-300" htmlFor="terms">
                                        Saya menyetujui <a className="text-primary hover:text-primary-hover underline" href="#">Syarat & Ketentuan</a> serta <a className="text-primary hover:text-primary-hover underline" href="#">Kebijakan Privasi</a>.
                                    </label>
                                </div>
                            </div>

                            {/* Cloudflare Turnstile Captcha */}
                            <div className="flex justify-center">
                                <CloudflareTurnstile
                                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                    onVerify={(token) => setCaptchaToken(token)}
                                    onExpire={() => setCaptchaToken('')}
                                    theme="light"
                                />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-bold leading-normal text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                                    type="submit"
                                    disabled={signUpMutation.isPending || !captchaToken}
                                >
                                    {signUpMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses...
                                        </span>
                                    ) : (
                                        <>
                                            <span>Daftar Sekarang</span>
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Mobile Login Link */}
                            <div className="mt-6 text-center sm:hidden">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Sudah punya akun?{' '}
                                    <Link className="font-semibold text-primary hover:text-primary-hover" to="/login">Login di sini</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
