import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, CheckCircle, ArrowLeft } from 'lucide-react';


// We need to duplicate the styles or import them. 
// Since DestinationDetails.module.css isn't strictly inside components/, 
// we assume the parent passed the correct context or we import it here.
// But importing module CSS from pages/ might be brittle if file structure changes.
// For now, I'll assume we can import it from the relative path if I place this component in src/components/Destinations
// Actually, let's just use inline styles for the extracted parts or reuse the same classNames if global.
// BUt wait, the original used CSS Modules.
// I will attempt to import the same module file. 
// NOTE: I need to know where this file is placed. It's in src/components/Destinations.
// The styles are in src/pages/destinations/DestinationDetails.module.css.
import pageStyles from '../../pages/destinations/DestinationDetails.module.css';

const DestinationContent = ({ destination, reviews = [], averageRating = 0, totalReviews = 0, starCounts = {}, onOpenReviewModal }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Fallback if destination is null
    if (!destination) return null;

    const backLabel = location.state?.from ? 'Back to Planner' : 'Back to all destinations';

    // Helper for navigation
    const handleBack = () => {
        if (location.state?.from) {
            navigate(-1);
        } else {
            navigate('/destinations');
        }
    };

    // Calculate rating if not passed (for preview mode where we might just have the raw object)
    const effectiveRating = averageRating || destination.rating || 0;
    const effectiveTotalReviews = totalReviews || (destination.reviews_count_str === 'New' ? 0 : parseInt(destination.reviews_count_str)) || 0;

    return (
        <div className={pageStyles.main}>
            {/* Hero Section */}
            <div className={pageStyles.hero}>
                <img
                    src={destination.image}
                    alt={destination.name}
                    className={pageStyles.heroImage}
                />
                <div className={pageStyles.heroOverlay} />
                <div className={pageStyles.heroContent}>
                    <button
                        onClick={handleBack}
                        className={pageStyles.backLink}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={16} /> {backLabel}
                    </button>
                    <h1 className={pageStyles.title}>{destination.name}</h1>
                    <p className={pageStyles.shortDesc}>{destination.desc}</p>
                    <div className={pageStyles.metaTags}>
                        <div className={pageStyles.metaTag}>
                            <MapPin size={18} /> {destination.location}
                        </div>
                        <div className={pageStyles.metaTag}>
                            <Star size={18} fill="orange" stroke="none" /> {effectiveRating} ({effectiveTotalReviews} reviews)
                        </div>
                    </div>
                </div>
            </div>

            <div className={pageStyles.container}>

                {/* Main Content */}
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>About {destination.name}</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '3rem' }}>
                        {destination.description}
                    </p>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Highlights</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {destination.highlights && destination.highlights.map((highlight, index) => (
                            <div key={index} className={pageStyles.highlightCard}>
                                <CheckCircle size={20} color="var(--primary)" />
                                <span style={{ fontWeight: '500', color: '#334155' }}>{highlight}</span>
                            </div>
                        ))}
                    </div>

                    {/* Vibe Tags / Review Highlights */}
                    {destination.vibe_tags && destination.vibe_tags.length > 0 && (
                        <div className={pageStyles.vibeSection}>
                            <h3 className={pageStyles.vibeTitle}>
                                <Star size={24} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.2 }} />
                                Traveler Highlights
                            </h3>
                            <div className={pageStyles.vibeGrid}>
                                {destination.vibe_tags.map((vibe, idx) => (
                                    <div key={idx} className={pageStyles.vibeCard}>
                                        <div className={pageStyles.vibeHeader}>
                                            <span className={pageStyles.categoryLabel}>{vibe.category || 'Vibe'}</span>
                                            <span className={`${pageStyles.sentimentBadge} ${vibe.sentiment === 'Positive' ? pageStyles.sentimentPositive :
                                                vibe.sentiment === 'Negative' ? pageStyles.sentimentNegative :
                                                    pageStyles.sentimentNeutral
                                                }`}>
                                                {vibe.sentiment || 'Neutral'}
                                            </span>
                                        </div>
                                        <div className={pageStyles.vibeTag}>{vibe.tag || vibe}</div>
                                        <div className={pageStyles.vibeFooter}>
                                            <span>Mentioned by <strong>{vibe.count || 1}</strong> travelers</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    {/* Only show reviews if we actually have them or if it's the live site. 
                        For preview, we might skip this or show a placeholder. 
                        Let's keep it but handle empty lists gracefully. */}
                    <div className={pageStyles.reviewsSection}>
                        <div className={pageStyles.reviewsHeader} style={{ marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Reviews</h3>
                            </div>
                            {onOpenReviewModal && (
                                <button className={pageStyles.writeReviewBtn} onClick={onOpenReviewModal}>
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {/* Rating Summary - Conditionally render if we have stats */}
                        {starCounts && (
                            <div className={pageStyles.ratingSummary}>
                                <div className={pageStyles.ratingOverview}>
                                    <span className={pageStyles.bigRating}>{effectiveRating}</span>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={18} fill={i < Math.round(Number(effectiveRating)) ? "orange" : "#e2e8f0"} stroke="none" />
                                        ))}
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{effectiveTotalReviews} reviews</span>
                                </div>

                                <div className={pageStyles.ratingBars}>
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className={pageStyles.barRow}>
                                            <span className={pageStyles.barLabel}>{stars} ★</span>
                                            <div className={pageStyles.barTrack}>
                                                <div
                                                    className={pageStyles.barFill}
                                                    style={{ width: `${effectiveTotalReviews > 0 ? ((starCounts[stars] || 0) / effectiveTotalReviews) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className={pageStyles.barCount}>{starCounts[stars] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={pageStyles.reviewGrid}>
                            {reviews.slice(0, 3).map((review, idx) => (
                                <div key={idx} className={pageStyles.reviewCard}>
                                    <div className={pageStyles.reviewerHeader}>
                                        <div className={pageStyles.avatar}>
                                            {(review.name || 'A').charAt(0)}
                                        </div>
                                        <div className={pageStyles.reviewerInfo}>
                                            <h4>{review.name || 'Anonymous'}</h4>
                                            <span className={pageStyles.reviewDate}>{review.date}</span>
                                        </div>
                                    </div>
                                    <div className={pageStyles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "orange" : "#e2e8f0"} stroke="none" />
                                        ))}
                                    </div>
                                    <p className={pageStyles.reviewText}>"{review.text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationContent;
