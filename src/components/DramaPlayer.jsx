import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Film, Lock as LockIcon, Crown, Clock } from 'lucide-react';
import { fetchDramaStream } from '../services/api';

const DramaPlayer = ({ dramaId, initialEpisode = 1, initialTotalEpisodes = 0, onBack, user, onUpgrade }) => {
    const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEpisodes, setTotalEpisodes] = useState(initialTotalEpisodes);
    const videoRef = useRef(null);

    const isSubscribed = user?.is_subscribed;
    const isEpisodeLocked = (ep) => !isSubscribed && ep > 2;

    useEffect(() => {
        const loadStream = async () => {
            // If locked, don't even fetch
            if (isEpisodeLocked(currentEpisode)) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const res = await fetchDramaStream(dramaId, currentEpisode);
                if (res.status === 'success') {
                    setStreamData(res.data);
                    if (res.data.allEps) {
                        setTotalEpisodes(res.data.allEps);
                    }
                } else {
                    setError('Failed to load stream');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadStream();
    }, [dramaId, currentEpisode, isSubscribed]);

    const handleEpisodeClick = (ep) => {
        if (isEpisodeLocked(ep)) {
            // Handle upgrade prompt
            return;
        }
        setCurrentEpisode(ep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="fixed top-0 left-0 right-0 p-4 flex items-center gap-4 bg-slate-900/90 backdrop-blur z-50 border-b border-white/10">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-bold">Error</h2>
                </div>

                <div className="max-w-md animate-fade-in mt-12">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)] mx-auto">
                        <Clock className="text-red-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">
                        Kesalahan pada server,<br />mohon hubungi admin
                    </h2>
                    <p className="text-slate-400 text-base mb-8 leading-relaxed">
                        Gagal memuat video untuk drama ini. Silakan coba kembali nanti atau hubungi bantuan.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-xl active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 bg-slate-900/90 backdrop-blur sticky top-0 z-50 border-b border-white/10">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-lg font-bold">Now Playing</h2>
                    <p className="text-sm text-slate-400">Episode {currentEpisode} {isEpisodeLocked(currentEpisode) && '(Locked)'}</p>
                </div>
            </div>

            {/* Video Player Section */}
            <div className="w-full bg-black aspect-video flex-shrink-0 shadow-2xl relative overflow-hidden">
                {isEpisodeLocked(currentEpisode) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/80 backdrop-blur-sm z-30">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
                            <LockIcon size={40} className="text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Episode Terkunci</h3>
                        <p className="text-slate-400 max-w-sm mb-8">
                            Hanya 2 episode pertama yang tersedia untuk akun free. Berlangganan Membership untuk membuka semua episode!
                        </p>
                        <button
                            onClick={onUpgrade}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                        >
                            <Crown size={20} /> Upgrade Premium
                        </button>
                    </div>
                ) : loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse bg-slate-100/5">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            Loading stream...
                        </div>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        src={streamData?.chapter?.video?.mp4}
                        poster={streamData?.chapter?.cover}
                        onError={(e) => setError('Gagal memuat file video. Mohon hubungi admin.')}
                        onEnded={() => {
                            const nextEp = currentEpisode + 1;
                            if (nextEp <= totalEpisodes && !isEpisodeLocked(nextEp)) {
                                handleEpisodeClick(nextEp);
                            }
                        }}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Episode List Section */}
            <div className="flex-1 p-4 container mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Film className="text-indigo-500" />
                        Episodes
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">{totalEpisodes} Episodes</span>
                        {!isSubscribed && (
                            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                                Free Access: 2 Eps
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                        const locked = isEpisodeLocked(ep);
                        return (
                            <button
                                key={ep}
                                onClick={() => handleEpisodeClick(ep)}
                                className={`
                                    relative py-3 px-2 rounded-lg text-sm font-medium transition-all group overflow-hidden
                                    ${ep === currentEpisode
                                        ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-400'
                                        : locked
                                            ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed grayscale'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }
                                `}
                            >
                                <span className={locked ? 'opacity-40' : ''}>EP {ep}</span>
                                {locked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                        <LockIcon size={14} className="text-slate-500" />
                                    </div>
                                )}
                                {ep === currentEpisode && !locked && (
                                    <div className="ml-1 inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {!isSubscribed && (
                    <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-white/5 text-center">
                        <h4 className="font-bold text-lg mb-2">Ingin menonton sisa episodenya?</h4>
                        <p className="text-slate-400 text-sm mb-6">Paket mulai dari Rp 1.000 saja. Murah, cepat, dan tanpa ribet!</p>
                        <button
                            onClick={onUpgrade}
                            className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
                        >
                            Beli Paket Sekarang
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DramaPlayer;
