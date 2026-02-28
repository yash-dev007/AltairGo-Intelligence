import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { DetailPageSkeleton } from '../../components/Skeleton/Skeleton';

import styles from './DestinationDetails.module.css';
import DestinationContent from '../../components/Destinations/DestinationContent';

const DestinationDetails = () => {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    // ... existing state ...

    // Review State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
    const [hoverRating, setHoverRating] = useState(0);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations/${id}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(`Status ${res.status}: ${text}`);
                    });
                }
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
                setError(err.message);
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

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!newReview.name || !newReview.text) return;

        const reviewToAdd = {
            ...newReview,
            date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };

        // Send to backend
        fetch(`${API_BASE_URL}/destinations/${id}/reviews`, {
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

    if (loading) {
        return <DetailPageSkeleton />;
    }

    if (error) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center', color: 'red' }}>
                <h2>Fetch Error</h2>
                <p>{error}</p>
                <Link to="/destinations" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Destinations</Link>
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
            <DestinationContent
                destination={destination}
                reviews={reviews}
                averageRating={averageRating}
                totalReviews={totalReviews}
                starCounts={starCounts}
                onOpenReviewModal={() => setIsModalOpen(true)}
            />

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
