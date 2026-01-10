import React, { useState, useEffect } from 'react';
import { PlayCircle, Lock as LockIcon } from 'lucide-react';
import { fetchDramaDetail } from '../services/api';
import './DramaCard.css';

const DramaCard = ({ drama, onClick, isLoggedIn }) => {
    // Defensive checks for likely properties from different API versions
    const title = drama.bookName || drama.title || drama.name || "Untitled";
    const image = drama.cover || drama.poster || drama.thumbnail || "https://placehold.co/300x450/1e293b/FFF?text=No+Image";

    // Extract episode count from various possible keys
    const rawEpisodes = drama.episode || drama.episodes || drama.chapterCount || drama.chapter_count || drama.total_chapter || "0";
    // Ensure we only get the number string (e.g., "80 Episode" -> "80")
    const initialEpisodes = rawEpisodes.toString().replace(/\D/g, '') || "0";

    const [displayEpisodes, setDisplayEpisodes] = useState(initialEpisodes);

    useEffect(() => {
        let ismounted = true;
        const correctData = async () => {
            // Extract ID from url if typical id is missing (e.g. from search result)
            let dramaId = drama.id || drama.bookId;
            if (!dramaId && drama.url) {
                const match = drama.url.match(/q=(\d+)/);
                if (match) dramaId = match[1];
            }

            if (initialEpisodes === "0" && dramaId) {
                try {
                    const res = await fetchDramaDetail(dramaId);
                    if (ismounted && res.success && res.data) {
                        const info = res.data.detail || res.data;
                        const realCount = info.chapterCount || info.episodeCount || (res.data.chapterList && res.data.chapterList.length) || 0;
                        if (realCount > 0) {
                            setDisplayEpisodes(realCount.toString());
                        }
                    }
                } catch (e) {
                    // ignore error, keep 0
                }
            }
        }
        correctData();
        return () => { ismounted = false; };
    }, [initialEpisodes, drama.id, drama.bookId, drama.url]);

    return (
        <div className="drama-card fade-in cursor-pointer" onClick={onClick}>
            <div className="card-image-wrapper">
                <img src={image} alt={title} loading="lazy" />
                <div className="overlay">
                    {isLoggedIn ? (
                        <PlayCircle size={48} color="#fff" strokeWidth={1.5} />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <LockIcon size={48} color="#fff" strokeWidth={1.5} />
                            <span className="text-white text-xs font-bold bg-black/40 px-2 py-1 rounded">Login to Watch</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <span className="card-meta">{displayEpisodes} Episodes</span>
            </div>
        </div>
    );
};

export default DramaCard;
