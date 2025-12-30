import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Calendar, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';

import styles from './DestinationDetails.module.css';

const DestinationDetails = () => {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review State
    // Review State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [visibleReviews, setVisibleReviews] = useState(3);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/destinations/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Destination not found");
                return res.json();
            })
            .then(data => {
                setDestination(data);
                // Initialize reviews from backend if available, else empty
                if (data.reviews_data) {
                    setReviews(data.reviews_data);
                } else {
                    setReviews([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch destination:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Calculate Stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0; // Show 0 if no actual reviews

    // Count stats per star
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        const rRating = Math.round(r.rating);
        if (starCounts[rRating] !== undefined) starCounts[rRating]++;
    });

    // Sorting Logic
    const getSortedReviews = () => {
        // Create copy to sort
        const sorted = [...reviews];
        if (sortBy === 'newest') {
            // Assuming current mock data doesn't have timestamps we can easily sort by,
            // we will just assume the array order for now (mock). 
            // In a real app, we'd parse r.date.
            return sorted;
        } else if (sortBy === 'highest') {
            return sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'lowest') {
            return sorted.sort((a, b) => a.rating - b.rating);
        }
        return sorted;
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!newReview.name || !newReview.text) return;

        const reviewToAdd = {
            ...newReview,
            date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };

        // Send to backend
        fetch(`http://127.0.0.1:5000/destinations/${id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewToAdd),
        })
            .then(res => res.json())
            .then(() => {
                // Optimistically update UI
                setReviews([reviewToAdd, ...reviews]);
                setNewReview({ name: '', rating: 5, text: '' });
                setHoverRating(0);
                setIsModalOpen(false);
            })
            .catch(err => {
                console.error("Failed to submit review:", err);
                alert("Failed to submit review. Please try again.");
            });
    };

    const handleLoadMore = () => {
        setVisibleReviews(prev => prev + 3);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!destination) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Destination not found</h2>
                <Link to="/destinations" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Destinations</Link>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <img
                    src={destination.image}
                    alt={destination.name}
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <Link to="/destinations" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to all destinations
                    </Link>
                    <h1 className={styles.title}>{destination.name}</h1>
                    <p className={styles.shortDesc}>{destination.desc}</p>
                    <div className={styles.metaTags}>
                        <div className={styles.metaTag}>
                            <MapPin size={18} /> {destination.location}
                        </div>
                        <div className={styles.metaTag}>
                            <Star size={18} fill="orange" stroke="none" /> {averageRating} ({totalReviews} reviews)
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.container}>

                {/* Main Content */}
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>About {destination.name}</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '3rem' }}>
                        {destination.description}
                    </p>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Highlights</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {destination.highlights && destination.highlights.map((highlight, index) => (
                            <div key={index} className={styles.highlightCard}>
                                <CheckCircle size={20} color="var(--primary)" />
                                <span style={{ fontWeight: '500', color: '#334155' }}>{highlight}</span>
                            </div>
                        ))}
                    </div>

                    {/* SUGGESTED ITINERARY REMOVED AS REQUESTED */}

                    {/* Vibe Tags / Review Highlights */}
                    {destination.vibe_tags && destination.vibe_tags.length > 0 && (
                        <div className={styles.vibeSection}>
                            <h3 className={styles.vibeTitle}>
                                <Star size={24} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.2 }} />
                                Traveler Highlights
                            </h3>
                            <div className={styles.vibeGrid}>
                                {destination.vibe_tags.map((vibe, idx) => (
                                    <div key={idx} className={styles.vibeCard}>
                                        <div className={styles.vibeHeader}>
                                            <span className={styles.categoryLabel}>{vibe.category}</span>
                                            <span className={`${styles.sentimentBadge} ${vibe.sentiment === 'Positive' ? styles.sentimentPositive :
                                                vibe.sentiment === 'Negative' ? styles.sentimentNegative :
                                                    styles.sentimentNeutral
                                                }`}>
                                                {vibe.sentiment}
                                            </span>
                                        </div>
                                        <div className={styles.vibeTag}>{vibe.tag}</div>
                                        <div className={styles.vibeFooter}>
                                            <span>Mentioned by <strong>{vibe.count}</strong> travelers</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className={styles.reviewsSection}>
                        <div className={styles.reviewsHeader} style={{ marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Reviews</h3>
                            </div>
                            <button className={styles.writeReviewBtn} onClick={() => setIsModalOpen(true)}>
                                Write a Review
                            </button>
                        </div>

                        {/* Rating Summary */}
                        <div className={styles.ratingSummary}>
                            <div className={styles.ratingOverview}>
                                <span className={styles.bigRating}>{averageRating}</span>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "orange" : "#e2e8f0"} stroke="none" />
                                    ))}
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{totalReviews} reviews</span>
                            </div>

                            <div className={styles.ratingBars}>
                                {[5, 4, 3, 2, 1].map(stars => (
                                    <div key={stars} className={styles.barRow}>
                                        <span className={styles.barLabel}>{stars} ★</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${totalReviews > 0 ? (starCounts[stars] / totalReviews) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className={styles.barCount}>{starCounts[stars]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.controls}>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>

                        <div className={styles.reviewGrid}>
                            {getSortedReviews().slice(0, visibleReviews).map((review, idx) => (
                                <div key={idx} className={styles.reviewCard}>
                                    <div className={styles.reviewerHeader}>
                                        <div className={styles.avatar}>
                                            {review.name.charAt(0)}
                                        </div>
                                        <div className={styles.reviewerInfo}>
                                            <h4>{review.name}</h4>
                                            <span className={styles.reviewDate}>{review.date}</span>
                                        </div>
                                    </div>
                                    <div className={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "orange" : "#e2e8f0"} stroke="none" />
                                        ))}
                                    </div>
                                    <p className={styles.reviewText}>"{review.text}"</p>
                                </div>
                            ))}
                        </div>

                        {visibleReviews < reviews.length && (
                            <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                                View More Reviews
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
                        <h3 className={styles.modalTitle}>Write a Review</h3>
                        <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Your Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. John Doe"
                                    value={newReview.name}
                                    onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Rating</label>
                                <div
                                    className={styles.starRatingContainer}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={styles.starBtn}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            onMouseEnter={() => setHoverRating(star)}
                                        >
                                            <Star
                                                size={32}
                                                fill={star <= (hoverRating || newReview.rating) ? "orange" : "#e2e8f0"}
                                                stroke="none"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Your Review</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Share your experience..."
                                    value={newReview.text}
                                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn}>Submit Review</button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default DestinationDetails;
