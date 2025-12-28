import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Blogs.module.css';

const Blogs = () => {
    // Show only first 3 blogs for the preview section
    const [previewBlogs, setPreviewBlogs] = React.useState([]);

    React.useEffect(() => {
        fetch('http://127.0.0.1:5000/blogs')
            .then(res => res.json())
            .then(data => setPreviewBlogs(data.slice(0, 3)))
            .catch(err => console.error("Failed to fetch blogs:", err));
    }, []);

    return (
        <section className={styles.section} id="blogs">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.heading}>Latest Travel Stories</h2>
                    <p className={styles.subheading}>Tips, guides, and inspiration for your next adventure.</p>
                </div>

                <div className={styles.grid}>
                    {previewBlogs.map((blog) => (
                        <article key={blog.id} className={styles.card}>
                            <div className={styles.imageContainer}>
                                <img src={blog.image} alt={blog.title} className={styles.image} />
                                <span className={styles.category}>{blog.category}</span>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.meta}>
                                    <span>{blog.date}</span>
                                    <span>•</span>
                                    <span>{blog.readTime}</span>
                                </div>
                                <h3 className={styles.title}>{blog.title}</h3>
                                <p className={styles.excerpt}>{blog.excerpt}</p>
                                <Link to={`/blogs/${blog.id}`} className={styles.readMore}>
                                    Read Article <span>→</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Link to="/blogs" className="btnPrimary">View More Stories</Link>
            </div>
        </section>
    );
};

export default Blogs;
