import React, { useEffect, useState } from 'react';
import { fetchLatestDramas, searchDramas, fetchRecommendations, fetchCategories } from './services/api';
import DramaList from './components/DramaList';
import DramaDetail from './components/DramaDetail';
import DramaPlayer from './components/DramaPlayer';
import Rekomendasi from './components/Rekomendasi';
import { Film, Menu, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

function App() {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [watchingEpisode, setWatchingEpisode] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  const loadDramas = async (currentPage, query) => {
    try {
      setLoading(true);
      setError(null);
      let data;

      if (query) {
        data = await searchDramas(query, currentPage);
      } else {
        data = await fetchLatestDramas(currentPage, 10);
      }

      // Handle various potential API response structures
      if (data && data.data && Array.isArray(data.data.book)) {
        setDramas(data.data.book);
        setHasMore(data.data.isMore);
      } else if (Array.isArray(data)) {
        setDramas(data);
        setHasMore(data.length === 10);
      } else if (data && Array.isArray(data.data)) {
        setDramas(data.data);
      } else if (data && Array.isArray(data.results)) {
        setDramas(data.results);
      } else if (data && Array.isArray(data.posts)) {
        setDramas(data.posts);
      } else {
        console.warn("Unknown API structure", data);
        setDramas([]);
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDrama) {
      loadDramas(page, activeSearch);
    }
  }, [page, activeSearch, selectedDrama]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchQuery);
    setSelectedDrama(null);
    setWatchingEpisode(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDramaClick = (drama) => {
    setSelectedDrama(drama);
    setWatchingEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedDrama(null);
    setWatchingEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatch = (dramaId, episode, totalEpisodes = 0) => {
    setWatchingEpisode({ dramaId, episode, totalEpisodes });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClosePlayer = () => {
    setWatchingEpisode(null);
    // Keep selectedDrama active so we go back to detail view
  };

  const resetHome = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setCurrentView('home');
  };

  const handleViewRekomendasi = () => {
    setCurrentView('rekomendasi');
    setSelectedDrama(null);
    setWatchingEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app bg-bg-primary min-h-screen text-text-primary font-sans flex flex-col">
      <nav className="sticky top-4 z-50 mx-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetHome}>
            <Film className="text-indigo-500" size={32} />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              DramaBox
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-slate-400">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); resetHome(); }}
              className={`transition-colors ${currentView === 'home' ? 'text-white' : 'hover:text-indigo-400'}`}
            >
              Home
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleViewRekomendasi(); }}
              className={`transition-colors ${currentView === 'rekomendasi' ? 'text-white' : 'hover:text-indigo-400'}`}
            >
              Rekomendasi
            </a>

            <div className="relative group">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                onMouseEnter={() => setShowCategories(true)}
              >
                Kategori <ChevronDown size={16} />
              </button>

              {showCategories && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 grid grid-cols-1 gap-2 z-50 animate-fade-in"
                  onMouseLeave={() => setShowCategories(false)}
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search dramas..."
                className="bg-slate-800/50 border border-slate-700 text-sm rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all text-white"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Search size={18} />
              </button>
            </div>
            <button className="md:hidden p-2 text-slate-300 hover:bg-white/10 rounded-full">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-64 pb-40 flex-grow">

        {watchingEpisode ? (
          <DramaPlayer
            dramaId={watchingEpisode.dramaId}
            initialEpisode={watchingEpisode.episode}
            initialTotalEpisodes={watchingEpisode.totalEpisodes}
            onBack={handleClosePlayer}
          />
        ) : selectedDrama ? (
          <DramaDetail
            dramaId={selectedDrama.id || selectedDrama.bookId}
            onBack={handleBackToHome}
            onWatch={handleWatch}
          />
        ) : (
          <>
            {currentView === 'rekomendasi' ? (
              <Rekomendasi onDramaClick={handleDramaClick} />
            ) : (
              <>
                <div className="text-center mb-12 pt-8">
                  <h2 className="text-4xl font-bold mb-4">Latest Dramas</h2>
                  <p className="text-slate-400 text-lg">Discover the newest trending stories</p>
                </div>

                {loading && <div className="text-center py-20 text-xl text-slate-400">Loading amazing content...</div>}

                {error && (
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
                )}

                {!loading && !error && (
                  <>
                    <DramaList dramas={dramas} onDramaClick={handleDramaClick} />

                    {/* Pagination */}
                    <div className="mt-24 flex justify-center items-center gap-3 flex-wrap">
                      <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${page === 1
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 text-white hover:bg-indigo-600 hover:scale-105 shadow-lg'
                          }`}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const totalPages = 20;
                          const pages = [];

                          if (totalPages >= 1) pages.push(1);
                          if (totalPages >= 2) pages.push(2);
                          if (totalPages >= 3) pages.push(3);

                          if (page > 4) {
                            pages.push('...');
                          }

                          if (page > 3 && page < totalPages) {
                            pages.push(page);
                          }

                          if (page < totalPages - 1) {
                            pages.push('...');
                          }

                          if (totalPages > 3) {
                            pages.push(totalPages);
                          }

                          // Deduplicate
                          const rendered = [];
                          let last = null;
                          pages.forEach(p => {
                            if (p === '...' && last === '...') return;
                            if (typeof p === 'number' && p === last) return;
                            rendered.push(p);
                            last = p;
                          });

                          return rendered.map((pageNum, idx) => {
                            if (pageNum === '...') {
                              return (
                                <span key={`ellipsis-${idx}`} className="text-slate-500 px-1 font-bold">
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border border-white/5 ${page === pageNum
                                  ? 'bg-indigo-600 text-white shadow-indigo-500/50 shadow-lg scale-110'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={!hasMore || page >= 20}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${(!hasMore || page >= 20)
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-700 text-white hover:bg-indigo-600 hover:scale-105 shadow-lg'
                          }`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-slate-500 mt-auto">
        <p>&copy; 2024 DramaBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
