import React, { useEffect, useState } from 'react';
import { fetchDramaDetail, fetchDramaChapters } from '../services/api';
import { ArrowLeft, Play, Clock, Star, List, Lock, Crown, LogIn } from 'lucide-react';

const DramaDetail = ({ dramaId, onBack, onWatch, user, onLogin, onMembership }) => {
    const [detail, setDetail] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch detail first to show content ASAP
                const detailRes = await fetchDramaDetail(dramaId);

                if (detailRes.success && detailRes.data) {
                    setDetail(detailRes.data.dramaInfo);

                    let allChapters = [];
                    if (detailRes.data.chapters && Array.isArray(detailRes.data.chapters)) {
                        allChapters = detailRes.data.chapters.map(c => ({
                            chapterId: c.id,
                            chapterIndex: c.index,
                            chapterName: `EP ${c.index + 1}`,
                            chapterImg: c.cover
                        }));
                    }

                    setChapters(allChapters);
                } else {
                    setError("Failed to load drama details");
                }
            } catch (err) {
                console.error(err);
                if (!detail) {
                    setError("Failed to load drama details");
                }
            } finally {
                setLoading(false);
            }
        };

        if (dramaId) {
            loadData();
        }
    }, [dramaId]);

    if (loading && !detail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading details...
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="text-center py-16 px-6 max-w-2xl mx-auto flex flex-col items-center animate-fade-in mt-20">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
                    <Clock className="text-indigo-400" size={40} />
                </div>
                <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">
                    Kesalahan pada server,<br />mohon hubungi admin
                </h2>
                <p className="text-slate-400 text-base mb-8 leading-relaxed">
                    {error || "Maaf, detail drama tidak dapat ditemukan atau terjadi gangguan koneksi."}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-xl active:scale-95 text-sm"
                    >
                        Coba Lagi
                    </button>
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-bold transition-all border border-white/5 active:scale-95 text-sm"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20 pt-10">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Browse
            </button>

            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/5">
                {/* Background Blur */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${detail.cover})` }}
                />

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-10">
                    <div className="shrink-0 mx-auto md:mx-0">
                        <img
                            src={detail.cover}
                            alt={detail.bookName}
                            className="w-60 h-80 object-cover rounded-xl shadow-2xl ring-1 ring-white/10"
                        />
                    </div>

                    <div className="flex flex-col justify-center flex-grow text-center md:text-left">
                        <h2 className="text-4xl font-bold mb-4 text-white leading-tight">
                            {detail.bookName}
                        </h2>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300 mb-6">
                            {detail.viewCount && (
                                <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                                    <Play size={14} className="text-indigo-400" />
                                    {Math.floor(detail.viewCount / 1000)}k Views
                                </span>
                            )}
                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                                <Star size={14} className="text-yellow-400" />
                                {detail.followCount} Followers
                            </span>
                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                                <List size={14} className="text-green-400" />
                                {detail.chapterCount} Chapters
                            </span>
                        </div>

                        <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">
                            {detail.introduction}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {detail.tags && detail.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Cast Section */}
                        {detail.performerList && detail.performerList.length > 0 && (
                            <div className="flex flex-col items-center md:items-start gap-3">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cast</h4>
                                <div className="flex gap-4">
                                    {detail.performerList.map((performer) => (
                                        <div key={performer.performerId} className="flex items-center gap-2 bg-white/5 pr-3 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                                            <img
                                                src={performer.performerAvatar}
                                                alt={performer.performerName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="text-xs font-medium text-slate-200">{performer.performerName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chapters Section */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <List className="text-indigo-500" />
                    Episodes
                </h3>

                {!user ? (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center max-w-2xl mx-auto backdrop-blur-sm">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
                            <Lock size={40} className="text-indigo-400" />
                        </div>
                        <h4 className="text-2xl font-bold mb-3">Konten Terkunci</h4>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar episode dan mulai menonton maraton drama favoritmu.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={onLogin}
                                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <LogIn size={20} /> Masuk Sekarang
                            </button>
                            <button
                                onClick={onMembership}
                                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-white/10 transition-all"
                            >
                                <Crown size={20} className="text-amber-400" /> Lihat Membership
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {chapters.map((chapter) => (
                            <div
                                key={chapter.chapterId}
                                onClick={() => onWatch && onWatch(dramaId, chapter.chapterIndex + 1, detail?.chapterCount || chapters.length)}
                                className="group relative bg-slate-800/50 hover:bg-slate-700/50 rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all hover:scale-105"
                            >
                                <div className="aspect-video relative overflow-hidden bg-slate-900">
                                    {chapter.chapterImg ? (
                                        <img
                                            src={chapter.chapterImg}
                                            alt={chapter.chapterName}
                                            className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                                            loading="lazy"
                                        />
                                    ) : loading ? (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse bg-slate-800/20">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                Loading stream...
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900 animate-fade-in">
                                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.5)]">
                                                <Clock className="text-red-400" size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-white">Kesalahan pada server</h3>
                                            <p className="text-slate-400 text-sm max-w-xs mb-6">
                                                Mohon hubungi admin. Gagal memuat video saat ini.
                                            </p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                                            >
                                                Coba Lagi
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900"></div>
                                            <Play size={24} className="text-slate-600 relative z-10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <Play size={32} className="text-white fill-white" />
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm z-20 border border-white/10">
                                        {chapter.chapterName}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h4 className="font-medium text-sm truncate text-slate-200 group-hover:text-indigo-300 transition-colors">
                                        {chapter.chapterName}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DramaDetail;
