import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Zap, Download, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { checkout } from '../services/api';

const Checkout = ({ plan, user, onBack, onPaymentSuccess }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState('payment'); // payment, success
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('manual'); // automatic, manual

    // Konfigurasi Pembayaran Manual Anda
    const manualPaymentDetails = {
        whatsappNumber: "6285179691321",
        accounts: [
            { name: "DANA", number: "0851-7969-1321", holder: "Nama Anda" },
            { name: "GoPay", number: "0851-7969-1321", holder: "Nama Anda" },
            { name: "ShopeePay", number: "0851-7969-1321", holder: "Nama Anda" }
        ]
    };

    // Hitung Biaya Admin
    const isAdminFeeActive = paymentMethod === 'automatic';
    const adminFeeRate = 0.04;
    const adminFee = isAdminFeeActive ? Math.round(plan.priceNumeric * adminFeeRate) : 0;
    const totalAmount = plan.priceNumeric + adminFee;

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const handlePayNow = async () => {
        setIsLoading(true);
        try {
            // Gunakan totalAmount yang sudah termasuk fee 4%
            const response = await checkout(plan.id, plan.duration, totalAmount);

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
                        alert('Anda menutup popup. Transaksi masih tersimpan sebagai "Pending" di Riwayat Transaksi. Anda bisa mengecek status atau membatalkannya di sana.');
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

    const handleManualConfirm = () => {
        const message = `Halo Admin, saya ingin konfirmasi pembayaran manual:
        
*Nama:* ${user.name}
*Paket:* ${plan.name} (${plan.duration})
*Total:* Rp ${formatIDR(totalAmount)}
        
Saya sudah melakukan transfer, berikut bukti pembayarannya:`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${manualPaymentDetails.whatsappNumber}?text=${encodedMessage}`, '_blank');
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
        <div className="max-w-4xl mx-auto pb-20 pt-12 animate-fade-in">
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
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Harga Paket</span>
                                    <span className="text-white font-medium">Rp {plan.price}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Biaya Admin {isAdminFeeActive ? '(4%)' : '(Manual)'}</span>
                                    <span className={isAdminFeeActive ? "text-white font-medium" : "text-green-400 font-bold"}>
                                        {isAdminFeeActive ? `Rp ${formatIDR(adminFee)}` : 'GRATIS'}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5 my-1"></div>
                                <div className="flex justify-between items-center text-lg pt-1">
                                    <span className="text-slate-400">Total Pembayaran</span>
                                    <span className="text-2xl font-bold text-indigo-400">Rp {formatIDR(totalAmount)}</span>
                                </div>
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

                {/* Checkout Section */}
                <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-6 sm:p-10 flex flex-col">
                    {/* Method Toggle */}
                    <div className="flex bg-slate-950/50 p-1 rounded-2xl mb-8 border border-white/5">
                        <button
                            disabled
                            className="flex-1 py-3 px-4 rounded-xl text-[10px] font-bold transition-all text-slate-600 bg-slate-900/50 cursor-not-allowed border border-white/5"
                        >
                            OTOMATIS (Coming Soon)
                        </button>
                        <button
                            onClick={() => setPaymentMethod('manual')}
                            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg"
                        >
                            MANUAL (WhatsApp)
                        </button>
                    </div>

                    {paymentMethod === 'automatic' ? (
                        <div className="flex flex-col items-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="text-indigo-500" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Bayar Otomatis</h3>
                            <p className="text-slate-400 mb-8 max-w-xs text-sm">
                                Pilih metode pembayaran (QRIS, VA, E-Wallet) dan akun akan otomatis aktif setelah bayar.
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
                                    <span>Lanjut Pembayaran</span>
                                )}
                            </button>
                            <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                Powered by Midtrans
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-white text-center">Detail Transfer Manual</h3>
                            <div className="space-y-3 mb-8">
                                {manualPaymentDetails.accounts.map((acc, i) => (
                                    <div key={i} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                        <div>
                                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{acc.name}</p>
                                            <p className="text-white font-bold text-lg">{acc.number}</p>
                                            <p className="text-slate-500 text-[10px]">A/N {acc.holder}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(acc.number);
                                                alert(`${acc.name} nomor disalin!`);
                                            }}
                                            className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                                        >
                                            SALIN
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-8">
                                <p className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">PENTING</p>
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    "Setelah transfer, klik tombol di bawah untuk kirim bukti pembayaran. Verifikasi manual membutuhkan waktu 30 menit - 1 jam."
                                </p>
                            </div>

                            <button
                                onClick={handleManualConfirm}
                                className="w-full bg-[#25D366] hover:bg-[#1eb954] text-white py-5 rounded-2xl font-bold shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 transition-all"
                            >
                                <MessageCircle size={24} />
                                <span>Konfirmasi via WhatsApp</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
