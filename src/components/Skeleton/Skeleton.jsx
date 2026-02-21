import React from 'react';
import s from './Skeleton.module.css';

/* ── Inline skeleton block ── */
export const Skeleton = ({ width, height, circle, rounded, style }) => (
    <div
        className={`${s.skeleton} ${circle ? s.circle : ''} ${rounded ? s.rounded : ''}`}
        style={{ width: width || '100%', height: height || '16px', ...style }}
    />
);

/* ── Destination carousel card ── */
export const DestinationCardSkeleton = () => (
    <div className={s.destCardSkeleton} />
);

/* ── Destination carousel row (4 cards) ── */
export const DestinationsSkeleton = ({ count = 4 }) => (
    <div style={{ display: 'flex', gap: 'var(--spacing-md, 1.5rem)', overflow: 'hidden' }}>
        {Array.from({ length: count }).map((_, i) => (
            <DestinationCardSkeleton key={i} />
        ))}
    </div>
);

/* ── Package tall card ── */
export const PackageCardSkeleton = () => (
    <div className={s.pkgCardSkeleton} />
);

/* ── Packages grid (3 cards) ── */
export const PackagesSkeleton = ({ count = 3 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md, 1.5rem)' }}>
        {Array.from({ length: count }).map((_, i) => (
            <PackageCardSkeleton key={i} />
        ))}
    </div>
);

/* ── Blog card ── */
export const BlogCardSkeleton = () => (
    <div className={s.blogCardSkeleton}>
        <div className={s.blogImageSkeleton} />
        <div className={s.blogBody}>
            <Skeleton width="40%" height="14px" />
            <Skeleton width="90%" height="20px" />
            <Skeleton width="100%" height="14px" />
            <Skeleton width="75%" height="14px" />
            <Skeleton width="30%" height="14px" style={{ marginTop: '0.5rem' }} />
        </div>
    </div>
);

/* ── Blogs grid (3 cards) ── */
export const BlogsSkeleton = ({ count = 3 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-xl, 2rem)' }}>
        {Array.from({ length: count }).map((_, i) => (
            <BlogCardSkeleton key={i} />
        ))}
    </div>
);

/* ── Feature card ── */
export const FeatureCardSkeleton = () => (
    <div className={s.featureCardSkeleton}>
        <Skeleton width="60px" height="60px" rounded />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton width="60%" height="18px" />
            <Skeleton width="100%" height="14px" />
            <Skeleton width="80%" height="14px" />
        </div>
    </div>
);

/* ── Features section ── */
export const FeaturesSkeleton = () => (
    <div style={{ padding: '2rem 0' }}>
        <div className={s.wrapper}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <Skeleton width="50%" height="28px" style={{ marginBottom: '1rem' }} />
                    <Skeleton width="80%" height="16px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="60%" height="16px" />
                </div>
                <div className={s.featureRow}>
                    <FeatureCardSkeleton />
                    <FeatureCardSkeleton />
                    <FeatureCardSkeleton />
                </div>
            </div>
        </div>
    </div>
);

/* ── Generic list card (Blogs/Packages pages) ── */
export const ListCardSkeleton = () => (
    <div className={s.cardSkeleton}>
        <div className={s.cardImageSkeleton} />
        <div className={s.cardBody}>
            <Skeleton width="80%" height="20px" />
            <Skeleton width="100%" height="14px" />
            <Skeleton width="60%" height="14px" />
        </div>
    </div>
);

/* ── Detail page (blog/package/destination) ── */
export const DetailPageSkeleton = () => (
    <div style={{ paddingTop: '80px' }}>
        <div className={s.detailHeroSkeleton} />
        <div className={s.detailBody}>
            <Skeleton width="60%" height="32px" />
            <Skeleton width="40%" height="16px" />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Skeleton width="100%" height="14px" />
                <Skeleton width="100%" height="14px" />
                <Skeleton width="95%" height="14px" />
                <Skeleton width="85%" height="14px" />
                <Skeleton width="100%" height="14px" />
                <Skeleton width="60%" height="14px" />
            </div>
        </div>
    </div>
);

/* ── Dashboard trip card ── */
export const TripCardSkeleton = () => (
    <div className={s.tripCardSkeleton}>
        <div className={s.tripCardTop} />
        <div className={s.tripCardBody}>
            <Skeleton width="70%" height="20px" />
            <Skeleton width="45%" height="14px" />
            <Skeleton width="30%" height="14px" />
        </div>
    </div>
);

/* ── Dashboard grid (3 trip cards) ── */
export const DashboardSkeleton = ({ count = 3 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Array.from({ length: count }).map((_, i) => (
            <TripCardSkeleton key={i} />
        ))}
    </div>
);
