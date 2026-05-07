import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const links = [
  { to: "/",         label: "Home" },
  { to: "/packages", label: "Packages" },
  { to: "/gallery",  label: "Gallery" },
  { to: "/about",    label: "About" },
  { to: "/contact",  label: "Contact" },
  { to: "/faq",      label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const loc      = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <style>{`
        .nav-desktop-links { display: flex; align-items: center; gap: 4px; }
        .nav-cta-desktop   { display: flex; align-items: center; gap: 14px; }

        /* Hamburger hidden by default on desktop */
        #nav-hamburger { display: none !important; }

        /* Book Now button always visible on desktop */
        .nav-book-btn { display: inline-flex !important; }

        @media (max-width: 900px) {
          .nav-desktop-links { display: none !important; }
          #nav-hamburger     { display: flex !important; }
          .nav-book-btn      { display: none !important; }
        }

        .nav-link {
          padding: 8px 13px 9px;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.07em;
          border-bottom: 1px solid transparent;
          transition: color .25s, border-color .25s;
          background: none;
          border-top: none; border-left: none; border-right: none;
          cursor: pointer;
          font-family: var(--ff-sans, inherit);
          text-decoration: none;
          display: inline-block;
        }
        .nav-link:hover { color: var(--gold-light, #d4af37) !important; }

        .mobile-nav-link {
          font-family: var(--ff-sans, inherit);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.1em;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
          color: var(--text-main, #f0e8d8);
          background: none;
          border-left: none; border-right: none; border-top: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: color .25s;
          text-decoration: none;
          text-transform: uppercase;
        }
        .mobile-nav-link:hover { color: var(--gold-light, #d4af37); }
      `}</style>

      {/* ── Top nav bar ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        height:"var(--nav-h, 64px)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 var(--gutter, 40px)",
        background:"#000",
        borderBottom:"1px solid rgba(184,134,11,.25)",
      }}>

        {/* Logo + Name */}
        <button
          onClick={() => goTo("/")}
          style={{ display:"flex", alignItems:"center", background:"none", border:"none", cursor:"pointer", padding:0 }}
        >
          <img
            src={logo}
            alt="Memorify"
            style={{ height:50, width:"auto", objectFit:"contain", display:"block" }}
          />
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2, marginLeft:-4 }}>
            <span style={{
              fontFamily:"var(--ff-tenor, Georgia, serif)",
              fontSize:16, letterSpacing:"0.18em",
              color:"var(--gold-light, #d4af37)", textTransform:"uppercase",
            }}>Memorify</span>
            <span style={{
              fontFamily:"var(--ff-sans, inherit)",
              fontSize:9, letterSpacing:"0.2em",
              color:"rgba(212,175,55,.55)", textTransform:"uppercase",
            }}>memorify.ca</span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="nav-desktop-links">
          {links.map(l => (
            <button
              key={l.to}
              onClick={() => goTo(l.to)}
              className="nav-link"
              style={{
                color: loc.pathname === l.to ? "var(--gold-light, #d4af37)" : "var(--text-dim, rgba(240,232,216,.5))",
                borderBottomColor: loc.pathname === l.to ? "var(--gold, #b8860b)" : "transparent",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-cta-desktop" style={{ display:"flex", alignItems:"center", gap:14 }}>

          {/* Book Now — desktop only */}
          <button
            onClick={() => goTo("/contact")}
            className="nav-book-btn"
            style={{
              fontSize:12, padding:"10px 22px",
              background:"var(--gold, #b8860b)", color:"#0d0b08",
              border:"none", cursor:"pointer",
              fontFamily:"var(--ff-sans, inherit)",
              fontWeight:600, letterSpacing:"0.1em",
              alignItems:"center",
            }}
          >
            Book Now
          </button>

          {/* Hamburger — mobile only */}
          <button
            id="nav-hamburger"
            onClick={() => setOpen(!open)}
            style={{
              background:"none", border:"none",
              flexDirection:"column", gap:5,
              padding:6, cursor:"pointer",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:22, height:1.5,
                background:"var(--text-main, #f0e8d8)",
                transition:"all .3s",
                transform: open
                  ? i===0 ? "rotate(45deg) translate(4.5px,4.5px)"
                  : i===2 ? "rotate(-45deg) translate(4.5px,-4.5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: open && i===1 ? 0 : 1,
                borderRadius:1,
              }}/>
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen menu ── */}
      <div style={{
        position:"fixed",
        top:"var(--nav-h, 64px)",
        left:0, right:0, bottom:0,
        zIndex:999,
        background:"#000",
        display:"flex", flexDirection:"column",
        justifyContent:"center",
        padding:"0 32px 32px",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition:"opacity .3s ease-out",
        overflowY:"auto",
      }}>

        {/* Nav links */}
        <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:28 }}>
          {links.map((l, i) => (
            <button
              key={l.to}
              onClick={() => goTo(l.to)}
              className="mobile-nav-link"
              style={{
                color: loc.pathname === l.to ? "var(--gold-light, #d4af37)" : "var(--text-main, #f0e8d8)",
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateX(-16px)",
                transition:`opacity .35s ${i*.06}s, transform .35s ${i*.06}s ease-out`,
              }}
            >
              <span style={{ fontSize:10, color:"var(--gold, #b8860b)", letterSpacing:"0.1em", minWidth:22 }}>
                0{i+1}
              </span>
              {l.label}
            </button>
          ))}
        </div>

        {/* Book button */}
        <button
          onClick={() => goTo("/contact")}
          style={{
            alignSelf:"flex-start",
            display:"inline-flex", alignItems:"center", gap:10,
            padding:"12px 24px",
            background:"var(--gold, #b8860b)", color:"#0d0b08",
            border:"none", cursor:"pointer",
            fontFamily:"var(--ff-sans, inherit)",
            fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
            opacity: open ? 1 : 0,
            transition:"opacity .4s .38s",
          }}
        >
          Book Your Event <span style={{ fontSize:14 }}>→</span>
        </button>

        {/* Social icons */}
        <div style={{ display:"flex", gap:16, marginTop:28, opacity: open ? 1 : 0, transition:"opacity .4s .46s" }}>
          {[
            { label:"Instagram", href:"https://www.instagram.com/YOUR_HANDLE" },
            { label:"Facebook",  href:"https://www.facebook.com/YOUR_PAGE"    },
            { label:"TikTok",    href:"https://www.tiktok.com/@YOUR_HANDLE"   },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize:11, letterSpacing:"0.1em",
                color:"rgba(240,232,216,.35)", textDecoration:"none",
                transition:"color .25s",
              }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--gold-light, #d4af37)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(240,232,216,.35)"}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}