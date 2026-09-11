import "./Legal.css";

const TermsOfService = () => {
  return (
    <div className="legal-container">
      <h1 className="legal-title">Terms of Service</h1>
      <div className="legal-content">
        <p className="legal-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          These Terms of Service constitute a legally binding agreement made between you and LocalServices concerning your 
          access to and use of the website as well as any other media form related, linked, or otherwise connected thereto. 
          You agree that by accessing the site, you have read, understood, and agreed to be bound by all of these Terms of Service.
        </p>

        <h2>1. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that:
        </p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
          <li>You will not access the site through automated or non-human means, whether through a bot, script or otherwise.</li>
          <li>You will not use the Site for any illegal or unauthorized purpose.</li>
        </ul>

        <h2>2. Services and Provider Responsibilities</h2>
        <p>
          Providers list services on our marketplace. Providers are solely responsible for the quality, accuracy, and legality of the 
          services they provide. LocalServices acts only as a platform to connect providers and customers and does not guarantee the 
          quality or safety of the services offered.
        </p>

        <h2>3. Prohibited Activities</h2>
        <p>
          You may not access or use the Site for any purpose other than that for which we make the Site available. 
          The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>
        
        <h2>4. User Generated Contributions</h2>
        <p>
          The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, 
          and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast 
          content and materials to us or on the Site. Contributions may be viewable by other users of the Site and through third-party websites.
        </p>

        <h2>5. Modifications and Interruptions</h2>
        <p>
          We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. 
          However, we have no obligation to update any information on our Site.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, 
          please contact us via the support channels provided.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
