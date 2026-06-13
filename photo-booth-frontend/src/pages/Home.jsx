import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* Local service images */
import booth360Img  from "../assets/360.png";
import withPrintImg from "../assets/with print.jpeg";
import audioImg     from "../assets/audio.png";
import guestBookImg from "../assets/guest book.png";
import keychainImg  from "../assets/keychain.jpeg";
import magnetImg    from "../assets/Magnet.jpeg";

/* ─── REPLACE these with your actual asset imports ─── */
// import { heroVideo, heroShot1, heroShot2, heroShot3, wedding1, wedding2,
//   corporate1, party1, booth360_1, gala1, pkgClassic, pkg360, pkgAudio, pkgGuestBook } from "../assets/index.js";

/* Placeholder images (swap with your actual imports above) */
const heroVideo      = "";
const heroShot1      = "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80";
const heroShot2      = "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80";
const heroShot3      = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80";
const wedding1       = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80";
const wedding2       = "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80";
const corporate1     = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80";
const party1         = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80";
const booth360_1     = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80";
const gala1          = "https://images.unsplash.com/photo-1559519529-0936e4058364?w=600&q=80";

/* ── tiny hook: triggers when element enters viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ── animated counter ── */
function Count({ to, suffix = "", dur = 1800 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const fired = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        const steps = 55, inc = to / steps;
        let cur = 0;
        const id = setInterval(() => {
          cur += inc;
          if (cur >= to) { setN(to); clearInterval(id); } else setN(Math.floor(cur));
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, dur]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ── Cookie Consent Banner ── */
function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    const saved = localStorage.getItem("cookie_consent");
    if (!saved) setTimeout(() => setVisible(true), 1800);
  }, []);

  const accept = (all = true) => {
    const consent = all
      ? { analytics: true, marketing: true, essential: true, timestamp: Date.now() }
      : { ...prefs, essential: true, timestamp: Date.now() };
    localStorage.setItem("cookie_consent", JSON.stringify(consent));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #0d0b08 0%, #1a1612 100%)",
      borderTop: "1px solid rgba(184,134,11,.4)",
      padding: "20px 24px",
      animation: "slideUp .5s ease-out",
      boxShadow: "0 -8px 40px rgba(0,0,0,.6)",
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: none; opacity:1; } }`}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          {/* Cookie icon + text */}
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🍪</span>
              <p style={{ fontFamily: "var(--ff-display, Georgia, serif)", fontSize: 16, color: "#f0e8d8", fontWeight: 500, margin: 0 }}>
                We use cookies
              </p>
            </div>
            <p style={{ fontSize: 13, color: "rgba(240,232,216,.65)", lineHeight: 1.7, margin: 0 }}>
              We use essential cookies to make our site work. With your consent, we may also use analytics cookies
              to understand how you use our site, and marketing cookies to personalise your experience.
              {" "}<a href="/privacy" style={{ color: "var(--gold-light, #d4af37)", textDecoration: "underline" }}>Privacy Policy</a>
              {" "}·{" "}
              <a href="/cookies" style={{ color: "var(--gold-light, #d4af37)", textDecoration: "underline" }}>Cookie Policy</a>
            </p>

            {showDetails && (
              <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(255,255,255,.04)", borderRadius: 4, border: "1px solid rgba(184,134,11,.2)" }}>
                <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,232,216,.45)", marginBottom: 12 }}>Cookie Preferences</p>
                {[
                  { key: "essential", label: "Essential Cookies", desc: "Required for the site to function. Cannot be disabled.", locked: true },
                  { key: "analytics", label: "Analytics Cookies", desc: "Help us understand how visitors interact with our website." },
                  { key: "marketing", label: "Marketing Cookies", desc: "Used to deliver personalised ads and track campaign performance." },
                ].map(({ key, label, desc, locked }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, color: "#f0e8d8", margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
                      <p style={{ fontSize: 11, color: "rgba(240,232,216,.5)", margin: 0 }}>{desc}</p>
                    </div>
                    <label style={{ position: "relative", display: "inline-block", width: 40, height: 22, flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={locked ? true : prefs[key]}
                        disabled={locked}
                        onChange={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: "absolute", inset: 0, borderRadius: 22,
                        background: (locked || prefs[key]) ? "var(--gold, #b8860b)" : "rgba(255,255,255,.15)",
                        transition: ".3s", cursor: locked ? "not-allowed" : "pointer",
                      }}>
                        <span style={{
                          position: "absolute", top: 3, left: (locked || prefs[key]) ? 20 : 3,
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#fff", transition: "left .3s",
                        }}/>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, justifyContent: "center" }}>
            <button onClick={() => accept(true)} style={{
              padding: "10px 22px", background: "var(--gold, #b8860b)", color: "#0d0b08",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.08em", borderRadius: 2, whiteSpace: "nowrap",
            }}>Accept All</button>
            <button onClick={() => showDetails ? accept(false) : decline()} style={{
              padding: "10px 22px", background: "transparent", color: "#f0e8d8",
              border: "1px solid rgba(240,232,216,.25)", cursor: "pointer",
              fontSize: 13, borderRadius: 2, whiteSpace: "nowrap",
            }}>{showDetails ? "Save My Choices" : "Decline Non-Essential"}</button>
            <button onClick={() => setShowDetails(d => !d)} style={{
              padding: "6px", background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "rgba(240,232,216,.45)", textDecoration: "underline",
            }}>{showDetails ? "Hide" : "Manage Preferences"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SERVICES = [
  {
    img: booth360Img,
    num: "01",
    title: "360° Digital Booth",
    tag: "Popular",
    desc: "Unlimited digital photos & slow-motion videos with instant sharing via Airdrop. Includes props, custom templates, backdrop, and full setup with attendant.",
  },
  {
    img: withPrintImg,
    num: "02",
    title: "Photo Booth with Prints",
    tag: null,
    desc: "2–4 hours photo booth with unlimited prints & instant Airdrop. Includes props, custom templates, backdrop (white or champagne), setup & attendant.",
  },
  {
    img: audioImg,
    num: "03",
    title: "Audio Guest Book",
    tag: "New",
    desc: "Guests leave heartfelt voice messages during your event. All recordings beautifully compiled and delivered to you — a unique, emotional keepsake.",
  },
  {
    img: guestBookImg,
    num: "04",
    title: "Photo Guest Book",
    tag: null,
    desc: "Guests print a photo on-site and sign a beautiful keepsake album. A tactile, personal memory you'll treasure forever — no screen required.",
  },
  {
    img: keychainImg,
    num: "05",
    title: "Keychain Station",
    tag: null,
    desc: "Guests snap a photo and walk away with a custom keychain printed on the spot. A fun, personalised party favour they'll carry long after the event ends.",
  },
  {
    img: magnetImg,
    num: "06",
    title: "Custom Photo Magnet Station",
    tag: null,
    desc: "Instant photo magnets printed live at your event. Guests grab a personalised fridge magnet keepsake — a charming take-home memory of your celebration.",
  },
];

const GALLERY_PREVIEW = [
  { img: wedding1,   category: "Weddings",  col: 2, row: 2 },
  { img: booth360_1, category: "360°",      col: 1, row: 1 },
  { img: corporate1, category: "Corporate", col: 1, row: 1 },
  { img: party1,     category: "Birthdays", col: 1, row: 1 },
  { img: gala1,      category: "Galas",     col: 1, row: 1 },
  { img: wedding2,   category: "Weddings",  col: 1, row: 1 },
];

const MARQUEE_WORDS = ["Weddings","Corporate Events","Sweet 16s","Galas","Product Launches","Anniversaries","Graduations","Birthdays"];

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);
  const [statsRef, statsVis] = useInView();
  const [svcRef, svcVis] = useInView(0.05);
  const [gallRef, gallVis] = useInView(0.05);
  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setHeroReady(true), 120); }, []);

  return (
    <div className="app">
      {/* Global responsive styles injected here */}
      <style>{`
        /* ── Responsive Overrides ── */
        @media (max-width: 768px) {
          .hero-floating-strip { display: none !important; }
          .hero-headline { font-size: clamp(2.2rem, 9vw, 3.5rem) !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 24px !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr 1fr !important; grid-auto-rows: 180px !important; }
          .gallery-grid > div:first-child { grid-column: span 2 !important; grid-row: span 1 !important; }
          .event-types-grid { grid-template-columns: 1fr !important; }
          .section-header-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .hero-btns { flex-direction: column !important; }
          .hero-btns a { width: 100% !important; justify-content: center !important; }
          .cta-btns { flex-direction: column !important; align-items: center !important; }
          .cta-btns a { width: 100% !important; max-width: 300px !important; justify-content: center !important; }
          .section { padding: 64px 20px !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2,1fr) !important; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
          .gallery-grid > div:first-child { grid-column: span 1 !important; }
          .services-grid .service-card { height: 420px !important; }
        }

        /* ── Cookie banner responsive ── */
        @media (max-width: 640px) {
          .cookie-row { flex-direction: column !important; }
          .cookie-btns { flex-direction: row !important; flex-wrap: wrap !important; }
        }
      `}</style>

      <CookieBanner />

      {/* ═══════════════════════════════════════ HERO ══ */}
      <section style={{ position:"relative", height:"100svh", minHeight:580, overflow:"hidden", display:"flex", alignItems:"center" }}>

        {/* Video background */}
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay muted loop playsInline
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            filter:"brightness(.45) saturate(.8)",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />

        {/* Fallback bg image if no video */}
        {!heroVideo && (
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`url(${wedding1})`,
            backgroundSize:"cover", backgroundPosition:"center",
            filter:"brightness(.45) saturate(.8)",
          }}/>
        )}

        {/* Overlay gradient */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to right, rgba(13,11,8,.88) 50%, rgba(13,11,8,.2) 100%)",
        }}/>
        {/* Bottom fade */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:160,
          background:"linear-gradient(to top, var(--ink, #0d0b08), transparent)",
        }}/>

        {/* Content */}
        <div style={{
          position:"relative", zIndex:2,
          maxWidth:"var(--max-w, 1280px)", margin:"0 auto", padding:"0 var(--gutter, 40px)",
          width:"100%",
        }}>
          {/* Live badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", marginBottom:24,
            border:"1px solid rgba(184,134,11,.35)",
            background:"rgba(184,134,11,.08)",
            borderRadius:2,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(12px)",
            transition:"all .7s .05s ease-out",
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--gold-light, #d4af37)", animation:"pulse 2s ease infinite" }}/>
            <span style={{ fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light, #d4af37)", fontWeight:500 }}>
              Booking 2025 &amp; 2026 — Limited Dates
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-headline" style={{
            fontFamily:"var(--ff-display, Georgia, serif)", fontWeight:500,
            fontSize:"clamp(2.8rem, 7vw, 6.2rem)",
            lineHeight:1.06, letterSpacing:"-.02em",
            maxWidth:720,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(36px)",
            transition:"all .9s .15s ease-out",
          }}>
            Your event,<br/>
            <span style={{ fontStyle:"italic", color:"var(--gold-pale, #e8d5a0)" }}>beautifully</span> captured.
          </h1>

          <p style={{
            fontSize:"clamp(14px, 2.2vw, 17px)", color:"rgba(240,232,216,.72)", lineHeight:1.8,
            maxWidth:460, marginTop:20, marginBottom:36,
            fontWeight:300,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(24px)",
            transition:"all .85s .3s ease-out",
          }}>
            Photo booth services with prints, 360° digital booth, audio guest book &amp; photo guest book — for weddings, parties, and all events.
          </p>

          <div className="hero-btns" style={{
            display:"flex", gap:14, flexWrap:"wrap",
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(20px)",
            transition:"all .8s .45s ease-out",
          }}>
            <Link to="/contact" className="btn btn-gold">
              Get a Free Quote
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/gallery" className="btn btn-ghost">
              View Our Work
            </Link>
          </div>

          {/* Scroll cue — hidden on mobile */}
          <div style={{
            position:"absolute", bottom:40, left:"var(--gutter, 40px)",
            display:"flex", alignItems:"center", gap:12,
            opacity: heroReady ? 1 : 0,
            transition:"opacity 1s .9s",
          }}>
            <div style={{ width:1, height:40, background:"var(--gold, #b8860b)", opacity:.6 }}/>
            <span style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-dim, rgba(240,232,216,.45))" }}>Scroll</span>
          </div>
        </div>

        {/* Floating photo strip — desktop only */}
        <div className="hero-floating-strip" style={{
          position:"absolute", right:"5%", top:"50%",
          transform:"translateY(-50%)",
          display:"flex", flexDirection:"column", gap:10,
          zIndex:2,
          opacity: heroReady ? 1 : 0,
          transition:"opacity 1.1s .5s ease-out",
        }}>
          {[
            { src:heroShot1, r:"-6deg", delay:"0s",    label:"captured ✨" },
            { src:heroShot2, r:"4deg",  delay:"0.18s",  label:"unforgettable" },
            { src:heroShot3, r:"-2deg", delay:"0.36s",  label:"your moment" },
          ].map((p,i)=>(
            <div key={i} style={{
              width:130, padding:"10px 10px 32px",
              background:"#fff",
              boxShadow:"0 12px 40px rgba(0,0,0,.55)",
              transform:`rotate(${p.r})`,
              animation:`floatY ${5.5+i*0.8}s ease-in-out infinite`,
              animationDelay:p.delay,
            }}>
              <img src={p.src} alt="" style={{ width:"100%", height:120, objectFit:"cover", display:"block" }}/>
              <p style={{ fontFamily:"'Caveat', cursive", fontSize:11, color:"#555", marginTop:7, textAlign:"center", letterSpacing:"0.04em" }}>
                {p.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ MARQUEE STRIP ══ */}
      <div style={{
        background:"var(--gold, #b8860b)",
        overflow:"hidden", padding:"13px 0",
        borderTop:"1px solid rgba(0,0,0,.12)",
      }}>
        <div style={{
          display:"flex", gap:0,
          animation:"marqueeScroll 22s linear infinite",
          width:"max-content",
        }}>
          {[...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS].map((w,i)=>(
            <span key={i} style={{
              fontFamily:"var(--ff-display, Georgia, serif)", fontStyle:"italic",
              fontSize:14, color: i%2===0 ? "var(--ink, #0d0b08)" : "rgba(13,11,8,.5)",
              padding:"0 28px", whiteSpace:"nowrap",
            }}>
              {w}
              <span style={{ margin:"0 10px 0 0", color:"rgba(13,11,8,.35)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════ STATS ══ */}
      <div ref={statsRef} style={{ background:"var(--surface, #141210)", borderBottom:"1px solid var(--border-soft, rgba(255,255,255,.06))" }}>
        <div style={{ maxWidth:"var(--max-w, 1280px)", margin:"0 auto", padding:"64px var(--gutter, 40px)" }}>
          <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:28 }}>
            {[
              { n:500,   s:"+",     label:"Events Captured" },
              { n:8,     s:" Yrs",  label:"In Business" },
              { n:98,    s:"%",     label:"Client Satisfaction" },
              { n:50000, s:"+",     label:"Photos Delivered" },
            ].map((st,i)=>(
              <div key={i} style={{
                textAlign:"center", padding:"8px 0",
                opacity: statsVis ? 1 : 0,
                transform: statsVis ? "none" : "translateY(22px)",
                transition:`all .7s ${i*.09}s ease-out`,
              }}>
                <div style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"clamp(2rem,4vw,3.4rem)", fontWeight:700, color:"var(--gold-light, #d4af37)", lineHeight:1, marginBottom:8 }}>
                  {statsVis && <Count to={st.n} suffix={st.s}/>}
                </div>
                <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim, rgba(240,232,216,.45))", fontWeight:500 }}>
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════ SERVICES ══ */}
      <section ref={svcRef} style={{ background:"var(--ink, #0d0b08)" }}>
        <div className="section" style={{ maxWidth:"var(--max-w, 1280px)", margin:"0 auto", padding:"96px var(--gutter, 40px)" }}>
          <div className="section-header-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:56, flexWrap:"wrap", gap:24 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold, #b8860b)", marginBottom:12 }}>What We Offer</p>
              <h2 style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:500, lineHeight:1.15 }}>
                Experiences that<br/>define your <em style={{ color:"var(--gold-pale, #e8d5a0)" }}>celebration</em>
              </h2>
            </div>
            <Link to="/packages" style={{ fontSize:13, color:"var(--gold, #b8860b)", textDecoration:"none", display:"flex", alignItems:"center", gap:6, letterSpacing:"0.06em", fontWeight:500 }}>
              All Packages <span>→</span>
            </Link>
          </div>

          {/* Services grid — 2 cols on tablet, 1 on mobile, 3 on desktop */}
          <div className="services-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:3 }}>
            {SERVICES.map((s,i)=>(
              <ServiceCard key={i} s={s} visible={svcVis} delay={i*.10}/>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ GALLERY PREVIEW ══ */}
      <section ref={gallRef} style={{ background:"var(--surface, #141210)" }}>
        <div className="section" style={{ maxWidth:"var(--max-w, 1280px)", margin:"0 auto", padding:"96px var(--gutter, 40px)" }}>
          <div className="section-header-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:44, flexWrap:"wrap", gap:20 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold, #b8860b)", marginBottom:12 }}>Portfolio</p>
              <h2 style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:500, lineHeight:1.15 }}>
                A glimpse of the <em style={{ color:"var(--gold-pale, #e8d5a0)" }}>magic</em>
              </h2>
            </div>
            <Link to="/gallery" style={{ fontSize:13, color:"var(--gold, #b8860b)", textDecoration:"none", display:"flex", alignItems:"center", gap:6, letterSpacing:"0.06em", fontWeight:500 }}>
              See Full Gallery <span>→</span>
            </Link>
          </div>

          <div className="gallery-grid" style={{
            display:"grid",
            gridTemplateColumns:"repeat(3,1fr)",
            gridAutoRows:"240px",
            gap:3,
          }}>
            {GALLERY_PREVIEW.map((g,i)=>(
              <div key={i} style={{
                position:"relative", overflow:"hidden",
                gridColumn: i===0 ? "span 2" : undefined,
                gridRow: i===0 ? "span 2" : undefined,
                opacity: gallVis ? 1 : 0,
                transform: gallVis ? "none" : "scale(.97)",
                transition:`all .7s ${i*.1}s ease-out`,
              }}>
                <img src={g.img} alt={g.category} style={{
                  width:"100%", height:"100%", objectFit:"cover",
                  transition:"transform .6s ease-out",
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                <div style={{
                  position:"absolute", inset:0,
                  background:"linear-gradient(to top, rgba(13,11,8,.7) 0%, transparent 55%)",
                  display:"flex", alignItems:"flex-end", padding:"16px 18px",
                }}>
                  <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(240,232,216,.75)" }}>
                    {g.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ EVENT TYPES ══ */}
      <section style={{ background:"var(--surface2, #111009)", borderTop:"1px solid var(--border-soft, rgba(255,255,255,.06))" }}>
        <div className="section" style={{ maxWidth:"var(--max-w, 1280px)", margin:"0 auto", padding:"96px var(--gutter, 40px)", textAlign:"center" }}>
          <p style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold, #b8860b)", marginBottom:12 }}>Perfect For</p>
          <h2 style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:500, lineHeight:1.15, marginBottom:52 }}>
            Every occasion <em style={{ color:"var(--gold-pale, #e8d5a0)" }}>deserves</em> to be remembered
          </h2>
          <div className="event-types-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, textAlign:"left" }}>
            {[
              ["Weddings & Engagements","Photo booth rentals & 360° for your big day"],
              ["Corporate Events","Branded activations for launches, galas & conferences"],
              ["Birthdays & Parties","Make every celebration unforgettable"],
              ["Graduations","Mark the milestone with style and lasting memories"],
              ["Anniversaries","Renew the magic — together and beautifully captured"],
              ["Charity Galas","Elevate your fundraiser with a premium guest experience"],
            ].map(([title,sub],i)=>(
              <div key={i}
                style={{
                  padding:"36px 32px",
                  background: i%2===0 ? "var(--surface3, #0f0d0b)" : "var(--surface, #141210)",
                  border:"1px solid var(--border-soft, rgba(255,255,255,.06))",
                  transition:"background .3s, border-color .3s",
                  cursor:"default",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="var(--ink-light, #1a1612)";
                  e.currentTarget.style.borderColor="var(--border, rgba(255,255,255,.12))";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background=i%2===0?"var(--surface3, #0f0d0b)":"var(--surface, #141210)";
                  e.currentTarget.style.borderColor="var(--border-soft, rgba(255,255,255,.06))";
                }}>
                <p style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"1.15rem", fontWeight:500, marginBottom:6 }}>{title}</p>
                <p style={{ fontSize:13, color:"var(--text-dim, rgba(240,232,216,.45))", lineHeight:1.65 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TRUST / PRIVACY NOTE ══ */}
      <section style={{ background:"var(--ink, #0d0b08)", borderTop:"1px solid var(--border-soft, rgba(255,255,255,.06))", padding:"48px var(--gutter, 40px)" }}>
        <div style={{ maxWidth:"var(--max-w, 1280px)", margin:"0 auto", display:"flex", flexWrap:"wrap", gap:32, justifyContent:"center", alignItems:"center" }}>
          {[
            { icon:"🔒", title:"Your Privacy Matters", desc:"We never sell your photos or data. All media belongs entirely to you." },
            { icon:"🗑️", title:"Data Retention", desc:"Event photos are securely stored for 30 days post-event, then deleted unless you request otherwise." },
            { icon:"✉️", title:"No Spam", desc:"Your contact details are used solely to manage your booking. Unsubscribe anytime." },
          ].map(({ icon, title, desc },i)=>(
            <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", maxWidth:300, flex:"1 1 220px" }}>
              <span style={{ fontSize:22, flexShrink:0, marginTop:2 }}>{icon}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--gold-light, #d4af37)", marginBottom:4 }}>{title}</p>
                <p style={{ fontSize:12, color:"rgba(240,232,216,.5)", lineHeight:1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ══ */}
      <section style={{
        background:`linear-gradient(rgba(13,11,8,.82),rgba(13,11,8,.82)), url(${wedding1}) center/cover no-repeat`,
        padding:"100px var(--gutter, 40px)",
        textAlign:"center",
        borderTop:"1px solid var(--border, rgba(255,255,255,.1))",
      }}>
        <p style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gold, #b8860b)", marginBottom:16 }}>Start Planning</p>
        <h2 style={{
          fontFamily:"var(--ff-display, Georgia, serif)",
          fontSize:"clamp(2rem,5vw,3.6rem)",
          fontWeight:500, marginBottom:18,
          maxWidth:640, margin:"0 auto 18px",
          lineHeight:1.15,
        }}>
          Your date is waiting — let's make it <em style={{ color:"var(--gold-pale, #e8d5a0)" }}>extraordinary.</em>
        </h2>
        <p style={{ fontSize:14, color:"var(--text-dim, rgba(240,232,216,.5))", marginBottom:40, maxWidth:420, margin:"0 auto 40px", lineHeight:1.75 }}>
          Limited availability each month. Reach out today and we'll craft the perfect package for your event.
        </p>
        <div className="cta-btns" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/contact" className="btn btn-gold">
            Book Your Date
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link to="/packages" className="btn btn-ghost">Explore Packages</Link>
        </div>
      </section>

    </div>
  );
}

/* ── Service Card sub-component ── */
function ServiceCard({ s, visible, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="service-card"
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative", overflow:"hidden",
        height:480,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(32px)",
        transition:`all .8s ${delay}s ease-out`,
        cursor:"pointer",
      }}>
      <img src={s.img} alt={s.title} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        objectFit:"cover",
        transform: hov ? "scale(1.06)" : "scale(1)",
        transition:"transform .65s ease-out",
        filter:"brightness(.55) saturate(.85)",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background: hov
          ? "linear-gradient(to top, rgba(13,11,8,.94) 40%, rgba(13,11,8,.2) 100%)"
          : "linear-gradient(to top, rgba(13,11,8,.82) 30%, rgba(13,11,8,.1) 100%)",
        transition:"background .4s",
      }}/>
      {s.tag && (
        <div style={{
          position:"absolute", top:18, right:18,
          padding:"4px 11px",
          background:"var(--gold, #b8860b)", color:"var(--ink, #0d0b08)",
          fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
          borderRadius:1,
        }}>
          {s.tag}
        </div>
      )}
      <div style={{ position:"absolute", inset:0, padding:"28px", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:11, letterSpacing:"0.14em", color:"var(--gold-light, #d4af37)", textTransform:"uppercase", marginBottom:9 }}>
          {s.num}
        </p>
        <h3 style={{ fontFamily:"var(--ff-display, Georgia, serif)", fontSize:"1.5rem", fontWeight:500, lineHeight:1.2, marginBottom:12 }}>
          {s.title}
        </h3>
        <p style={{
          fontSize:13, color:"rgba(240,232,216,.72)", lineHeight:1.75,
          maxHeight: hov ? "100px" : "0px",
          overflow:"hidden",
          transition:"max-height .45s ease-out, opacity .4s",
          opacity: hov ? 1 : 0,
          marginBottom: hov ? 18 : 0,
        }}>
          {s.desc}
        </p>
        <Link to="/packages" style={{
          fontSize:12, color:"var(--gold, #b8860b)", textDecoration:"none",
          display:"flex", alignItems:"center", gap:6, letterSpacing:"0.08em", fontWeight:500,
          opacity: hov ? 1 : 0.55,
          transform: hov ? "none" : "translateY(6px)",
          transition:"all .35s ease-out",
        }}>
          Learn More <span>→</span>
        </Link>
      </div>
    </div>
  );
}