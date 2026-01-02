import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '../services/api';
import DramaCard from './DramaCard';
import { Sparkles, Clock } from 'lucide-react';

const Rekomendasi = ({ onDramaClick, isLoggedIn }) => {
    const [dramas, setDramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchRecommendations();

                if (data.success && Array.isArray(data.data)) {
                    // Filter out dramas without proper data
                    const validDramas = data.data.filter(drama =>
                        drama.bookId &&
                        drama.bookName &&
                        drama.coverWap &&
                        drama.chapterCount
                    );
                    setDramas(validDramas);
                } else {
                    setError('Failed to load recommendations');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-20 text-xl text-slate-400 animate-pulse">
                Loading recommendations...
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
                    Gagal memuat rekomendasi untuk Anda saat ini. Silakan coba beberapa saat lagi.
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
                    <h2 className="text-4xl font-bold">Rekomendasi Untuk Anda</h2>
                </div>
                <p className="text-slate-400 text-lg">Drama pilihan yang dipersonalisasi khusus untuk Anda</p>
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
