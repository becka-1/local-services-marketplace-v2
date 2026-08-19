import { Routes, Route } from 'react-router';
import { UserProvider } from './context/UserContext.jsx';
import Navbar from './components/Navbar.jsx';
import Services from './pages/Services.jsx';
import UserProfile from './pages/UserProfile.jsx';
import CreateService from './pages/CreateService.jsx';
import EditProfile from './pages/EditProfile.jsx';
import MyRequests from './pages/MyRequests.jsx';
import RequestDetails from './pages/RequestDetails.jsx';
import EditRequest from './pages/EditRequest.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <UserProvider>
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Services />} />
            <Route path="/services" element={<Services />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/services/new" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
            <Route path="/users/:id/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/users/:id/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/requests/:id" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
            <Route path="/requests/:id/edit" element={<ProtectedRoute><EditRequest /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;