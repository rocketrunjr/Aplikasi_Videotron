import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'videotron_cms_settings';
function loadCms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
}

const DEFAULT_BANNER = "https://lh3.googleusercontent.com/aida-public/AB6AXuD6KLRje607a6x_Hx4S75V6FpO1OPIFApc-C6vEUc4LAL0wS44IpwSYQyNFstMNddI31adaCjv9KQHFXWGpQLVADaQm0HvxZeBoNFanN1742rzdKNWr3k8kVsbyFNESHX02XEBn5ZpmxcQ_lGEMqTBe_GWvdeYb4GfFJVpe5CerdrLvgcwedfqP9aNqAM-0QQ9mwjMVem-SVKxhYp7GhMC89xrCx2A0cKhBhNofZ6oKdgx_RjYus2jCdMUfEPqxDvAX93VZy0JcDTo";

const Hero = () => {
    const [cms] = useState(loadCms);

    const badge = cms.heroBadge || 'Solusi Periklanan Digital Modern';
    const title = cms.heroTitle || 'Iklankan Bisnis Anda di Titik Strategis Kota';
    const subtitle = cms.heroSubtitle || 'Jangkau ribuan audiens setiap hari dengan videotron LED kualitas tinggi di lokasi premium. Pesan slot iklan Anda dengan mudah dan cepat.';
    const banner = cms.bannerLanding || DEFAULT_BANNER;

    return (
        <section className="relative bg-gray-900 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10"></div>
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${banner}')` }}
                >
                </div>
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-inset ring-blue-700/30 mb-6">
                        {badge}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-xl">
                        {subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/login" className="flex items-center justify-center h-12 px-6 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-blue-900/20 transition-all">
                            Pesan Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
