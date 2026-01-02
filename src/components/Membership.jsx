import React from 'react';
import { Check, Crown, Zap, Calendar, Star, ShieldCheck } from 'lucide-react';

const Membership = ({ onSelectPlan }) => {
    const plans = [
        {
            id: 'daily',
            name: 'Harian',
            price: '1.000',
            priceNumeric: 1000,
            duration: '1 Hari',
            description: 'Akses penuh untuk maraton drama hari ini.',
            icon: <Zap className="text-yellow-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: '3days',
            name: '3 Hari',
            price: '3.000',
            priceNumeric: 3000,
            duration: '3 Hari',
            description: 'Akses sepuasnya untuk menemani akhir pekanmu.',
            icon: <Calendar className="text-purple-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-purple-500 to-indigo-400'
        },
        {
            id: 'weekly',
            name: 'Hemat 1 Minggu',
            price: '5.000',
            priceNumeric: 5000,
            duration: '1 Minggu',
            description: 'Pilihan paling populer untuk pecinta drama.',
            icon: <Star className="text-pink-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-pink-500 to-rose-400',
            popular: true
        },
        {
            id: 'monthly',
            name: 'Hemat 1 Bulan',
            price: '15.000',
            priceNumeric: 15000,
            duration: '1 Bulan',
            description: 'Akses tanpa batas sebulan penuh.',
            icon: <Crown className="text-amber-400" size={28} />,
            features: ['Akses Semua Drama'],
            color: 'from-amber-500 to-orange-400'
        }
    ];

    return (
        <div className="animate-fade-in pb-20">
            <div className="text-center mb-16 pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                    <Crown size={16} />
                    <span>Premium Membership</span>
                </div>
                <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    Pilih Paket Nontonmu
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Nikmati ribuan episode drama favorit dengan harga yang sangat terjangkau.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group bg-slate-900/50 border ${plan.popular ? 'border-indigo-500 shadow-indigo-500/20 shadow-2xl scale-105 z-10' : 'border-white/10'} rounded-3xl p-8 transition-all hover:scale-105 hover:bg-slate-800/80`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                Terpopuler
                            </div>
                        )}

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} p-0.5 mb-6`}>
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                {plan.icon}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-bold text-white">Rp {plan.price}</span>
                            <span className="text-slate-500 text-sm">/ {plan.duration}</span>
                        </div>

                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            {plan.description}
                        </p>

                        <div className="space-y-4 mb-10">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-green-500" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onSelectPlan && onSelectPlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                }`}
                        >
                            Pilih Paket
                        </button>
                    </div>
                ))}
            </div>

            {/* Trust Section */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/5 pt-16">
                <div className="flex flex-col items-center text-center px-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="text-indigo-400" />
                    </div>
                    <h4 className="font-bold mb-2">Pembayaran QRIS</h4>
                    <p className="text-slate-500 text-sm">Mendukung semua aplikasi dompet digital & bank melalui satu kode QRIS.</p>
                </div>
                <div className="flex flex-col items-center text-center px-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                        <Zap className="text-indigo-400" />
                    </div>
                    <h4 className="font-bold mb-2">Aktivasi Otomatis</h4>
                    <p className="text-slate-500 text-sm">Paket langsung aktif setelah scan QRIS berhasil dilakukan.</p>
                </div>
                <div className="flex flex-col items-center text-center px-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                        <Crown className="text-indigo-400" />
                    </div>
                    <h4 className="font-bold mb-2">Akses Instan</h4>
                    <p className="text-slate-500 text-sm">Langsung bisa menonton semua episode drama tanpa menunggu lama.</p>
                </div>
            </div>
        </div>
    );
};

export default Membership;
