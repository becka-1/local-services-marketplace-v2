import { Routes, Route } from 'react-router';
import { UserProvider } from './context/UserContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import UserProfile from './pages/UserProfile.jsx';
import CreateService from './pages/CreateService.jsx';
import MyRequests from './pages/MyRequests.jsx';
import RequestDetails from './pages/RequestDetails.jsx';
import EditRequest from './pages/EditRequest.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <UserProvider>
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/services/new" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
            <Route path="/users/:id/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/requests/:id" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
            <Route path="/requests/:id/edit" element={<ProtectedRoute><EditRequest /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;