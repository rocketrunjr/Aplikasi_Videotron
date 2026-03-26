import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { apiClient } from '../lib/api-client';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const statusMap = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
    menunggu_verifikasi: { label: 'Verifikasi', color: 'bg-orange-100 text-orange-800' },
    sudah_bayar: { label: 'Sudah Bayar', color: 'bg-emerald-100 text-emerald-800' },
    tayang: { label: 'Tayang', color: 'bg-blue-100 text-blue-800' },
    selesai: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    dibatalkan: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600' },
};

const statusLabel = (s) => statusMap[s]?.label || s;

const AdminReportsPage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exporting, setExporting] = useState('');

    const { data: summaryData, isLoading } = useQuery({
        queryKey: ['admin', 'reports', 'summary', startDate, endDate],
        queryFn: () => apiClient.get('/api/admin/reports/summary', {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }),
    });

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin', 'reports', 'orders', startDate, endDate],
        queryFn: () => apiClient.get('/api/admin/reports/export-json', {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }),
    });

    const summary = summaryData?.data || summaryData || {};
    const ordersList = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];

    const formatDateID = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    const formatSchedule = (row) => {
        if (row.minDate && row.maxDate) {
            return `${formatDateID(row.minDate)} - ${formatDateID(row.maxDate)}`;
        }
        return '-';
    };

    const getExportRows = () => {
        return ordersList.map((row, idx) => ({
            no: idx + 1,
            tanggal: row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
            namaPemesan: row.userName || '-',
            unitVideotron: row.unitName || '-',
            jadwalTayang: formatSchedule(row),
            kodeVoucher: row.voucherCode || '-',
            totalHarga: row.totalAmount || 0,
            status: statusLabel(row.status),
        }));
    };

    const handleExport = async (format) => {
        setExporting(format);
        try {
            const rows = getExportRows();
            if (rows.length === 0) {
                alert('Tidak ada data untuk diekspor.');
                setExporting('');
                return;
            }

            const dateLabel = [startDate, endDate].filter(Boolean).join(' s/d ') || 'Semua Tanggal';
            const filename = `laporan-pesanan-${new Date().toISOString().slice(0, 10)}`;

            if (format === 'excel') {
                // Build Excel with xlsx
                const wsData = [
                    ['Laporan Pesanan Videotron'],
                    [`Periode: ${dateLabel}`],
                    [],
                    ['No', 'Tanggal Pesanan', 'Nama Pemesan', 'Unit Videotron', 'Jadwal Tayang', 'Kode Voucher', 'Total Harga', 'Status'],
                    ...rows.map(r => [r.no, r.tanggal, r.namaPemesan, r.unitVideotron, r.jadwalTayang, r.kodeVoucher, r.totalHarga, r.status]),
                ];
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                ws['!cols'] = [
                    { wch: 5 },   // No
                    { wch: 22 },  // Tanggal
                    { wch: 25 },  // Nama
                    { wch: 25 },  // Unit
                    { wch: 30 },  // Jadwal Tayang
                    { wch: 15 },  // Kode Voucher
                    { wch: 18 },  // Harga
                    { wch: 15 },  // Status
                ];
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
                XLSX.writeFile(wb, `${filename}.xlsx`);
            } else if (format === 'pdf') {
                // Build PDF with jspdf + autotable
                const doc = new jsPDF({ orientation: 'landscape' });
                doc.setFontSize(16);
                doc.text('Laporan Pesanan Videotron', 14, 15);
                doc.setFontSize(10);
                doc.text(`Periode: ${dateLabel}`, 14, 22);
                doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 28);

                autoTable(doc, {
                    startY: 34,
                    head: [['No', 'Tanggal Pesanan', 'Nama Pemesan', 'Unit Videotron', 'Jadwal Tayang', 'Kode Voucher', 'Total Harga', 'Status']],
                    body: rows.map(r => [r.no, r.tanggal, r.namaPemesan, r.unitVideotron, r.jadwalTayang, r.kodeVoucher, formatCurrency(r.totalHarga), r.status]),
                    styles: { fontSize: 8, cellPadding: 3 },
                    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [245, 247, 250] },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 10 },
                        6: { halign: 'right' },
                        7: { halign: 'center' },
                    },
                });

                doc.save(`${filename}.pdf`);
            }
        } catch (err) {
            alert('Gagal mengekspor laporan: ' + (err.message || 'Unknown error'));
        } finally {
            setExporting('');
        }
    };

    return (
        <AdminLayout title="Laporan">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Laporan</h2>
                <p className="text-slate-500">Ringkasan pendapatan dan ekspor data pesanan.</p>
            </div>

            {/* Date Filters & Export */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Mulai</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Akhir</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <button onClick={() => handleExport('excel')} disabled={!!exporting}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-lg">table_view</span>
                    {exporting === 'excel' ? 'Mengunduh...' : 'Export Excel'}
                </button>
                <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                    {exporting === 'pdf' ? 'Mengunduh...' : 'Export PDF'}
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pesanan</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {isLoading ? '...' : summary.totalOrders || 0}
                    </h3>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                        {isLoading ? '...' : formatCurrency(summary.totalRevenue)}
                    </h3>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pesanan Terbayar</p>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">
                        {isLoading ? '...' : summary.paidOrders || 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{isLoading ? '' : formatCurrency(summary.paidRevenue)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pesanan Pending</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">
                        {isLoading ? '...' : summary.pendingOrders || 0}
                    </h3>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
                <div className="border-b border-slate-200 px-6 py-3 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Pesanan</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-2.5 font-medium">No</th>
                                <th className="px-6 py-2.5 font-medium">Tanggal Pesanan</th>
                                <th className="px-6 py-2.5 font-medium">Nama Pemesan</th>
                                <th className="px-6 py-2.5 font-medium">Unit Videotron</th>
                                <th className="px-6 py-2.5 font-medium">Jadwal Tayang</th>
                                <th className="px-6 py-2.5 font-medium">Kode Voucher</th>
                                <th className="px-6 py-2.5 font-medium text-right">Total Harga</th>
                                <th className="px-6 py-2.5 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {ordersLoading ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
                            ) : ordersList.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Belum ada data pesanan</td></tr>
                            ) : (
                                ordersList.map((row, idx) => {
                                    const st = statusMap[row.status] || { label: row.status, color: 'bg-slate-100 text-slate-600' };
                                    return (
                                        <tr key={row.orderNumber || idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-2.5 text-slate-500">{idx + 1}</td>
                                            <td className="px-6 py-2.5 text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                            <td className="px-6 py-2.5 font-medium text-slate-900">{row.userName || '-'}</td>
                                            <td className="px-6 py-2.5 text-slate-700">{row.unitName || '-'}</td>
                                            <td className="px-6 py-2.5 text-slate-700">{formatSchedule(row)}</td>
                                            <td className="px-6 py-2.5 font-mono text-xs text-slate-600">{row.voucherCode || '-'}</td>
                                            <td className="px-6 py-2.5 text-right font-medium text-slate-900">{formatCurrency(row.totalAmount)}</td>
                                            <td className="px-6 py-2.5 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.color}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminReportsPage;
