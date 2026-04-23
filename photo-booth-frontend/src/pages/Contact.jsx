import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", eventType:"", date:"", guests:"", message:"" });
  const [focus, setFocus] = useState("");
  const [sent, setSent] = useState(false);

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const submit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
  name: form.name,
  email: form.email,
  phone: form.phone,
  eventType: form.eventType,
  date: form.date,
  guests: form.guests,
  message: form.message,
}),
    });

    const data = await res.json();

    if (res.ok) {
      setSent(true);
    } else {
      alert("Error: " + data.error);
    }

  } catch (error) {
    alert("Server error");
  }
};

  const fi = key => ({
    background:"var(--surface2)",
    border:`1px solid ${focus===key ? "var(--gold)" : "var(--border-soft)"}`,
    borderRadius:0,
    padding:"12px 16px",
    fontSize:14,
    color:"var(--text-main)",
    outline:"none",
    width:"100%",
    fontFamily:"var(--ff-sans)",
    transition:"border-color .25s",
  });

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>

      {/* Header */}
      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"80px var(--gutter) 72px" }}>
        <div style={{ maxWidth:"var(--max-w)", margin:"0 auto" }}>
          <p className="eyebrow fade-up d1">Get In Touch</p>
          <h1 className="heading-xl fade-up d2">Let's plan something <span className="em">incredible</span></h1>
          <hr className="rule fade-up d3"/>
          <p style={{ fontSize:15, color:"var(--text-dim)", maxWidth:460, lineHeight:1.8 }} className="fade-up d4">
            Fill in the details below and we'll come back to you within 24 hours with a personalised quote.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"var(--max-w)", margin:"0 auto", padding:"72px var(--gutter) 112px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:64, alignItems:"start" }}>

          {/* Form */}
          {sent ? (
            <div style={{ background:"var(--surface2)", padding:"64px 48px", border:"1px solid var(--border)", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--gold-muted)", border:"1px solid var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:22 }}>
                ✓
              </div>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"2rem", fontWeight:500, marginBottom:12 }}>
                We've got your inquiry!
              </h2>
              <p style={{ fontSize:14, color:"var(--text-dim)", lineHeight:1.85, maxWidth:360, margin:"0 auto 32px" }}>
                Our team will review your details and reach out within 24 hours. We can't wait to work with you.
              </p>
              <button onClick={()=>setSent(false)} className="btn btn-ghost">Send Another</button>
            </div>
          ) : (



            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Full Name *</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Your full name"
                    onFocus={()=>setFocus("name")} onBlur={()=>setFocus("")} style={fi("name")}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="your@email.com"
                    onFocus={()=>setFocus("email")} onBlur={()=>setFocus("")} style={fi("email")}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Phone</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000"
                    onFocus={()=>setFocus("phone")} onBlur={()=>setFocus("")} style={fi("phone")}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Event Type *</label>
                  <select required value={form.eventType} onChange={set("eventType")}
                    onFocus={()=>setFocus("eventType")} onBlur={()=>setFocus("")}
                    style={{ ...fi("eventType"), color: form.eventType ? "var(--text-main)" : "var(--text-faint)" }}>
                    <option value="" disabled>Select type</option>
                    {["Wedding","Birthday","Corporate","Gala","Graduation","Anniversary","Other"].map(o=>(
                      <option key={o} value={o} style={{ background:"var(--surface)" }}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Event Date *</label>
                  <input required type="date" value={form.date} onChange={set("date")}
                    onFocus={()=>setFocus("date")} onBlur={()=>setFocus("")}
                    style={{ ...fi("date"), colorScheme:"dark" }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Guest Count</label>
                  <input value={form.guests} onChange={set("guests")} placeholder="e.g. 150"
                    onFocus={()=>setFocus("guests")} onBlur={()=>setFocus("")} style={fi("guests")}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Your Vision</label>
                <textarea value={form.message} onChange={set("message")} rows={5}
                  placeholder="Tell us about your event, packages you're interested in, or any special requests..."
                  onFocus={()=>setFocus("message")} onBlur={()=>setFocus("")}
                  style={{ ...fi("message"), resize:"vertical", lineHeight:1.7 }}/>
              </div>
              <button type="submit" className="btn btn-gold" style={{ padding:"15px 36px", marginTop:4 }}>
                Submit Inquiry
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </form>
          )}

          {/* Info */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"var(--surface2)", padding:"36px", border:"1px solid var(--border-soft)" }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:24, paddingBottom:18, borderBottom:"1px solid var(--border-soft)" }}>
                Contact Info
              </p>
              {[
                { icon:"✉", label:"Email",    val:"Memorify.ca@gmail.com" },
                { icon:"✆", label:"Phone",    val:"+1 (555) 000-0000" },
        
              ].map(({ icon,label,val })=>(
                <div key={label} style={{ display:"flex", gap:14, marginBottom:20, alignItems:"flex-start" }}>
                  <span style={{ color:"var(--gold)", width:18, marginTop:2 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--text-faint)", marginBottom:2 }}>{label}</p>
                    <p style={{ fontSize:14, color:"var(--text-main)" }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>

         <div style={{ background:"var(--surface2)", padding:"28px 32px", border:"1px solid var(--border-soft)" }}>
  
  <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:18 }}>
    Services
  </p>

  <div style={{ fontSize:13, lineHeight:1.8, color:"var(--text-main)" }}>
    <p>• Photo Booth with Prints</p>
    <p>• Digital Photo Booth</p>
    <p>• Audio Guest Book</p>
    <p>• Guest Book (Photo Album)</p>
  </div>

  <p style={{ fontSize:11.5, color:"var(--text-dim)", marginTop:12, lineHeight:1.7 }}>
    Available for weddings, birthdays, and all types of events.
  </p>

</div>

            <div style={{
              padding:"20px 24px",
              background:"rgba(184,134,11,.07)",
              border:"1px solid rgba(184,134,11,.2)",
              display:"flex", alignItems:"center", gap:14,
            }}>
              <span style={{ fontSize:20, color:"var(--gold)" }}>✓</span>
              <div>
                <p style={{ fontSize:13, fontWeight:500, color:"var(--text-main)" }}>Response Guaranteed</p>
                <p style={{ fontSize:12, color:"var(--text-dim)", marginTop:2 }}>We reply to all inquiries within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
