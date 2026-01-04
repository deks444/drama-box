import React, { useEffect, useState } from 'react';
import { fetchSubscriptions, checkTransactionStatus, deleteSubscription } from '../services/api';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, RefreshCcw, Loader2, Trash2 } from 'lucide-react';

const TransactionHistory = ({ user, onStatusUpdate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handlePayAgain = (snapToken) => {
        if (window.snap && snapToken) {
            window.snap.pay(snapToken, {
                onSuccess: () => {
                    if (onStatusUpdate && user) {
                        onStatusUpdate({ ...user, is_subscribed: true });
                    }
                    loadTransactions();
                },
                onPending: () => loadTransactions(),
                onError: () => loadTransactions(),
                onClose: () => loadTransactions(),
            });
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
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Gagal membatalkan transaksi.");
        }
    };

    const getStatusBadge = (status) => {
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
                                    {getStatusBadge(trx.payment_status)}

                                    {trx.payment_status === 'pending' && trx.snap_token && (
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => handleDelete(trx.id)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Batalkan Transaksi"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleCheckStatus(trx.order_id)}
                                                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 transition-all flex items-center gap-1.5"
                                            >
                                                <RefreshCcw size={12} /> CEK
                                            </button>
                                            <button
                                                onClick={() => handlePayAgain(trx.snap_token)}
                                                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-600/20"
                                            >
                                                BAYAR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
