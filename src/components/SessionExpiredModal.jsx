import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';

const SessionExpiredModal = ({ onClose }) => {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleReload}
            />

            {/* Modal */}
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)] animate-scale-in">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl" />

                <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 mx-auto">
                        <AlertCircle className="text-red-400" size={40} />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 text-center leading-tight">
                        Sesi Telah Berakhir
                    </h2>

                    {/* Message */}
                    <p className="text-slate-300 text-center mb-8 leading-relaxed">
                        Akun Anda telah login di perangkat lain. Untuk keamanan, sesi di perangkat ini akan diakhiri.
                    </p>

                    {/* Button */}
                    <button
                        onClick={handleReload}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95"
                    >
                        <LogOut size={20} />
                        Kembali ke Login
                    </button>

                    {/* Info text */}
                    <p className="text-slate-500 text-xs text-center mt-4">
                        Halaman akan dimuat ulang secara otomatis
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
