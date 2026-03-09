import React from 'react';

/**
 * ConfirmDialog — React modal replacement for window.confirm()
 * Props:
 *   open: boolean — show/hide
 *   title: string — heading text
 *   message: string — body text
 *   confirmText?: string — confirm button label (default: "Ya, Lanjutkan")
 *   cancelText?: string — cancel button label (default: "Batal")
 *   variant?: 'danger' | 'warning' | 'info' — color scheme
 *   onConfirm: () => void — called when confirmed
 *   onCancel: () => void — called when cancelled
 */
const ConfirmDialog = ({
    open,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const variantStyles = {
        danger: {
            icon: 'delete',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: 'info',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const v = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel} />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${v.iconBg}`}>
                            <span className={`material-symbols-outlined text-2xl ${v.iconColor}`}>{v.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${v.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
