import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/packages", label: "Packages" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  const isHome = loc.pathname === "/";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: "var(--nav-h)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 var(--gutter)",
        background: scrolled
          ? "rgba(13,11,8,.94)"
          : isHome ? "transparent" : "rgba(13,11,8,.94)",
        borderBottom: scrolled || !isHome
          ? "1px solid var(--border)"
          : "1px solid transparent",
        backdropFilter: scrolled || !isHome ? "blur(18px)" : "none",
        transition: "background .4s, border-color .4s, backdrop-filter .4s",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="14" width="15.56" height="15.56" transform="rotate(-45 3 14)" stroke="var(--gold)" strokeWidth="1.5" fill="none"/>
            <circle cx="14" cy="14" r="3.5" fill="var(--gold)"/>
          </svg>
          <div>
            <div style={{ fontFamily:"var(--ff-tenor)", fontSize:16, letterSpacing:"0.2em", color:"var(--text-main)", lineHeight:1.1 }}>
              PHOTOBOOTH
            </div>
            <div style={{ fontFamily:"var(--ff-sans)", fontSize:9, letterSpacing:"0.22em", color:"var(--gold-light)", textTransform:"uppercase" }}>
              Premium Experiences
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: "8px 14px",
              fontFamily: "var(--ff-sans)",
              fontSize: 13, fontWeight: 400,
              letterSpacing: "0.07em",
              color: loc.pathname === l.to ? "var(--gold-light)" : "var(--text-dim)",
              borderBottom: loc.pathname === l.to ? "1px solid var(--gold)" : "1px solid transparent",
              transition: "color .25s, border-color .25s",
              paddingBottom: 9,
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <Link to="/contact" className="btn btn-gold" style={{ fontSize:12, padding:"10px 24px" }}>
            Book Now
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            style={{ background:"none", border:"none", display:"none", flexDirection:"column", gap:5, padding:4 }}
            id="hamburger"
            aria-label="Menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display:"block", width:22, height:1.5,
                background:"var(--text-main)",
                transition:"all .3s",
                transform: open
                  ? i===0 ? "rotate(45deg) translate(4.5px,4.5px)"
                  : i===2 ? "rotate(-45deg) translate(4.5px,-4.5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: open && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div style={{
        position:"fixed", inset:0, zIndex:999,
        background:"var(--ink)",
        display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"0 var(--gutter)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition:"opacity .35s var(--ease-out)",
      }}>
        {links.map((l,i) => (
          <Link key={l.to} to={l.to} style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(2.2rem,6vw,3.8rem)",
            fontWeight: 400,
            color: loc.pathname===l.to ? "var(--gold-light)" : "var(--text-main)",
            padding: "14px 0",
            borderBottom: "1px solid var(--border-soft)",
            opacity: open ? 1 : 0,
            transform: open ? "none" : "translateX(-20px)",
            transition: `opacity .4s ${i*.07}s, transform .4s ${i*.07}s var(--ease-out)`,
          }}>
            <span style={{ fontSize:12, color:"var(--gold)", marginRight:16, fontFamily:"var(--ff-sans)", letterSpacing:"0.1em" }}>
              0{i+1}
            </span>
            {l.label}
          </Link>
        ))}
        <Link to="/contact" className="btn btn-gold" style={{ marginTop:40, alignSelf:"flex-start" }}>
          Book Your Event
        </Link>
      </div>

      <style>{`
        @media(max-width:900px){
          nav > div:nth-child(2){ display:none!important; }
          #hamburger{ display:flex!important; }
        }
      `}</style>
    </>
  );
}
