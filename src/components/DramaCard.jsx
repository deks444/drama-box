import React from 'react';
import { PlayCircle } from 'lucide-react';
import './DramaCard.css';

const DramaCard = ({ drama, onClick }) => {
    // Defensive checks for likely properties
    const title = drama.title || drama.name || "Untitled";
    const image = drama.poster || drama.cover || drama.thumbnail || "https://placehold.co/300x450/1e293b/FFF?text=No+Image";
    const views = drama.playCount || drama.views;

    return (
        <div className="drama-card fade-in cursor-pointer" onClick={onClick}>
            <div className="card-image-wrapper">
                <img src={image} alt={title} loading="lazy" />
                <div className="overlay">
                    <PlayCircle size={48} color="#fff" strokeWidth={1.5} />
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
