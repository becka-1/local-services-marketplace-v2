import "./Legal.css";

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <h1 className="legal-title">Privacy Policy</h1>
      <div className="legal-content">
        <p className="legal-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          Welcome to LocalServices ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. 
          If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, 
          please contact us.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining 
          information about us or our products and services, or otherwise contact us. The personal information we collect may include the following:
        </p>
        <ul>
          <li>Names</li>
          <li>Phone numbers</li>
          <li>Email addresses</li>
          <li>Mailing addresses</li>
          <li>Passwords</li>
          <li>Profile pictures</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use personal information collected via our website for a variety of business purposes described below:
        </p>
        <ul>
          <li>To facilitate account creation and logon process.</li>
          <li>To post testimonials with your consent.</li>
          <li>To request feedback and contact you about your use of our website.</li>
          <li>To manage user accounts and enable user-to-user communications.</li>
          <li>To send administrative information to you.</li>
          <li>To protect our services (e.g., fraud monitoring and prevention).</li>
        </ul>

        <h2>3. Will Your Information Be Shared With Anyone?</h2>
        <p>
          We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          When you interact with other users of the Website, those users may see your name, profile photo, and descriptions of your activity.
        </p>

        <h2>4. How Long Do We Keep Your Information?</h2>
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, 
          unless a longer retention period is required or permitted by law.
        </p>

        <h2>5. Your Privacy Rights</h2>
        <p>
          You may review, change, or terminate your account at any time. If you have any questions or comments about your privacy rights, 
          you may email us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
