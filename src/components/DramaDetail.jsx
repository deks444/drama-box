import React, { useEffect, useState } from 'react';
import { fetchDramaDetail, fetchDramaChapters } from '../services/api';
import { ArrowLeft, Play, Clock, Star, List } from 'lucide-react';

const DramaDetail = ({ dramaId, onBack, onWatch }) => {
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

                if (detailRes.success) {
                    setDetail(detailRes.data.drama);

                    let allChapters = [];
                    // 1. Get full list from detail response (simple data: index, id)
                    if (detailRes.data.chapters && Array.isArray(detailRes.data.chapters)) {
                        allChapters = detailRes.data.chapters.map(c => ({
                            chapterId: c.id,
                            chapterIndex: c.index,
                            chapterName: `EP ${c.index + 1}`,
                            chapterImg: null // Placeholder initially
                        }));
                    }

                    // 2. Fetch rich chapters (typically only returns first 6 with images)
                    const chaptersRes = await fetchDramaChapters(dramaId);

                    // 3. Merge & Extrapolate Images
                    if (chaptersRes.success && Array.isArray(chaptersRes.data) && chaptersRes.data.length > 0) {
                        const richChapters = chaptersRes.data;
                        const richMap = new Map();

                        // Find a template image URL from a valid chapter (e.g., the first one)
                        let urlTemplate = null;
                        let templateId = null;

                        richChapters.forEach(ch => {
                            richMap.set(ch.chapterIndex, ch);
                            if (!urlTemplate && ch.chapterImg && ch.chapterId) {
                                urlTemplate = ch.chapterImg;
                                templateId = ch.chapterId.toString();
                            }
                        });

                        // Helper to generate image for missing ones
                        const generateImage = (id) => {
                            if (!urlTemplate || !templateId) return null;
                            const idStr = id.toString();

                            // Logic: 
                            // 1. Replace the ID in the filename and parent folder
                            // 2. Calculate the 'hash' folder which is the reversed last 2 digits of the ID

                            // Original hash: e.g. "17" -> "71"
                            const limitId = templateId.slice(-2);
                            const originalHash = limitId.split('').reverse().join('');

                            // New hash
                            const newLimitId = idStr.slice(-2);
                            const newHash = newLimitId.split('').reverse().join('');

                            // Replace hash in path (it's usually the first segment after domain, e.g. /71/)
                            // We replace the first occurrence of `/${originalHash}/` with `/${newHash}/`
                            // And replace all occurrences of `templateId` with `idStr`

                            let newUrl = urlTemplate;

                            // Replace ID first (longest match first usually safer, but here IDs are same length)
                            // We use a global replace for the ID
                            newUrl = newUrl.split(templateId).join(idStr);

                            // Replace the hash folder. Be careful not to replace other "71"s if they exist.
                            // The hash is typically at the start of the path: .com/71/...
                            newUrl = newUrl.replace(`/${originalHash}/`, `/${newHash}/`);

                            return newUrl;
                        };

                        allChapters = allChapters.map(ch => {
                            const rich = richMap.get(ch.chapterIndex);
                            if (rich && rich.chapterImg) {
                                return rich; // Use the rich object if it has an image
                            }
                            // Otherwise generate it
                            if (templateId) {
                                return {
                                    ...ch,
                                    chapterImg: generateImage(ch.chapterId)
                                };
                            }
                            return ch;
                        });
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
            <div className="text-center py-20 text-red-400">
                <p>{error || "Drama not found"}</p>
                <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20 pt-8">
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
                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                                <Play size={14} className="text-indigo-400" />
                                {Math.floor(detail.viewCount / 1000)}k Views
                            </span>
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
            </div>
        </div>
    );
};

export default DramaDetail;
