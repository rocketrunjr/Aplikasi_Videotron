import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActiveUnits } from '../hooks/useUnits';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const PopularLocations = () => {
    const { data: unitsData, isLoading } = useActiveUnits();
    const units = Array.isArray(unitsData?.data) ? unitsData.data : Array.isArray(unitsData) ? unitsData : [];

    const locations = units;

    const defaultImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wGFolzvaOouXfrqAF5FIvk-MazEBBFxh2Yo1IVcaEKyXpXu3Ik3Wn2InRVt34c4y_sbMKJ2OmmAhPOztQW7y0bMEtmtmnlUom4JD5w1gBHNEa46DtvhqgPxr-bTibLhvzBTuTJoLkYZviXGYI81GRg_QFeLgDVCln-g7Kn73Vy10rTJCF8Oq0ydL41VPXI3XcpmAz8wPdCiYqk-e-5-OIbSWNPV4ift8BdbrwdyJjP5KZvnq-e88BQc3WqzNRYYUK8wannERq1c';

    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            if (el) el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [locations]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 320;
        el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    };

    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
                            Lokasi Videotron Populer
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                            Temukan spot terbaik dengan engagement tertinggi untuk bisnis Anda.
                        </p>
                    </div>
                    {/* Navigation Arrows */}
                    {locations.length > 4 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-4xl animate-spin mr-3">progress_activity</span>
                        Memuat lokasi videotron...
                    </div>
                ) : locations.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mr-3">tv_off</span>
                        Belum ada unit videotron tersedia.
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mb-4 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <style>{`.popular-locations-scroll::-webkit-scrollbar { display: none; }`}</style>
                        {locations.map((loc) => (
                            <div key={loc.id} className="group flex flex-col bg-background-light dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg snap-start flex-shrink-0 w-[280px] sm:w-[300px]">
                                <div className="relative h-48 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span> {loc.city}
                                    </div>
                                    <div
                                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-slate-200"
                                        style={{ backgroundImage: `url('${loc.imageUrl || defaultImage}')` }}
                                    ></div>
                                </div>
                                <div className="flex flex-col flex-1 p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{loc.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span> {loc.location}
                                    </p>
                                    <p className="text-[12px] text-gray-400 mb-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">aspect_ratio</span> {loc.size} • {loc.type === 'outdoor' ? 'Outdoor' : 'Indoor'}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Mulai dari</p>
                                            <p className="text-base font-bold text-primary">{formatCurrency(loc.pricePerDay)}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/hari</span></p>
                                        </div>
                                        <Link to="/user/pesan" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularLocations;
