import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import s from './Admin.module.css';

const AdminLogin = () => {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If already authenticated, redirect
    React.useEffect(() => {
        if (sessionStorage.getItem('adminToken')) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!key.trim()) return;
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/verify-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessKey: key })
            });
            const data = await res.json();

            if (res.ok && data.token) {
                sessionStorage.setItem('adminToken', data.token);
                navigate('/admin');
            } else {
                setError(data.error || 'Invalid access key');
            }
        } catch (err) { // eslint-disable-line no-unused-vars
            setError('Connection failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.loginPage}>
            <div className={s.loginCard}>
                <div className={s.loginLogo}>
                    <Shield size={40} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
                    <h1>ALTAIRGO <span>INTELLIGENCE</span></h1>
                    <p>Admin Control Center</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className={s.loginLabel}>
                        <KeyRound size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Access Key
                    </label>
                    <input
                        type="password"
                        className={s.loginInput}
                        placeholder="••••••••••••••"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className={s.loginBtn}
                        disabled={loading || !key.trim()}
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>

                {error && <div className={s.loginError}>{error}</div>}
            </div>
        </div>
    );
};

export default AdminLogin;
