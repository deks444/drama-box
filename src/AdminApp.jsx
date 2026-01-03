import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function AdminApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if admin is already logged in
        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setIsLoggedIn(false);
    };

    return isLoggedIn ? (
        <AdminPanel onLogout={handleLogout} />
    ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
    );
}

export default AdminApp;
