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

import {
  getProfile,
} from "../services/profileApi.js";

import {
  getUserServices,
} from "../services/userApi.js";

import ProfileAvatar from "../components/ProfileAvatar.jsx";

import ServiceCard from "../components/ServiceCard.jsx";

const UserProfile = () => {
  const { id } = useParams();

  const [profile, setProfile] =
    useState(null);

  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [
          profileData,
          serviceData,
        ] = await Promise.all([
          getProfile(id),
          getUserServices(id),
        ]);

        setProfile(profileData);
        setServices(serviceData);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <main className="user-profile-page">
      <section className="profile-header">
        <Link
          to={`/users/${profile.user_id}/edit`}
        >
          Edit Profile
        </Link>
        <ProfileAvatar
          userId={profile.user_id}
          name={profile.name}
          hasProfilePicture={
            profile.has_profile_picture
          }
          size="large"
        />

        <div className="profile-info">
          <h1>{profile.name}</h1>

          {profile.bio && (
            <p>{profile.bio}</p>
          )}

          {profile.location && (
            <p>
              📍 {profile.location}
            </p>
          )}

          {profile.phone && (
            <p>
              📞 {profile.phone}
            </p>
          )}

          {profile.email && (
            <p>
              ✉ {profile.email}
            </p>
          )}

          {profile.website && (
            <p>
              🌐{" "}
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
      </section>

      {profile.social_links?.length > 0 && (
        <section className="profile-socials">
          <h2>Social Links</h2>

          <div>
            {profile.social_links.map(
              (social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.platform}
                </a>
              )
            )}
          </div>
        </section>
      )}

      <section className="profile-services">
        <h2>Services</h2>

        {services.length === 0 ? (
          <p>
            This user hasn't posted any
            services yet.
          </p>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserProfile;