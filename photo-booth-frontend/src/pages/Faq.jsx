import { useState } from "react";
import { Link } from "react-router-dom";

const DATA = [
  { cat:"Booking", items:[
    { q:"How far in advance should I book?", a:"For standard events, 4–6 weeks is usually fine. For peak season (May–October) weddings and large corporate events, we strongly recommend 3–6 months. We do accommodate last-minute bookings based on availability — just reach out." },
    { q:"What's needed to secure my date?", a:"A 30% deposit and a signed service agreement lock in your event date. The remaining balance is due 7 days before your event." },
    { q:"Do you travel outside the metro area?", a:"Yes. Events within our standard service zone have no travel charge. Events beyond 30km incur a modest travel fee, which we'll quote upfront before you commit." },
  ]},
  { cat:"The Experience", items:[
    { q:"How long does setup take?", a:"Typical setup is 45–90 minutes depending on the package. We always arrive well ahead of your start time so everything is ready to go — no last-minute scrambling." },
    { q:"Can we customise the overlay template?", a:"Absolutely. Gold and Platinum packages include fully custom overlay design. We'll match your theme, colour palette, and branding to perfection." },
    { q:"What if something goes wrong with the equipment?", a:"We carry backup equipment to every single event. We've maintained a 100% event completion record across 500+ events. In the extremely unlikely case of a technical issue, we resolve it on-site — or you receive a full refund." },
  ]},
  { cat:"Photos & Delivery", items:[
    { q:"When do guests receive their photos?", a:"Prints are instant — guests walk away with their photo strip within seconds. Digital copies are uploaded to your private gallery within 24–48 hours after the event." },
    { q:"How long is the digital gallery hosted?", a:"Your gallery is hosted for 12 months post-event. We strongly recommend downloading and backing up your photos well before that window closes." },
    { q:"Can guests share directly from the booth?", a:"Yes! With our Social Kiosk add-on, guests can share via SMS, email, or scan a QR code — perfect for real-time event buzz and Instagram moments." },
  ]},
  { cat:"Pricing", items:[
    { q:"Are there hidden fees?", a:"Never. All pricing is transparent. The only potential extras are travel fees beyond our standard zone (quoted upfront) and optional add-ons you choose." },
    { q:"Do you offer corporate or repeat-client discounts?", a:"Yes — we have special pricing for corporate clients booking multiple events and returning clients. Reach out to discuss your specific needs." },
  ]},
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid var(--border-soft)" }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:"100%", background:"none", border:"none",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        gap:24, padding:"22px 0", textAlign:"left",
      }}>
        <span style={{ fontFamily:"var(--ff-display)", fontSize:"1.1rem", fontWeight:400, color:"var(--text-main)", lineHeight:1.4 }}>{q}</span>
        <span style={{ color:"var(--gold-light)", fontSize:22, lineHeight:1, flexShrink:0, transform: open?"rotate(45deg)":"none", transition:"transform .3s var(--ease-out)" }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? 300 : 0, overflow:"hidden",
        transition:"max-height .4s var(--ease-out)",
      }}>
        <p style={{ fontSize:14, color:"var(--text-dim)", lineHeight:1.9, paddingBottom:24, maxWidth:680 }}>{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  const [cat, setCat] = useState(null);
  const shown = cat ? DATA.filter(d=>d.cat===cat) : DATA;

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>

      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"80px var(--gutter) 72px" }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto" }}>
          <p className="eyebrow fade-up d1">FAQ</p>
          <h1 className="heading-xl fade-up d2">Everything you <span className="em">need to know</span></h1>
          <hr className="rule fade-up d3"/>
          <p style={{ fontSize:15, color:"var(--text-dim)", maxWidth:460, lineHeight:1.8 }} className="fade-up d4">
            Still have a question? Reach out directly — we're happy to help.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", padding:"72px var(--gutter) 112px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:64, alignItems:"start" }}>

          {/* Sidebar */}
          <div style={{ position:"sticky", top:"calc(var(--nav-h) + 32px)" }}>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:16 }}>
              Categories
            </p>
            {[null,...DATA.map(d=>d.cat)].map((c,i)=>(
              <button key={i} onClick={()=>setCat(c)} style={{
                display:"block", width:"100%", textAlign:"left",
                background:"none", border:"none",
                padding:"9px 12px",
                fontSize:14,
                color: cat===c ? "var(--gold-light)" : "var(--text-dim)",
                borderLeft: cat===c ? "2px solid var(--gold)" : "2px solid transparent",
                transition:"color .2s, border-color .2s",
              }}>
                {c ?? "All Questions"}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div style={{ display:"flex", flexDirection:"column", gap:48 }}>
            {shown.map(section=>(
              <div key={section.cat}>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:20 }}>
                  {section.cat}
                </p>
                {section.items.map((item,i)=><Item key={i} q={item.q} a={item.a}/>)}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop:80,
          padding:"52px 60px",
          background:"var(--surface2)",
          border:"1px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:40, flexWrap:"wrap",
        }}>
          <div>
            <p style={{ fontFamily:"var(--ff-display)", fontSize:"1.6rem", fontWeight:500, marginBottom:8 }}>
              Still have questions?
            </p>
            <p style={{ fontSize:14, color:"var(--text-dim)" }}>Our team will get back to you within 24 hours.</p>
          </div>
          <Link to="/contact" className="btn btn-gold">
            Contact Us
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
