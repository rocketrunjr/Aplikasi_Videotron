import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAdminOrderDetail, useVerifyPayment, useRejectPayment } from '../hooks/useAdmin';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);
};

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const AdminOrderVerificationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: orderData, isLoading } = useAdminOrderDetail(id);
    const verifyMutation = useVerifyPayment();
    const rejectMutation = useRejectPayment();

    const [adminNotes, setAdminNotes] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // 'verify' | 'reject' | null
    const [errorMsg, setErrorMsg] = useState('');

    const detail = orderData?.data || orderData;
    const order = detail?.order;
    const unit = detail?.unit;
    const usr = detail?.user;
    const dates = detail?.dates || [];

    const handleVerify = () => {
        if (confirmAction !== 'verify') {
            setConfirmAction('verify');
            setErrorMsg('');
            return;
        }
        verifyMutation.mutate({ id, adminNotes }, {
            onSuccess: () => {
                alert('Pembayaran berhasil diverifikasi!');
                navigate('/admin/pesanan');
            },
            onError: (err) => {
                setErrorMsg(err.message || 'Gagal memverifikasi pembayaran');
                setConfirmAction(null);
            },
        });
    };

    const handleReject = () => {
        if (!adminNotes.trim()) {
            setErrorMsg('Harap isi alasan penolakan pada kolom catatan.');
            return;
        }
        if (confirmAction !== 'reject') {
            setConfirmAction('reject');
            setErrorMsg('');
            return;
        }
        rejectMutation.mutate({ id, adminNotes }, {
            onSuccess: () => {
                alert('Pembayaran ditolak.');
                navigate('/admin/pesanan');
            },
            onError: (err) => {
                setErrorMsg(err.message || 'Gagal menolak pembayaran');
                setConfirmAction(null);
            },
        });
    };

    // Custom Breadcrumb Title
    const breadcrumbTitle = (
        <>
            <Link className="hover:text-primary transition-colors text-slate-500 font-normal" to="/admin/pesanan">Pesanan</Link>
            <span className="material-symbols-outlined text-xs text-slate-500">chevron_right</span>
            <span className="font-medium text-slate-900">Verifikasi #{order?.orderNumber || id?.slice(0, 8)}</span>
        </>
    );

    if (isLoading) {
        return (
            <AdminLayout title="Verifikasi Pesanan">
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-outlined text-3xl animate-spin mr-3">progress_activity</span>
                    Memuat data pesanan...
                </div>
            </AdminLayout>
        );
    }

    if (!order) {
        return (
            <AdminLayout title="Verifikasi Pesanan">
                <div className="text-center py-20 text-slate-400">Pesanan tidak ditemukan.</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={breadcrumbTitle}>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/pesanan" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Verifikasi Pesanan #{order.orderNumber}</h2>
                    <p className="text-slate-500">Tinjau detail pesanan dan bukti pembayaran.</p>
                </div>
                <div className="ml-auto">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 border border-yellow-200">
                        Menunggu Verifikasi
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Section: Informasi Pemesan */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">person</span>
                                Informasi Pemesan
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl">person</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                                        <p className="text-base font-semibold text-slate-900">{usr?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-base text-slate-900">{usr?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nomor Telepon</p>
                                        <p className="text-base text-slate-900">{usr?.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Perusahaan</p>
                                        <p className="text-base text-slate-900">{usr?.company || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Detail Pesanan */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">list_alt</span>
                                Detail Pesanan
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Lokasi Videotron</p>
                                    <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                        <div
                                            className="h-16 w-24 rounded bg-slate-300 bg-cover bg-center flex-shrink-0"
                                            style={unit?.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}
                                        ></div>
                                        <div>
                                            <p className="font-bold text-slate-900">{unit?.name || '-'}</p>
                                            <p className="text-sm text-slate-500">{unit?.location || '-'}</p>
                                            <p className="text-xs text-primary mt-1 font-medium">Ukuran: {unit?.size || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Tanggal Tayang ({dates.length} Hari)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {dates.map((d) => (
                                            <span key={d.id || d.date} className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                {formatDate(d.date)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Materi Iklan */}
                                {(order.materialFileUrl || order.materialDriveLink) && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Materi Iklan</p>
                                        <div className="space-y-2">
                                            {order.materialFileUrl && (
                                                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                                    <span className="material-symbols-outlined text-slate-500">attach_file</span>
                                                    <span className="text-sm text-slate-700 flex-1 truncate">File Materi</span>
                                                    <a href={order.materialFileUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">download</span>Download
                                                    </a>
                                                </div>
                                            )}
                                            {order.materialDriveLink && (
                                                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                                    <span className="material-symbols-outlined text-slate-500">link</span>
                                                    <span className="text-sm text-slate-700 flex-1 truncate">Google Drive Link</span>
                                                    <a href={order.materialDriveLink} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">open_in_new</span>Buka
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-600">Harga Sewa ({dates.length} Hari)</span>
                                        <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.voucherCode && (
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-green-600">Voucher: {order.voucherCode}</span>
                                            <span className="font-medium text-green-600">-{formatCurrency(order.subtotal - order.totalAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                                        <span className="text-lg font-bold text-slate-900">Total Harga</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Bukti Transfer (Sticky Sidebar) */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-24">
                        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">payments</span>
                                Bukti Transfer
                            </h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {order.paymentProofUrl ? (
                                <>
                                    <div className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                        <img
                                            src={order.paymentProofUrl.startsWith('http') ? order.paymentProofUrl : `/api/uploads/file/${order.paymentProofUrl.split('/').pop()}`}
                                            alt="Bukti Transfer"
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.onerror = null; e.target.src = order.paymentProofUrl; }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-base">visibility</span>
                                            Lihat
                                        </a>
                                        <a href={order.paymentProofUrl} download
                                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-base">download</span>
                                            Unduh
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="aspect-[3/4] w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                    <span className="material-symbols-outlined text-5xl mb-2">receipt_long</span>
                                    <p className="text-sm">Belum ada bukti transfer</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700" htmlFor="notes">
                                    Keterangan / Catatan
                                    <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
                                </label>
                                <textarea
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    id="notes"
                                    placeholder="Tulis catatan untuk user jika ada masalah dengan bukti transfer..."
                                    rows="3"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                ></textarea>
                                <p className="text-xs text-slate-500">Catatan ini akan disimpan bersama pesanan.</p>
                            </div>

                            {errorMsg && (
                                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {errorMsg}
                                </div>
                            )}

                            {confirmAction && (
                                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">warning</span>
                                    Klik sekali lagi untuk {confirmAction === 'verify' ? 'menyetujui' : 'menolak'} pembayaran.
                                    <button type="button" onClick={() => setConfirmAction(null)} className="ml-auto text-amber-600 hover:text-amber-800 text-xs underline">Batal</button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={handleReject} disabled={rejectMutation.isPending}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 ${confirmAction === 'reject' ? 'border-red-400 bg-red-100 text-red-700' : 'border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300'}`}>
                                    <span className="material-symbols-outlined text-lg">close</span>
                                    {rejectMutation.isPending ? 'Menolak...' : confirmAction === 'reject' ? 'Yakin Tolak?' : 'Tolak'}
                                </button>
                                <button type="button" onClick={handleVerify} disabled={verifyMutation.isPending}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${confirmAction === 'verify' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-hover'}`}>
                                    <span className="material-symbols-outlined text-lg">check</span>
                                    {verifyMutation.isPending ? 'Menyetujui...' : confirmAction === 'verify' ? 'Yakin Setujui?' : 'Setujui'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOrderVerificationPage;
