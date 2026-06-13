import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

/* ── Social SVG Icons ── */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* ── WhatsApp config ── */
const WHATSAPP_NUMBER = "16479704508";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi! I'd like to inquire about booking a photo booth for my event.");

/* ── Scroll to top helper ── */
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const SOCIALS = [
    {
      name: "Instagram",
      icon: <InstagramIcon />,
      href: "https://www.instagram.com/YOUR_HANDLE",
    },
    {
      name: "Facebook",
      icon: <FacebookIcon />,
      href: "https://www.facebook.com/YOUR_PAGE",
    },
    {
      name: "TikTok",
      icon: <TikTokIcon />,
      href: "https://www.tiktok.com/@YOUR_HANDLE",
    },
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
    },
  ];

  const NAV_LINKS = [
    ["Home",     "/"],
    ["Packages", "/packages"],
    ["Gallery",  "/gallery"],
    ["About",    "/about"],
    ["Contact",  "/contact"],
    ["FAQ",      "/faq"],
  ];

  const LEGAL_LINKS = [
    ["Privacy Policy",    "/privacy"],
    ["Terms of Service",  "/terms"],
    ["Cookie Policy",     "/cookies"],
  ];

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 60px;
        }
        .footer-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .footer-bottom-bar {
          padding-top: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .footer-bottom-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .footer-link-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          color: rgba(245,240,232,0.45);
          text-align: left;
          transition: color 0.3s;
          display: block;
          line-height: 1.8;
        }
        .footer-link-btn:hover { color: var(--gold, #b8860b); }
        .social-btn {
          width: 40px; height: 40px;
          border: 1px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          color: rgba(245,240,232,0.5);
          text-decoration: none;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        .social-btn:hover {
          border-color: var(--gold, #b8860b);
          color: var(--gold, #b8860b);
          background: rgba(201,168,76,0.08);
        }
        .social-btn.whatsapp:hover {
          border-color: #25D366;
          color: #25D366;
          background: rgba(37,211,102,0.08);
        }
        .legal-link-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          color: rgba(245,240,232,0.3);
          transition: color 0.3s;
          letter-spacing: 0.04em;
        }
        .legal-link-btn:hover { color: var(--gold, #b8860b); }
        .footer-main-wrap {
          padding: 72px 60px 36px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .whatsapp-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #25D366;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: background .25s, transform .15s;
          border-radius: 2px;
          width: 100%;
          justify-content: center;
          box-sizing: border-box;
        }
        .whatsapp-cta-btn:hover {
          background: #1ebe5d;
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
          .footer-main-wrap {
            padding: 56px 24px 32px !important;
          }
          .footer-cta-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 24px !important;
          }
          .footer-cta-strip {
            padding: 48px 24px !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .footer-bottom-links {
            gap: 14px !important;
          }
        }
      `}</style>

      <footer style={{ background:"var(--dark, #0a0906)" }}>

        {/* ── CTA Strip ── */}
        <div className="footer-cta-strip" style={{
          background:"linear-gradient(135deg, var(--dark2, #0f0d0a), var(--dark3, #13110e))",
          borderTop:"1px solid rgba(201,168,76,0.2)",
          borderBottom:"1px solid rgba(201,168,76,0.1)",
          padding:"60px",
        }}>
          <div className="footer-cta-inner">
            <div>
              <div style={{ fontFamily:"var(--font-display, Georgia, serif)", fontSize:11, letterSpacing:"4px", color:"var(--gold, #b8860b)", marginBottom:8, textTransform:"uppercase" }}>
                Ready to create memories?
              </div>
              <h2 style={{ fontFamily:"var(--font-serif, Georgia, serif)", fontSize:"clamp(1.6rem, 3vw, 2.6rem)", fontWeight:300, color:"var(--white, #f5f0e8)", margin:0 }}>
                Let's make your event <em style={{ fontStyle:"italic", color:"var(--gold, #b8860b)" }}>unforgettable</em>
              </h2>
            </div>
            <button
              onClick={() => goTo("/contact")}
              style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"14px 28px",
                background:"var(--gold, #b8860b)", color:"#0a0906",
                border:"none", cursor:"pointer",
                fontFamily:"var(--font-display, Georgia, serif)",
                fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
                whiteSpace:"nowrap", flexShrink:0,
                transition:"opacity .25s",
              }}
              onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >
              Book Your Date <span style={{ fontSize:16 }}>→</span>
            </button>
          </div>
        </div>

        {/* ── Main Footer ── */}
        <div className="footer-main-wrap">
          <div className="footer-grid" style={{ paddingBottom:52, borderBottom:"1px solid rgba(245,240,232,0.06)" }}>

            {/* Brand col */}
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ color:"var(--gold, #b8860b)", fontSize:26 }}>◈</span>
                <div>
                  <div style={{ fontFamily:"var(--font-display, Georgia, serif)", fontSize:20, letterSpacing:"4px", color:"var(--white, #f5f0e8)" }}>
                    Memorify
                  </div>
                  <div style={{ fontSize:9, letterSpacing:"3px", color:"var(--gold, #b8860b)", textTransform:"uppercase" }}>
                    Premium Experiences
                  </div>
                </div>
              </div>

              <p style={{ fontSize:13, color:"rgba(245,240,232,0.5)", lineHeight:1.8, maxWidth:280, margin:0 }}>
                We capture your moments and turn them into memories that last forever.
              </p>

              {/* Social icons */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {SOCIALS.map(({ name, icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-btn${name === "WhatsApp" ? " whatsapp" : ""}`}
                    title={name}
                    aria-label={name}
                  >
                    {icon}
                  </a>
                ))}
              </div>

              {/* WhatsApp CTA button */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Navigate col */}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{
                fontFamily:"var(--font-display, Georgia, serif)", fontSize:11,
                letterSpacing:"4px", color:"var(--gold, #b8860b)",
                textTransform:"uppercase", marginBottom:10,
                paddingBottom:12, borderBottom:"1px solid rgba(201,168,76,0.2)",
              }}>
                Navigate
              </div>
              {NAV_LINKS.map(([label, path]) => (
                <button key={path} onClick={() => goTo(path)} className="footer-link-btn">
                  {label}
                </button>
              ))}
            </div>

            {/* Services col */}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{
                fontFamily:"var(--font-display, Georgia, serif)", fontSize:11,
                letterSpacing:"4px", color:"var(--gold, #b8860b)",
                textTransform:"uppercase", marginBottom:10,
                paddingBottom:12, borderBottom:"1px solid rgba(201,168,76,0.2)",
              }}>
                Services
              </div>
              {[
                "Photo Booth with Prints",
                "360° Digital Photo Booth",
                "Audio Guest Book",
                "Photo Guest Book",
                "Keychain Station",
                "Custom Photo Magnet Station ",
              ].map((s) => (
                <button key={s} onClick={() => goTo("/packages")} className="footer-link-btn">
                  {s}
                </button>
              ))}
            </div>

            {/* Newsletter + Contact col */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{
                fontFamily:"var(--font-display, Georgia, serif)", fontSize:11,
                letterSpacing:"4px", color:"var(--gold, #b8860b)",
                textTransform:"uppercase", marginBottom:10,
                paddingBottom:12, borderBottom:"1px solid rgba(201,168,76,0.2)",
              }}>
                Stay Connected
              </div>

              <p style={{ fontSize:12, color:"rgba(245,240,232,0.45)", lineHeight:1.75, margin:0 }}>
                Get updates on availability, special offers &amp; inspiration.
              </p>

              {subscribed ? (
                <div style={{
                  color:"var(--gold, #b8860b)", fontSize:13,
                  padding:"14px 16px", border:"1px solid rgba(201,168,76,0.3)",
                  letterSpacing:"2px",
                }}>
                  ✓ You're on the list!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display:"flex", border:"1px solid rgba(201,168,76,0.3)" }}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex:1, background:"transparent", border:"none", outline:"none",
                      padding:"13px 14px", color:"var(--white, #f5f0e8)",
                      fontFamily:"var(--font-body, inherit)", fontSize:13,
                      minWidth:0,
                    }}
                    required
                  />
                  <button type="submit" style={{
                    background:"var(--gold, #b8860b)", border:"none",
                    color:"#0a0906", padding:"0 18px", fontSize:18,
                    cursor:"pointer", transition:"opacity .25s", flexShrink:0,
                  }}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                  >→</button>
                </form>
              )}

              {/* Contact details with address */}
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
                {[
                  ["◎", "Memorify.ca@gmail.com"],
                  ["◉", "+1 (647) 970-4508"],
                  ["◈", "Greater Toronto Area (GTA)\nOntario, Canada"],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:"rgba(245,240,232,0.5)" }}>
                    <span style={{ color:"var(--gold, #b8860b)", fontSize:10, flexShrink:0, marginTop:3 }}>{icon}</span>
                    <span style={{ lineHeight:1.6 }}>
                      {text.split("\n").map((line, i) => (
                        <span key={i} style={{ display:"block" }}>{line}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Bottom bar ── */}
          <div className="footer-bottom-bar">
            <span style={{ fontSize:12, color:"rgba(245,240,232,0.25)", letterSpacing:"1px" }}>
              © {new Date().getFullYear()} Memorify. All rights reserved.
            </span>
            <div className="footer-bottom-links">
              {LEGAL_LINKS.map(([label, path]) => (
                <button
                  key={path}
                  onClick={() => goTo(path)}
                  className="legal-link-btn"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}