import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import styles from './TripPlanner.module.css';
import { DashboardSkeleton } from '../../components/Skeleton/Skeleton';

const DashboardPage = () => {
    const { user, token, loading, logout } = useAuth();
    const navigate = useNavigate();

    const [trips, setTrips] = React.useState([]);

    React.useEffect(() => {
        // Wait for auth loading to complete before checking user
        if (loading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchTrips = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/trips`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTrips(data);
                }
            } catch (err) {
                console.error("Failed to fetch trips", err);
            }
        };
        fetchTrips();
    }, [user, loading, navigate, token]);

    // Show loading state while auth is being validated
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', paddingTop: '8rem', maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem 2rem' }}>
                <DashboardSkeleton count={3} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className={styles.title}>Hello, {user.name} 👋</h1>
                        <p className={styles.subtitle}>Welcome to your travel dashboard.</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #dc2626', color: '#dc2626', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Logout
                    </button>
                </div>

                {trips.length > 0 ? (
                    <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {trips.map(trip => (
                            <div key={trip.id} className={styles.card} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trip/${trip.id}`)}>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardTitle}>{trip.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {trip.duration} Days • {trip.country}
                                    </div>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                        ₹{trip.cost?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.card} style={{ padding: '2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
                        <h3>No Saved Trips Yet</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Start planning your next adventure today.</p>
                        <button
                            className={styles.nextBtn}
                            onClick={() => navigate('/plan-trip')}
                        >
                            Plan a New Trip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
