import React, { useEffect, useState } from 'react';
import { fetchSubscriptions, checkTransactionStatus, deleteSubscription } from '../services/api';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, RefreshCcw, Loader2, Trash2, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';

const TransactionHistory = ({ user, onStatusUpdate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [qrCodeImage, setQrCodeImage] = useState(null);

    const loadTransactions = async () => {
        try {
            const response = await fetchSubscriptions();
            if (response.success) {
                // Show all transactions (pending, success, failed)
                setTransactions(response.data);
            }
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const handleShowQR = async (trx) => {
        if (!trx.snap_token) {
            alert('QR Code tidak tersedia');
            return;
        }

        try {
            const qrDataUrl = await QRCodeLib.toDataURL(trx.snap_token, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeImage(qrDataUrl);
            setSelectedTransaction(trx);
            setShowQRModal(true);
        } catch (error) {
            console.error('Error generating QR:', error);
            alert('Gagal menampilkan QR Code');
        }
    };

    const handleCheckStatus = async (orderId) => {
        try {
            const response = await checkTransactionStatus(orderId);
            alert(response.message);
            if (response.status === 'success') {
                if (onStatusUpdate && user) {
                    onStatusUpdate({ ...user, is_subscribed: true });
                }
                loadTransactions();
                setShowQRModal(false);
            }
        } catch (error) {
            console.error("Error checking status:", error);
            alert("Gagal mengecek status.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin membatalkan transaksi ini?")) return;
        try {
            const response = await deleteSubscription(id);
            if (response.success) {
                loadTransactions();
                setShowQRModal(false);
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Gagal membatalkan transaksi.");
        }
    };

    const getStatusBadge = (status, expiresAt) => {
        // Check if subscription is expired
        if (status === 'success' && expiresAt) {
            const now = new Date();
            const expiry = new Date(expiresAt);
            if (expiry < now) {
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-xs font-bold border border-slate-500/20">
                        <XCircle size={12} /> EXPIRED
                    </span>
                );
            }
        }

        switch (status) {
            case 'success':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                        <CheckCircle2 size={12} /> BERHASIL
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                        <Clock size={12} /> PENDING
                    </span>
                );
            case 'failed':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                        <XCircle size={12} /> GAGAL
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-xs font-bold border border-slate-500/20">
                        <AlertCircle size={12} /> {status.toUpperCase()}
                    </span>
                );
        }
    };

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const getPriceFromPlanType = (planType) => {
        const prices = {
            'daily': 3000,
            '3days': 8000,
            'weekly': 12000,
            'monthly': 35000,
            'permanent': 250000,
        };
        return prices[planType] || 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20 pt-16">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold mb-2">Riwayat Transaksi</h2>
                <p className="text-slate-400">Pantau semua aktivitas pembayaran kamu di sini.</p>
            </div>

            {transactions.length === 0 ? (
                <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg">Belum ada riwayat transaksi.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {transactions.map((trx) => (
                        <div
                            key={trx.id}
                            className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-800/80 transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trx.payment_status === 'success' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Paket {trx.plan_type.charAt(0).toUpperCase() + trx.plan_type.slice(1)}</h4>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <p className="text-slate-500 text-xs">Order ID: {trx.order_id || '-'}</p>
                                        {trx.payment_status === 'success' && trx.expires_at && (
                                            <p className="text-indigo-400 text-xs font-medium flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Aktif hingga: {new Date(trx.expires_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto">
                                <div className="text-right hidden sm:block">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Dibuat Pada</p>
                                    <p className="text-white text-sm">
                                        {new Date(trx.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-2 text-right">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Status</p>
                                    {getStatusBadge(trx.payment_status, trx.expires_at)}

                                    {trx.payment_status === 'pending' && trx.snap_token && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleShowQR(trx)}
                                                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                                            >
                                                <QrCode size={14} /> LIHAT QR
                                            </button>
                                            <button
                                                onClick={() => handleDelete(trx.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Batalkan Transaksi"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedTransaction && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQRModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-2">Scan QRIS untuk Bayar</h3>
                        <p className="text-slate-400 mb-6 text-sm">Gunakan aplikasi e-wallet favoritmu</p>

                        {qrCodeImage && (
                            <div className="bg-white p-6 rounded-2xl inline-block mb-6">
                                <img src={qrCodeImage} alt="QRIS Code" className="w-64 h-64" />
                            </div>
                        )}

                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 mb-6 text-left">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Paket</span>
                                    <span className="text-white font-bold">{selectedTransaction.plan_type.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total</span>
                                    <span className="text-indigo-400 font-bold">Rp {formatIDR(getPriceFromPlanType(selectedTransaction.plan_type))}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleCheckStatus(selectedTransaction.order_id)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} /> Cek Status
                            </button>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all"
                            >
                                Tutup
                            </button>
                        </div>

                        <button
                            onClick={() => handleDelete(selectedTransaction.id)}
                            className="mt-4 text-red-400 hover:text-red-300 text-sm font-bold transition-all flex items-center gap-2 mx-auto"
                        >
                            <Trash2 size={14} /> Batalkan Transaksi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
