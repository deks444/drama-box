import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Zap, Download, CheckCircle2, Loader2, MessageCircle, Clock } from 'lucide-react';
import { checkout, checkTransactionStatus } from '../services/api';
import QRCode from 'qrcode';

const Checkout = ({ plan, user, onBack, onPaymentSuccess }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState('payment'); // payment, qris, success
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('automatic'); // automatic, manual
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // Konfigurasi Pembayaran Manual Anda
    const manualPaymentDetails = {
        whatsappNumber: "6285179691321",
        accounts: [
            { name: "DANA", number: "0851-7969-1321" }
        ]
    };

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    // Countdown timer
    useEffect(() => {
        if (!paymentData?.expired_at) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(paymentData.expired_at).getTime();
            const distance = expiry - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('EXPIRED');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentData]);

    // Payment status polling - check every 3 seconds
    useEffect(() => {
        if (!paymentData?.order_id || step !== 'qris') return;

        const checkPaymentStatus = async () => {
            try {
                const response = await checkTransactionStatus(paymentData.order_id);

                if (response.success && response.status === 'success') {
                    // Payment completed!
                    setStep('success');
                    if (onPaymentSuccess) {
                        onPaymentSuccess(plan);
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                // Continue polling even if there's an error
            }
        };

        // Check immediately
        checkPaymentStatus();

        // Then check every 3 seconds
        const interval = setInterval(checkPaymentStatus, 3000);

        return () => clearInterval(interval);
    }, [paymentData, step, plan, onPaymentSuccess]);

    const handlePayNow = async () => {
        setIsLoading(true);
        try {
            const response = await checkout(plan.id, plan.duration);

            if (response.success && response.payment) {
                setPaymentData(response.payment);

                // Generate QR Code from payment_number (QRIS string)
                const qrDataUrl = await QRCode.toDataURL(response.payment.qr_string, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                setQrCodeImage(qrDataUrl);
                setStep('qris');
            } else {
                // Check if error is due to pending transaction
                if (response.has_pending) {
                    if (confirm(response.message + "\n\nKlik OK untuk ke Riwayat Transaksi.")) {
                        onBack(); // Go back to close checkout
                        // Trigger navigation to history (you'll need to pass this from parent)
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('navigate-to-history'));
                        }, 100);
                    }
                } else {
                    alert("Gagal membuat transaksi: " + (response.message || "Unknown error"));
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Terjadi kesalahan sistem saat memproses pembayaran.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualConfirm = () => {
        const totalAmount = plan.priceNumeric;
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

    if (step === 'qris') {
        return (
            <div className="max-w-2xl mx-auto pb-20 pt-12 animate-fade-in">
                <button
                    onClick={() => setStep('payment')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali</span>
                </button>

                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">Scan QRIS untuk Bayar</h2>
                    <p className="text-slate-400 mb-8">Gunakan aplikasi e-wallet favoritmu</p>

                    {/* Timer */}
                    {timeLeft && timeLeft !== 'EXPIRED' && (
                        <div className="flex items-center justify-center gap-2 mb-6 text-amber-400">
                            <Clock size={20} />
                            <span className="font-mono text-xl font-bold">{timeLeft}</span>
                        </div>
                    )}

                    {timeLeft === 'EXPIRED' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                            <p className="text-red-400 font-bold">QR Code sudah kadaluarsa. Silakan buat transaksi baru.</p>
                        </div>
                    )}

                    {/* QR Code */}
                    {qrCodeImage && (
                        <div className="bg-white p-6 rounded-2xl inline-block mb-6">
                            <img src={qrCodeImage} alt="QRIS Code" className="w-72 h-72" />
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 mb-6 text-left">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Order ID</span>
                                <span className="text-white font-mono text-sm">{paymentData?.order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Harga Paket</span>
                                <span className="text-white">Rp {formatIDR(paymentData?.amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Biaya Admin</span>
                                <span className="text-white">Rp {formatIDR(paymentData?.fee || 0)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2"></div>
                            <div className="flex justify-between text-lg">
                                <span className="text-slate-400 font-bold">Total Pembayaran</span>
                                <span className="text-indigo-400 font-bold text-2xl">Rp {formatIDR(paymentData?.total_payment || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Loader2 className="animate-spin text-indigo-400" size={16} />
                            <p className="text-xs text-indigo-400 font-bold">Mengecek status pembayaran...</p>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            Setelah pembayaran berhasil, akun kamu akan otomatis aktif dalam beberapa detik.
                        </p>
                    </div>

                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Powered by Pakasir
                    </p>
                </div>
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
                                <div className="h-px bg-white/5 my-1"></div>
                                <div className="flex justify-between items-center text-lg pt-1">
                                    <span className="text-slate-400">Total</span>
                                    <span className="text-2xl font-bold text-indigo-400">Rp {plan.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <ShieldCheck className="text-indigo-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-white">Pembayaran Aman</h4>
                                <p className="text-xs text-slate-500 mt-1">Transaksi kamu dilindungi dengan enkripsi keamanan tingkat tinggi oleh Pakasir.</p>
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
                            onClick={() => setPaymentMethod('automatic')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'automatic'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white bg-transparent'
                                }`}
                        >
                            QRIS (Otomatis)
                        </button>
                        <button
                            onClick={() => setPaymentMethod('manual')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${paymentMethod === 'manual'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white bg-transparent'
                                }`}
                        >
                            MANUAL (WhatsApp)
                        </button>
                    </div>

                    {paymentMethod === 'automatic' ? (
                        <div className="flex flex-col items-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="text-indigo-500" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Bayar dengan QRIS</h3>
                            <p className="text-slate-400 mb-8 max-w-xs text-sm">
                                Scan QR Code dengan aplikasi e-wallet favoritmu (GoPay, OVO, DANA, ShopeePay, dll) dan akun akan otomatis aktif.
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
                                    <span>Tampilkan QR Code</span>
                                )}
                            </button>
                            <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                Powered by Pakasir
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 text-white text-center">Detail Transfer Manual</h3>
                            <div className="space-y-3 mb-8">
                                {manualPaymentDetails.accounts.map((acc, i) => (
                                    <div key={i} className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            {/* DANA Logo */}
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-white font-black text-lg">D</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{acc.name}</p>
                                                <p className="text-white font-bold text-lg">{acc.number}</p>
                                            </div>
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
