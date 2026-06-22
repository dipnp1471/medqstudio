import Logo from './Logo';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="footer animate-fade">
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
            <Logo size={40} />
            <span className="logo-text" style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center' }}>
              Med <span style={{ color: 'var(--color-brand-primary)', marginLeft: '0.25rem' }}>Q</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '500', letterSpacing: '0.15em', textTransform: 'uppercase', marginLeft: '0.5rem', color: 'var(--color-text-muted)' }}>Studios</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
            High-yield revision resources for medical professionals preparing for the Multi-Specialty Recruitment Assessment (MSRA). Aligning practice with the official exam blueprint.
          </p>
        </div>

        {/* Resources Column */}
        <div className="footer-links-col">
          <span className="footer-links-title">Resources</span>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setCurrentPage('practice'); }}>Free Random Practice</a>
          <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setCurrentPage('how-it-works'); }}>Revision Science</a>
        </div>

        {/* Support Column */}
        <div className="footer-links-col">
          <span className="footer-links-title">Legal & Contact</span>
          <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Contact Support</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Med Q Studios. All rights reserved.</span>
        <span>Disclaimer: This platform is an independent revision resource and is not affiliated with Health Education England (HEE) or the official MSRA exam organizers.</span>
      </div>
    </footer>
  );
}
