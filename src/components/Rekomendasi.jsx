import React, { useEffect, useState } from 'react';
import { fetchRecommendations, fetchTrendingDramas } from '../services/api';
import DramaCard from './DramaCard';
import { Sparkles, Clock } from 'lucide-react';

const Rekomendasi = ({ onDramaClick, isLoggedIn, title = "Rekomendasi Untuk Anda", subtitle = "Drama pilihan yang dipersonalisasi khusus untuk Anda" }) => {
    const [dramas, setDramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);

                let data;
                // If title indicates trending, use fetchTrendingDramas
                if (title === "Trending") {
                    data = await fetchTrendingDramas();
                } else {
                    data = await fetchRecommendations();
                }

                if (data.success && (data.data.list || Array.isArray(data.data))) {
                    const rawList = data.data.list || data.data;

                    // Normalize data structure
                    const normalizedDramas = rawList.map(drama => {
                        return {
                            bookId: drama.bookId || drama.id,
                            bookName: drama.bookName || drama.title,
                            // Use 'cover' as per new API, fallback to 'coverWap' or 'thumbnail'
                            coverWap: drama.cover || drama.coverWap || drama.thumbnail,
                            chapterCount: drama.chapterCount || (drama.episode ? drama.episode.replace(/\D/g, '') : '0'),
                            playCount: drama.playCount || drama.views || 'Unknown',
                            tags: drama.tags || (drama.tag ? [drama.tag] : []),
                            // Pass corner info if available
                            corner: drama.corner
                        };
                    });

                    // Filter out dramas without essential data
                    const validDramas = normalizedDramas.filter(drama =>
                        drama.bookId &&
                        drama.bookName &&
                        drama.coverWap
                    );
                    setDramas(validDramas);
                } else {
                    setError('Failed to load dramas');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, [title]);

    if (loading) {
        return (
            <div className="text-center py-20 text-xl text-slate-400 animate-pulse">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 px-6 max-w-2xl mx-auto flex flex-col items-center animate-fade-in mt-12">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
                    <Clock className="text-indigo-400" size={40} />
                </div>
                <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">
                    Kesalahan pada server,<br />mohon hubungi admin
                </h2>
                <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-md">
                    Gagal memuat data saat ini. Silakan coba beberapa saat lagi.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-xl active:scale-95 text-sm"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-12 pt-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="text-indigo-500" size={36} />
                    <h2 className="text-4xl font-bold">{title}</h2>
                </div>
                <p className="text-slate-400 text-lg">{subtitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {dramas.map((drama) => (
                    <DramaCard
                        key={drama.bookId}
                        isLoggedIn={isLoggedIn}
                        drama={{
                            id: drama.bookId,
                            bookId: drama.bookId,
                            title: drama.bookName,
                            bookName: drama.bookName,
                            cover: drama.coverWap,
                            views: drama.playCount || '0',
                            episodes: drama.chapterCount,
                            tags: drama.tags || [],
                            corner: drama.corner
                        }}
                        onClick={() => onDramaClick(drama)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Rekomendasi;
