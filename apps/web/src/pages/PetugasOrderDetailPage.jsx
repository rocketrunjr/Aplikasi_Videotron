import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import PetugasLayout from '../components/PetugasLayout';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { useUpdatePetugasOrderStatus, useUploadPetugasBroadcastProof, useUploadPetugasInvoice } from '../hooks/usePetugas';
import { useUploadFile } from '../hooks/useUploads';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const statusMap = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-purple-100 text-purple-800' },
    tayang: { label: 'Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const PetugasOrderDetailPage = () => {
    const { id } = useParams();
    const updateStatusMutation = useUpdatePetugasOrderStatus();
    const uploadBroadcastMutation = useUploadPetugasBroadcastProof();
    const uploadInvoiceMutation = useUploadPetugasInvoice();
    const uploadFileMutation = useUploadFile();

    const [successMsg, setSuccessMsg] = useState('');
    const invoiceInputRef = useRef(null);
    
    const { data: orderData, isLoading } = useQuery({
        queryKey: ['petugas', 'orders', id],
        queryFn: async () => {
            const res = await apiClient.get(`/api/petugas/orders/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const order = orderData;
    const dates = orderData?.dates || [];
    const proofs = orderData?.broadcastProofs || [];

    const st = order ? (statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' }) : {};

    const handleStatusChange = (newStatus) => {
        updateStatusMutation.mutate({ id, status: newStatus }, {
            onSuccess: () => {
                setSuccessMsg(`Status berhasil diubah ke "${statusMap[newStatus]?.label || newStatus}"`);
                setTimeout(() => setSuccessMsg(''), 3000);
            },
            onError: (err) => {
                alert('Gagal mengubah status: ' + (err.response?.data?.error || err.message));
            }
        });
    };

    const handleInvoiceUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const result = await uploadFileMutation.mutateAsync({ type: 'invoice', file });
            const fileUrl = result?.data?.url || result?.url;
            if (fileUrl) {
                await uploadInvoiceMutation.mutateAsync({ id, fileUrl });
                setSuccessMsg('Invoice berhasil diupload!');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            alert('Gagal upload invoice: ' + (err.message || 'Unknown error'));
        }
    };

    const handleBroadcastUpload = async (dateStr, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const result = await uploadFileMutation.mutateAsync({ type: 'broadcast-proof', file });
            const imageUrl = result?.data?.url || result?.url;
            if (imageUrl) {
                await uploadBroadcastMutation.mutateAsync({ id, date: dateStr, timeOfDay: 'tayangan', imageUrl });
                setSuccessMsg('Foto tayangan berhasil diupload!');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            alert('Gagal upload foto: ' + (err.response?.data?.error || err.message || 'Unknown error'));
        }
    };

    const breadcrumbTitle = (
        <>
            <Link className="hover:text-primary transition-colors text-slate-500 font-normal" to="/petugas/pesanan">Pesanan</Link>
            <span className="material-symbols-outlined text-xs text-slate-500">chevron_right</span>
            <span className="font-medium text-slate-900">Detail #{order?.orderNumber || id?.slice(0, 8)}</span>
        </>
    );

    if (isLoading) {
        return (
            <PetugasLayout title="Detail Pesanan">
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <span className="material-symbols-outlined text-3xl animate-spin mr-3">progress_activity</span>
                    Memuat data pesanan...
                </div>
            </PetugasLayout>
        );
    }

    if (!order) {
        return (
            <PetugasLayout title="Detail Pesanan">
                <div className="text-center py-20 text-slate-400">Pesanan tidak ditemukan.</div>
            </PetugasLayout>
        );
    }

    return (
        <PetugasLayout title={breadcrumbTitle}>
            {successMsg && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    {successMsg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pesanan #{order.orderNumber}</h2>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                            {st.label}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">Dipesan oleh <span className="font-medium text-slate-700">{order?.userName || '-'}</span> pada {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/petugas/pesanan" className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Kembali
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Ringkasan Pesanan */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Ringkasan Pesanan</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lokasi Videotron</span>
                                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-slate-600">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{order?.unitName || '-'}</p>
                                        <p className="text-sm text-slate-500">{order?.unitLocation || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal Penayangan</span>
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                                    {dates.map((d) => (
                                        <div key={d.id || d.date} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                            <span className="text-slate-600">{formatDate(d.date)}</span>
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{formatCurrency(d.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-dashed border-slate-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">Durasi Total</span>
                                    <span className="text-sm font-bold text-slate-900">{dates.length} Hari</span>
                                </div>
                            </div>

                            <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-500">Total Pembayaran</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                                    {order.voucherCode && (
                                        <span className="text-xs text-emerald-600 mt-1">Voucher: {order.voucherCode}</span>
                                    )}
                                </div>
                            </div>

                            {/* Status Action */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ubah Status</span>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updateStatusMutation.isPending}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    {Object.entries(statusMap).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pembayaran */}
                    {order.paymentProofUrl && (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-slate-900">Bukti Transfer</h3>
                            </div>
                            <div className="p-6 text-sm">
                                <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 mb-4">
                                    <img
                                        src={order.paymentProofUrl.startsWith('http') ? order.paymentProofUrl : `/api/uploads/file/${order.paymentProofUrl.split('/').pop()}`}
                                        alt="Bukti Pembayaran"
                                        className="w-full h-48 object-contain"
                                        onError={(e) => { e.target.onerror = null; e.target.src = order.paymentProofUrl; }}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                                        <span className="material-symbols-outlined text-base">visibility</span>
                                        Lihat
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Materi Iklan */}
                    {(order.materialFileUrl || order.materialDriveLink) && (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-slate-900">Materi Iklan</h3>
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
                                        <span className="text-sm text-slate-700 flex-1 truncate">{order.materialDriveLink}</span>
                                        <a href={order.materialDriveLink} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>Buka
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dokumen Invoice */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Dokumen Invoice</h3>
                        </div>
                        <div className="p-6">
                            {order.invoiceFileUrl ? (
                                <div className="flex items-center gap-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                    <span className="material-symbols-outlined text-2xl text-emerald-600">description</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-emerald-800">Invoice sudah diupload</p>
                                    </div>
                                    <a href={order.invoiceFileUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">open_in_new</span> Lihat
                                    </a>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 mb-4">Upload invoice resmi yang akan dikirimkan kepada customer.</p>
                                    <div
                                        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition hover:bg-slate-100 group cursor-pointer"
                                        onClick={() => invoiceInputRef.current?.click()}
                                    >
                                        <input ref={invoiceInputRef} accept=".pdf,image/*" className="hidden" type="file" onChange={handleInvoiceUpload} />
                                        <div className="rounded-full bg-slate-200 p-3 text-slate-500 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-2xl">upload_file</span>
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-slate-900">Klik untuk upload</p>
                                        <p className="mt-1 text-xs text-slate-500">PDF atau Gambar (Maks. 5MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bukti Penayangan (Upload) */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-slate-900">Bukti Penayangan</h3>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">{dates.length}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-6">Upload foto bukti penayangan videotron untuk setiap tanggal.</p>
                            <div className="flex flex-col gap-6">
                                {dates.map((d) => {
                                    const dateProofs = proofs.filter(p => p.date === d.date);
                                    return (
                                        <div key={d.id || d.date} className="flex flex-col gap-3">
                                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                                                {formatDate(d.date)}
                                                {dateProofs.length > 0 && (
                                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                                        Sudah upload
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {dateProofs.map((proof) => (
                                                    <div key={proof.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                                                        <img src={proof.imageUrl} alt="Bukti tayangan" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {/* Upload area */}
                                                <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 transition hover:bg-slate-100 group cursor-pointer">
                                                    <input accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" type="file"
                                                        onChange={(e) => handleBroadcastUpload(d.date, e)} />
                                                    <div className="rounded-full bg-slate-200 p-2 text-slate-500 group-hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined">add_a_photo</span>
                                                    </div>
                                                    <p className="mt-2 text-xs font-medium text-slate-600 text-center">Upload Foto Tayangan</p>
                                                </div>
                                            </div>
                                            {d !== dates[dates.length - 1] && <div className="h-px bg-slate-100 w-full mt-2"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PetugasLayout>
    );
};

export default PetugasOrderDetailPage;
