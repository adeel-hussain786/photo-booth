import { useState } from "react";
import { Link } from "react-router-dom";
import { pkgClassic, pkgAudio } from "../assets/index.js";

const TABS = ["Photo Booth","Digital Booth","Audio Guest Book","Add-Ons"];

const PACKAGES = {

  "Photo Booth": [
    {
      name:"Silver",
      price:299,
      hours:2,
      img:pkgClassic,
      features:[
        "Fun props to engage your guests",
        "Unlimited photo strip prints",
        "Instant digital sharing (Airdrop)",
        "Friendly on-site attendant",
        "Customizable templates",
        "Backdrop (White or Champagne)",
        "Setup & teardown included",
        "Travel cost depends on distance (KM)",
        "All digital photos delivered within 1 week"
      ]
    },
    {
      name:"Gold",
      price:399,
      hours:3,
      img:pkgClassic,
      featured:true,
      features:[
        "Everything in Silver",
        "Unlimited prints + digital sharing",
        "Red carpet setup",
        "Premium event experience",
        "Backdrop (White or Champagne)",
        "Professional attendant",
        "Setup & teardown included",
        "Travel cost depends on distance (KM)",
        "All photos delivered within 1 week"
      ]
    },
    {
      name:"Premium",
      price:499,
      hours:4,
      img:pkgClassic,
      features:[
        "Everything in Gold",
        "Extended booth time",
        "Unlimited prints + digital",
        "Red carpet experience",
        "Luxury event feel",
        "Custom templates",
        "Full support attendant",
        "Setup & teardown included",
        "Travel cost depends on distance (KM)",
        "All photos delivered within 1 week"
      ]
    }
  ],

  "Digital Booth": [
    {
      name:"Digital Smart",
      price:199,
      hours:2,
      img:pkgClassic,
      featured:true,
      features:[
        "Fun props to engage your guests",
        "Unlimited digital photos",
        "Instant Airdrop sharing",
        "Friendly on-site attendant",
        "Customizable templates",
        "Backdrop (White or Champagne)",
        "Setup & teardown included",
        "Travel cost depends on distance (KM)",
        "All digital photos delivered within 1 week"
      ]
    }
  ],

  "Audio Guest Book": [
    {
      name:"Audio Experience",
      price:0,
      hours:0,
      img:pkgAudio,
      features:[
        "Guests record voice messages",
        "Beautiful audio memories",
        "Digital audio delivery",
        "Custom greeting message",
        "Perfect for weddings & special events"
      ]
    }
  ],

  "Add-Ons": [
    {
      name:"Red Carpet",
      price:0,
      hours:0,
      img:pkgClassic,
      features:["Elegant red carpet setup"]
    },
    {
      name:"Custom Template",
      price:0,
      hours:0,
      img:pkgClassic,
      features:["Personalized event design"]
    },
    {
      name:"Extra Hours",
      price:0,
      hours:0,
      img:pkgClassic,
      features:["Extend your booking anytime"]
    }
  ]
};

export default function Packages() {
  const [tab, setTab] = useState(TABS[0]);
  const pkgs = PACKAGES[tab];

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>
      <style>{`
        @media (max-width: 768px) {
          .pkg-cards { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
          .pkg-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pkg-tabs::-webkit-scrollbar { display: none; }
          .pkg-header { padding: 60px 20px 52px !important; }
          .pkg-body { padding: 40px 20px 80px !important; }
        }
        @media (max-width: 480px) {
          .pkg-cards { max-width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div className="pkg-header" style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"80px var(--gutter) 72px" }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto" }}>
          <p className="eyebrow fade-up d1">Pricing</p>
          <h1 className="heading-xl fade-up d2">
            Choose your perfect <span className="em">package</span>
          </h1>
          <hr className="rule fade-up d3"/>
          <p style={{ fontSize:15, color:"var(--text-dim)", maxWidth:500, lineHeight:1.8 }} className="fade-up d4">
            Affordable, premium, and fully customizable packages for your events.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="pkg-tabs" style={{
        position:"sticky", top:"var(--nav-h)", zIndex:200,
        background:"rgba(13,11,8,.96)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid var(--border-soft)",
        padding:"0 var(--gutter)",
        overflowX:"auto",
        WebkitOverflowScrolling:"touch",
      }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", display:"flex", minWidth:"max-content" }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"16px 22px",
              background:"none", border:"none",
              fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
              fontWeight: tab===t ? 500 : 400,
              color: tab===t ? "var(--gold-light)" : "var(--text-dim)",
              borderBottom: tab===t ? "2px solid var(--gold)" : "2px solid transparent",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="pkg-body" style={{ maxWidth:"var(--max-w)", margin:"0 auto", padding:"64px var(--gutter) 112px" }}>
        <div className="pkg-cards" style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(pkgs.length, 3)},1fr)`, gap:3 }}>
          {pkgs.map((pkg,i)=>(
            <div key={i} style={{
              background: pkg.featured ? "var(--surface2)" : "var(--surface)",
              border: pkg.featured ? "1px solid var(--gold)" : "1px solid var(--border-soft)",
              display:"flex", flexDirection:"column",
              boxShadow: pkg.featured ? "0 0 60px rgba(184,134,11,.1)" : "none",
            }}>
              <div style={{ height:220, overflow:"hidden" }}>
                <img src={pkg.img} alt={pkg.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
              <div style={{ padding:"28px", display:"flex", flexDirection:"column", gap:12, flex:1 }}>
                {pkg.featured && (
                  <span style={{
                    display:"inline-block", padding:"4px 12px",
                    background:"var(--gold)", color:"var(--ink)",
                    fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
                    alignSelf:"flex-start",
                  }}>Most Popular</span>
                )}
                <h3 style={{ fontSize:20 }}>{pkg.name}</h3>
                <p style={{ fontSize:28, fontWeight:"bold", color:"var(--gold-light)" }}>
                  {pkg.price ? `$${pkg.price}` : "Custom"}
                </p>
                {pkg.hours > 0 && (
                  <p style={{ fontSize:12, color:"var(--text-dim)" }}>{pkg.hours} Hours</p>
                )}
                <ul style={{ fontSize:13, lineHeight:1.8, flex:1 }}>
                  {pkg.features.map((f,j)=>(
                    <li key={j} style={{ marginBottom:4 }}>• {f}</li>
                  ))}
                </ul>
                <Link to="/contact" className="btn btn-gold" style={{ marginTop:10, textAlign:"center", justifyContent:"center" }}>
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}