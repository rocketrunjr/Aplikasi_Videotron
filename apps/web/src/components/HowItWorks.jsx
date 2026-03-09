import React, { useState } from 'react';

const STORAGE_KEY = 'videotron_cms_settings';
function loadCms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
}

const HowItWorks = () => {
    const [cms] = useState(loadCms);

    const title = cms.howTitle || 'Cara Kerja Sederhana';
    const subtitle = cms.howSubtitle || 'Promosikan bisnis Anda hanya dalam 3 langkah mudah tanpa proses yang berbelit-belit.';
    const steps = [
        { num: 1, icon: 'location_on', title: cms.howStep1Title || 'Pilih Lokasi', desc: cms.howStep1Desc || 'Cari titik strategis yang sesuai dengan target audiens Anda. Kami menyediakan data trafik untuk setiap lokasi.' },
        { num: 2, icon: 'calendar_month', title: cms.howStep2Title || 'Tentukan Jadwal', desc: cms.howStep2Desc || 'Atur durasi dan waktu tayang iklan sesuai kebutuhan kampanye. Fleksibilitas penuh dalam genggaman Anda.' },
        { num: 3, icon: 'cloud_upload', title: cms.howStep3Title || 'Upload Materi', desc: cms.howStep3Desc || 'Unggah video iklan Anda dengan mudah dan lakukan pembayaran dengan aman melalui sistem terintegrasi.' },
    ];

    return (
        <section className="py-20 bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {subtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.num} className="relative group bg-white dark:bg-neutral-800 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute -top-6 left-8 flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white font-bold text-xl shadow-lg shadow-blue-900/20">
                                {step.num}
                            </div>
                            <div className="mt-6 mb-4 text-primary dark:text-blue-400">
                                <span className="material-symbols-outlined text-[48px]">{step.icon}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
