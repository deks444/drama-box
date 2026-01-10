import React, { useState, useEffect } from 'react';
import { Search, Crown, Users, CheckCircle, Calendar, Mail, Shield, LogOut, TrendingUp, LayoutDashboard, CreditCard, Menu, X, Settings } from 'lucide-react';
import AdminTransactions from './AdminTransactions';

const AdminPanel = ({ onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Dashboard States
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [grantForm, setGrantForm] = useState({
        plan_type: 'monthly',
        duration_days: 30
    });

    const MY_BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:8000/api`
        : 'https://be-drama-box-production.up.railway.app/api';

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('admin_token');
        setLoading(true);
        try {
            const response = await fetch(`${MY_BACKEND_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                // Laravel pagination returns data in data.data.data
                setUsers(data.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`${MY_BACKEND_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }

        const token = localStorage.getItem('admin_token');
        setLoading(true);
        try {
            const response = await fetch(`${MY_BACKEND_URL}/admin/users/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantPremium = async () => {
        if (!selectedUser) return;

        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`${MY_BACKEND_URL}/admin/users/grant-premium`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    plan_type: grantForm.plan_type,
                    duration_days: parseInt(grantForm.duration_days)
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Premium berhasil diberikan!');
                setSelectedUser(null);
                handleSearch(); // Refresh list
                fetchStats(); // Refresh stats
            }
        } catch (error) {
            console.error('Grant premium failed:', error);
            alert('❌ Gagal memberikan premium');
        }
    };

    const planOptions = [
        { value: 'daily', label: 'Harian', days: 1 },
        { value: '3days', label: '3 Hari', days: 3 },
        { value: 'weekly', label: 'Mingguan', days: 7 },
        { value: 'monthly', label: 'Bulanan', days: 30 },
        { value: 'permanent', label: 'Permanent', days: 36500 }
    ];

    const DashboardContent = () => (
        <div className="animate-fade-in">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Users</p>
                                <p className="text-3xl font-bold">{stats.total_users}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <Crown className="text-amber-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Premium Users</p>
                                <p className="text-3xl font-bold">{stats.premium_users}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Free Users</p>
                                <p className="text-3xl font-bold">{stats.free_users}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Users size={24} className="text-purple-400" />
                    Kelola User
                </h2>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Cari berdasarkan email atau nama..."
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <Search size={20} />
                        {loading ? 'Mencari...' : 'Cari'}
                    </button>
                </div>

                {/* Table Results */}
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-slate-400 text-sm">
                                <th className="px-6 py-3 font-medium text-left">User</th>
                                <th className="px-6 py-3 font-medium text-left">Email</th>
                                <th className="px-6 py-3 font-medium text-left">Status</th>
                                <th className="px-6 py-3 font-medium text-left">Terdaftar</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {users.length > 0 ? (
                                users.map((user) => {
                                    const activeSub = user.subscriptions?.[0];
                                    const isPremium = activeSub && new Date(activeSub.expires_at) > new Date();

                                    return (
                                        <tr
                                            key={user.id}
                                            className="group bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <td className="px-6 py-4 rounded-l-2xl border-y border-l border-white/10 group-hover:border-purple-500/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                                                        {isPremium ? <Crown className="text-amber-400" size={18} /> : <Users className="text-slate-400" size={18} />}
                                                    </div>
                                                    <span className="font-bold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-white/10 group-hover:border-purple-500/30">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Mail size={14} />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-white/10 group-hover:border-purple-500/30">
                                                {isPremium ? (
                                                    <div className="flex flex-col">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 w-fit">
                                                            PREMIUM
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 mt-1">
                                                            Exp: {new Date(activeSub.expires_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-400 w-fit">
                                                        FREE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 border-y border-white/10 group-hover:border-purple-500/30 text-slate-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 rounded-r-2xl border-y border-r border-white/10 group-hover:border-purple-500/30 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                    }}
                                                    className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all"
                                                >
                                                    <Settings size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">
                                        {loading ? 'Memuat data...' : 'Tidak ada user ditemukan'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <button
                            onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'dashboard'
                                ? 'bg-purple-600 shadow-lg shadow-purple-900/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setActiveView('transactions'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'transactions'
                                ? 'bg-purple-600 shadow-lg shadow-purple-900/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <CreditCard size={20} />
                            Rekap Pembayaran
                        </button>
                    </nav>

                    <button
                        onClick={onLogout}
                        className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 bg-slate-900 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400">
                            <Menu size={24} />
                        </button>
                        <h1 className="font-bold">Admin Panel</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {activeView === 'dashboard' && <DashboardContent />}
                    {activeView === 'transactions' && <AdminTransactions />}
                </main>
            </div>

            {/* Grant Premium Modal - Keep it global or inside Dashboard logic? It uses state, so keep here */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Shield className="text-purple-400" size={28} />
                                Berikan Premium
                            </h3>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-white/5 rounded-xl">
                            <p className="text-sm text-slate-400 mb-1">User:</p>
                            <p className="font-bold">{selectedUser.name}</p>
                            <p className="text-sm text-slate-400">{selectedUser.email}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Paket</label>
                                <select
                                    value={grantForm.plan_type}
                                    onChange={(e) => {
                                        const plan = planOptions.find(p => p.value === e.target.value);
                                        setGrantForm({
                                            plan_type: e.target.value,
                                            duration_days: plan.days
                                        });
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white"
                                >
                                    {planOptions.map(plan => (
                                        <option key={plan.value} value={plan.value}>{plan.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Durasi (Hari)</label>
                                <input
                                    type="number"
                                    value={grantForm.duration_days}
                                    onChange={(e) => setGrantForm({ ...grantForm, duration_days: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleGrantPremium}
                                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white"
                            >
                                <CheckCircle size={20} />
                                Berikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
