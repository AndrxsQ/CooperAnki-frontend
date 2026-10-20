const defaultSocialLinks = [
  { label: "Instagram" },
  { label: "Facebook" },
  { label: "Twitter / X" },
  { label: "YouTube" },
];

export const Footer = ({ websiteUrl, socialLinks = defaultSocialLinks }) => (
  <footer className="landing-footer" id="contacto">
    <div className="landing-footer-inner">
      <h2>Contáctanos</h2>
      <div className="footer-contact-grid">
        <div className="footer-contact-group">
          <h3>Página web</h3>
          {websiteUrl ? (
            <a href={websiteUrl} rel="noopener noreferrer" target="_blank">
              {websiteUrl}
            </a>
          ) : (
            <span className="footer-link-placeholder">URL por definir</span>
          )}
        </div>
        <div className="footer-contact-group">
          <h3>Redes sociales</h3>
          <ul>
            {socialLinks.map(({ label, href }) => (
              <li key={label}>
                {href ? (
                  <a href={href} rel="noopener noreferrer" target="_blank">{label}</a>
                ) : (
                  <span className="footer-link-placeholder">{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="footer-copyright">Coopera2075</p>
    </div>
  </footer>
);
