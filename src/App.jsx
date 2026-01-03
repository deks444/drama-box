import React, { useEffect, useState, useRef } from 'react';
import { fetchLatestDramas, searchDramas, fetchRecommendations, fetchCategories, fetchCategoryDramas, fetchMe } from './services/api';
import DramaList from './components/DramaList';
import DramaDetail from './components/DramaDetail';
import DramaPlayer from './components/DramaPlayer';
import Rekomendasi from './components/Rekomendasi';
import Membership from './components/Membership';
import Auth from './components/Auth';
import Checkout from './components/Checkout';
import TransactionHistory from './components/TransactionHistory';
import SessionExpiredModal from './components/SessionExpiredModal';
import { Film, Menu, Search, ChevronLeft, ChevronRight, ChevronDown, Crown, LogIn, User as UserIcon, LogOut, Clock, MessageCircle, UserPlus } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Refs untuk deteksi klik di luar
  const categoryRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tutup Kategori jika klik di luar
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategories(false);
      }
      // Tutup Menu User jika klik di luar
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      // Tutup Mobile Menu jika klik di luar navbar
      if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const loadDramas = async (currentPage, query, categoryId) => {
    try {
      setLoading(true);
      setError(null);
      let data;

      if (query) {
        data = await searchDramas(query, currentPage);
      } else if (categoryId) {
        data = await fetchCategoryDramas(categoryId, currentPage);
      } else {
        data = await fetchLatestDramas(currentPage, 10);
      }

      // Handle various potential API response structures
      if (data && data.data) {
        if (Array.isArray(data.data.book)) {
          setDramas(data.data.book);
          setHasMore(data.data.isMore);
        } else if (Array.isArray(data.data.bookList)) {
          setDramas(data.data.bookList);
          // For categories, pages and currentPage are provided
          setHasMore(data.data.currentPage < data.data.pages);
        } else if (Array.isArray(data.data)) {
          setDramas(data.data);
        }
      } else if (Array.isArray(data)) {
        setDramas(data);
        setHasMore(data.length === 10);
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
      loadDramas(page, activeSearch, selectedCategory?.id);
    }
  }, [page, activeSearch, selectedDrama, selectedCategory]);

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

    // Load user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    loadCategories();

    // Load Midtrans Snap Script
    const loadMidtransScript = () => {
      const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      const scriptUrl = isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

      // Check if already exists
      if (document.querySelector(`script[src="${scriptUrl}"]`)) return;

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.head.appendChild(script);
    };

    loadMidtransScript();

    // Heartbeat untuk cek sesi (Single Session Protection)
    // Optimized: Hanya cek saat tab aktif dan interval lebih panjang
    const sessionInterval = setInterval(async () => {
      // Hanya cek jika tab sedang aktif (user sedang melihat)
      if (localStorage.getItem('token') && !document.hidden) {
        console.log("[Heartbeat] Checking session...");
        try {
          await fetchMe();
        } catch (err) {
          console.error("Session heartbeat failed", err);
        }
      }
    }, 600000); // 10 menit - sangat efisien, proactive check handle semua aksi penting

    return () => clearInterval(sessionInterval);
  }, []);

  // Event listener untuk session expired
  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpired(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchQuery);
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setSelectedCategory(null);
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

  const handleDramaClick = async (drama) => {
    // Proactive session check
    if (user) {
      await fetchMe().catch(() => { });
    }
    setSelectedDrama(drama);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedDrama(null);
    setWatchingEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatch = async (dramaId, episode, totalEpisodes = 0) => {
    // Proactive session check sebelum mulai nonton
    if (user) {
      await fetchMe().catch(() => { });
    }
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
    setSelectedCategory(null);
    setCurrentView('home');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setSearchQuery('');
    setActiveSearch('');
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setCurrentView('home');
    setShowCategories(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRekomendasi = () => {
    setCurrentView('rekomendasi');
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setSelectedCategory(null);
    setShowUserMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewMembership = () => {
    setCurrentView('membership');
    setSelectedDrama(null);
    setWatchingEpisode(null);
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('home');
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowUserMenu(false);
    setWatchingEpisode(null);
    setSelectedDrama(null);
    setCurrentView('home');
  };

  const handleViewAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView('auth');
    setSelectedDrama(null);
    setWatchingEpisode(null);
  };

  const handleSelectPlan = async (plan) => {
    if (!user) {
      handleViewAuth();
      return;
    }
    // Proactive session check sebelum checkout
    await fetchMe().catch(() => { });
    setSelectedPlan(plan);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (plan) => {
    // In a real app, we would verify with the backend
    // For now, let's update the local user state
    const updatedUser = { ...user, is_subscribed: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleCloseCheckout = () => {
    setCurrentView('membership');
    setSelectedPlan(null);
  };

  return (
    <div className="app bg-bg-primary min-h-screen text-text-primary font-sans flex flex-col">
      <nav ref={mobileMenuRef} className="sticky top-4 z-[100] mx-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg">
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
            {(!user || !user.is_subscribed) && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleViewMembership(); }}
                className={`flex items-center gap-1.5 transition-colors ${currentView === 'membership' ? 'text-indigo-400' : 'hover:text-amber-400'}`}
              >
                <Crown size={16} /> Membership
              </a>
            )}

            <div className="relative group" ref={categoryRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center gap-1 transition-colors ${showCategories ? 'text-indigo-400' : 'hover:text-indigo-400'}`}
              >
                Kategori <ChevronDown size={16} className={`transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              {showCategories && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 grid grid-cols-1 gap-2 z-50 animate-fade-in"
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors ${selectedCategory?.id === cat.id ? 'text-indigo-400 bg-white/5' : 'text-slate-300 hover:text-white'}`}
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
                className="bg-slate-800/50 border border-slate-700 text-sm rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 lg:w-64 transition-all text-white"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Search size={18} />
              </button>
            </div>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-1.5 pr-3 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-[110] animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <p className={`text-[10px] font-bold mt-1 ${user.is_subscribed ? 'text-amber-500' : 'text-slate-400'}`}>
                        {user.is_subscribed ? 'PREMIUM MEMBER' : 'FREE ACCOUNT'}
                      </p>
                    </div>
                    <button
                      onClick={handleViewHistory}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Clock size={16} /> Riwayat Transaksi
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewAuth('login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
                >
                  <LogIn size={18} /> Masuk
                </button>
                <button
                  onClick={() => handleViewAuth('register')}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  <UserPlus size={18} /> Daftar
                </button>
              </div>
            )}

            <button
              className="md:hidden p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {
          showMobileMenu && (
            <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl rounded-b-2xl animate-fade-in overflow-hidden">
              <div className="flex flex-col p-4 gap-2">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); resetHome(); setShowMobileMenu(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'home' ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-white/5 text-slate-300'}`}
                >
                  Home
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleViewRekomendasi(); setShowMobileMenu(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'rekomendasi' ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-white/5 text-slate-300'}`}
                >
                  Rekomendasi
                </a>
                {(!user || !user.is_subscribed) && (
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleViewMembership(); setShowMobileMenu(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'membership' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-white/5 text-slate-300'}`}
                  >
                    <Crown size={18} /> Membership
                  </a>
                )}

                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kategori</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { handleCategorySelect(cat); setShowMobileMenu(false); }}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory?.id === cat.id ? 'text-indigo-400 bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:hidden mt-2 p-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(); setShowMobileMenu(false); } }}
                      placeholder="Search dramas..."
                      className="bg-slate-800/50 border border-slate-700 text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 w-full text-white"
                    />
                    <button
                      onClick={() => { handleSearch(); setShowMobileMenu(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-0 flex-grow">

        {watchingEpisode ? (
          <DramaPlayer
            dramaId={watchingEpisode.dramaId}
            initialEpisode={watchingEpisode.episode}
            initialTotalEpisodes={watchingEpisode.totalEpisodes}
            onBack={handleClosePlayer}
            user={user}
            onUpgrade={handleViewMembership}
          />
        ) : selectedDrama ? (
          <DramaDetail
            dramaId={selectedDrama.id || selectedDrama.bookId}
            onBack={handleBackToHome}
            onWatch={handleWatch}
            user={user}
            onLogin={handleViewAuth}
            onMembership={handleViewMembership}
          />
        ) : (
          <>
            {currentView === 'rekomendasi' ? (
              <Rekomendasi onDramaClick={handleDramaClick} isLoggedIn={!!user} />
            ) : currentView === 'membership' ? (
              <Membership onSelectPlan={handleSelectPlan} />
            ) : currentView === 'checkout' ? (
              <Checkout
                plan={selectedPlan}
                user={user}
                onBack={handleCloseCheckout}
                onPaymentSuccess={handlePaymentSuccess}
              />
            ) : currentView === 'history' ? (
              <TransactionHistory
                user={user}
                onStatusUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }}
              />
            ) : currentView === 'auth' ? (
              <Auth
                mode={authMode}
                onLoginSuccess={handleLoginSuccess}
                onToggleMode={toggleAuthMode}
              />
            ) : (
              <>
                {!loading && error ? (
                  <div className="text-center py-6 px-6 max-w-2xl mx-auto flex flex-col items-center animate-fade-in mt-12">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
                      <Clock className="text-indigo-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">
                      Kesalahan pada server,<br />mohon hubungi admin
                    </h2>
                    <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-md">
                      Kami mendeteksi gangguan teknis. Tim kami sedang berusaha memperbaikinya secepat mungkin.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-xl active:scale-95 text-sm"
                      >
                        Refresh Page
                      </button>
                      <button
                        onClick={resetHome}
                        className="px-6 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-bold transition-all border border-white/5 active:scale-95 text-sm"
                      >
                        Kembali Ke Home
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!loading && (
                      <div className="text-center mb-12 pt-8">
                        <h2 className="text-4xl font-bold mb-4">
                          {activeSearch ? `Search Results for "${activeSearch}"` : selectedCategory ? `Kategori: ${selectedCategory.name}` : 'Latest Dramas'}
                        </h2>
                        <p className="text-slate-400 text-lg">
                          {activeSearch ? `Found dramas matching your search` : selectedCategory ? `Dramas in ${selectedCategory.name} collection` : 'Discover the newest trending stories'}
                        </p>
                      </div>
                    )}

                    {loading && <div className="text-center py-20 text-xl text-slate-400">Mohon menunggu...</div>}

                    {!loading && <DramaList dramas={dramas} onDramaClick={handleDramaClick} isLoggedIn={!!user} />}
                  </>
                )}

                {!loading && !error && (
                  <>
                    {/* Pagination */}
                    <div className="mt-12 mb-32 flex justify-center items-center gap-3 flex-wrap">
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

      <footer className="border-t border-white/5 py-6 text-center text-slate-500 mt-auto">
        <p>&copy; 2026 DramaBox. All rights reserved.</p>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/6285179691321?text=Halo%20Admin,%20saya%20ingin%20bertanya..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[120] group flex items-center gap-3"
      >
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-2xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
          Hubungi Admin
        </div>
        <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all duration-300">
          <MessageCircle size={32} className="text-white fill-white/20" />
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        </div>
      </a>

      {/* Session Expired Modal */}
      {showSessionExpired && <SessionExpiredModal />}
    </div >
  );
}

export default App;
