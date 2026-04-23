import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  heroVideo,
  heroShot1, heroShot2, heroShot3,
  wedding1, wedding2,
  corporate1,
  party1,
  booth360_1,
  gala1,
  pkgClassic, pkg360, pkgAudio,
} from "../assets/index.js";

/* ── tiny hook: triggers when element enters viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
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
        let cur = 0, id = setInterval(() => {
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

const SERVICES = [
  {
    img: pkgClassic,
    num: "01",
    title: "Photo Booth with Prints",
    tag: null,
    desc: "2–4 hours photo booth with unlimited prints & instant Airdrop. Includes props, custom templates, backdrop (white or champagne), setup & attendant."
  },
  {
    img: pkg360,
    num: "02",
    title: "Digital Photo Booth",
    tag: "Popular",
    desc: "Unlimited digital photos with instant sharing via Airdrop. Includes props, custom templates, backdrop, and full setup with attendant."
  },
  {
    img: pkgAudio,
    num: "03",
    title: "Audio Guest Book",
    tag: "New",
    desc: "Guests leave voice messages during your event. All recordings delivered to you after the event — a unique memory experience."
  }
];



const GALLERY_PREVIEW = [
  { img:wedding1,    category:"Weddings",   span:"col-span-2 row-span-2" },
  { img:booth360_1,  category:"360°",       span:"" },
  { img:corporate1,  category:"Corporate",  span:"" },
  { img:party1,      category:"Birthdays",  span:"" },
  { img:gala1,       category:"Galas",      span:"" },
  { img:wedding2,    category:"Weddings",   span:"" },
];

const MARQUEE_WORDS = ["Weddings","Corporate Events","Sweet 16s","Galas","Product Launches","Anniversaries","Graduations","Birthdays"];

export default function Home() {
  const [heroReady, setHeroReady] = useState(false);
  const [statsRef, statsVis] = useInView();
  const [svcRef, svcVis] = useInView(0.1);
  const [gallRef, gallVis] = useInView(0.1);

  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setHeroReady(true), 120); }, []);


  return (
    <div className="app">

      {/* ═══════════════════════════════════════ HERO ══ */}
      <section style={{ position:"relative", height:"100vh", minHeight:680, overflow:"hidden", display:"flex", alignItems:"center" }}>

        {/* Video background */}
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay muted loop playsInline
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            animation:"videoKen 18s ease-in-out infinite",
            filter:"brightness(.45) saturate(.8)",
          }}
          onError={e => { e.target.style.display="none"; }}
        />

        {/* Overlay gradient */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to right, rgba(13,11,8,.82) 45%, rgba(13,11,8,.1) 100%)",
        }}/>
        {/* Bottom fade */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:180,
          background:"linear-gradient(to top, var(--ink), transparent)",
        }}/>

        {/* Content */}
        <div style={{
          position:"relative", zIndex:2,
          maxWidth:"var(--max-w)", margin:"0 auto", padding:"0 var(--gutter)",
          width:"100%",
        }}>
          {/* Live badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", marginBottom:28,
            border:"1px solid rgba(184,134,11,.35)",
            background:"rgba(184,134,11,.08)",
            borderRadius:2,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(12px)",
            transition:"all .7s .05s var(--ease-out)",
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--gold-light)", animation:"pulse 2s ease infinite" }}/>
            <span style={{ fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", fontWeight:500 }}>
              Booking 2025 & 2026 — Limited Dates
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:"var(--ff-display)", fontWeight:500,
            fontSize:"clamp(3rem,7vw,6.2rem)",
            lineHeight:1.06, letterSpacing:"-.02em",
            maxWidth:760,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(36px)",
            transition:"all .9s .15s var(--ease-out)",
          }}>
            Your event,<br/>
            <span style={{ fontStyle:"italic", color:"var(--gold-pale)" }}>beautifully</span> captured.
          </h1>

          <p style={{
            fontSize:17, color:"rgba(240,232,216,.72)", lineHeight:1.8,
            maxWidth:480, marginTop:24, marginBottom:40,
            fontWeight:300,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(24px)",
            transition:"all .85s .3s var(--ease-out)",
          }}>
           Photo booth services with prints, digital booth, audio guest book, and guest book — for weddings, parties, and all events.          </p>

          <div style={{
            display:"flex", gap:14, flexWrap:"wrap",
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "none" : "translateY(20px)",
            transition:"all .8s .45s var(--ease-out)",
          }}>
            <Link to="/contact" className="btn btn-gold">
              Get a Free Quote
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/gallery" className="btn btn-ghost">
              View Our Work
            </Link>
          </div>

          {/* Scroll cue */}
          <div style={{
            position:"absolute", bottom:48, left:"var(--gutter)",
            display:"flex", alignItems:"center", gap:12,
            opacity: heroReady ? 1 : 0,
            transition:"opacity 1s .9s",
          }}>
            <div style={{ width:1, height:44, background:"var(--gold)", opacity:.6 }}/>
            <span style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-dim)" }}>Scroll</span>
          </div>
        </div>

        {/* Floating photo strip (right side) */}
        <div style={{
          position:"absolute", right:"6%", top:"50%",
          transform:"translateY(-50%)",
          display:"flex", flexDirection:"column", gap:10,
          zIndex:2,
          opacity: heroReady ? 1 : 0,
          transition:"opacity 1.1s .5s var(--ease-out)",
        }}>
          {[
            { src:heroShot1, r:"-6deg", delay:"0s" },
            { src:heroShot2, r:"4deg",  delay:"0.18s" },
            { src:heroShot3, r:"-2deg", delay:"0.36s" },
          ].map((p,i)=>(
            <div key={i} style={{
              width:140, padding:"10px 10px 34px",
              background:"#fff",
              boxShadow:"0 12px 40px rgba(0,0,0,.55)",
              transform:`rotate(${p.r})`,
              animation:`floatY ${5.5+i*0.8}s ease-in-out infinite`,
              animationDelay:p.delay,
            }}>
              <img src={p.src} alt="" style={{ width:"100%", height:130, objectFit:"cover", display:"block" }}/>
              <p style={{ fontFamily:"'Caveat',cursive,var(--ff-sans)", fontSize:11, color:"#555", marginTop:8, textAlign:"center", letterSpacing:"0.04em" }}>
                {["captured ✨","unforgettable","your moment"][i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ MARQUEE STRIP ══ */}
      <div style={{
        background:"var(--gold)",
        overflow:"hidden", padding:"14px 0",
        borderTop:"1px solid rgba(0,0,0,.12)",
      }}>
        <div style={{
          display:"flex", gap:0,
          animation:"marqueeScroll 22s linear infinite",
          width:"max-content",
        }}>
          {[...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS].map((w,i)=>(
            <span key={i} style={{
              fontFamily:"var(--ff-display)", fontStyle:"italic",
              fontSize:15, color:i%2===0 ? "var(--ink)" : "rgba(13,11,8,.55)",
              padding:"0 32px", whiteSpace:"nowrap",
            }}>
              {w}
              <span style={{ margin:"0 12px 0 0", color:"rgba(13,11,8,.4)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════ STATS ══ */}
      <div ref={statsRef} style={{ background:"var(--surface)", borderBottom:"1px solid var(--border-soft)" }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", padding:"72px var(--gutter)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32 }}>
            {[
              { n:500,  s:"+",  label:"Events Captured" },
              { n:8,    s:" Yrs",label:"In Business" },
              { n:98,   s:"%",  label:"Client Satisfaction" },
              { n:50000,s:"+",  label:"Photos Delivered" },
            ].map((st,i)=>(
              <div key={i} style={{
                textAlign:"center", padding:"8px 0",
                opacity: statsVis ? 1 : 0,
                transform: statsVis ? "none" : "translateY(22px)",
                transition:`all .7s ${i*.09}s var(--ease-out)`,
              }}>
                <div style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2.4rem,4vw,3.6rem)", fontWeight:700, color:"var(--gold-light)", lineHeight:1, marginBottom:8 }}>
                  {statsVis && <Count to={st.n} suffix={st.s}/>}
                </div>
                <p style={{ fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", fontWeight:500 }}>
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════ SERVICES ══ */}
      <section ref={svcRef} style={{ background:"var(--ink)" }}>
        <div className="section">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:64, flexWrap:"wrap", gap:24 }}>
            <div>
              <p className="eyebrow">What We Offer</p>
              <h2 className="heading-xl">Experiences that<br/>define your <span className="em">celebration</span></h2>
            </div>
            <Link to="/packages" className="btn-text">
              All Packages <span>→</span>
            </Link>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:3 }}>
            {SERVICES.map((s,i)=>(
              <ServiceCard key={i} s={s} visible={svcVis} delay={i*.12}/>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ GALLERY PREVIEW ══ */}
      <section ref={gallRef} style={{ background:"var(--surface)" }}>
        <div className="section">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:20 }}>
            <div>
              <p className="eyebrow">Portfolio</p>
              <h2 className="heading-xl">A glimpse of the <span className="em">magic</span></h2>
            </div>
            <Link to="/gallery" className="btn-text">See Full Gallery <span>→</span></Link>
          </div>

          <div style={{
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
                transition:`all .7s ${i*.1}s var(--ease-out)`,
              }}>
                <img src={g.img} alt={g.category} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .6s var(--ease-out)" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                <div style={{
                  position:"absolute", inset:0,
                  background:"linear-gradient(to top, rgba(13,11,8,.7) 0%, transparent 55%)",
                  display:"flex", alignItems:"flex-end", padding:"18px 20px",
                }}>
                  <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(240,232,216,.7)" }}>
                    {g.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ════════════════════ EVENT TYPES ══ */}
      <section style={{ background:"var(--surface2)", borderTop:"1px solid var(--border-soft)" }}>
        <div className="section" style={{ textAlign:"center" }}>
          <p className="eyebrow">Perfect For</p>
          <h2 className="heading-xl" style={{ marginBottom:56 }}>
            Every occasion <span className="em">deserves</span> to be remembered
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {[
              ["Weddings & Engagements","photo booth rentals & 360° for your big day"],
              ["Corporate Events","branded activations for launches, galas & conferences"],
              ["Birthdays & Parties","make every celebration unforgettable"],
              ["Graduations","mark the milestone with style"],
              ["Anniversaries","renew the magic together"],
              ["Charity Galas","elevate your fundraiser experience"],
            ].map(([title,sub],i)=>(
              <div key={i} style={{
                padding:"40px 36px",
                background: i%2===0 ? "var(--surface3)" : "var(--surface)",
                border:"1px solid var(--border-soft)",
                transition:"background .3s",
                textAlign:"left",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--ink-light)";e.currentTarget.style.borderColor="var(--border)";}}
                onMouseLeave={e=>{e.currentTarget.style.background=i%2===0?"var(--surface3)":"var(--surface)";e.currentTarget.style.borderColor="var(--border-soft)";}}>
                <p style={{ fontFamily:"var(--ff-display)", fontSize:"1.25rem", fontWeight:500, marginBottom:8 }}>{title}</p>
                <p style={{ fontSize:13, color:"var(--text-dim)" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ══ */}
      <section style={{
        background:`linear-gradient(rgba(13,11,8,.78),rgba(13,11,8,.78)), url(${wedding1}) center/cover no-repeat`,
        padding:"120px var(--gutter)",
        textAlign:"center",
        borderTop:"1px solid var(--border)",
      }}>
        <p className="eyebrow">Start Planning</p>
        <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:500, marginBottom:20, maxWidth:680, margin:"0 auto 20px" }}>
          Your date is waiting — let's make it<br/><span className="em">extraordinary.</span>
        </h2>
        <p style={{ fontSize:15, color:"var(--text-dim)", marginBottom:44, maxWidth:440, margin:"0 auto 44px" }}>
          Limited availability each month. Reach out today and we'll craft the perfect package for your event.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
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
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative", overflow:"hidden",
        height:480,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(32px)",
        transition:`all .8s ${delay}s var(--ease-out)`,
      }}>
      {/* Photo */}
      <img src={s.img} alt={s.title} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        objectFit:"cover",
        transform: hov ? "scale(1.06)" : "scale(1)",
        transition:"transform .65s var(--ease-out)",
        filter: "brightness(.55) saturate(.85)",
      }}/>
      {/* Gradient */}
      <div style={{
        position:"absolute", inset:0,
        background: hov
          ? "linear-gradient(to top, rgba(13,11,8,.92) 40%, rgba(13,11,8,.2) 100%)"
          : "linear-gradient(to top, rgba(13,11,8,.82) 30%, rgba(13,11,8,.1) 100%)",
        transition:"background .4s",
      }}/>
      {/* Tag */}
      {s.tag && (
        <div style={{
          position:"absolute", top:20, right:20,
          padding:"5px 12px",
          background:"var(--gold)", color:"var(--ink)",
          fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
        }}>
          {s.tag}
        </div>
      )}
      {/* Content */}
      <div style={{ position:"absolute", inset:0, padding:"32px", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:11, letterSpacing:"0.14em", color:"var(--gold-light)", textTransform:"uppercase", marginBottom:10 }}>
          {s.num}
        </p>
        <h3 style={{ fontFamily:"var(--ff-display)", fontSize:"1.6rem", fontWeight:500, lineHeight:1.2, marginBottom:14 }}>
          {s.title}
        </h3>
        <p style={{
          fontSize:14, color:"rgba(240,232,216,.7)", lineHeight:1.75,
          maxHeight: hov ? "80px" : "0px",
          overflow:"hidden",
          transition:"max-height .45s var(--ease-out), opacity .4s",
          opacity: hov ? 1 : 0,
          marginBottom: hov ? 20 : 0,
        }}>
          {s.desc}
        </p>
        <Link to="/packages" className="btn-text" style={{
          opacity: hov ? 1 : 0.6,
          transform: hov ? "none" : "translateY(6px)",
          transition:"all .35s var(--ease-out)",
        }}>
          Learn More <span>→</span>
        </Link>
      </div>
    </div>
  );
}
