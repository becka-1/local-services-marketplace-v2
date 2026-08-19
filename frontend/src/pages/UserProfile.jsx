// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router';
// import './UserProfile.css';

// import {
//   getUserProfile,
//   getUserServices,
// } from "../services/userApi.js";

// import ServiceCard from "../components/ServiceCard.jsx";

// const UserProfile = () => {
//   const { id } = useParams();

//   const [user, setUser] = useState(null);
//   const [services, setServices] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const [userData, servicesData] =
//           await Promise.all([
//             getUserProfile(id),
//             getUserServices(id),
//           ]);

//         setUser(userData);
//         setServices(servicesData);
//       } catch (error) {
//         console.error(error);

//         if (error.response?.status === 404) {
//           setError("User profile not found.");
//         } else {
//           setError("Failed to load profile.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, [id]);

//   if (loading) {
//     return <p>Loading profile...</p>;
//   }

//   if (error) {
//     return (
//       <main>
//         <p>{error}</p>

//         <Link to="/services">
//           Back to services
//         </Link>
//       </main>
//     );
//   }
//   console.log(services)
//   return (
//     <main>
//       <Link to="/services">
//         ← Back to services
//       </Link>

//       <section className="profile-header">
//         <div className="profile-avatar">
//           {user.name?.charAt(0).toUpperCase()}
//         </div>

//         <div className="profile-info">
//           <h1>{user.name}</h1>

//           {user.bio && (
//             <p className="profile-bio">
//               {user.bio}
//             </p>
//           )}

//           {user.location && (
//             <p>
//               Location: {user.location}
//             </p>
//           )}
//         </div>
//       </section>

//       <section className="profile-contact">
//         <h2>Contact</h2>

//         <p>
//           <strong>Phone:</strong>{" "}
//           {user.phone}
//         </p>

//         {user.email && (
//           <p>
//             <strong>Email:</strong>{" "}
//             {user.email}
//           </p>
//         )}
//       </section>

//       {user.social_links?.length > 0 && (
//         <section className="profile-socials">
//           <h2>Social links</h2>

//           <div className="social-links">
//             {user.social_links.map((social) => (
//               <a
//                 key={social.platform}
//                 href={social.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 {social.platform}
//               </a>
//             ))}
//           </div>
//         </section>
//       )}

//       <section className="profile-services">
//         <h2>
//           Services by {user.name}
//         </h2>

//         {services.length === 0 ? (
//           <p>
//             This user hasn't posted any services yet.
//           </p>
//         ) : (
//           <div className="services-grid">
//             {services.map((service) => (
//               <ServiceCard
//                 key={service.id}
//                 service={{
//                   ...service,
//                   provider_name: user.name,
//                 }}
//               />
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// };

// export default UserProfile;

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useUser } from "../context/UserContext.jsx";

import {
  getProfile,
} from "../services/profileApi.js";

import {
  getUserServices,
} from "../services/userApi.js";

import {
  deleteService,
} from "../services/serviceApi.js";

import ProfileAvatar from "../components/ProfileAvatar.jsx";
import ServiceCard from "../components/ServiceCard.jsx";

const UserProfile = () => {
  const { id } = useParams();
  const { currentUserId } = useUser();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = Number(id) === Number(currentUserId);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, serviceData] = await Promise.all([
          getProfile(id),
          getUserServices(id),
        ]);

        setProfile(profileData);
        setServices(serviceData);
      } catch (error) {
        console.error(error);
        setError(
          error.response?.data?.message || "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(serviceId, profile.user_id);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  const handleServiceUpdated = (updatedService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? { ...s, ...updatedService } : s))
    );
  };

  if (loading) {
    return (
      <main className="user-profile-page">
        <p className="loading-state">Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="user-profile-page">
        <p className="error-state">{error}</p>
        <Link to="/services" className="back-link">
          ← Back to services
        </Link>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="user-profile-page">
        <p>Profile not found.</p>
        <Link to="/services">← Back to services</Link>
      </main>
    );
  }

  return (
    <main className="user-profile-page">
      {/* Top Action & Navigation Bar */}
      <div className="profile-top-nav">
        <div className="nav-left-group">
          <Link to="/services" className="back-link">
            ← Back to services
          </Link>
          {/* <span className={`profile-badge ${isOwnProfile ? "badge-own" : "badge-public"}`}>
            {isOwnProfile ? "🌟 Your Profile" : "👤 Provider Profile"}
          </span> */}
        </div>

        {isOwnProfile && (
          <div className="profile-actions">
            <Link
              to="/services/new"
              className="profile-btn btn-new-service"
            >
              ➕ Post Service
            </Link>
            <Link
              to={`/users/${profile.user_id}/requests`}
              className="profile-btn btn-requests"
            >
              📋 Service Requests
            </Link>
            <Link
              to={`/users/${profile.user_id}/edit`}
              className="profile-btn btn-edit"
            >
              ✏️ Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Main Profile Info Section */}
      <section className="profile-header">
        <ProfileAvatar
          userId={profile.user_id}
          name={profile.name}
          hasProfilePicture={profile.has_profile_picture}
          size="large"
        />

        <div className="profile-info">
          <h1>{profile.name}</h1>

          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          <div className="profile-meta-details">
            {profile.location && (
              <p className="meta-item">
                📍 <strong>Location:</strong> {profile.location}
              </p>
            )}

            {profile.phone && (
              <p className="meta-item">
                📞 <strong>Phone:</strong> {profile.phone}
              </p>
            )}

            {profile.email && (
              <p className="meta-item">
                ✉ <strong>Email:</strong> {profile.email}
              </p>
            )}

            {profile.website && (
              <p className="meta-item">
                🌐 <strong>Website:</strong>{" "}
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Social Links */}
      {profile.social_links?.length > 0 && (
        <section className="profile-socials">
          <h2>Social Links</h2>
          <div className="social-links-grid">
            {profile.social_links.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="social-badge"
              >
                🔗 {social.platform}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="profile-services">
        <div className="services-header-row">
          <h2>
            {isOwnProfile
              ? `My Services (${services.length})`
              : `Services by ${profile.name} (${services.length})`}
          </h2>
          {isOwnProfile && (
            <Link to="/services/new" className="link-add-service">
              + Post New Service
            </Link>
          )}
        </div>

        {services.length === 0 ? (
          <div className="empty-services-card">
            <p>
              {isOwnProfile
                ? "You haven't posted any services yet."
                : "This user hasn't posted any services yet."}
            </p>
            {isOwnProfile && (
              <Link to="/services/new" className="btn-create-first">
                + Post Your First Service
              </Link>
            )}
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isOwner={isOwnProfile}
                onDelete={handleDeleteService}
                onUpdate={handleServiceUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserProfile;