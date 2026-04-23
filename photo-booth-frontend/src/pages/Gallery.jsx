import { useState, useRef, useEffect } from "react";
import {
  wedding1, wedding2, wedding3, wedding4,
  corporate1, corporate2, corporate3,
  party1, party2, party3,
  booth360_1, booth360_2, booth360_3,
  gala1, gala2,
} from "../assets/index.js";

const ALL = [
  { id:1,  cat:"Weddings",  img:wedding1,   size:"large" },
  { id:2,  cat:"360°",      img:booth360_1,  size:"tall" },
  { id:3,  cat:"Corporate", img:corporate1,  size:"normal" },
  { id:4,  cat:"Birthdays", img:party1,      size:"normal" },
  { id:5,  cat:"Weddings",  img:wedding2,    size:"wide" },
  { id:6,  cat:"Galas",     img:gala1,       size:"normal" },
  { id:7,  cat:"360°",      img:booth360_2,  size:"normal" },
  { id:8,  cat:"Weddings",  img:wedding3,    size:"normal" },
  { id:9,  cat:"Corporate", img:corporate2,  size:"tall" },
  { id:10, cat:"Birthdays", img:party2,      size:"wide" },
  { id:11, cat:"Galas",     img:gala2,       size:"normal" },
  { id:12, cat:"360°",      img:booth360_3,  size:"normal" },
  { id:13, cat:"Corporate", img:corporate3,  size:"normal" },
  { id:14, cat:"Birthdays", img:party3,      size:"normal" },
  { id:15, cat:"Weddings",  img:wedding4,    size:"normal" },
];

const CATS = ["All","Weddings","Corporate","Birthdays","360°","Galas"];

export default function Gallery() {
  const [active, setActive] = useState("All");
  const [lb, setLb] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(()=>setLoaded(true),80); }, []);

  const items = active === "All" ? ALL : ALL.filter(i=>i.cat===active);

  /* lock body scroll when lightbox open */
  useEffect(() => { document.body.style.overflow = lb ? "hidden" : ""; }, [lb]);

  const prev = () => { const idx=items.findIndex(i=>i.id===lb.id); setLb(items[(idx-1+items.length)%items.length]); };
  const next = () => { const idx=items.findIndex(i=>i.id===lb.id); setLb(items[(idx+1)%items.length]); };

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>

      {/* Header */}
      <div style={{
        background:"var(--surface)",
        borderBottom:"1px solid var(--border)",
        padding:"80px var(--gutter) 72px",
      }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto" }}>
          <p className="eyebrow fade-up d1">Portfolio</p>
          <h1 className="heading-xl fade-up d2">
            Moments we've <span className="em">crafted</span>
          </h1>
          <hr className="rule fade-up d3"/>
          <p style={{ fontSize:15, color:"var(--text-dim)", maxWidth:480, lineHeight:1.8 }} className="fade-up d4">
            Every event is unique. Every photo tells a story. Here's a look at the memories we've helped create.
          </p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div style={{
        position:"sticky", top:"var(--nav-h)", zIndex:200,
        background:"rgba(13,11,8,.96)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid var(--border-soft)",
        padding:"0 var(--gutter)",
      }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", display:"flex", gap:4 }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setActive(c)} style={{
              padding:"16px 20px",
              background:"none", border:"none",
              fontFamily:"var(--ff-sans)", fontSize:13, fontWeight: active===c ? 500 : 400,
              letterSpacing:"0.06em",
              color: active===c ? "var(--gold-light)" : "var(--text-dim)",
              borderBottom: active===c ? "2px solid var(--gold)" : "2px solid transparent",
              transition:"color .25s, border-color .25s",
              whiteSpace:"nowrap",
              marginBottom:"-1px",
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        maxWidth:"var(--max-w)", margin:"0 auto",
        padding:"48px var(--gutter) 96px",
      }}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gridAutoRows:"220px",
          gap:3,
        }}>
          {items.map((item,i)=>(
            <GalleryItem
              key={item.id} item={item} index={i}
              loaded={loaded}
              onOpen={()=>setLb(item)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lb && (
        <div
          onClick={()=>setLb(null)}
          style={{
            position:"fixed", inset:0, zIndex:3000,
            background:"rgba(0,0,0,.92)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"fadeIn .25s ease",
          }}>
          {/* Prev */}
          <button onClick={e=>{e.stopPropagation();prev();}} style={{
            position:"absolute", left:24,
            width:44, height:44, borderRadius:"50%",
            background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
            color:"#fff", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center",
          }}>‹</button>

          {/* Image */}
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:"80vw", maxHeight:"82vh", position:"relative" }}>
            <img src={lb.img} alt={lb.cat} style={{ maxWidth:"80vw", maxHeight:"80vh", objectFit:"contain", display:"block" }}/>
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              background:"linear-gradient(to top,rgba(0,0,0,.7),transparent)",
              padding:"20px 24px",
            }}>
              <span style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,.6)" }}>{lb.cat}</span>
            </div>
          </div>

          {/* Next */}
          <button onClick={e=>{e.stopPropagation();next();}} style={{
            position:"absolute", right:24,
            width:44, height:44, borderRadius:"50%",
            background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
            color:"#fff", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center",
          }}>›</button>

          {/* Close */}
          <button onClick={()=>setLb(null)} style={{
            position:"absolute", top:20, right:20,
            width:38, height:38, borderRadius:"50%",
            background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
            color:"#fff", fontSize:16,
          }}>✕</button>
        </div>
      )}
    </div>
  );
}

function GalleryItem({ item, index, loaded, onOpen }) {
  const [hov, setHov] = useState(false);
  const sizeStyle = item.size==="large"
    ? { gridColumn:"span 2", gridRow:"span 2" }
    : item.size==="tall"  ? { gridRow:"span 2" }
    : item.size==="wide"  ? { gridColumn:"span 2" }
    : {};
  return (
    <div
      onClick={onOpen}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        ...sizeStyle,
        position:"relative", overflow:"hidden",
        cursor:"none",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "none" : "scale(.96)",
        transition:`opacity .6s ${index*.05}s, transform .6s ${index*.05}s var(--ease-out)`,
      }}>
      <img src={item.img} alt={item.cat} style={{
        width:"100%", height:"100%", objectFit:"cover",
        transform: hov ? "scale(1.07)" : "scale(1)",
        transition:"transform .65s var(--ease-out)",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background: hov ? "rgba(13,11,8,.44)" : "rgba(13,11,8,.18)",
        transition:"background .35s",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {hov && (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.7)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
            <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,.75)" }}>View</p>
          </div>
        )}
      </div>
      {/* Category label */}
      <div style={{
        position:"absolute", bottom:14, left:14,
        opacity: hov ? 0 : 1, transition:"opacity .3s",
      }}>
        <span style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,.55)" }}>{item.cat}</span>
      </div>
    </div>
  );
}
