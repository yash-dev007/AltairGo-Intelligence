import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { DetailPageSkeleton } from '../../components/Skeleton/Skeleton';
import BlogContent from '../../components/Blogs/BlogContent';

// import styles from '../../components/Blogs/Blogs.module.css';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/blogs/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Blog not found");
                return res.json();
            })
            .then(data => {
                setBlog(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch blog:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <DetailPageSkeleton />;
    }

    if (!blog) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Blog post not found</h2>
                <Link to="/blogs" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '4rem' }}>
            <BlogContent blog={blog} />
        </div>
    );
};

export default BlogDetails;
