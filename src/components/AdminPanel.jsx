import React, { useState, useEffect } from 'react';
import { Search, Crown, Users, CheckCircle, Calendar, Mail, Shield, LogOut, TrendingUp } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [grantForm, setGrantForm] = useState({
        plan_type: 'monthly',
        duration_days: 30
    });

    const MY_BACKEND_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api'
        : 'https://be-drama-box-production.up.railway.app/api';

    useEffect(() => {
        fetchStats();
    }, []);

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
        if (!searchQuery.trim()) return;

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400 mb-2">
                            Admin Panel
                        </h1>
                        <p className="text-slate-400">Kelola akses premium user</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Search size={24} className="text-purple-400" />
                    Cari User
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

                {/* Results */}
                {users.length > 0 && (
                    <div className="mt-6 space-y-3">
                        {users.map((user) => {
                            const activeSub = user.subscriptions?.[0];
                            const isPremium = activeSub && new Date(activeSub.expires_at) > new Date();

                            return (
                                <div
                                    key={user.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                                                {isPremium ? <Crown className="text-amber-400" size={20} /> : <Users className="text-slate-400" size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isPremium ? (
                                                <>
                                                    <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold mb-1">
                                                        PREMIUM
                                                    </span>
                                                    <p className="text-xs text-slate-400">
                                                        Expired: {new Date(activeSub.expires_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="inline-block px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-bold">
                                                    FREE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Grant Premium Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="text-purple-400" size={28} />
                            Berikan Premium
                        </h3>

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
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
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
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleGrantPremium}
                                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
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
