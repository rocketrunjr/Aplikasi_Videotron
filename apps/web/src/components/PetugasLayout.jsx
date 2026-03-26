import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useSignOut } from '../hooks/useAuth';
import AppLogo from './AppLogo';

const PetugasLayout = ({ children, title = "Dashboard" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const signOutMutation = useSignOut();

    const isActive = (path) => {
        if (path === '/petugas') return location.pathname === '/petugas';
        return location.pathname.startsWith(path);
    };

    const getLinkClasses = (path) => {
        const base = "flex items-center gap-3 rounded-lg px-5 py-3 transition-all";
        return isActive(path)
            ? `${base} bg-primary text-white shadow-md shadow-blue-900/20 relative`
            : `${base} text-slate-400 hover:bg-slate-800 hover:text-white`;
    };

    const getIconClasses = (path) => `material-symbols-outlined ${isActive(path) ? 'font-bold' : ''}`;
    const getIconStyle = (path) => isActive(path) ? { fontVariationSettings: "'FILL' 1" } : {};
    const getLabelClasses = (path) => `text-sm ${isActive(path) ? 'font-bold' : 'font-medium'}`;

    const handleLogout = () => {
        signOutMutation.mutate(undefined, { onSuccess: () => navigate('/') });
    };

    const userName = user?.name || 'Petugas';
    const userEmail = user?.email || 'petugas@videotron.id';
    const userImage = user?.image;
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="flex min-h-screen w-full bg-background-light">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 flex-col justify-between border-r border-slate-800 bg-slate-900 p-0 hidden lg:flex text-slate-100 z-50">
                <div className="flex flex-col gap-8 p-4">
                    <div className="flex items-center gap-3 px-2">
                        <AppLogo size="lg" />
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-white">Videotron</h1>
                            <p className="text-xs text-slate-400">Petugas Portal</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <Link to="/petugas" className={getLinkClasses('/petugas')}>
                            <span className={getIconClasses('/petugas')} style={getIconStyle('/petugas')}>dashboard</span>
                            <span className={getLabelClasses('/petugas')}>Dashboard</span>
                        </Link>
                        <Link to="/petugas/pesanan" className={getLinkClasses('/petugas/pesanan')}>
                            <span className={getIconClasses('/petugas/pesanan')} style={getIconStyle('/petugas/pesanan')}>receipt_long</span>
                            <span className={getLabelClasses('/petugas/pesanan')}>Pesanan</span>
                        </Link>
                        <Link to="/petugas/laporan" className={getLinkClasses('/petugas/laporan')}>
                            <span className={getIconClasses('/petugas/laporan')} style={getIconStyle('/petugas/laporan')}>assessment</span>
                            <span className={getLabelClasses('/petugas/laporan')}>Laporan</span>
                        </Link>
                        <Link to="/petugas/voucher" className={getLinkClasses('/petugas/voucher')}>
                            <span className={getIconClasses('/petugas/voucher')} style={getIconStyle('/petugas/voucher')}>confirmation_number</span>
                            <span className={getLabelClasses('/petugas/voucher')}>Voucher</span>
                        </Link>
                        <Link to="/petugas/profil" className={getLinkClasses('/petugas/profil')}>
                            <span className={getIconClasses('/petugas/profil')} style={getIconStyle('/petugas/profil')}>person</span>
                            <span className={getLabelClasses('/petugas/profil')}>Profil</span>
                        </Link>
                    </nav>
                </div>

                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-3 border-t border-slate-800 px-2 pt-4">
                        {userImage ? (
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 ring-2 ring-slate-700"
                                style={{ backgroundImage: `url("${userImage}")` }}></div>
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-600 text-xs font-bold text-white">
                                {initials}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{userName}</p>
                            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                        </div>
                        <button onClick={handleLogout} disabled={signOutMutation.isPending}
                            className="ml-auto text-slate-500 hover:text-slate-300" title="Keluar">
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
                <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <AppLogo size="md" />
                    </div>
                    <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
                        {typeof title === 'string' ? (
                            <span className="font-medium text-slate-900">{title}</span>
                        ) : title}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4"></div>
                </header>

                <div className="flex flex-1 flex-col p-4 lg:p-8 gap-6 overflow-hidden">
                    <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PetugasLayout;
