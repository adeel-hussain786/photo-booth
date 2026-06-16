import { useState } from "react";
import { apiUrl } from "../lib/api";

const WHATSAPP_NUMBER = "16479704508";

export default function Contact() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", eventType:"", date:"", guests:"", message:"" });
  const [focus, setFocus] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      form.name,
          email:     form.email,
          phone:     form.phone,
          eventType: form.eventType,
          date:      form.date,
          guests:    form.guests,
          message:   form.message,
        }),
      });
      const data = await res.json();
      if (res.ok) { setSent(true); } else { alert("Error: " + data.error); }
    } catch (error) {
      alert("Could not connect to server. Please try WhatsApp instead.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent("Hi! I'd like to inquire about booking a photo booth for my event.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
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
    boxSizing:"border-box",
  });

  return (
    <div className="app" style={{ paddingTop:"var(--nav-h)" }}>
      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; }
          .contact-form-row { grid-template-columns: 1fr !important; }
          .contact-header { padding: 60px 20px 52px !important; }
          .contact-body { padding: 40px 20px 80px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="contact-header" style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"80px var(--gutter) 72px" }}>
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
      <div className="contact-body" style={{ maxWidth:"var(--max-w)", margin:"0 auto", padding:"72px var(--gutter) 112px" }}>
        <div className="contact-layout" style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:64, alignItems:"start" }}>

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
              <div className="contact-form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
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
              <div className="contact-form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-dim)", display:"block", marginBottom:8 }}>Phone</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="+1 (647) 970-4508"
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
              <div className="contact-form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
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
              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold"
                style={{ padding:"15px 36px", marginTop:4, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Sending..." : "Submit Inquiry"}
                {!loading && (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>
          )}

          {/* Info Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* WhatsApp Button */}
            <button onClick={openWhatsApp} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              width:"100%", padding:"16px 24px",
              background:"#25D366",
              border:"none", cursor:"pointer",
              transition:"background .25s, transform .15s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#1ebe5d"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#25D366"; e.currentTarget.style.transform="none"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span style={{ color:"white", fontWeight:600, fontSize:15, letterSpacing:"0.04em" }}>
                Chat on WhatsApp
              </span>
            </button>

            <div style={{ background:"var(--surface2)", padding:"36px", border:"1px solid var(--border-soft)" }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:24, paddingBottom:18, borderBottom:"1px solid var(--border-soft)" }}>
                Contact Info
              </p>
              {[
                { icon:"✉", label:"Email", val:"Memorify.ca@gmail.com" },
                { icon:"✆", label:"Phone", val:"+1 (647) 970-4508" },
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