import React, { useEffect, useState } from 'react';
import { Download, Search, Calendar, User, CreditCard, CheckCircle2 } from 'lucide-react';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'date', 'month'
    const [filterDate, setFilterDate] = useState('');
    const [filterMonth, setFilterMonth] = useState('');

    const MY_BACKEND_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api'
        : 'https://be-drama-box-production.up.railway.app/api';

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const response = await fetch(`${MY_BACKEND_URL}/admin/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(trx => {
        const matchesSearch =
            trx.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trx.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trx.order_id?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const trxDate = new Date(trx.created_at);
        const trxDateStr = trxDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const trxMonthStr = trxDate.toISOString().slice(0, 7); // YYYY-MM

        if (filterType === 'date' && filterDate) {
            return trxDateStr === filterDate;
        }

        if (filterType === 'month' && filterMonth) {
            return trxMonthStr === filterMonth;
        }

        return true;
    });

    const getPrice = (planType) => {
        switch (planType) {
            case 'daily': return 3000;
            case 'weekly': return 15000;
            case 'monthly': return 50000;
            case 'permanent': return 250000;
            default: return 0;
        }
    };

    // Calculate total based on FILTERED transactions
    const totalRevenue = filteredTransactions.reduce((sum, trx) => sum + getPrice(trx.plan_type), 0);

    const exportToCSV = () => {
        // Use semicolon (;) as separator which is standard for Excel in Indonesia/Europe
        const separator = ";";
        const headers = ["Order ID", "User Name", "Email", "Plan", "Price (IDR)", "Transaction Time", "Expired Date"];

        const rows = filteredTransactions.map(trx => [
            `"${trx.order_id}"`, // Quote to prevent scientific notation
            `"${(trx.user?.name || 'Unknown').replace(/"/g, '""')}"`, // Escape quotes
            `"${(trx.user?.email || 'Unknown')}"`,
            trx.plan_type,
            getPrice(trx.plan_type),
            `"${new Date(trx.created_at).toLocaleString('id-ID')}"`,
            `"${new Date(trx.expires_at).toLocaleDateString('id-ID')}"`
        ].join(separator));

        // Calculate Summary
        const totalAmount = filteredTransactions.reduce((sum, trx) => sum + getPrice(trx.plan_type), 0);

        // Add Total Row at the bottom
        // Empty columns for alignment under 'Price'
        const totalRow = ["", "", "", "TOTAL PENDAPATAN", totalAmount, "", ""].join(separator);

        const filterInfo = filterType === 'date' ? `Tanggal: ${filterDate}` : filterType === 'month' ? `Bulan: ${filterMonth}` : 'Semua Waktu';
        const titleRow = [`REKAP PEMBAYARAN - ${filterInfo}`].join(separator);

        const csvContent = "\uFEFF" + [ // Add BOM for proper UTF-8 handling in Excel
            titleRow,
            headers.join(separator),
            ...rows,
            separator.repeat(headers.length - 1), // Empty row
            totalRow
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Rekap_Pembayaran_${filterType}_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="text-purple-400" />
                        Rekap Pembayaran
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Menampilkan {filteredTransactions.length} transaksi sukses
                    </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-xl min-w-[200px] text-right">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-white">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">

                {/* Filters */}
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => { setFilterType('all'); setFilterDate(''); setFilterMonth(''); }}
                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'all' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilterType('date')}
                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'date' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Harian
                    </button>
                    <button
                        onClick={() => setFilterType('month')}
                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${filterType === 'month' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Bulanan
                    </button>
                </div>

                {/* Date/Month Inpust */}
                {filterType === 'date' && (
                    <div className="relative animate-fade-in">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                )}

                {filterType === 'month' && (
                    <div className="relative animate-fade-in">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                )}

                <div className="h-8 w-px bg-white/10 hidden md:block mx-2"></div>

                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari User, Email, atau Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm transition-colors text-white shadow-lg shadow-green-900/20 whitespace-nowrap"
                >
                    <Download size={16} /> Export Excel
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Paket</th>
                                <th className="p-4 font-bold">Harga</th>
                                <th className="p-4 font-bold">Tanggal</th>
                                <th className="p-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        Tidak ada data transaksi.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                    {trx.user?.name?.charAt(0) || <User size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{trx.user?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-slate-500">{trx.user?.email}</p>
                                                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">{trx.order_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="capitalize text-sm font-medium text-slate-300">
                                                {trx.plan_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-white">
                                                Rp {getPrice(trx.plan_type).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300">
                                                    {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                <CheckCircle2 size={12} /> SUKSES
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;
