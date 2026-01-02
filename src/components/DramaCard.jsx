import React from 'react';
import { PlayCircle, Lock as LockIcon } from 'lucide-react';
import './DramaCard.css';

const DramaCard = ({ drama, onClick, isLoggedIn }) => {
    // Defensive checks for likely properties from different API versions
    const title = drama.bookName || drama.title || drama.name || "Untitled";
    const image = drama.cover || drama.poster || drama.thumbnail || "https://placehold.co/300x450/1e293b/FFF?text=No+Image";
    const views = drama.viewCountDisplay || drama.playCount || drama.views;

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
                {views && <span className="card-meta">{typeof views === 'number' ? views.toLocaleString() : views} views</span>}
            </div>
        </div>
    );
};

export default DramaCard;
