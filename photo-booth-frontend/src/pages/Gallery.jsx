import { useState, useEffect } from "react";

import image1  from '../assets/image1.jpg'
import image2  from '../assets/image2.jpg'
import image3  from '../assets/image3.jpg'
import image4  from '../assets/image4.jpg'
import image5  from '../assets/image5.jpg'
import image6  from '../assets/image6.jpg'
import image7  from '../assets/image7.jpg'
import image8  from '../assets/image8.jpg'
import image9  from '../assets/image9.jpg'
import image10 from '../assets/image10.jpg'
import image11 from '../assets/image11.jpg'
import image12 from '../assets/image12.jpg'
import image13 from '../assets/image13.jpg'
import image14 from '../assets/image14.jpg'
import image15 from '../assets/image15.jpg'
import image16 from '../assets/image16.jpg'
import image17 from '../assets/image17.jpg'
import image18 from '../assets/image18.jpg'
import image19 from '../assets/image19.jpg'
import image20 from '../assets/image20.jpg'
import image21 from '../assets/image21.jpg'
import image22 from '../assets/image22.jpg'
import image23 from '../assets/image23.jpg'
import image24 from '../assets/image24.jpg'

const PAIRS = [
  { id:"p1",  left:{ img:image1  }, right:{ img:image13 } },
  { id:"p2",  left:{ img:image2  }, right:{ img:image14 } },
  { id:"p3",  left:{ img:image3  }, right:{ img:image15 } },
  { id:"p4",  left:{ img:image4  }, right:{ img:image16 } },
  { id:"p5",  left:{ img:image5  }, right:{ img:image17 } },
  { id:"p6",  left:{ img:image6  }, right:{ img:image18 } },
  { id:"p7",  left:{ img:image7  }, right:{ img:image19 } },
  { id:"p8",  left:{ img:image8  }, right:{ img:image20 } },
  { id:"p9",  left:{ img:image9  }, right:{ img:image21 } },
  { id:"p10", left:{ img:image10 }, right:{ img:image22 } },
  { id:"p11", left:{ img:image11 }, right:{ img:image23 } },
  { id:"p12", left:{ img:image12 }, right:{ img:image24 } },
];

const ALL_FLAT = [
  image1,  image13, image2,  image14, image3,  image15,
  image4,  image16, image5,  image17, image6,  image18,
  image7,  image19, image8,  image20, image9,  image21,
  image10, image22, image11, image23, image12, image24,
];

export default function Gallery() {
  const [lb, setLb]         = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);
  useEffect(() => { document.body.style.overflow = lb ? "hidden" : ""; }, [lb]);

  const openLb = (src) => {
    const idx = ALL_FLAT.indexOf(src);
    setLb({ src, index: idx });
  };

  const prev = () => {
    const newIdx = (lb.index - 1 + ALL_FLAT.length) % ALL_FLAT.length;
    setLb({ src: ALL_FLAT[newIdx], index: newIdx });
  };
  const next = () => {
    const newIdx = (lb.index + 1) % ALL_FLAT.length;
    setLb({ src: ALL_FLAT[newIdx], index: newIdx });
  };

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>

      {/* Header */}
      <div style={{
        background:"var(--surface)",
        borderBottom:"1px solid var(--border)",
        padding:"60px var(--gutter) 56px",
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

      {/* Grid */}
      <div style={{
        maxWidth:"var(--max-w)", margin:"0 auto",
        padding:"40px var(--gutter) 80px",
      }}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",
          gap:6,
        }}>
          {PAIRS.map((pair, pi) => (
            <div key={pair.id} style={{
              display:"grid",
              gridTemplateColumns:"1fr 1fr",
              gap:4,
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(12px)",
              transition:`opacity .5s ${pi * .05}s, transform .5s ${pi * .05}s`,
            }}>
              <GalleryItem img={pair.left.img}  onOpen={() => openLb(pair.left.img)}  />
              <GalleryItem img={pair.right.img} onOpen={() => openLb(pair.right.img)} />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lb && (
        <div
          onClick={() => setLb(null)}
          style={{
            position:"fixed", inset:0, zIndex:3000,
            background:"rgba(0,0,0,.93)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>

          <button onClick={e => { e.stopPropagation(); prev(); }} style={{
            position:"absolute", left:12, zIndex:10,
            width:44, height:44, borderRadius:"50%",
            background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
            color:"#fff", fontSize:24, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>‹</button>

          <div onClick={e => e.stopPropagation()} style={{
            maxWidth:"92vw", maxHeight:"90vh",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <img src={lb.src} alt="gallery" style={{
              maxWidth:"90vw", maxHeight:"88vh",
              objectFit:"contain", display:"block", borderRadius:6,
            }}/>
          </div>

          <button onClick={e => { e.stopPropagation(); next(); }} style={{
            position:"absolute", right:12, zIndex:10,
            width:44, height:44, borderRadius:"50%",
            background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
            color:"#fff", fontSize:24, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>›</button>

          <button onClick={() => setLb(null)} style={{
            position:"absolute", top:14, right:14, zIndex:10,
            width:36, height:36, borderRadius:"50%",
            background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
            color:"#fff", fontSize:15, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>

          <div style={{
            position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
            fontSize:12, color:"rgba(255,255,255,.5)", letterSpacing:"0.1em",
          }}>
            {lb.index + 1} / {ALL_FLAT.length}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryItem({ img, onOpen }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative", overflow:"hidden",
        cursor:"pointer", borderRadius:4,
      }}>
      <img src={img} alt="gallery" style={{
        width:"100%", height:"auto", display:"block",
        transform: hov ? "scale(1.04)" : "scale(1)",
        transition:"transform .5s ease",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background: hov ? "rgba(0,0,0,.4)" : "rgba(0,0,0,.06)",
        transition:"background .3s",
        display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:4,
      }}>
        {hov && (
          <div style={{ textAlign:"center" }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              border:"1.5px solid rgba(255,255,255,.85)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 6px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
            <p style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,.85)", margin:0 }}>View</p>
          </div>
        )}
      </div>
    </div>
  );
}