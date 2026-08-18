import { Routes, Route } from 'react-router';
import Services from './pages/Services.jsx';
import ServiceDetails from './pages/ServiceDetails.jsx';
import UserProfile from './pages/UserProfile.jsx';
import CreateService from './pages/CreateService.jsx';
import EditService from './pages/EditService.jsx';
import EditProfile from './pages/EditProfile.jsx';

function App() {
  return (
    <Routes>
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      <Route path="/users/:id" element={<UserProfile />} />
      <Route path="/services/new" element={<CreateService />} />
      <Route path="/services/:id/edit" element={<EditService />} />
      <Route path="/users/:id/edit" element={<EditProfile />} />
    </Routes>
  );
}

export default App;