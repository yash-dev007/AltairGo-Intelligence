import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ItineraryTimeline from '../../components/TripPlanner/ItineraryTimeline';
import BookingSection from '../../components/TripPlanner/BookingSection';
import { API_BASE_URL } from '../../config';
import { MapPin, Calendar, DollarSign, Clock, Share2, ArrowLeft } from 'lucide-react';

const TripViewerPage = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get-trip/${tripId}`);
                if (!response.ok) throw new Error("Trip not found");
                const data = await response.json();
                setTrip(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [tripId]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <h2>Trip Not Found</h2>
            <p>Dimensions of this trip seem lost in space-time.</p>
            <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>Go Home</Link>
        </div>
    );

    // Parse itinerary if necessary (it might come as JSON string or object depending on DB)
    const itinerary = typeof trip.itinerary === 'string' ? JSON.parse(trip.itinerary) : trip.itinerary;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
                        <ArrowLeft size={18} /> Back home
                    </Link>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '1.2rem' }}>AltairGo</div>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* Trip Hero */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', color: '#1e293b' }}>{trip.title || `Trip to ${trip.country}`}</h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {trip.country}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {trip.duration} Days</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> ₹{trip.cost ? trip.cost.toLocaleString() : 'N/A'}</span>
                            </div>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#475569', fontWeight: '600' }}>
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                </div>

                {/* Itinerary Timeline */}
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#334155' }}>Itinerary</h2>
                <ItineraryTimeline itinerary={itinerary} />

                {/* Booking Section */}
                <BookingSection
                    startLocation={trip.startCity || 'Your City'}
                    destinations={[{ name: trip.country }]} // Simplified for viewer
                    travelDate={{ duration: trip.duration }}
                />

            </div>
        </div>
    );
};

export default TripViewerPage;
