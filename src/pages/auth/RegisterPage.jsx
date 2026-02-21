import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Mail, Lock, User, ArrowRight, Globe, Shield, Sparkles, AlertCircle } from 'lucide-react';
import styles from './Auth.module.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.page}>
            {/* Left Hero Panel */}
            <div className={styles.heroPanel}>
                <div className={styles.heroOverlay}>
                    <div className={styles.heroBrand}>
                        Altair<span className={styles.heroBrandAccent}>Go</span>
                    </div>
                    <h2 className={styles.heroTitle}>
                        Start exploring<br />the world today.
                    </h2>
                    <p className={styles.heroSubtitle}>
                        Create your free account and unlock AI-powered trip planning,
                        personalized recommendations, and curated travel experiences.
                    </p>
                    <div className={styles.heroStats}>
                        <div className={styles.heroStat}>
                            <strong>Free</strong>
                            <span>Forever</span>
                        </div>
                        <div className={styles.heroStat}>
                            <strong>30s</strong>
                            <span>Setup</span>
                        </div>
                        <div className={styles.heroStat}>
                            <strong>∞</strong>
                            <span>Trips</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className={styles.formPanel}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <div className={styles.formIcon}>
                            <Sparkles size={26} />
                        </div>
                        <h1 className={styles.formTitle}>Create account</h1>
                        <p className={styles.formSubtitle}>Join AltairGo and start your journey</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="name"
                            />
                        </div>

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
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Create account <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.footerLink}>Sign in</Link>
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

export default RegisterPage;
