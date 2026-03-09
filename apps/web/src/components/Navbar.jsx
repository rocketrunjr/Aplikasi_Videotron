import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from './AppLogo';

const STORAGE_KEY = 'videotron_cms_settings';
function loadCms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
}

const Navbar = () => {
    const [cms] = useState(loadCms);
    const siteName = cms.siteName || 'Videotron Booking';

    return (
        <header className="sticky top-0 z-50 w-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <AppLogo size="md" />
                        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">{siteName}</span>
                    </Link>

                    {/* Desktop Nav Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="hidden md:flex items-center justify-center h-9 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
