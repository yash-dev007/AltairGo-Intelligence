import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import BlogsPage from './pages/BlogsPage';
import BlogDetails from './pages/BlogDetails';
import PackagesPage from './pages/PackagesPage';
import PackageDetails from './pages/PackageDetails';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetails from './pages/DestinationDetails';
import BookingPage from './pages/BookingPage';
import TripPlannerPage from './pages/TripPlannerPage';

function App() {
  return (
    <Router>
      <main>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:id" element={<DestinationDetails />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/plan-trip" element={<TripPlannerPage />} />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
}

export default App;
