import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Mail, Lock, ArrowRight, Globe, Shield, Sparkles, AlertCircle } from 'lucide-react';
import styles from './Auth.module.css';
import logo from '../../assets/logo_corrected.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate(redirectTo);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.page}>
            {/* Left Hero Panel */}
            <div className={styles.heroPanel}>
                <div className={styles.heroOverlay}>
                    <img
                        src={logo}
                        alt="AltairGo"
                        className={styles.heroBrand}
                        style={{ height: '40px', width: 'auto' }}
                    />
                    <h2 className={styles.heroTitle}>
                        Your next adventure<br />starts here.
                    </h2>
                    <p className={styles.heroSubtitle}>
                        Plan stunning trips with AI-powered itineraries, discover hidden gems,
                        and explore the world like never before.
                    </p>
                    <div className={styles.heroStats}>
                        <div className={styles.heroStat}>
                            <strong>500+</strong>
                            <span>Destinations</span>
                        </div>
                        <div className={styles.heroStat}>
                            <strong>10K+</strong>
                            <span>Travelers</span>
                        </div>
                        <div className={styles.heroStat}>
                            <strong>AI</strong>
                            <span>Powered</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className={styles.formPanel}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <div className={styles.formIcon}>
                            <Globe size={26} />
                        </div>
                        <h1 className={styles.formTitle}>Welcome back</h1>
                        <p className={styles.formSubtitle}>Sign in to continue your journey</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Sign in <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className={styles.footer}>
                        Don't have an account?{' '}
                        <Link to="/register" className={styles.footerLink}>Create one</Link>
                    </div>

                    <div className={styles.trustRow}>
                        <div className={styles.trustItem}>
                            <Shield size={14} /> Secure
                        </div>
                        <div className={styles.trustItem}>
                            <Sparkles size={14} /> AI-Powered
                        </div>
                        <div className={styles.trustItem}>
                            <Globe size={14} /> Free
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
