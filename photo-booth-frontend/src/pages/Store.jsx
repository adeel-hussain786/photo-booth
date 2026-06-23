import { useState, useEffect } from "react";
import { apiUrl } from "../lib/api";
import magnetImg from "../assets/Magnet.jpeg";
import keychainImg from "../assets/keychain.jpeg";

const CURRENCY = "$"; // change to "Rs " etc. if you bill in another currency

const FALLBACK = (key) =>
  key.includes("magnet") ? magnetImg : key.includes("keychain") ? keychainImg : null;
const productImage = (p) => p.imageUrl || FALLBACK(p.productKey);
const isKeychain = (p) => p && p.productKey.includes("keychain");

const STEPS = ["Product", "Photos", "Preview", "Shipping", "Review"];
const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];
const DELIVERY = [
  { value: "Local Pickup (North York)", label: "Local Pickup — North York (Free)" },
  { value: "GTA Delivery", label: "GTA Delivery" },
  { value: "Canada Shipping", label: "Shipping across Canada" },
];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [photos, setPhotos] = useState([]); // single mode: [{file,url}]
  const [front, setFront] = useState([]); // double mode
  const [back, setBack] = useState([]); // double mode

  const [customer, setCustomer] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", province: "ON", postalCode: "",
    deliveryMethod: DELIVERY[0].value, notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    fetch(apiUrl("/api/products"))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const isDouble = selected && selected.photoMode === "double";
  const isBundle = selected && selected.unitCount > 1;
  const units = selected ? quantity * selected.unitCount : 0; // suggested photos
  const total = selected ? (selected.price * quantity).toFixed(2) : "0.00";

  // ─── photo helpers ───
  const toPreview = (fileList) =>
    Array.from(fileList || []).filter((f) => f.type.startsWith("image/")).map((file) => ({ file, url: URL.createObjectURL(file) }));
  // Build the preview list synchronously (right now), then append. If we let the
  // state updater read the FileList later, the input's value reset would already
  // have emptied it — which is why uploads "weren't getting" through.
  const addTo = (setter) => (fileList) => {
    const items = toPreview(fileList);
    setter((prev) => [...prev, ...items]);
  };
  const removeFrom = (list, setter) => (idx) => {
    URL.revokeObjectURL(list[idx].url);
    setter(list.filter((_, i) => i !== idx));
  };
  const resetPhotos = () => {
    [...photos, ...front, ...back].forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]); setFront([]); setBack([]);
  };

  const chooseProduct = (p) => {
    resetPhotos();
    setSelected(p);
    setQuantity(1);
    setStep(2);
  };

  // ─── step validation ───
  const canNext = () => {
    if (step === 1) return !!selected;
    if (step === 2) return isDouble ? front.length > 0 && back.length > 0 : photos.length > 0;
    if (step === 4) return customer.firstName.trim() && customer.lastName.trim() && customer.phone.trim();
    return true;
  };
  const next = () => { setError(""); if (canNext()) setStep((s) => Math.min(5, s + 1)); else setError(stepError()); };
  const prev = () => { setError(""); setStep((s) => Math.max(1, s - 1)); };
  const stepError = () => {
    if (step === 2) return isDouble ? "Please upload a front and a back photo." : "Please upload at least one photo.";
    if (step === 4) return "First name, last name and phone are required.";
    return "Please complete this step.";
  };

  const placeOrder = async () => {
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("customer", JSON.stringify(customer));
      fd.append("items", JSON.stringify([{ productKey: selected.productKey, quantity }]));
      if (isDouble) {
        front.forEach((p) => fd.append("item_0_front", p.file));
        back.forEach((p) => fd.append("item_0_back", p.file));
      } else {
        photos.forEach((p) => fd.append("item_0", p.file));
      }
      const res = await fetch(apiUrl("/api/orders"), { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not place your order."); return; }
      resetPhotos();
      setDone(data.orderId);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setDone(null); setSelected(null); setQuantity(1); resetPhotos(); setStep(1);
    setCustomer({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", province: "ON", postalCode: "", deliveryMethod: DELIVERY[0].value, notes: "" });
  };

  // ─── success ───
  if (done) {
    return (
      <div className="app" style={{ paddingTop: "var(--nav-h)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "100px var(--gutter) 120px", textAlign: "center" }}>
          <div style={{ fontSize: 46, marginBottom: 18 }}>✅</div>
          <h1 className="heading-xl">Order received!</h1>
          <hr className="rule" style={{ margin: "20px auto 26px" }} />
          <p style={{ color: "var(--text-dim)", fontSize: 15, lineHeight: 1.8 }}>
            Thank you. Your order has been received — our team will contact you shortly to
            confirm <b>payment</b> and {customer.deliveryMethod?.includes("Pickup") ? "pickup" : "delivery"} details.
          </p>
          <p style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 18 }}>Reference: {done}</p>
          <button className="btn btn-gold" style={{ marginTop: 30 }} onClick={restart}>Place another order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ paddingTop: "var(--nav-h)" }}>
      <style>{css}</style>

      {/* Hero */}
      <div className="store-header" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "56px var(--gutter) 48px" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <p className="eyebrow fade-up d1">Memorify Store</p>
          <h1 className="heading-xl fade-up d2">Turn Your Favourite Memories Into <span className="em">Personalized Keepsakes</span></h1>
          <hr className="rule fade-up d3" />
          <p className="fade-up d4" style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 560, lineHeight: 1.8 }}>
            Photo magnets &amp; keychains, professionally printed in Toronto. Pickup in North York or shipping across Canada.
          </p>
        </div>
      </div>

      <div className="store-body" style={{ maxWidth: 980, margin: "0 auto", padding: "40px var(--gutter) 64px" }}>
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "todo";
            return (
              <div key={label} className={`step step-${state}`}>
                <span className="step-dot">{n < step ? "✓" : n}</span>
                <span className="step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {error && <div className="store-error">{error}</div>}

        {/* ── STEP 1: choose product ── */}
        {step === 1 && (
          loading ? <p style={{ color: "var(--text-dim)" }}>Loading products…</p> : (
            <div className="prod-grid">
              {products.map((p) => (
                <button key={p.productKey} className={`prod-card ${selected?.productKey === p.productKey ? "sel" : ""}`} onClick={() => chooseProduct(p)}>
                  <div className="prod-media">{productImage(p) ? <img src={productImage(p)} alt={p.name} /> : <span>No photo</span>}</div>
                  <div className="prod-info">
                    <h3>{p.name}</h3>
                    <p className="prod-price">{CURRENCY}{Number(p.price).toFixed(2)}</p>
                    <p className="prod-desc">{p.description}</p>
                    <span className="prod-cta">Select →</span>
                  </div>
                </button>
              ))}
            </div>
          )
        )}

        {/* ── STEP 2: upload photos ── */}
        {step === 2 && selected && (
          <div className="panel">
            <h2 className="panel-title">{selected.name}</h2>
            {!isBundle && (
              <label className="qty-row">Quantity:&nbsp;
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} />
              </label>
            )}
            <p className="hint">
              {isDouble
                ? "This keychain has two sides — upload a Front and a Back photo."
                : `Upload your photo${units > 1 ? `s — up to ${units} (one per item)` : ""}.`}
            </p>

            {isDouble ? (
              <div className="dual">
                <Uploader label="Front photo" items={front} onAdd={addTo(setFront)} onRemove={removeFrom(front, setFront)} />
                <Uploader label="Back photo" items={back} onAdd={addTo(setBack)} onRemove={removeFrom(back, setBack)} />
              </div>
            ) : (
              <Uploader label="Your photos" items={photos} onAdd={addTo(setPhotos)} onRemove={removeFrom(photos, setPhotos)} max={units || undefined} />
            )}
          </div>
        )}

        {/* ── STEP 3: preview ── */}
        {step === 3 && selected && (
          <div className="panel">
            <h2 className="panel-title">Preview</h2>
            <p className="hint">Here's how your {selected.name.toLowerCase()} will look. This is an approximate preview.</p>
            <div className="preview-grid">
              {isDouble
                ? front.map((f, i) => (
                    <div key={i} className="kc-pair">
                      <Mockup product={selected} url={f.url} caption="Front" />
                      <Mockup product={selected} url={(back[i] || back[0])?.url} caption="Back" />
                    </div>
                  ))
                : photos.map((p, i) => <Mockup key={i} product={selected} url={p.url} />)}
            </div>
          </div>
        )}

        {/* ── STEP 4: shipping ── */}
        {step === 4 && (
          <div className="panel">
            <h2 className="panel-title">Your Details</h2>
            <div className="form-grid">
              <input className="fld" placeholder="First name *" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} />
              <input className="fld" placeholder="Last name *" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} />
              <input className="fld" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              <input className="fld" placeholder="Phone *" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              <input className="fld" placeholder="Street address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              <input className="fld" placeholder="City" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
              <select className="fld" value={customer.province} onChange={(e) => setCustomer({ ...customer, province: e.target.value })}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input className="fld" placeholder="Postal code" value={customer.postalCode} onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })} />
            </div>
            <label className="fld-label">Delivery option</label>
            <select className="fld" value={customer.deliveryMethod} onChange={(e) => setCustomer({ ...customer, deliveryMethod: e.target.value })}>
              {DELIVERY.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <textarea className="fld" style={{ marginTop: 12, minHeight: 70, resize: "vertical" }} placeholder="Notes / instructions (optional)" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
          </div>
        )}

        {/* ── STEP 5: review & place ── */}
        {step === 5 && selected && (
          <div className="panel">
            <h2 className="panel-title">Review &amp; Place Order</h2>
            <div className="review">
              <div><b>{selected.name}</b> × {quantity}</div>
              <div>{isDouble ? `${front.length} front / ${back.length} back photo(s)` : `${photos.length} photo(s)`}</div>
              <div>{customer.firstName} {customer.lastName} · {customer.phone}</div>
              {customer.email && <div>{customer.email}</div>}
              <div>{[customer.address, customer.city, customer.province, customer.postalCode].filter(Boolean).join(", ")}</div>
              <div>Delivery: {customer.deliveryMethod}</div>
              {customer.notes && <div>Notes: {customer.notes}</div>}
              <div className="review-total">Estimated total: <b>{CURRENCY}{total}</b></div>
            </div>
            <p className="hint">No payment now — we'll contact you to confirm payment (bank transfer) and delivery.</p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="wiz-nav">
          {step > 1 && <button className="btn btn-ghost" onClick={prev} disabled={submitting}>← Back</button>}
          <span style={{ flex: 1 }} />
          {step < 5 && step > 1 && <button className="btn btn-gold" onClick={next}>Next →</button>}
          {step === 5 && <button className="btn btn-gold" onClick={placeOrder} disabled={submitting}>{submitting ? "Placing…" : "Place Order"}</button>}
        </div>
      </div>

      {/* Content sections */}
      <Sections />
    </div>
  );
}

// ── Reusable uploader (drag & drop) ──
function Uploader({ label, items, onAdd, onRemove, max }) {
  const [drag, setDrag] = useState(false);
  // Respect an optional cap (e.g. a bundle of 4 shouldn't accept 10 photos).
  // Only the first `remaining` files from a drop/selection are kept.
  const capped = (fileList) => {
    if (!max) return fileList;
    const remaining = Math.max(0, max - items.length);
    return Array.from(fileList || []).slice(0, remaining);
  };
  const atLimit = max ? items.length >= max : false;
  return (
    <div style={{ flex: 1 }}>
      <label className="fld-label">{label}{max ? ` (up to ${max})` : ""}</label>
      <label
        className={`dropzone ${drag ? "drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onAdd(capped(e.dataTransfer.files)); }}
      >
        <span>{atLimit ? "Photo limit reached — remove one to add another" : "📷 Drag & drop or click to upload"}</span>
        <input type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={(e) => { onAdd(capped(e.target.files)); e.target.value = ""; }} />
      </label>
      {items.length > 0 && (
        <div className="thumbs">
          {items.map((it, i) => (
            <div key={i} className="thumb-wrap">
              <img src={it.url} alt="" />
              <button onClick={() => onRemove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Live product mockup (free, in-browser) ──
function Mockup({ product, url, caption }) {
  const keychain = isKeychain(product);
  return (
    <div className="mockup">
      <div className={keychain ? "mk keychain" : "mk magnet"}>
        {keychain && <span className="mk-ring" />}
        {url ? <img src={url} alt="preview" /> : <span className="mk-empty">No photo</span>}
      </div>
      {caption && <span className="mk-cap">{caption}</span>}
    </div>
  );
}

// ── Static marketing content ──
function Sections() {
  return (
    <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "64px var(--gutter)" }}>
        <div className="info-grid">
          <div>
            <h3 className="info-h">How It Works</h3>
            <ol className="info-list">
              <li>Upload your photo.</li>
              <li>Place your order online.</li>
              <li>We professionally print &amp; assemble your keepsake.</li>
              <li>Receive your order by pickup or delivery.</li>
            </ol>
          </div>
          <div>
            <h3 className="info-h">Why Memorify</h3>
            <ul className="info-list">
              <li>Made in Toronto</li>
              <li>Premium photo quality</li>
              <li>Personalized for every order</li>
              <li>Fast turnaround</li>
              <li>Perfect for birthdays, weddings, anniversaries, baby showers &amp; graduations</li>
            </ul>
          </div>
          <div>
            <h3 className="info-h">Pickup &amp; Shipping</h3>
            <ul className="info-list">
              <li>📍 Pickup available in North York</li>
              <li>🚚 Shipping available across Canada</li>
              <li>🛵 GTA delivery on request</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
.stepper{display:flex;gap:6px;justify-content:center;margin:0 0 28px;flex-wrap:wrap;}
.step{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:30px;font-size:12px;color:var(--text-faint);}
.step-dot{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:1px solid var(--border);}
.step-active{color:var(--text-main);}
.step-active .step-dot{background:var(--gold);color:#0d0b08;border-color:var(--gold);}
.step-done .step-dot{background:rgba(184,134,11,.25);color:var(--gold-pale);border-color:transparent;}
.store-error{background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.3);color:#fca5a5;font-size:13px;padding:10px 14px;border-radius:6px;margin-bottom:18px;}

.prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
.prod-card{text-align:left;background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;padding:0;color:inherit;font:inherit;opacity:0;transform:translateY(20px);animation:fadeUp .6s var(--ease-out) forwards;transition:transform .35s var(--ease-out),box-shadow .35s,border-color .25s;}
.prod-card:nth-child(2){animation-delay:.06s}.prod-card:nth-child(3){animation-delay:.12s}.prod-card:nth-child(4){animation-delay:.18s}.prod-card:nth-child(5){animation-delay:.24s}.prod-card:nth-child(6){animation-delay:.3s}.prod-card:nth-child(7){animation-delay:.36s}
.prod-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,.4);}
.prod-card.sel{border-color:var(--gold);}
.prod-media{height:150px;background:var(--surface3);overflow:hidden;}
.prod-media img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease-out);}
.prod-card:hover .prod-media img{transform:scale(1.06);}
.prod-info{padding:16px;}
.prod-info h3{margin:0 0 4px;font-size:15px;color:var(--text-main);}
.prod-price{margin:0 0 8px;font-size:20px;font-weight:600;color:var(--gold-light);}
.prod-desc{margin:0 0 12px;font-size:12px;color:var(--text-dim);line-height:1.6;}
.prod-cta{font-size:12px;color:var(--gold-pale);letter-spacing:.05em;}

.panel{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:24px;animation:fadeUp .4s var(--ease-out) both;}
.panel-title{margin:0 0 14px;font-size:20px;color:var(--text-main);}
.hint{font-size:13px;color:var(--text-dim);margin:0 0 16px;line-height:1.6;}
.qty-row{display:inline-flex;align-items:center;font-size:13px;color:var(--text-dim);margin-bottom:12px;}
.qty-row input{width:64px;margin-left:6px;background:var(--surface3);border:1px solid var(--border-soft);border-radius:4px;padding:6px 10px;color:var(--text-main);}
.dual{display:flex;gap:18px;flex-wrap:wrap;}

.fld-label{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim);margin:0 0 6px;}
.dropzone{display:flex;align-items:center;justify-content:center;text-align:center;min-height:120px;border:2px dashed rgba(184,134,11,.35);border-radius:8px;background:rgba(184,134,11,.03);cursor:pointer;font-size:13px;color:var(--text-dim);transition:all .25s;}
.dropzone.drag{border-color:var(--gold);background:rgba(184,134,11,.08);}
.thumbs{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.thumb-wrap{position:relative;}
.thumb-wrap img{width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid var(--border);}
.thumb-wrap button{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:rgba(220,38,38,.95);color:#fff;border:none;font-size:11px;cursor:pointer;}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.fld{background:var(--surface3);border:1px solid var(--border-soft);border-radius:4px;padding:11px 14px;font-size:14px;color:var(--text-main);outline:none;width:100%;font-family:var(--ff-sans);box-sizing:border-box;}
.fld:focus{border-color:var(--gold);}

.preview-grid{display:flex;flex-wrap:wrap;gap:20px;}
.kc-pair{display:flex;gap:12px;}
.mockup{display:flex;flex-direction:column;align-items:center;gap:6px;}
.mk{position:relative;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.45);}
.mk img{width:100%;height:100%;object-fit:cover;}
.mk.magnet{width:150px;height:150px;border-radius:8px;padding:6px;background:#fff;}
.mk.magnet img{border-radius:4px;}
.mk.keychain{width:120px;height:150px;border-radius:16px;margin-top:14px;}
.mk-ring{position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:18px;height:18px;border:3px solid #c9c9c9;border-radius:50%;background:transparent;z-index:2;}
.mk-cap{font-size:11px;color:var(--text-dim);letter-spacing:.08em;text-transform:uppercase;}
.mk-empty{color:#999;font-size:12px;}

.review{background:var(--surface3);border-radius:8px;padding:18px;font-size:14px;color:var(--text-main);line-height:1.9;}
.review-total{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:16px;color:var(--gold-light);}

.wiz-nav{display:flex;align-items:center;gap:12px;margin-top:24px;}

.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;}
.info-h{font-size:16px;color:var(--gold-pale);margin:0 0 14px;letter-spacing:.04em;}
.info-list{margin:0;padding-left:18px;color:var(--text-dim);font-size:13.5px;line-height:2;}

@media(max-width:768px){
  .store-header{padding:48px 20px 40px!important;}
  .store-body{padding:32px 20px 56px!important;}
  .form-grid{grid-template-columns:1fr!important;}
  .step-label{display:none;}
}
`;
