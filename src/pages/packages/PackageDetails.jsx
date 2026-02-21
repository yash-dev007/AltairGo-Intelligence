import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { DetailPageSkeleton } from '../../components/Skeleton/Skeleton';
import PackageContent from '../../components/Packages/PackageContent';

const PackageDetails = () => {
    const { id } = useParams();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/packages/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Package not found");
                return res.json();
            })
            .then(data => {
                setPkg(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch package:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <DetailPageSkeleton />;
    }

    if (!pkg) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Package not found</h2>
                <Link to="/packages" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Packages</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '6rem' }}>
            <PackageContent pkg={pkg} />
        </div>
    );
};

export default PackageDetails;
