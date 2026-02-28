import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, MapPin, FileText, Users, LogOut, Package,
    Pencil, Trash2, ChevronLeft, ChevronRight, Globe, Map, Plane, BookOpen, X, Eye, Inbox, CheckCircle2, XCircle, TrendingUp, DollarSign
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import BlogContent from '../../components/Blogs/BlogContent';
import PackageContent from '../../components/Packages/PackageContent';
import DestinationContent from '../../components/Destinations/DestinationContent';
import s from './Admin.module.css';

/* ── SVG Area Chart Component ── */
const VisitorChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const W = 800, H = 160, PAD = 30;
    const max = Math.max(...data.map(d => d.visitors), 1);
    const stepX = (W - PAD) / (data.length - 1);

    const points = data.map((d, i) => ({
        x: PAD + i * stepX,
        y: H - PAD - ((d.visitors / max) * (H - PAD * 2))
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${H - PAD} L${PAD},${H - PAD} Z`;

    // Show every 3rd label
    const labels = data.filter((_, i) => i % 3 === 0);
    const labelPositions = labels.map((d) => ({
        x: PAD + (data.indexOf(d)) * stepX,
        label: d.time
    }));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pct => (
                <line key={pct} x1={PAD} y1={H - PAD - pct * (H - PAD * 2)} x2={W} y2={H - PAD - pct * (H - PAD * 2)}
                    stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
            ))}
            {/* Area fill */}
            <path d={areaPath} fill="url(#chartFill)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* End dot */}
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#38bdf8" />
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="8" fill="#38bdf8" opacity="0.2" />
            {/* Time labels */}
            {labelPositions.map((lp, i) => (
                <text key={i} x={lp.x} y={H - 6} fill="#475569" fontSize="10" textAnchor="middle" fontFamily="inherit">{lp.label}</text>
            ))}
        </svg>
    );
};

/* ── Main Dashboard ── */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('adminToken');

    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [visitors, setVisitors] = useState(null);

    // Destinations state
    const [destinations, setDestinations] = useState([]);
    const [destTotal, setDestTotal] = useState(0);
    const [destPage, setDestPage] = useState(1);
    const [destPages, setDestPages] = useState(1);
    const [destSearch, setDestSearch] = useState('');

    // Blogs, Packages, Users, Trips, Requests, Affiliates
    const [blogs, setBlogs] = useState([]);
    const [packages, setPackages] = useState([]);
    const [users, setUsers] = useState([]);
    const [destRequests, setDestRequests] = useState([]);
    const [affiliateStats, setAffiliateStats] = useState(null);

    // Pagination State (Client-Side)
    const ITEMS_PER_PAGE = 10;
    const [blogPage, setBlogPage] = useState(1);
    const [pkgPage, setPkgPage] = useState(1);
    const [userPage, setUserPage] = useState(1);

    // Edit modals
    const [editDest, setEditDest] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editBlog, setEditBlog] = useState(null);
    const [blogForm, setBlogForm] = useState({});
    const [editPkg, setEditPkg] = useState(null);
    const [pkgForm, setPkgForm] = useState({});

    // Preview state
    const [previewBlog, setPreviewBlog] = useState(null);
    const [previewPkg, setPreviewPkg] = useState(null);
    const [previewDest, setPreviewDest] = useState(null);

    // Redirect if not authenticated
    useEffect(() => { if (!token) navigate('/admin/login'); }, [token, navigate]);

    const getHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }), [token]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: getHeaders() });
            if (res.status === 401) { sessionStorage.removeItem('adminToken'); navigate('/admin/login'); return; }
            setStats(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders, navigate]);

    const fetchVisitors = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/visitors`, { headers: getHeaders() });
            if (res.ok) setVisitors(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    const fetchDestinations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/destinations?page=${destPage}&search=${destSearch}`, { headers: getHeaders() });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setDestinations(data.items || []);
            setDestTotal(data.total || 0);
            setDestPages(data.pages || 1);
        } catch (e) { console.error(e); }
    }, [token, destPage, destSearch, getHeaders]);

    const fetchBlogs = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/blogs`, { headers: getHeaders() });
            if (res.ok) setBlogs(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    const fetchPackages = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/packages`, { headers: getHeaders() });
            if (res.ok) setPackages(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: getHeaders() });
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    const fetchDestRequests = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/destination-requests`, { headers: getHeaders() });
            if (res.ok) setDestRequests(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    const fetchAffiliateStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/affiliate-stats`, { headers: getHeaders() });
            if (res.ok) setAffiliateStats(await res.json());
        } catch (e) { console.error(e); }
    }, [token, getHeaders]);

    useEffect(() => { fetchStats(); fetchVisitors(); }, [fetchStats, fetchVisitors]);

    // Auto-refresh visitors every 30 seconds
    useEffect(() => {
        if (tab !== 'overview') return;
        const interval = setInterval(fetchVisitors, 30000);
        return () => clearInterval(interval);
    }, [tab, fetchVisitors]);

    useEffect(() => {
        if (tab === 'destinations') fetchDestinations();
        if (tab === 'blogs') { fetchBlogs(); fetchPackages(); }
        if (tab === 'users') { fetchUsers(); }
        if (tab === 'requests') fetchDestRequests();
        if (tab === 'affiliates') fetchAffiliateStats();
    }, [tab, fetchDestinations, fetchBlogs, fetchPackages, fetchUsers, fetchDestRequests, fetchAffiliateStats]);

    // ── Destination CRUD ──
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this destination permanently?')) return;
        try { await fetch(`${API_BASE_URL}/api/admin/destinations/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchDestinations(); fetchStats(); } catch (e) { console.error(e); }
    };

    const openEditDest = (dest) => {
        setEditDest(dest);
        setEditForm({ name: dest.name || '', desc: dest.desc || '', description: dest.description || '', location: dest.location || '', rating: dest.rating || 0, tag: dest.tag || '', image: dest.image || '' });
    };

    const saveDest = async () => {
        try { await fetch(`${API_BASE_URL}/api/admin/destinations/${editDest.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(editForm) }); setEditDest(null); fetchDestinations(); } catch (e) { console.error(e); }
    };

    // ── Blog CRUD ──
    const openEditBlog = (blog) => {
        setEditBlog(blog);
        setBlogForm({ title: blog.title || '', category: blog.category || '', date: blog.date || '', excerpt: blog.excerpt || '', image: blog.image || '', readTime: blog.readTime || '', content: blog.content || '' });
    };

    const saveBlog = async () => {
        try { await fetch(`${API_BASE_URL}/api/admin/blogs/${editBlog.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(blogForm) }); setEditBlog(null); fetchBlogs(); } catch (e) { console.error(e); }
    };

    const handlePreview = () => {
        setPreviewBlog({ ...editBlog, ...blogForm });
    };

    const handlePkgPreview = () => {
        setPreviewPkg({ ...editPkg, ...pkgForm });
    };

    const handleDestPreview = () => {
        setPreviewDest({ ...editDest, ...editForm });
    };

    // ── Package CRUD ──
    const openEditPkg = (pkg) => {
        setEditPkg(pkg);
        setPkgForm({ title: pkg.title || '', description: pkg.description || '', price: pkg.price || '', duration: pkg.duration || '', difficulty: pkg.difficulty || '', image: pkg.image || '' });
    };

    const savePkg = async () => {
        try { await fetch(`${API_BASE_URL}/api/admin/packages/${editPkg.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(pkgForm) }); setEditPkg(null); fetchPackages(); } catch (e) { console.error(e); }
    };

    const handleLogout = () => { sessionStorage.removeItem('adminToken'); navigate('/admin/login'); };

    const handleApproveRequest = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/admin/destination-requests/${id}/approve`, { method: 'POST', headers: getHeaders() });
            fetchDestRequests();
            fetchStats();
        } catch (e) { console.error(e); }
    };

    const handleRejectRequest = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/admin/destination-requests/${id}/reject`, { method: 'POST', headers: getHeaders() });
            fetchDestRequests();
        } catch (e) { console.error(e); }
    };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'destinations', icon: MapPin, label: 'Destinations' },
        { id: 'blogs', icon: FileText, label: 'Content' },
        { id: 'users', icon: Users, label: 'Users & Trips' },
        { id: 'requests', icon: Inbox, label: 'Requests', badge: destRequests.length },
        { id: 'affiliates', icon: TrendingUp, label: 'Affiliates & Revenue' },
    ];

    const statCards = stats ? [
        { label: 'Destinations', value: stats.destinations, icon: MapPin, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
        { label: 'Regions', value: stats.regions, icon: Map, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
        { label: 'Countries', value: stats.countries, icon: Globe, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
        { label: 'Users', value: stats.users, icon: Users, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
        { label: 'Trips', value: stats.trips, icon: Plane, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
        { label: 'Blogs', value: stats.blogs, icon: BookOpen, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
        { label: 'Packages', value: stats.packages, icon: Package, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
    ] : [];

    if (!token) return null;

    /* ── Helper: Client-Side Pagination ── */
    const getPaginatedData = (data, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    };

    /* ── Helper: Pagination Controls ── */
    const PaginationControls = ({ page, total, setPage }) => {
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        return (
            <div className={s.pagination}>
                <span>Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        );
    };

    /* ── Reusable edit modal renderer ── */
    const renderModal = (title, fields, form, setForm, onSave, onClose, extraButtons = null) => (
        <div className={s.modalOverlay} onClick={onClose}>
            <div className={s.modal} onClick={e => e.stopPropagation()}>
                <h3 className={s.modalTitle}>{title}</h3>
                {fields.map(f => (
                    <div className={s.formGroup} key={f.key}>
                        <label className={s.formLabel}>{f.label}</label>
                        {f.type === 'textarea' ? (
                            <textarea className={s.formTextarea} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                        ) : (
                            <input type={f.type || 'text'} className={s.formInput} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                        )}
                    </div>
                ))}
                <div className={s.modalActions}>
                    {extraButtons && <div style={{ marginRight: 'auto' }}>{extraButtons}</div>}
                    <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={s.saveBtn} onClick={onSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );

    const renderPreviewModal = () => {
        const closePreview = () => {
            setPreviewBlog(null);
            setPreviewPkg(null);
            setPreviewDest(null);
        };

        let content = null;
        let title = "Preview";

        if (previewBlog) {
            content = <BlogContent blog={previewBlog} />;
            title = "Blog Preview";
        } else if (previewPkg) {
            content = <PackageContent pkg={previewPkg} />;
            title = "Package Preview";
        } else if (previewDest) {
            // For destination preview, map the form fields to what DestinationContent expects
            // The form has 'desc' (short) and 'description' (long). 
            // DestinationContent expects 'description' for the long text.
            content = (
                <DestinationContent
                    destination={previewDest}
                    // Pass dummy reviews for preview or empty
                    reviews={[]}
                    totalReviews={0}
                    averageRating={previewDest.rating || 0}
                />
            );
            title = "Destination Preview";
        }

        if (!content) return null;

        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={closePreview}>
                <div style={{ background: '#0f172a', width: '100%', maxWidth: '1000px', height: '100%', borderRadius: '1rem', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617' }}>
                        <h3 style={{ margin: 0, color: '#f8fafc' }}>{title}</h3>
                        <button onClick={closePreview} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Close Preview <X size={20} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#fff' }}> {/* White background for preview content correctness */}
                        {/* Wrap in a container to isolate styles if needed */}
                        <div className="preview-container">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={s.dashboard}>
            {/* Sidebar */}
            <aside className={s.sidebar}>
                <div className={s.sidebarLogo}>ALTAIRGO <span>INTELLIGENCE</span></div>
                <nav className={s.sidebarNav}>
                    {navItems.map(item => (
                        <button key={item.id} className={`${s.navItem} ${tab === item.id ? s.navItemActive : ''}`} onClick={() => setTab(item.id)} style={{ position: 'relative' }}>
                            <item.icon size={18} /> {item.label}
                            {item.badge > 0 && (
                                <span style={{ marginLeft: 'auto', background: '#f43f5e', color: '#fff', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', lineHeight: '1.6' }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
                <button className={`${s.navItem} ${s.navItemLogout}`} onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            <div className={s.mainContent}>

                {/* ═══════════ OVERVIEW ═══════════ */}
                {tab === 'overview' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Dashboard Overview</h1>
                            <p>Real-time analytics for AltairLabs platform</p>
                        </div>

                        <div className={s.statsGrid}>
                            {statCards.map(card => (
                                <div key={card.label} className={s.statCard}>
                                    <div className={s.statIcon} style={{ background: card.bg }}>
                                        <card.icon size={22} color={card.color} />
                                    </div>
                                    <div>
                                        <div className={s.statValue}>{card.value}</div>
                                        <div className={s.statLabel}>{card.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visitors Chart */}
                        <div className={s.chartContainer}>
                            <div className={s.chartHeader}>
                                <span className={s.chartTitle}>Visitors — Last 24 Hours</span>
                                <span className={s.liveLabel}>
                                    <span className={s.liveDot} />
                                    {visitors ? `${visitors.current} online now` : 'Loading...'}
                                </span>
                            </div>
                            {visitors && <VisitorChart data={visitors.hourly} />}
                            {visitors && (
                                <div className={s.visitorStatsRow}>
                                    <div className={s.visitorStat}>
                                        <div className={s.visitorStatValue}>{visitors.current}</div>
                                        <div className={s.visitorStatLabel}>Live Now</div>
                                    </div>
                                    <div className={s.visitorStat}>
                                        <div className={s.visitorStatValue}>{visitors.totalToday?.toLocaleString()}</div>
                                        <div className={s.visitorStatLabel}>Today Total</div>
                                    </div>
                                    <div className={s.visitorStat}>
                                        <div className={s.visitorStatValue}>{visitors.hourly ? Math.max(...visitors.hourly.map(h => h.visitors)) : 0}</div>
                                        <div className={s.visitorStatLabel}>Peak Hour</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ═══════════ DESTINATIONS ═══════════ */}
                {tab === 'destinations' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Destinations</h1>
                            <p>Manage all {destTotal} destinations in the database</p>
                        </div>
                        <div className={s.tableContainer}>
                            <div className={s.tableHeader}>
                                <span className={s.tableTitle}>{destTotal} Destinations</span>
                                <input type="text" className={s.searchBox} placeholder="Search destinations..." value={destSearch} onChange={(e) => { setDestSearch(e.target.value); setDestPage(1); }} />
                            </div>
                            <table className={s.table}>
                                <thead><tr><th>Image</th><th>Name</th><th>Location</th><th>Rating</th><th>Tag</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {destinations.map(d => (
                                        <tr key={d.id}>
                                            <td>{d.image ? <img src={d.image} alt="" className={s.tableImg} /> : '—'}</td>
                                            <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{d.name}</td>
                                            <td>{d.location || '—'}</td>
                                            <td><span className={`${s.badge} ${s.badgeGreen}`}>★ {d.rating || '—'}</span></td>
                                            <td>{d.tag ? <span className={`${s.badge} ${s.badgePurple}`}>{d.tag}</span> : '—'}</td>
                                            <td>
                                                <button className={s.actionBtn} onClick={() => openEditDest(d)}><Pencil size={15} /></button>
                                                <button className={`${s.actionBtn} ${s.actionBtnDanger}`} onClick={() => handleDelete(d.id)}><Trash2 size={15} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {destinations.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No destinations found</td></tr>}
                                </tbody>
                            </table>
                            <div className={s.pagination}>
                                <span>Page {destPage} of {destPages}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className={s.pageBtn} disabled={destPage <= 1} onClick={() => setDestPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                                    <button className={s.pageBtn} disabled={destPage >= destPages} onClick={() => setDestPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════════ CONTENT (BLOGS + PACKAGES) ═══════════ */}
                {tab === 'blogs' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Content Management</h1>
                            <p>Edit blogs and tour packages</p>
                        </div>

                        {/* Blogs Table */}
                        <div className={s.tableContainer} style={{ marginBottom: '2rem' }}>
                            <div className={s.tableHeader}>
                                <span className={s.tableTitle}>{blogs.length} Blog Posts</span>
                            </div>
                            <table className={s.table}>
                                <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Read Time</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {getPaginatedData(blogs, blogPage).map(b => (
                                        <tr key={b.id}>
                                            <td>{b.image ? <img src={b.image} alt="" className={s.tableImg} /> : '—'}</td>
                                            <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{b.title}</td>
                                            <td><span className={`${s.badge} ${s.badgeBlue}`}>{b.category}</span></td>
                                            <td>{b.readTime}</td>
                                            <td>
                                                <button className={s.actionBtn} onClick={() => openEditBlog(b)} title="Edit blog"><Pencil size={15} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <PaginationControls page={blogPage} total={blogs.length} setPage={setBlogPage} />
                        </div>

                        {/* Packages Table */}
                        <div className={s.tableContainer}>
                            <div className={s.tableHeader}>
                                <span className={s.tableTitle}>{packages.length} Tour Packages</span>
                            </div>
                            <table className={s.table}>
                                <thead><tr><th>Image</th><th>Title</th><th>Price</th><th>Duration</th><th>Difficulty</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {getPaginatedData(packages, pkgPage).map(p => (
                                        <tr key={p.id}>
                                            <td>{p.image ? <img src={p.image} alt="" className={s.tableImg} /> : '—'}</td>
                                            <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.title}</td>
                                            <td><span className={`${s.badge} ${s.badgeGreen}`}>{p.price}</span></td>
                                            <td>{p.duration || '—'}</td>
                                            <td>{p.difficulty ? <span className={`${s.badge} ${s.badgePurple}`}>{p.difficulty}</span> : '—'}</td>
                                            <td>
                                                <button className={s.actionBtn} onClick={() => openEditPkg(p)} title="Edit package"><Pencil size={15} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <PaginationControls page={pkgPage} total={packages.length} setPage={setPkgPage} />
                        </div>
                    </>
                )}

                {/* ═══════════ USERS & TRIPS ═══════════ */}
                {tab === 'users' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Users</h1>
                            <p>Registered users overview</p>
                        </div>
                        <div className={s.tableContainer}>
                            <div className={s.tableHeader}><span className={s.tableTitle}>{users.length} Registered Users</span></div>
                            <table className={s.table}>
                                <thead><tr><th>Name</th><th>Email</th><th>Trips</th><th>Joined</th></tr></thead>
                                <tbody>
                                    {getPaginatedData(users, userPage).map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{u.name || 'Unnamed'}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`${s.badge} ${s.badgePurple}`}>{u.tripCount} trips</span></td>
                                            <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users yet</td></tr>}
                                </tbody>
                            </table>
                            <PaginationControls page={userPage} total={users.length} setPage={setUserPage} />
                        </div>
                    </>
                )}

                {/* ═══════════ PENDING REQUESTS ═══════════ */}
                {tab === 'requests' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Pending Requests</h1>
                            <p>User-submitted destination suggestions awaiting review</p>
                        </div>
                        <div className={s.tableContainer}>
                            <div className={s.tableHeader}>
                                <span className={s.tableTitle}>{destRequests.length} Pending</span>
                            </div>
                            <table className={s.table}>
                                <thead><tr><th>Name</th><th>Description</th><th>Tag</th><th>Est. Cost</th><th>Submitted</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {destRequests.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.name}</td>
                                            <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }}>{r.description || '—'}</td>
                                            <td>{r.tag ? <span className={`${s.badge} ${s.badgePurple}`}>{r.tag}</span> : '—'}</td>
                                            <td>{r.cost ? <span className={`${s.badge} ${s.badgeGreen}`}>₹{r.cost.toLocaleString()}</span> : 'N/A'}</td>
                                            <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                                            <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className={s.actionBtn}
                                                    onClick={() => handleApproveRequest(r.id)}
                                                    title="Approve"
                                                    style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    className={`${s.actionBtn} ${s.actionBtnDanger}`}
                                                    onClick={() => handleRejectRequest(r.id)}
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {destRequests.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No pending requests 🎉</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ═══════════ AFFILIATES ═══════════ */}
                {tab === 'affiliates' && (
                    <>
                        <div className={s.pageHeader}>
                            <h1>Affiliate Tracking & Revenue</h1>
                            <p>Monitor your booking link performance and estimated commissions</p>
                        </div>

                        {affiliateStats ? (
                            <>
                                <div className={s.statsGrid}>
                                    <div className={s.statCard}>
                                        <div className={s.statIcon} style={{ background: 'rgba(52,211,153,0.1)' }}>
                                            <TrendingUp size={22} color="#34d399" />
                                        </div>
                                        <div>
                                            <div className={s.statValue}>{affiliateStats.total_clicks}</div>
                                            <div className={s.statLabel}>Total Clicks Tracked</div>
                                        </div>
                                    </div>

                                    <div className={s.statCard} style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(20,83,45,0.05) 100%)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                        <div className={s.statIcon} style={{ background: '#dcfce7' }}>
                                            <DollarSign size={22} color="#166534" />
                                        </div>
                                        <div>
                                            <div className={s.statValue} style={{ color: '#166534' }}>₹{affiliateStats.estimated_revenue.toLocaleString()}</div>
                                            <div className={s.statLabel} style={{ color: '#15803d', fontWeight: 600 }}>Est. AI Revenue Pipeline</div>
                                        </div>
                                    </div>
                                </div>

                                <div className={s.tableContainer} style={{ marginTop: '2rem' }}>
                                    <div className={s.tableHeader}>
                                        <span className={s.tableTitle}>Click Breakdown by Category</span>
                                    </div>
                                    <table className={s.table}>
                                        <thead><tr><th>Service Type</th><th>Total Clicks</th><th>Est. Conversion Rate</th><th>Est. Commission</th></tr></thead>
                                        <tbody>
                                            {Object.entries(affiliateStats.breakdown || {}).map(([type, count]) => (
                                                <tr key={type}>
                                                    <td style={{ fontWeight: 600, color: '#f1f5f9', textTransform: 'capitalize' }}>
                                                        {type === 'flight' ? <Plane size={14} style={{ marginRight: '6px' }} /> : null}
                                                        {type}
                                                    </td>
                                                    <td><span className={`${s.badge} ${s.badgeBlue}`}>{count}</span></td>
                                                    <td>8%</td>
                                                    <td><span className={`${s.badge} ${s.badgeGreen}`}>~{type === 'hotel' ? '5%' : type === 'flight' ? '3%' : '10%'}</span></td>
                                                </tr>
                                            ))}
                                            {Object.keys(affiliateStats.breakdown || {}).length === 0 && (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No clicks tracked yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>Loading affiliate data...</div>
                        )}
                    </>
                )}
            </div>

            {/* ── Edit Modals ── */}
            {editDest && renderModal('Edit Destination', [
                { key: 'name', label: 'Name' }, { key: 'location', label: 'Location' },
                { key: 'desc', label: 'Short Description' }, { key: 'rating', label: 'Rating', type: 'number' },
                { key: 'tag', label: 'Tag' }, { key: 'image', label: 'Image URL' },
                { key: 'description', label: 'Full Description', type: 'textarea' },
            ], editForm, setEditForm, saveDest, () => setEditDest(null), (
                <button className={s.saveBtn} onClick={handleDestPreview} style={{ background: '#22d3ee', color: '#0f172a', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={16} /> Preview
                </button>
            ))}

            {editBlog && renderModal('Edit Blog Post', [
                { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' },
                { key: 'date', label: 'Date' }, { key: 'readTime', label: 'Read Time' },
                { key: 'image', label: 'Image Path' },
                { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
                { key: 'content', label: 'Content (HTML)', type: 'textarea' },
            ], blogForm, setBlogForm, saveBlog, () => setEditBlog(null), (
                <button className={s.saveBtn} onClick={handlePreview} style={{ background: '#22d3ee', color: '#0f172a', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={16} /> Preview
                </button>
            ))}

            {/* Inject Preview Button into the Edit Modal logic is hard with reusable renderModal. 
                Instead, let's just conditionally render the preview button if it's the blog modal.
                Actually, simpler: Just add use effect to inject it or customize renderModal? 
                Let's customize renderModal call for blog to include the extra button in actions.
                Wait, renderModal doesn't support extra buttons. 
                I'll modify renderModal to accept 'extraButtons'.
            */}

            {previewBlog && renderPreviewModal()}
            {previewPkg && renderPreviewModal()}
            {previewDest && renderPreviewModal()}

            {editPkg && renderModal('Edit Package', [
                { key: 'title', label: 'Title' }, { key: 'price', label: 'Price' },
                { key: 'duration', label: 'Duration' }, { key: 'difficulty', label: 'Difficulty' },
                { key: 'image', label: 'Image Path' },
                { key: 'description', label: 'Description', type: 'textarea' },
            ], pkgForm, setPkgForm, savePkg, () => setEditPkg(null), (
                <button className={s.saveBtn} onClick={handlePkgPreview} style={{ background: '#22d3ee', color: '#0f172a', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={16} /> Preview
                </button>
            ))}
        </div>
    );
};

export default AdminDashboard;
