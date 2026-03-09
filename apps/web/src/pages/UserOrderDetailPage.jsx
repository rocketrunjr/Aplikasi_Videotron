import React from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { useOrderDetail } from '../hooks/useOrders';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const statusMap = {
    pending: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-800', icon: 'schedule' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800', icon: 'hourglass_top' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-emerald-100 text-emerald-800', icon: 'check_circle' },
    tayang: { label: 'Sedang Tayang', color: 'bg-blue-100 text-blue-800', icon: 'play_circle' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800', icon: 'verified' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: 'cancel' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600', icon: 'block' },
};

const UserOrderDetailPage = () => {
    const { id } = useParams();
    const { data, isLoading, error } = useOrderDetail(id);

    const breadcrumb = (
        <div className="flex items-center gap-2 text-sm">
            <Link to="/user/riwayat" className="text-slate-500 hover:text-primary">Riwayat Pesanan</Link>
            <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
            <span className="text-slate-900 font-medium">Detail Pesanan</span>
        </div>
    );

    if (isLoading) {
        return (
            <UserLayout title={breadcrumb}>
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                        Memuat detail pesanan...
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (error || !data) {
        return (
            <UserLayout title={breadcrumb}>
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3 text-red-500">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        {error?.message || 'Pesanan tidak ditemukan'}
                    </div>
                </div>
            </UserLayout>
        );
    }

    const detail = data?.data || data;
    const order = detail?.order;
    const unit = detail?.unit;
    const dates = detail?.dates || [];
    const proofs = detail?.proofs || [];

    if (!order) {
        return (
            <UserLayout title={breadcrumb}>
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">info</span>
                        Pesanan tidak ditemukan
                    </div>
                </div>
            </UserLayout>
        );
    }

    const st = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600', icon: 'info' };

    return (
        <UserLayout title={breadcrumb}>
            <div className="mx-auto w-full max-w-5xl">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Pesanan #{order.orderNumber}</h2>
                        <p className="text-sm text-slate-500 mt-1">Dibuat pada {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${st.color}`}>
                        <span className="material-symbols-outlined text-base">{st.icon}</span>
                        {st.label}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Unit Info */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h3 className="font-semibold text-slate-900">Informasi Unit Videotron</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="h-20 w-32 rounded-lg bg-slate-200 bg-cover bg-center flex-shrink-0 border"
                                        style={unit?.imageUrl ? { backgroundImage: `url('${unit.imageUrl}')` } : {}}
                                    ></div>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-slate-900 text-lg">{unit?.name || 'Unit Videotron'}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {unit?.location || '-'}
                                        </p>
                                        {unit?.size && <p className="text-sm text-slate-500">Ukuran: {unit.size}</p>}
                                        {unit?.type && <p className="text-xs text-slate-400 capitalize">Tipe: {unit.type}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        {dates.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Tanggal Tayang ({dates.length} hari)</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {dates.map((d) => (
                                            <span key={d.id} className="rounded-lg bg-blue-50 text-blue-700 px-3 py-1.5 text-sm font-medium border border-blue-200">
                                                {formatDate(d.date)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Broadcast Proofs */}
                        {proofs.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Bukti Tayang</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {proofs.map((proof) => (
                                            <div key={proof.id} className="flex flex-col gap-2">
                                                <div
                                                    className="h-32 rounded-lg bg-slate-200 bg-cover bg-center border"
                                                    style={{ backgroundImage: `url('${proof.imageUrl}')` }}
                                                ></div>
                                                <div className="text-xs text-slate-500">
                                                    <p>{formatDate(proof.date)}</p>
                                                    <p className="capitalize">{proof.timeOfDay}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice */}
                        {order.invoiceFileUrl && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Invoice</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                        <span className="material-symbols-outlined text-2xl text-emerald-600">description</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-emerald-800">Invoice tersedia</p>
                                            <p className="text-xs text-emerald-600">Anda dapat melihat atau mengunduh invoice pesanan ini.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <a href={order.invoiceFileUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                            Lihat Invoice
                                        </a>
                                        <a href={order.invoiceFileUrl} download
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-all">
                                            <span className="material-symbols-outlined text-lg">download</span>
                                            Download Invoice
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Material */}
                        {(order.materialFileUrl || order.materialDriveLink) && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Materi Iklan</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {order.materialFileUrl && (
                                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                            <span className="material-symbols-outlined text-slate-500">attach_file</span>
                                            <span className="text-sm text-slate-700 flex-1 truncate">File Materi Iklan</span>
                                            <a href={order.materialFileUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                                <span className="material-symbols-outlined text-sm">download</span>Download
                                            </a>
                                        </div>
                                    )}
                                    {order.materialDriveLink && (
                                        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                            <span className="material-symbols-outlined text-slate-500">link</span>
                                            <span className="text-sm text-slate-700 flex-1 truncate">Google Drive Link</span>
                                            <a href={order.materialDriveLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>Buka
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* Cost Summary */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h3 className="font-semibold text-slate-900">Ringkasan Biaya</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal ({dates.length} hari)</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
                                </div>
                                {order.voucherCode && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Voucher ({order.voucherCode})</span>
                                        <span className="font-medium text-emerald-600">Applied</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-3 flex justify-between">
                                    <span className="font-semibold text-slate-900">Total</span>
                                    <span className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Proof */}
                        {order.paymentProofUrl && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Bukti Pembayaran</h3>
                                </div>
                                <div className="p-6">
                                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                                        <img
                                            src={order.paymentProofUrl}
                                            alt="Bukti Pembayaran"
                                            className="w-full h-48 object-contain"
                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                                            <span className="material-symbols-outlined text-base">visibility</span>
                                            Lihat
                                        </a>
                                        <a href={order.paymentProofUrl} download
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                                            <span className="material-symbols-outlined text-base">download</span>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Notes */}
                        {order.adminNotes && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4">
                                    <h3 className="font-semibold text-slate-900">Catatan Admin</h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-600">{order.adminNotes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserOrderDetailPage;
