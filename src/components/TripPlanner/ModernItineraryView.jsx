import React, { useMemo } from 'react';
import styles from './ModernItineraryView.module.css';
import {
    Calendar, MapPin, Search, Sparkles, Navigation, Droplets,
    Mountain, Umbrella, Palmtree, Utensils, ArrowRight,
    CheckCircle2, Map
} from 'lucide-react';

const getIntensityColor = (val) => {
    if (val <= 3) return '#10b981'; // Green
    if (val <= 6) return '#f59e0b'; // Yellow
    if (val <= 8) return '#f97316'; // Orange
    return '#ef4444'; // Red
};

const getIconForType = (type, name) => {
    const lName = (name || '').toLowerCase();
    const lType = (type || '').toLowerCase();
    if (lName.includes('lake') || lName.includes('water') || lName.includes('falls')) return <Droplets size={18} />;
    if (lName.includes('trek') || lName.includes('mountain') || lName.includes('hill')) return <Mountain size={18} />;
    if (lName.includes('beach') || lName.includes('island')) return <Palmtree size={18} />;
    if (lType.includes('food') || lName.includes('dinner')) return <Utensils size={18} />;
    return <MapPin size={18} />;
};

const ModernItineraryView = ({ itinerary, tripContext, insight }) => {
    // Process itinerary into days
    const days = useMemo(() => {
        if (!itinerary || itinerary.length === 0) return [];

        // Handle backend ItineraryDay object array
        const isStructured = itinerary[0] && Array.isArray(itinerary[0].activities);

        if (isStructured) {
            return itinerary.map(item => {
                const acts = item.activities || [];
                const locations = [...new Set(acts.map(a => a.location || item.location).filter(Boolean))];
                const primaryLocation = item.base_location || item.location || (locations.length > 0 ? locations[0] : 'City');

                return {
                    day: item.day,
                    activities: acts,
                    primaryLocation: primaryLocation,
                    allLocations: locations,
                    intensity: item.intensity_score || 5,
                    travelHours: item.travel_hours || '2 hrs',
                    risk: item.risk || 'Low',
                    weatherSensitivity: item.weather_sensitivity || 'Low',
                    purpose: item.purpose || '',
                    stayLogic: item.stay_logic || '',
                    routeStr: locations.length > 0 ? locations.join(' → ') : primaryLocation
                };
            });
        }

        // Fallback for old unstructured flat list arrays
        const dMap = {};
        itinerary.forEach(item => {
            if (!dMap[item.day]) dMap[item.day] = [];
            dMap[item.day].push(item);
        });

        return Object.keys(dMap).sort((a, b) => Number(a) - Number(b)).map(day => {
            const acts = dMap[day];
            const locations = [...new Set(acts.map(a => a.location).filter(Boolean))];
            return {
                day: Number(day),
                activities: acts,
                primaryLocation: locations[0] || 'City',
                allLocations: locations,
                intensity: 5,
                travelHours: '3 hrs',
                risk: 'Low',
                purpose: '',
                weatherSensitivity: 'Medium',
                stayLogic: '',
                routeStr: locations.length > 0 ? locations.join(' → ') : 'City'
            };
        });
    }, [itinerary]);

    // Derived Trip Info
    const tripTitle = tripContext?.title || `Trip to ${itinerary[0]?.location || 'Unknown'}`;
    // Try to get a nice image for the hero
    const heroImage = itinerary.find(i => i.image)?.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';
    const totalDays = days.length;

    if (days.length === 0) return null;

    return (
        <div className={styles.container}>
            {/* HER SECTION */}
            <div className={styles.heroSection}>
                <img src={heroImage} alt="Trip Background" className={styles.heroImage} />
                <div className={styles.heroOverlay}>
                    <div className={styles.aiBadge}>✨ AI GENERATED</div>
                    <div className={styles.heroMeta}>
                        <Calendar size={14} /> {totalDays} Days
                    </div>
                    <h1 className={styles.heroTitle}>
                        {tripTitle}
                    </h1>
                </div>

                <div className={styles.budgetBox}>
                    <div className={styles.budgetHeader}>
                        <span>Smart Budget Summary</span>
                        <span className={styles.budgetValue}>₹{(tripContext?.budget || 50000).toLocaleString()}</span>
                    </div>
                    <div className={styles.budgetBars}>
                        <div className={styles.budgetRow}>
                            <span>Flights</span>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: '40%', background: '#3b82f6' }}></div>
                            </div>
                        </div>
                        <div className={styles.budgetRow}>
                            <span>Stay</span>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: '35%', background: '#10b981' }}></div>
                            </div>
                        </div>
                        <div className={styles.budgetRow}>
                            <span>Food</span>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: '25%', background: '#f59e0b' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.layout}>
                {/* LEFT COLUMN: TIMELINE */}
                <div className={styles.timeline}>
                    {days.map((dayData, idx) => {
                        const isEven = idx % 2 === 0;
                        const mainAct = dayData.activities[0];
                        const imgAct = dayData.activities.find(a => a.image);

                        return (
                            <div key={dayData.day} className={styles.dayWrapper}>
                                <div className={styles.dayNumberBadge}>{dayData.day}</div>

                                <div className={styles.dayCard}>
                                    {/* Alternate layouts based on 'isEven' to match the screenshot vibe */}
                                    {isEven ? (
                                        <div className={styles.dayContentRow}>
                                            <div className={styles.dayMain}>
                                                <div className={styles.dayHeader}>
                                                    <h3 className={styles.dayTitle}>DAY {dayData.day} — {mainAct?.activity || 'EXPLORATION'}</h3>
                                                    <span className={styles.aiOptimized}>AI OPTIMIZED</span>
                                                </div>

                                                <div className={styles.routeBox}>
                                                    <Navigation size={16} className={styles.routeIcon} />
                                                    <strong>Route:</strong> {dayData.routeStr}
                                                </div>

                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>PLANNED STOPS</div>
                                                <div className={styles.stopsGrid}>
                                                    {dayData.activities.slice(0, 4).map((act, i) => (
                                                        <div key={i} className={styles.stopItem}>
                                                            <div className={styles.stopIcon}>{getIconForType(act.type, act.activity)}</div>
                                                            <div className={styles.stopInfo}>
                                                                <span className={styles.stopName}>{act.activity}</span>
                                                                <span className={styles.stopDesc}>{act.description?.substring(0, 30)}...</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {dayData.stayLogic && (
                                                    <div className={styles.aiTip}>
                                                        <Sparkles size={14} className={styles.aiTipIcon} />
                                                        <strong>Stay Logic:</strong> {dayData.stayLogic}
                                                    </div>
                                                )}
                                                {dayData.purpose && (
                                                    <div className={styles.aiTip} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#0369a1', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                                                        <Sparkles size={14} className={styles.aiTipIcon} />
                                                        <strong>Purpose:</strong> {dayData.purpose}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.dayStats}>
                                                <div className={styles.statItem}>
                                                    <span className={styles.statLabel}>Travel Hours</span>
                                                    <span className={styles.statValue}>{dayData.travelHours}</span>
                                                </div>
                                                <div className={styles.statItem}>
                                                    <span className={styles.statLabel}>Intensity</span>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <span className={styles.statValue} style={{ color: getIntensityColor(dayData.intensity) }}>{dayData.intensity}/10</span>
                                                    </div>
                                                    <div className={styles.intensityBar}>
                                                        <div className={styles.intensityFill} style={{ width: `${dayData.intensity * 10}%`, background: getIntensityColor(dayData.intensity) }}></div>
                                                    </div>
                                                </div>

                                                <a href="#details" className={styles.detailLink}>Details <ArrowRight size={14} /></a>
                                            </div>
                                        </div>
                                    ) : (
                                        // Layout 2: Featured Image
                                        <div className={styles.dayContentRow}>
                                            <div className={styles.dayMain}>
                                                <div className={styles.dayHeader}>
                                                    <h3 className={styles.dayTitle} style={{ textTransform: 'none', fontWeight: 700 }}>Day {dayData.day}: {mainAct?.activity}</h3>
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                                    {dayData.activities.map(a => a.description).join(' ').substring(0, 150)}...
                                                </p>

                                                <div className={styles.stopsGrid} style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {dayData.activities.slice(0, 2).map((act, i) => (
                                                        <div key={i} className={styles.stopItem} style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: '0 0 1rem 0' }}>
                                                            <div className={styles.stopIcon} style={{ color: '#3b82f6' }}>{getIconForType(act.type, act.activity)}</div>
                                                            <div className={styles.stopInfo}>
                                                                <span className={styles.stopName}>{act.activity}</span>
                                                                <span className={styles.stopDesc}>{act.description?.substring(0, 40)}...</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>🛏️ Stay: Default Hotel</span>
                                                    <a href="#details" className={styles.detailLink} style={{ marginTop: 0 }}>Details <ArrowRight size={14} /></a>
                                                </div>
                                            </div>
                                            {imgAct && (
                                                <img src={imgAct.image} alt={imgAct.activity} className={styles.dayImage} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>
                            Show All Days
                        </button>
                    </div>

                    <div className={styles.mapPlaceholder}>
                        <svg className={styles.mapLines} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50,150 Q150,50 300,100 T550,200 T800,100" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10, 10" />
                            <circle cx="50" cy="150" r="8" fill="#94a3b8" />
                            <circle cx="300" cy="100" r="8" fill="#94a3b8" />
                            <circle cx="550" cy="200" r="8" fill="#94a3b8" />
                            <circle cx="800" cy="100" r="8" fill="#94a3b8" />
                        </svg>
                        <button className={styles.viewMapBtn}>
                            <Map size={18} color="#3b82f6" /> View Interactive Map
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className={styles.sidebar}>
                    <div className={styles.structureCard}>
                        <h4 className={styles.cardTitle}>
                            <Search size={18} color="#3b82f6" /> AI Structure Summary
                        </h4>
                        <table className={styles.structureTable}>
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Base</th>
                                    <th>Hrs</th>
                                    <th>Int.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.slice(0, 5).map(d => (
                                    <tr key={d.day}>
                                        <td><strong>{d.day}</strong></td>
                                        <td>{d.primaryLocation}</td>
                                        <td>{d.travelHours}</td>
                                        <td>
                                            <div className={styles.intBadge} style={{ background: getIntensityColor(d.intensity) }}>
                                                {d.intensity}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.perfectCard}>
                        <div className={styles.perfectIconBox}>
                            <Sparkles size={24} />
                        </div>
                        <h4 className={styles.perfectTitle}>Why This is AI-Perfect</h4>

                        <div className={styles.perfectList}>
                            {tripContext?.ai_perfect_reasons && tripContext.ai_perfect_reasons.length > 0 ? (
                                tripContext.ai_perfect_reasons.map((reason, idx) => {
                                    const splits = reason.split(':');
                                    return (
                                        <div key={idx} className={styles.perfectItem}>
                                            <CheckCircle2 size={16} className={styles.perfectCheck} />
                                            <div>
                                                {splits.length > 1 ? (
                                                    <><strong style={{ color: '#f8fafc' }}>{splits[0]}:</strong> {splits.slice(1).join(':')}</>
                                                ) : (
                                                    reason
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <>
                                    <div className={styles.perfectItem}>
                                        <CheckCircle2 size={16} className={styles.perfectCheck} />
                                        <div>
                                            <strong>Geographic Flow:</strong> Loops logically from start to end, minimizing backtracking compared to standard tours.
                                        </div>
                                    </div>
                                    <div className={styles.perfectItem}>
                                        <CheckCircle2 size={16} className={styles.perfectCheck} />
                                        <div>
                                            <strong>Pacing Logic:</strong> Follows the 'High-Low' pattern. Heavy exertion is followed by cultural leisure based on your preference.
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Extra Images for padding */}
                    <div className={styles.imagesGrid}>
                        {itinerary.filter(i => i.image).slice(1, 3).map((imgAct, idx) => (
                            <img key={idx} src={imgAct.image} className={styles.miniImage} alt="Trip Thumbnail" />
                        ))}
                    </div>
                </div>
            </div>

            <button className={styles.exportBtn} onClick={() => window.print()}>
                <Navigation size={18} /> EXPORT PDF
            </button>
        </div>
    );
};

export default ModernItineraryView;
