import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Film } from 'lucide-react';
import { fetchDramaStream } from '../services/api';

const DramaPlayer = ({ dramaId, initialEpisode = 1, initialTotalEpisodes = 0, onBack }) => {
    const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEpisodes, setTotalEpisodes] = useState(initialTotalEpisodes);
    const videoRef = useRef(null);

    useEffect(() => {
        const loadStream = async () => {
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
    }, [dramaId, currentEpisode]);

    // Auto-scroll to current episode in list could be nice, but keeping it simple for now.

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
                    <p className="text-sm text-slate-400">Episode {currentEpisode}</p>
                </div>
            </div>

            {/* Video Player Section */}
            <div className="w-full bg-black aspect-video flex-shrink-0 shadow-2xl">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse">
                        Loading stream...
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex items-center justify-center text-red-400">
                        {error}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        src={streamData?.chapter?.video?.mp4}
                        poster={streamData?.chapter?.cover}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Episode List Section */}
            <div className="flex-1 p-4 container mx-auto max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Film className="text-indigo-500" />
                        Episodes
                    </h3>
                    <span className="text-slate-400 text-sm">{totalEpisodes} Episodes</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                        <button
                            key={ep}
                            onClick={() => {
                                setCurrentEpisode(ep);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`
                                py-3 px-2 rounded-lg text-sm font-medium transition-all
                                ${ep === currentEpisode
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }
                            `}
                        >
                            EP {ep}
                            {ep === currentEpisode && (
                                <div className="ml-1 inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DramaPlayer;
