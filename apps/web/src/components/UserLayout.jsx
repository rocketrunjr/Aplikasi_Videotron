import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useSignOut } from '../hooks/useAuth';
import AppLogo from './AppLogo';

const UserLayout = ({ children, title, headerActions }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const signOutMutation = useSignOut();

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        signOutMutation.mutate(undefined, {
            onSuccess: () => {
                navigate('/');
            },
        });
    };

    const userName = user?.name || 'User';
    const userEmail = user?.email || '';
    const userImage = user?.image;
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="flex min-h-screen w-full bg-[#f6f6f8] text-slate-900 font-['Inter',sans-serif]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 flex-col justify-between border-r border-slate-800 bg-[#111621] p-0 hidden lg:flex text-slate-100 z-50">
                <div className="flex flex-col gap-8 p-4">
                    <div className="flex items-center gap-3 px-2">
                        <AppLogo size="lg" />
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-white">Videotron</h1>
                            <p className="text-xs text-slate-400">User Panel</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <Link
                            to="/user/dashboard"
                            className={`flex items-center gap-3 rounded-lg px-5 py-3 transition-colors ${isActive('/user/dashboard')
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive('/user/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                dashboard
                            </span>
                            <span className={`text-sm ${isActive('/user/dashboard') ? 'font-bold' : 'font-medium'}`}>
                                Dashboard
                            </span>
                        </Link>
                        <Link
                            to="/user/pesan"
                            className={`flex items-center gap-3 rounded-lg px-5 py-3 transition-colors ${isActive('/user/pesan')
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive('/user/pesan') ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                add_box
                            </span>
                            <span className={`text-sm ${isActive('/user/pesan') ? 'font-bold' : 'font-medium'}`}>
                                Pesan Videotron
                            </span>
                        </Link>
                        <Link
                            to="/user/riwayat"
                            className={`flex items-center gap-3 rounded-lg px-5 py-3 transition-colors ${isActive('/user/riwayat')
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive('/user/riwayat') ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                history
                            </span>
                            <span className={`text-sm ${isActive('/user/riwayat') ? 'font-bold' : 'font-medium'}`}>
                                Riwayat Pesanan
                            </span>
                        </Link>
                        <Link
                            to="/user/profil"
                            className={`flex items-center gap-3 rounded-lg px-5 py-3 transition-colors ${isActive('/user/profil')
                                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive('/user/profil') ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                person
                            </span>
                            <span className={`text-sm ${isActive('/user/profil') ? 'font-bold' : 'font-medium'}`}>
                                Profil
                            </span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            disabled={signOutMutation.isPending}
                            className="flex items-center gap-3 rounded-lg px-5 py-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-2 w-full text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="text-sm font-medium">
                                {signOutMutation.isPending ? 'Keluar...' : 'Keluar'}
                            </span>
                        </button>
                    </nav>
                </div>

                <div className="flex flex-col gap-4 p-4">
                    <div className="rounded-xl bg-slate-800 p-4 border border-slate-700">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-[#2563EB] shadow-sm">
                            <span className="material-symbols-outlined text-sm">support_agent</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">Butuh Bantuan?</h4>
                        <p className="mt-1 text-xs text-slate-400">Hubungi tim support kami jika ada masalah.</p>
                        <a href="https://wa.me/6285250769086" target="_blank" rel="noopener noreferrer" className="mt-3 w-full rounded-lg bg-slate-700 border border-slate-600 py-1.5 text-xs font-medium text-slate-200 shadow-sm hover:bg-slate-600 transition-colors block text-center">Hubungi Support</a>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-800 px-2 pt-4">
                        {userImage ? (
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 ring-2 ring-slate-700" style={{ backgroundImage: `url('${userImage}')` }}></div>
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-600 text-xs font-bold text-white">
                                {initials}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{userName}</p>
                            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <AppLogo size="md" />
                    </div>

                    <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
                        <span className="font-medium text-slate-900">{title}</span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {headerActions}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex flex-1 flex-col p-4 lg:p-8 gap-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default UserLayout;
