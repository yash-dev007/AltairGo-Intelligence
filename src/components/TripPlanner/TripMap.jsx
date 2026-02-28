import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue (Vite / Webpack bundler issue with Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored circle marker for day numbers
const createDayIcon = (dayNumber, color) => L.divIcon({
    className: '',
    html: `<div style="
        background: ${color};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Inter, sans-serif;
    ">${dayNumber}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const DAY_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
];

// Helper to auto-fit map to markers
function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions && positions.length > 0) {
            if (positions.length === 1) {
                map.setView(positions[0], 11);
            } else {
                map.fitBounds(positions, { padding: [40, 40] });
            }
        }
    }, [positions, map]);
    return null;
}

// Nominatim geocoder — rate-limited to 1 req/s
async function geocodeQuery(query) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'AltairGO-Travel-App' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
    } catch (e) { // eslint-disable-line no-unused-vars
        // silently fail
    }
    return null;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

const TripMap = ({ itinerary }) => {
    const [markers, setMarkers] = useState([]); // [{day, label, position, color}]
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!itinerary || itinerary.length === 0 || hasFetched.current) return;
        hasFetched.current = true;

        (async () => {
            setLoading(true);
            const results = [];

            // Collect one representative location per day (first activity's google_maps_search_query)
            for (let i = 0; i < itinerary.length; i++) {
                const day = itinerary[i];
                const dayNum = day.day ?? (i + 1);
                const color = DAY_COLORS[i % DAY_COLORS.length];

                // Try activities first, then fallback to day.location
                const activities = day.activities || [];
                let position = null;

                for (const act of activities) {
                    const query = act.google_maps_search_query || act.activity;
                    if (!query) continue;
                    position = await geocodeQuery(query);
                    if (position) break;
                    await sleep(1050); // Nominatim rate limit: 1 req/s
                }

                // Fallback to location name
                if (!position && day.location) {
                    position = await geocodeQuery(day.location);
                    await sleep(1050);
                }

                if (position) {
                    results.push({
                        day: dayNum,
                        label: day.location || `Day ${dayNum}`,
                        activities: activities.slice(0, 3).map(a => a.activity || '').filter(Boolean),
                        position,
                        color,
                    });
                }

                // Rate-limit between days too
                if (i < itinerary.length - 1) await sleep(1050);
            }

            setMarkers(results);
            setLoading(false);
        })();
    }, [itinerary]);

    const positions = markers.map(m => m.position);

    return (
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '400px', marginTop: '3rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(248, 250, 252, 0.92)', backdropFilter: 'blur(4px)',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '4px solid #e2e8f0', borderTopColor: '#3b82f6',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                        Locating destinations on map…
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {positions.length > 0 && <FitBounds positions={positions} />}

                {/* Route polyline */}
                {positions.length > 1 && (
                    <Polyline
                        positions={positions}
                        pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.7, dashArray: '8, 6' }}
                    />
                )}

                {/* Day markers */}
                {markers.map((m) => (
                    <Marker key={m.day} position={m.position} icon={createDayIcon(m.day, m.color)}>
                        <Popup>
                            <div style={{ minWidth: '160px' }}>
                                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                                    Day {m.day} — {m.label}
                                </strong>
                                {m.activities.length > 0 && (
                                    <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem', fontSize: '0.82rem', color: '#475569' }}>
                                        {m.activities.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default TripMap;
