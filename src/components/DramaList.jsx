import React from 'react';
import DramaCard from './DramaCard';
import './DramaList.css';

const DramaList = ({ dramas, onDramaClick }) => {
    if (!dramas || dramas.length === 0) {
        return <div className="no-data">No dramas found.</div>;
    }

    return (
        <div className="drama-grid">
            {dramas.map((drama, index) => (
                // Use standard ID usually, or fallback to index if API doesn't provide unique ID
                <DramaCard
                    key={drama.id || drama._id || index}
                    drama={drama}
                    onClick={() => onDramaClick(drama)}
                />
            ))}
        </div>
    );
};

export default DramaList;
