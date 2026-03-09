import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CmsImageUpload from '../components/CmsImageUpload';

const DEFAULT_CMS = {
    // Header / Navbar
    siteName: 'Videotron Booking',
    heroTitle: 'Iklankan Bisnis Anda di Titik Strategis Kota',
    heroSubtitle: 'Jangkau ribuan audiens setiap hari dengan videotron LED kualitas tinggi di lokasi premium. Pesan slot iklan Anda dengan mudah dan cepat.',
    heroBadge: 'Solusi Periklanan Digital Modern',
    // Logo
    appLogo: '',
    // Banners (base64 data URLs)
    bannerLanding: '',
    bannerLogin: '',
    bannerRegister: '',
    bannerResetPassword: '',
    // Social Links
    socialFacebook: '',
    socialInstagram: '',
    socialWebsite: '',
    // Footer
    footerDescription: 'Platform pemesanan videotron resmi Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika.',
    footerAddress: 'Jl. Bessai Berinta, Gedung Graha Taman Praja Blok I Lantai III, Kelurahan. Bontang Lestari, Kecamatan Bontang Selatan',
    footerEmail: 'diskominfo@bontangkota.go.id',
    footerPhone: '+62 811 5813 036',
    footerWhatsapp: '+62 811 5813 036',
    footerCopyright: '© 2026 Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika',
    // How It Works
    howTitle: 'Cara Kerja Sederhana',
    howSubtitle: 'Promosikan bisnis Anda hanya dalam 3 langkah mudah tanpa proses yang berbelit-belit.',
    howStep1Title: 'Pilih Lokasi',
    howStep1Desc: 'Cari titik strategis yang sesuai dengan target audiens Anda. Kami menyediakan data trafik untuk setiap lokasi.',
    howStep2Title: 'Tentukan Jadwal',
    howStep2Desc: 'Atur durasi dan waktu tayang iklan sesuai kebutuhan kampanye. Fleksibilitas penuh dalam genggaman Anda.',
    howStep3Title: 'Upload Materi',
    howStep3Desc: 'Unggah video iklan Anda dengan mudah dan lakukan pembayaran dengan aman melalui sistem terintegrasi.',
};

const STORAGE_KEY = 'videotron_cms_settings';

function loadCmsSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...DEFAULT_CMS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_CMS;
}

const CmsField = ({ label, value, onChange, type = 'text', rows, hint }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {type === 'textarea' ? (
            <textarea
                rows={rows || 3}
                value={value}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
        )}
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
);

const AdminCMSPage = () => {
    const [form, setForm] = useState(loadCmsSettings);
    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Yakin ingin mengembalikan ke pengaturan default?')) {
            setForm(DEFAULT_CMS);
            localStorage.removeItem(STORAGE_KEY);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <AdminLayout title="CMS Landing Page">
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">CMS Landing Page</h1>
                        <p className="text-slate-500 mt-1">Kelola konten header, footer, banner, dan section di halaman landing page.</p>
                    </div>
                    {saved && (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Berhasil disimpan!
                        </div>
                    )}
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Logo Aplikasi */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">image</span>
                                <h2 className="text-lg font-semibold text-slate-900">Logo Aplikasi</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Logo akan ditampilkan di navbar, footer, sidebar, dan halaman login/register.</p>
                        </div>
                        <div className="p-6">
                            <CmsImageUpload
                                label="Upload Logo"
                                value={form.appLogo}
                                onChange={(dataUrl) => handleChange('appLogo', dataUrl)}
                                hint="Rekomendasi: 128×128 px (1:1 persegi), format PNG/JPG/JPEG, maks 500KB"
                                maxSizeMB={0.5}
                            />
                        </div>
                    </div>

                    {/* Header / Hero Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">web</span>
                                <h2 className="text-lg font-semibold text-slate-900">Header & Hero</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <CmsField label="Nama Situs" value={form.siteName} onChange={(e) => handleChange('siteName', e.target.value)} hint="Ditampilkan di navbar dan footer" />
                            <CmsField label="Badge Hero" value={form.heroBadge} onChange={(e) => handleChange('heroBadge', e.target.value)} />
                            <CmsField label="Judul Hero" value={form.heroTitle} onChange={(e) => handleChange('heroTitle', e.target.value)} />
                            <CmsField label="Subtitle Hero" value={form.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} type="textarea" rows={3} />
                        </div>
                    </div>

                    {/* Banner Images */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">photo_library</span>
                                <h2 className="text-lg font-semibold text-slate-900">Banner / Gambar</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Upload gambar banner untuk halaman publik. Kosongkan untuk menggunakan gambar default.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <CmsImageUpload
                                label="Banner Landing Page (Hero)"
                                value={form.bannerLanding}
                                onChange={(dataUrl) => handleChange('bannerLanding', dataUrl)}
                                hint="Rekomendasi: 1920×1080 px (16:9), format PNG/JPG/JPEG, maks 2MB"
                                maxSizeMB={2}
                            />
                            <CmsImageUpload
                                label="Banner Halaman Login"
                                value={form.bannerLogin}
                                onChange={(dataUrl) => handleChange('bannerLogin', dataUrl)}
                                hint="Rekomendasi: 800×1200 px (2:3 portrait), format PNG/JPG/JPEG, maks 1MB"
                                maxSizeMB={1}
                            />
                            <CmsImageUpload
                                label="Banner Halaman Register"
                                value={form.bannerRegister}
                                onChange={(dataUrl) => handleChange('bannerRegister', dataUrl)}
                                hint="Rekomendasi: 800×1200 px (2:3 portrait), format PNG/JPG/JPEG, maks 1MB"
                                maxSizeMB={1}
                            />
                            <CmsImageUpload
                                label="Banner Halaman Reset Password"
                                value={form.bannerResetPassword}
                                onChange={(dataUrl) => handleChange('bannerResetPassword', dataUrl)}
                                hint="Rekomendasi: 800×1200 px (2:3 portrait), format PNG/JPG/JPEG, maks 1MB"
                                maxSizeMB={1}
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">share</span>
                                <h2 className="text-lg font-semibold text-slate-900">Link Sosial Media</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <CmsField label="Facebook URL" value={form.socialFacebook} onChange={(e) => handleChange('socialFacebook', e.target.value)} hint="Contoh: https://facebook.com/diskominfobontang" />
                            <CmsField label="Instagram URL" value={form.socialInstagram} onChange={(e) => handleChange('socialInstagram', e.target.value)} hint="Contoh: https://instagram.com/diskominfobontang" />
                            <CmsField label="Website URL" value={form.socialWebsite} onChange={(e) => handleChange('socialWebsite', e.target.value)} hint="Contoh: https://bontangkota.go.id" />
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">route</span>
                                <h2 className="text-lg font-semibold text-slate-900">Cara Kerja (How It Works)</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <CmsField label="Judul Section" value={form.howTitle} onChange={(e) => handleChange('howTitle', e.target.value)} />
                            <CmsField label="Subtitle Section" value={form.howSubtitle} onChange={(e) => handleChange('howSubtitle', e.target.value)} type="textarea" rows={2} />
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Langkah 1</p>
                                <CmsField label="Judul" value={form.howStep1Title} onChange={(e) => handleChange('howStep1Title', e.target.value)} />
                                <div className="mt-2"><CmsField label="Deskripsi" value={form.howStep1Desc} onChange={(e) => handleChange('howStep1Desc', e.target.value)} type="textarea" rows={2} /></div>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Langkah 2</p>
                                <CmsField label="Judul" value={form.howStep2Title} onChange={(e) => handleChange('howStep2Title', e.target.value)} />
                                <div className="mt-2"><CmsField label="Deskripsi" value={form.howStep2Desc} onChange={(e) => handleChange('howStep2Desc', e.target.value)} type="textarea" rows={2} /></div>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Langkah 3</p>
                                <CmsField label="Judul" value={form.howStep3Title} onChange={(e) => handleChange('howStep3Title', e.target.value)} />
                                <div className="mt-2"><CmsField label="Deskripsi" value={form.howStep3Desc} onChange={(e) => handleChange('howStep3Desc', e.target.value)} type="textarea" rows={2} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">bottom_navigation</span>
                                <h2 className="text-lg font-semibold text-slate-900">Footer</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <CmsField label="Deskripsi Footer" value={form.footerDescription} onChange={(e) => handleChange('footerDescription', e.target.value)} type="textarea" rows={2} />
                            <CmsField label="Alamat Kantor" value={form.footerAddress} onChange={(e) => handleChange('footerAddress', e.target.value)} type="textarea" rows={2} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CmsField label="Email" value={form.footerEmail} onChange={(e) => handleChange('footerEmail', e.target.value)} type="email" />
                                <CmsField label="Telepon" value={form.footerPhone} onChange={(e) => handleChange('footerPhone', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CmsField label="WhatsApp" value={form.footerWhatsapp} onChange={(e) => handleChange('footerWhatsapp', e.target.value)} />
                                <CmsField label="Copyright" value={form.footerCopyright} onChange={(e) => handleChange('footerCopyright', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">restart_alt</span>
                            Reset ke Default
                        </button>
                        <button type="submit"
                            className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-lg">save</span>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminCMSPage;
