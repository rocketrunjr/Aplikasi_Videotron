import React, { useState } from 'react';

const STORAGE_KEY = 'videotron_cms_settings';

function loadCmsLogo() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return data.appLogo || '';
        }
    } catch { /* ignore */ }
    return '';
}

/**
 * Unified App Logo component. Reads logo from CMS localStorage.
 * If no custom logo uploaded, renders a default icon.
 *
 * Props:
 *   size: 'sm' | 'md' | 'lg' (default: 'md')
 *   className: extra CSS classes
 */
const AppLogo = ({ size = 'md', className = '' }) => {
    const [logo] = useState(loadCmsLogo);

    const sizeMap = {
        sm: { container: 'w-6 h-6', icon: 'text-[16px]', img: 'w-6 h-6' },
        md: { container: 'w-8 h-8', icon: 'text-[20px]', img: 'w-8 h-8' },
        lg: { container: 'w-10 h-10', icon: 'text-[24px]', img: 'w-10 h-10' },
    };

    const s = sizeMap[size] || sizeMap.md;

    if (logo) {
        return (
            <img
                src={logo}
                alt="Logo"
                className={`${s.img} rounded-lg object-contain ${className}`}
            />
        );
    }

    return (
        <div className={`flex items-center justify-center ${s.container} rounded-lg bg-primary text-white ${className}`}>
            <span className={`material-symbols-outlined ${s.icon}`}>play_circle</span>
        </div>
    );
};

export default AppLogo;
