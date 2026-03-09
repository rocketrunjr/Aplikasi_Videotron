import React, { useState } from 'react';
import AppLogo from './AppLogo';

const STORAGE_KEY = 'videotron_cms_settings';
function loadCms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
}

const Footer = () => {
    const [cms] = useState(loadCms);

    const siteName = cms.siteName || 'Videotron Booking';
    const description = cms.footerDescription || 'Platform pemesanan videotron resmi Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika.';
    const address = cms.footerAddress || 'Jl. Bessai Berinta, Gedung Graha Taman Praja Blok I Lantai III, Kelurahan. Bontang Lestari, Kecamatan Bontang Selatan';
    const email = cms.footerEmail || 'diskominfo@bontangkota.go.id';
    const phone = cms.footerPhone || '+62 811 5813 036';
    const whatsapp = cms.footerWhatsapp || '+62 811 5813 036';
    const copyright = cms.footerCopyright || '© 2026 Pemerintah Kota Bontang, Dinas Komunikasi dan Informatika';
    const fbLink = cms.socialFacebook || '#';
    const igLink = cms.socialInstagram || '#';
    const webLink = cms.socialWebsite || '#';

    const waNumber = whatsapp.replace(/[^0-9]/g, '');

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Info */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <AppLogo size="md" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{siteName}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            {description}
                        </p>
                        <div className="flex gap-4">
                            {/* Facebook */}
                            <a href={fbLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path></svg>
                            </a>
                            {/* Instagram */}
                            <a href={igLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Instagram</span>
                                <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-3.196 8.45a3.802 3.802 0 107.592 0 3.802 3.802 0 00-7.592 0zm6.54-3.535a1.205 1.205 0 112.41 0 1.205 1.205 0 01-2.41 0z" fillRule="evenodd"></path></svg>
                            </a>
                            {/* Website */}
                            <a href={webLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Website</span>
                                <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
                            </a>
                        </div>
                    </div>

                    {/* Hubungi Kami */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Hubungi Kami</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-sm">call</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-sm">mail</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{email}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" /></svg>
                                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">WhatsApp: {whatsapp}</a>
                            </li>
                        </ul>
                    </div>

                    {/* Kantor */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Kantor</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">map</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        {copyright}
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-400">Bahasa Indonesia</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
