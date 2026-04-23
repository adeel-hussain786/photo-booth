import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer style={styles.footer}>
      
      {/* CTA */}
      <div style={styles.ctaStrip}>
        <div style={styles.ctaInner}>
          <div>
            <div style={styles.ctaLabel}>Ready to create memories?</div>
            <h2 style={styles.ctaTitle}>
              Let's make your event <em style={{fontStyle:"italic",color:"var(--gold)"}}>unforgettable</em>
            </h2>
          </div>
          <Link to="/contact" className="btn-primary">
            <span>Book Your Date</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.mainFooter}>
        <div style={styles.footerGrid}>
          
          {/* Brand */}
          <div style={styles.brandCol}>
            <div style={styles.footerLogo}>
              <span style={{color:"var(--gold)",fontSize:"28px"}}>◈</span>
              <div>
                <div style={styles.footerLogoText}>Memorify</div>
                <div style={styles.footerLogoSub}>Premium Experiences</div>
              </div>
            </div>

            <p style={styles.brandDesc}>
              We capture your moments and turn them into memories that last forever.
            </p>

            <div style={styles.socials}>
              {["Instagram", "Facebook", "TikTok"].map((s) => (
                <a key={s} href="#" style={styles.social}>{s[0]}</a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={styles.navCol}>
            <div style={styles.colTitle}>Navigate</div>
            {[["Home","/"],["Packages","/packages"],["Gallery","/gallery"],["About","/about"],["Contact","/contact"],["FAQ","/faq"]].map(([l,to]) => (
              <Link key={to} to={to} style={styles.footerLink}>{l}</Link>
            ))}
          </div>

          {/* REAL SERVICES ONLY */}
          <div style={styles.navCol}>
            <div style={styles.colTitle}>Services</div>
            {[
              "Photo Booth with Prints",
              "Digital Photo Booth",
                "Audio Guest Book (Voice Messages)",
               "Guest Book (Photo Album)"
            ].map((s) => (
              <span key={s} style={{...styles.footerLink, cursor:"default"}}>{s}</span>
            ))}
          </div>

          {/* Newsletter + Contact */}
          <div style={styles.newsletterCol}>
            <div style={styles.colTitle}>Stay Connected</div>

            {subscribed ? (
              <div style={styles.subscribedMsg}>✓ You're on the list!</div>
            ) : (
              <form onSubmit={handleSubscribe} style={styles.form}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                <button type="submit" style={styles.submitBtn}>→</button>
              </form>
            )}

            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>◎</span>
                <span>Memorify.ca@gmail.com</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>◉</span>
                <span>+1 (555) 000-0000</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div style={styles.bottomBar}>
          <span style={styles.copyright}>
            © {new Date().getFullYear()} Memorify. All rights reserved.
          </span>
          <div style={styles.bottomLinks}>
            {["Privacy Policy","Terms of Service","Cookie Policy"].map((l) => (
              <a key={l} href="#" style={styles.bottomLink}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
const styles = {
  footer: { background: "var(--dark)", },
  ctaStrip: {
    background: "linear-gradient(135deg, var(--dark2), var(--dark3))",
    borderTop: "1px solid rgba(201,168,76,0.2)",
    borderBottom: "1px solid rgba(201,168,76,0.1)",
    padding: "60px",
  },
  ctaInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  ctaLabel: {
    fontFamily: "var(--font-display)",
    fontSize: "11px",
    letterSpacing: "4px",
    color: "var(--gold)",
    marginBottom: "8px",
  },
  ctaTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
    fontWeight: 300,
    color: "var(--white)",
  },
  mainFooter: { padding: "80px 60px 40px", maxWidth: "1400px", margin: "0 auto" },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr",
    gap: "60px",
    paddingBottom: "60px",
    borderBottom: "1px solid rgba(245,240,232,0.06)",
  },
  brandCol: { display: "flex", flexDirection: "column", gap: "24px" },
  footerLogo: { display: "flex", alignItems: "center", gap: "12px" },
  footerLogoText: {
    fontFamily: "var(--font-display)",
    fontSize: "22px",
    letterSpacing: "4px",
    color: "var(--white)",
  },
  footerLogoSub: {
    fontFamily: "var(--font-body)",
    fontSize: "9px",
    letterSpacing: "3px",
    color: "var(--gold)",
    textTransform: "uppercase",
  },
  brandDesc: {
    fontSize: "13px",
    color: "var(--white-dim)",
    lineHeight: 1.8,
    maxWidth: "300px",
  },
  socials: { display: "flex", gap: "12px" },
  social: {
    width: "38px", height: "38px",
    border: "1px solid rgba(201,168,76,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-body)",
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--gold)",
    transition: "all 0.3s ease",
    letterSpacing: 0,
  },
  navCol: { display: "flex", flexDirection: "column", gap: "12px" },
  colTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "11px",
    letterSpacing: "4px",
    color: "var(--gold)",
    textTransform: "uppercase",
    marginBottom: "8px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(201,168,76,0.2)",
  },
  footerLink: {
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    color: "var(--white-dim)",
    transition: "color 0.3s ease",
    display: "block",
  },
  newsletterCol: { display: "flex", flexDirection: "column", gap: "16px" },
  newsletterDesc: { fontSize: "13px", color: "var(--white-dim)", lineHeight: 1.8 },
  form: { display: "flex", border: "1px solid rgba(201,168,76,0.3)" },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "14px 16px",
    color: "var(--white)",
    fontFamily: "var(--font-body)",
    fontSize: "13px",
  },
  submitBtn: {
    background: "var(--gold)",
    border: "none",
    color: "var(--black)",
    padding: "0 20px",
    fontSize: "18px",
    cursor: "none",
    transition: "background 0.3s ease",
  },
  subscribedMsg: {
    color: "var(--gold)",
    fontFamily: "var(--font-display)",
    letterSpacing: "3px",
    fontSize: "13px",
    padding: "16px",
    border: "1px solid rgba(201,168,76,0.3)",
  },
  contactInfo: { display: "flex", flexDirection: "column", gap: "10px" },
  contactItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--white-dim)" },
  contactIcon: { color: "var(--gold)", fontSize: "10px" },
  bottomBar: {
    paddingTop: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  copyright: { fontSize: "12px", color: "rgba(245,240,232,0.3)", letterSpacing: "1px" },
  bottomLinks: { display: "flex", gap: "24px" },
  bottomLink: { fontSize: "12px", color: "rgba(245,240,232,0.3)", transition: "color 0.3s" },
};
