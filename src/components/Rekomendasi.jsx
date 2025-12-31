import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '../services/api';
import DramaCard from './DramaCard';
import { Sparkles } from 'lucide-react';

const Rekomendasi = ({ onDramaClick }) => {
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
            <div className="text-center py-20">
                <p className="text-xl mb-4">Oops! Something went wrong.</p>
                <p className="text-red-400 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
                >
                    Retry
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
