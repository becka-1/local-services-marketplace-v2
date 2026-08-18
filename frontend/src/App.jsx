import { Routes, Route } from 'react-router';
import Services from './pages/Services.jsx';
import UserProfile from './pages/UserProfile.jsx';
import CreateService from './pages/CreateService.jsx';
import EditService from './pages/EditService.jsx';
import EditProfile from './pages/EditProfile.jsx';
import MyRequests from './pages/MyRequests.jsx';
import RequestDetails from './pages/RequestDetails.jsx';
import EditRequest from './pages/EditRequest.jsx';

function App() {
  return (
    <Routes>
      <Route path="/services" element={<Services />} />
      <Route path="/users/:id" element={<UserProfile />} />
      <Route path="/services/new" element={<CreateService />} />
      <Route path="/services/:id/edit" element={<EditService />} />
      <Route path="/users/:id/edit" element={<EditProfile />} />
      <Route path="/users/:id/requests" element={<MyRequests />} />
      <Route path="/requests/:id" element={<RequestDetails />} />
      <Route path="/requests/:id/edit" element={<EditRequest />} />
    </Routes>
  );
}

export default App;