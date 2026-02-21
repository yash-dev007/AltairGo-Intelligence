import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import BlogsPage from './pages/blogs/BlogsPage';
import BlogDetails from './pages/blogs/BlogDetails';
import PackagesPage from './pages/packages/PackagesPage';
import PackageDetails from './pages/packages/PackageDetails';
import DestinationsPage from './pages/destinations/DestinationsPage';
import DestinationDetails from './pages/destinations/DestinationDetails';
import DestinationDetailsPage from './pages/destinations/DestinationDetailsPage';
import BookingPage from './pages/booking/BookingPage';
import TripPlannerPage from './pages/trips/TripPlannerPage';
import TripViewerPage from './pages/trips/TripViewerPage';
import { AuthProvider } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/trips/DashboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const shouldHideLayout = isAdmin || isAuthPage;

  return (
    <main>
      {!shouldHideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:id" element={<BlogDetails />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:id" element={<PackageDetails />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
        <Route path="/destination/:id" element={<DestinationDetailsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/plan-trip" element={<TripPlannerPage />} />
        <Route path="/trip/:tripId" element={<TripViewerPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {!shouldHideLayout && <Footer />}
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
