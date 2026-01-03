import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Zap, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { checkout } from '../services/api';

const Checkout = ({ plan, user, onBack, onPaymentSuccess }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState('payment'); // payment, success
    const [isLoading, setIsLoading] = useState(false);

    const handlePayNow = async () => {
        setIsLoading(true);
        try {
            const response = await checkout(plan.id, plan.duration, plan.priceNumeric);

            if (response.success && response.snap_token) {
                if (!window.snap) {
                    alert("Sedang menghubungkan ke Midtrans, silakan tunggu sebentar dan coba lagi.");
                    setIsLoading(false);
                    return;
                }
                window.snap.pay(response.snap_token, {
                    onSuccess: function (result) {
                        setStep('success');
                        if (onPaymentSuccess) {
                            onPaymentSuccess(plan);
                        }
                    },
                    onPending: function (result) {
                        alert("Pembayaran anda sedang diproses, silakan cek berkala.");
                        onBack();
                    },
                    onError: function (result) {
                        alert("Pembayaran gagal, silakan coba lagi.");
                        setIsLoading(false);
                    },
                    onClose: function () {
                        alert('Anda menutup popup pembayaran sebelum menyelesaikan transaksi.');
                        setIsLoading(false);
                    }
                });
            } else {
                alert("Gagal membuat transaksi: " + (response.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Terjadi kesalahan sistem saat memproses pembayaran.");
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in text-center">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Pembayaran Berhasil!</h2>
                <p className="text-slate-400 text-lg max-w-md mb-10">
                    Selamat! Akun kamu sekarang sudah aktif sebagai **{plan.name}**. Silakan nikmati semua drama favoritmu sekarang.
                </p>
                <button
                    onClick={onBack}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30"
                >
                    Mulai Menonton
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Kembali ke Paket</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Order Summary */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Ringkasan Pesanan</h2>
                        <p className="text-slate-400">Pastikan paket yang kamu pilih sudah sesuai.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-indigo-500">
                            {plan.icon}
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Paket Dipilih</span>
                            <h3 className="text-2xl font-bold text-white">{plan.name} - {plan.duration}</h3>
                            <div className="h-px bg-white/5 my-2"></div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-slate-400">Total Pembayaran</span>
                                <span className="text-2xl font-bold text-white">Rp {plan.price}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <ShieldCheck className="text-indigo-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-white">Pembayaran Aman</h4>
                                <p className="text-xs text-slate-500 mt-1">Transaksi kamu dilindungi dengan enkripsi keamanan tingkat tinggi oleh Midtrans.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <Zap className="text-indigo-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-white">Aktivasi Instan</h4>
                                <p className="text-xs text-slate-500 mt-1">Layanan akan langsung aktif setelah sistem kami mendeteksi pembayaran.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="text-indigo-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">Lanjutkan ke Pembayaran</h3>
                    <p className="text-slate-400 mb-8 max-w-xs">
                        Klik tombol di bawah untuk memilih metode pembayaran (QRIS, VA Bank, E-Wallet, dll) melalui sistem aman Midtrans.
                    </p>

                    <button
                        onClick={handlePayNow}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <span>Bayar Sekarang</span>
                            </>
                        )}
                    </button>

                    <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Powered by Midtrans
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
