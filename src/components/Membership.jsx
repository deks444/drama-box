import React, { useEffect, useRef } from 'react';
import { Check, Crown, Zap, Calendar, Star, ShieldCheck, Download, Infinity } from 'lucide-react';

const Membership = ({ onSelectPlan }) => {
    const plans = [
        {
            id: 'daily',
            name: 'Harian',
            price: '3.000',
            priceNumeric: 3000,
            duration: '1 Hari',
            description: 'Akses penuh untuk maraton drama hari ini.',
            icon: <Zap className="text-yellow-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: '3days',
            name: '3 Hari',
            price: '8.000',
            priceNumeric: 8000,
            duration: '3 Hari',
            description: 'Akses sepuasnya untuk menemani akhir pekanmu.',
            icon: <Calendar className="text-purple-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-purple-500 to-indigo-400'
        },
        {
            id: 'weekly',
            name: 'Hemat 1 Minggu',
            price: '12.000',
            priceNumeric: 12000,
            duration: '1 Minggu',
            description: 'Pilihan paling populer untuk pecinta drama.',
            icon: <Star className="text-pink-400" size={24} />,
            features: ['Akses Semua Drama'],
            color: 'from-pink-500 to-rose-400'
        },
        {
            id: 'monthly',
            name: 'Hemat 1 Bulan',
            price: '35.000',
            priceNumeric: 35000,
            duration: '1 Bulan',
            description: 'Akses tanpa batas sebulan penuh.',
            icon: <Crown className="text-amber-400" size={28} />,
            features: ['Akses Semua Drama'],
            color: 'from-amber-500 to-orange-400',
            popular: true
        },
        {
            id: 'permanent',
            name: 'Paket Permanent',
            price: '250.000',
            priceNumeric: 250000,
            duration: 'Selamanya',
            description: 'Akses seumur hidup & fitur download offline.',
            icon: <Infinity className="text-emerald-400" size={28} />,
            features: ['Akses Semua Drama', 'Link Download Offline', 'Kualitas High-Res'],
            color: 'from-emerald-500 to-teal-400'
        }
    ];

    const [activeIndex, setActiveIndex] = React.useState(0);
    const scrollContainerRef = useRef(null);
    const recommendedRef = useRef(null);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 300 + 32; // Width + gap (300px width + 8*4px gap = 32px)
            const index = Math.round(container.scrollLeft / cardWidth);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && recommendedRef.current) {
            const target = recommendedRef.current;

            // Hitung posisi tengah agar fokus ke kartu rekomendasi
            const scrollPos = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
            container.scrollTo({ left: scrollPos, behavior: 'smooth' });

            // Initial index check after scroll animation
            setTimeout(handleScroll, 500);
        }
    }, []);

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

            {/* Scrollable Container */}
            <div className="relative group/scroll">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-8 pb-12 pt-8 px-4 -mx-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            ref={plan.popular ? recommendedRef : null}
                            className={`relative flex-shrink-0 w-[300px] snap-center bg-slate-900/50 border ${plan.popular ? 'border-indigo-500 shadow-indigo-500/20 shadow-2xl scale-105 z-10' : 'border-white/10'} rounded-3xl p-8 transition-all duration-500 hover:bg-slate-800/80 group flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Rekomendasi
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
                                {plan.id !== 'permanent' && (
                                    <span className="text-slate-500 text-sm">/ {plan.duration}</span>
                                )}
                            </div>

                            <p className="text-slate-400 text-sm mb-8 leading-relaxed min-h-[3rem]">
                                {plan.description}
                            </p>

                            <div className="space-y-4 mb-10 flex-grow">
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

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-3 mt-4">
                    {plans.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 transition-all duration-300 rounded-full ${i === activeIndex
                                ? 'w-8 bg-indigo-500 shadow-lg shadow-indigo-500/20'
                                : 'w-1.5 bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
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
