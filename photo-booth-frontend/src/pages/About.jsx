import { teamA, teamB, teamC, teamD, aboutHero } from "../assets/index.js";

const TEAM = [
  { name:"Alexandra Voss", role:"Founder & Creative Director", img:teamA, note:"8+ years in event photography" },
  { name:"Marcus Lim",     role:"Lead 360° Specialist",        img:teamB, note:"Former cinematographer" },
  { name:"Priya Sharma",   role:"Event Coordinator",           img:teamC, note:"Managed 200+ events" },
  { name:"Jordan Reed",    role:"Technical Director",           img:teamD, note:"AV & lighting expert" },
];

const VALUES = [
  { title:"Artistry First",      desc:"Every setup is a curated visual composition, not just gear in a corner." },
  { title:"Flawless Execution",  desc:"We arrive early, leave spotless, and eliminate every ounce of day-of stress." },
  { title:"Genuine Investment",  desc:"We treat every event like it's our own. 100% personal care, every time." },
  { title:"Always Evolving",     desc:"We continuously update our tech so your event features what's truly current." },
];

export default function About() {
  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>

      {/* Hero */}
      <div style={{
        height:480,
        background:`linear-gradient(rgba(13,11,8,.65),rgba(13,11,8,.65)) center/cover no-repeat, url(${aboutHero}) center/cover`,
        display:"flex", alignItems:"flex-end",
        padding:"0 var(--gutter) 72px",
      }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", width:"100%" }}>
          <p className="eyebrow fade-up d1">Our Story</p>
          <h1 className="heading-xl fade-up d2" style={{ maxWidth:640 }}>
            Born from a love of<br/><span className="em">capturing joy</span>
          </h1>
        </div>
      </div>

      {/* Intro */}
      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border-soft)" }}>
        <div className="section">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
            <div>
              <p className="eyebrow">How It Started</p>
              <h2 className="heading-lg" style={{ marginBottom:24 }}>From one booth to <span className="em">500+ events</span></h2>
              <hr className="rule"/>
              <p style={{ fontSize:15, color:"var(--text-dim)", lineHeight:1.9, marginBottom:20 }}>
                PhotoBooth started in 2017 at a friend's wedding with a single camera and a DIY backdrop. The reaction from guests told us everything — people <em>love</em> having a tangible, instant memory to take home.
              </p>
              <p style={{ fontSize:15, color:"var(--text-dim)", lineHeight:1.9 }}>
                Eight years and 500+ events later, we've grown into a full-service experiential photography company trusted by families, Fortune 500 companies, and event planners across the region.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
              {[
                { n:"500+", l:"Events Served" },
                { n:"8",    l:"Years of Experience" },
                { n:"98%",  l:"Client Satisfaction" },
                { n:"50K+", l:"Photos Delivered" },
              ].map(({ n, l })=>(
                <div key={l} style={{
                  background:"var(--surface2)",
                  padding:"40px 28px",
                  border:"1px solid var(--border-soft)",
                }}>
                  <p style={{ fontFamily:"var(--ff-display)", fontSize:"2.8rem", fontWeight:700, color:"var(--gold-light)", lineHeight:1 }}>{n}</p>
                  <p style={{ fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--text-dim)", marginTop:8 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ background:"var(--ink)" }}>
        <div className="section">
          <p className="eyebrow">What Drives Us</p>
          <h2 className="heading-xl" style={{ marginBottom:56 }}>Our <span className="em">values</span></h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2 }}>
            {VALUES.map((v,i)=>(
              <div key={i} style={{
                padding:"44px 36px",
                background: i%2===0 ? "var(--surface)" : "var(--surface2)",
                border:"1px solid var(--border-soft)",
              }}>
                <div style={{ width:36, height:36, border:"1px solid var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, color:"var(--gold-light)", fontSize:16 }}>
                  {["✦","◎","♡","↗"][i]}
                </div>
                <h3 style={{ fontFamily:"var(--ff-display)", fontSize:"1.25rem", fontWeight:500, marginBottom:12 }}>{v.title}</h3>
                <p style={{ fontSize:13.5, color:"var(--text-dim)", lineHeight:1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ background:"var(--surface)", borderTop:"1px solid var(--border-soft)" }}>
        <div className="section">
          <p className="eyebrow">The People</p>
          <h2 className="heading-xl" style={{ marginBottom:56 }}>Meet the <span className="em">team</span></h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {TEAM.map((m,i)=>(
              <div key={i} style={{ background:"var(--surface2)", border:"1px solid var(--border-soft)", overflow:"hidden" }}>
                <div style={{ height:220, overflow:"hidden" }}>
                  <img src={m.img} alt={m.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", transition:"transform .5s var(--ease-out)" }}
                    onMouseEnter={e=>e.target.style.transform="scale(1.06)"}
                    onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                </div>
                <div style={{ padding:"22px 20px" }}>
                  <p style={{ fontFamily:"var(--ff-display)", fontSize:"1.1rem", fontWeight:500, marginBottom:4 }}>{m.name}</p>
                  <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:8 }}>{m.role}</p>
                  <p style={{ fontSize:12.5, color:"var(--text-dim)" }}>{m.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
