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

// Company Pages
import AboutUsPage from './pages/company/AboutUsPage';
import CareersPage from './pages/company/CareersPage';
import PressPage from './pages/company/PressPage';
import PartnersPage from './pages/company/PartnersPage';

// Support Pages
import HelpCenterPage from './pages/support/HelpCenterPage';
import SafetyPage from './pages/support/SafetyPage';
import CancellationPolicyPage from './pages/support/CancellationPolicyPage';

// Legal Pages
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';

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

        {/* Company Routes */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/partners" element={<PartnersPage />} />

        {/* Support Routes */}
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/cancellation" element={<CancellationPolicyPage />} />

        {/* Legal Routes */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
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
