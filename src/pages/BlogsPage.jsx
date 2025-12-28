import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../components/Blogs/Blogs.module.css'; // Reusing styles

const BlogsPage = () => {
    const [blogsData, setBlogsData] = React.useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/blogs')
            .then(res => res.json())
            .then(data => setBlogsData(data))
            .catch(err => console.error("Failed to fetch blogs:", err));
    }, []);
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className={styles.section} style={{ paddingTop: '8rem' }}>
            <div className={styles.container}>
                <div className={styles.header} style={{ marginBottom: '3rem' }}>
                    <h2 className={styles.heading} style={{ color: '#0f172a', marginBottom: '0.5rem' }}>All Travel Stories</h2>
                    <p className={styles.subheading} style={{ color: '#64748b' }}>Explore our complete collection of travel guides and tips.</p>
                </div>

                <div className={styles.grid}>
                    {blogsData.map((blog) => (
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
        </section>
    );
};

export default BlogsPage;
