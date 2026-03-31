import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn, useAuth } from '../hooks/useAuth';
import CloudflareTurnstile from '../components/CloudflareTurnstile';
import AppLogo from '../components/AppLogo';

const STORAGE_KEY = 'videotron_cms_settings';
const DEFAULT_LOGIN_BANNER = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4tbQQ4wVUR8HhfsroS-LMj3rZ1tlIEAo_kk6N6E83p-dED6aLuFy8DMcp7vapWgpkGXYuF4TvhTQI_Ikjzh_L6l9zvdtItNyxuaUUhBzFZjIXBvtUAyr0uCAoQ69KE5KV-Ev7JfW-X0V-nV38QBMBy-CfRVvRljBMMkQSLHu3C0_njNl3OfcW-tiED0IUgaDoSCqKWi1LqXJZU0YPMLf7cJdylRX5YBOgVjlgyd2PgLQnE0XkvbUrQFQeXQoynm7UZLMI7vn3wJE";
function loadCms() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch { /* ignore */ } return {}; }

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaKey, setCaptchaKey] = useState(0);
    const [cms] = useState(loadCms);
    const loginBanner = cms.bannerLogin || DEFAULT_LOGIN_BANNER;
    const navigate = useNavigate();
    const signInMutation = useSignIn();
    const { user } = useAuth();

    // If already logged in, redirect
    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (user.role === 'petugas') {
                navigate('/petugas', { replace: true });
            } else {
                navigate('/user/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await signInMutation.mutateAsync({ email, password, captchaToken });
            if (result?.error) {
                // If it's a 400 with our custom message or a generic error with 'captcha' inside
                const isCaptchaErr = result.error.status === 400 || result.error.message?.toLowerCase().includes('captcha');
                setError(isCaptchaErr ? 'Verifikasi Captcha gagal. Silakan muat ulang halaman atau coba lagi.' : (result.error.message || 'Email atau kata sandi salah.'));
                // Reset captcha
                setCaptchaToken('');
                setCaptchaKey(k => k + 1);
                return;
            }
            // After successful sign in, useAuth will update and useEffect will redirect
        } catch (err) {
            const isCaptchaErr = err?.status === 400 || err?.message?.toLowerCase().includes('captcha');
            setError(isCaptchaErr ? 'Verifikasi Captcha gagal. Silakan muat ulang halaman atau coba lagi.' : (err?.message || 'Email atau kata sandi salah. Silakan coba lagi.'));
            // Reset captcha
            setCaptchaToken('');
            setCaptchaKey(k => k + 1);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-neutral-900 dark:text-neutral-50 antialiased h-screen flex flex-col overflow-hidden">
            <div className="flex flex-1 h-full w-full">
                {/* Left Side: Image/Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900">
                    <div
                        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${loginBanner}')` }}
                    >
                    </div>
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/80 to-neutral-900/90 mix-blend-multiply"></div>
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent"></div>

                    {/* Branding Content */}
                    <div className="relative z-30 flex flex-col justify-end p-12 h-full text-white">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                    <AppLogo size="lg" className="!bg-transparent" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">Videotron Booking</span>
                            </div>
                            <h2 className="text-4xl font-bold leading-tight mb-4 max-w-lg">Jangkau Jutaan Mata di Pusat Kota</h2>
                            <p className="text-neutral-200 text-lg max-w-md leading-relaxed">
                                Kelola kampanye iklan videotron Anda dengan mudah, efisien, dan transparan melalui dashboard kami.
                            </p>
                        </div>
                        {/* Testimonial / Social Proof */}
                        <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                            <div className="flex -space-x-3">
                                <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmfxkV18ic_qE4hKnaGmTd-AsoWY0iftbcl0QvXcyoPdElnJy0zqFIgbWHOZiqUFmAKHiACCllF7vz3YOieAMt9Gp70hajaMUe-Ik03CWmYZ436PTI6AX4c7Siz6O4-dYcPVJkL4AgoEiuOFsZ68-ZB5s0nV4Q2LcgPcxaYN-KQwm1Y-hYT0M9wNg6zKYwXblA85FUzk8D17_eEd_IeLpxeZ2yShlawOV6Quu1YnUL_YpgJyTvH504rNilvZtqHL1YpkmF_7Ier3I" />
                                <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpHuvAbjtbjTvlHxy8VwbIIP1V13inFMLBOaqCeXN4V5yU0TZ0gbV2hkQ90ValozZVgBSmW4ixmX13UD6d3etrDV0evhylbPcZamf6-nWWtVPx7SnCAT0tdHTeN178lXPMab63k7-dZ63lx1VCuDUsXLLDGoE6nK_7nD1d1SP6OTo2zsHv1GdbYLp0pvEQz1obYbP_gY25i9s-mHselH8zQe13KEJj0rSjoe9Ov2OVLU1ER1Zx5hGVKZSamHmTrOx0VGxo7oto9m4" />
                                <img alt="User 3" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhPVw1RCIm82T5fFkw1MRjW0-C94XMrUdPPBXHLZGAQ0RBrtlqyNpLSjBRYILA3DRh_TdXAvzqYcMzxSbSC5linM456zl1Ub_xwpLvAmXVBAkQDtoBWOwsC0vUEEPlorZtkYpQpUidiB_yfQIiBEMOi6MDaqYsbfyXZ_MBhq6B2ayPyFPzUP1uuBJWxw4ozN9ZKV6qJI1WeOkXzAgJ0i_aHqjkcZspcKfA1N-K69RyvMWjfDWQDEiQTCexJRoq9Os5ksLlgUAp0gA" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">Dipercaya oleh 500+ Brand</p>
                                <p className="text-neutral-300">Bergabunglah bersama kami hari ini.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto bg-white dark:bg-background-dark">
                    <div className="w-full max-w-[440px] space-y-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="flex items-center gap-2 text-primary">
                                <AppLogo size="lg" />
                                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Videotron Booking</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Selamat Datang Kembali</h1>
                            <p className="text-neutral-500 dark:text-neutral-400">Masuk untuk mengelola kampanye videotron Anda.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-700 dark:text-neutral-300" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        className="flex h-12 w-full rounded-lg border border-neutral-200 bg-background-light px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:ring-offset-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-400"
                                        id="email"
                                        placeholder="nama@perusahaan.com"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={signInMutation.isPending}
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-3 top-3 text-neutral-400">
                                        <span className="material-symbols-outlined text-xl">mail</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-700 dark:text-neutral-300" htmlFor="password">
                                        Kata Sandi
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        className="flex h-12 w-full rounded-lg border border-neutral-200 bg-background-light px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:ring-offset-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-400 pr-10"
                                        id="password"
                                        placeholder="Masukkan kata sandi"
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={signInMutation.isPending}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600 dark:bg-neutral-700 dark:ring-offset-neutral-900" type="checkbox" />
                                    <span className="text-neutral-600 dark:text-neutral-400">Ingat saya</span>
                                </label>
                                <Link className="font-medium text-primary hover:text-primary-hover hover:underline" to="/reset-password">
                                    Lupa Kata Sandi?
                                </Link>
                            </div>

                            {/* Cloudflare Turnstile Captcha — only loads after password entered */}
                            {email && password.length >= 1 && (
                                <div className="flex justify-center">
                                    <CloudflareTurnstile
                                        key={captchaKey}
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                        onVerify={(token) => setCaptchaToken(token)}
                                        onExpire={() => setCaptchaToken('')}
                                        theme="light"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-12 w-full shadow-sm hover:shadow-md"
                                type="submit"
                                disabled={signInMutation.isPending || !email || !password || !captchaToken}
                            >
                                {signInMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : 'Masuk'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="text-center text-sm">
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Belum punya akun?{' '}
                                <Link className="font-semibold text-primary hover:text-primary-hover hover:underline transition-all" to="/register">
                                    Daftar Sekarang
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer for Copyright */}
                    <div className="absolute bottom-6 w-full text-center lg:text-left lg:pl-12 lg:hidden">
                        <p className="text-xs text-neutral-400">© 2026 Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
