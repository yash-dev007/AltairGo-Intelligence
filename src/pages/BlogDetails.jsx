import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../components/Blogs/Blogs.module.css';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/blogs/${id}`)
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

    if (!blog) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Blog post not found</h2>
                <Link to="/blogs" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '6rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/blogs" style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to all stories
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span style={{ background: 'var(--accent-light)', color: 'var(--accent-hover)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        {blog.category}
                    </span>
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '1.5rem' }}>
                    {blog.title}
                </h1>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '400px', marginBottom: '3rem' }}>
                <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <article style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--primary-light)' }}
                dangerouslySetInnerHTML={{ __html: blog.content }}>
            </article>

            {/* Simple inline styles for article content spacing for now */}
            <style>{`
                article p { margin-bottom: 1.5rem; }
                article h3 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 2.5rem; margin-bottom: 1rem; }
                article ul, article ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                article li { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
};

export default BlogDetails;
