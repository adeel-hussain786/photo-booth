import { useState } from "react";

/**
 * Responsive grid of gallery media with per-item download and a click-to-zoom
 * lightbox. Reusable: pass an `items` array of
 *   { id, url, downloadUrl, resourceType, originalName }
 * (the exact shape returned by the gallery verify endpoint).
 */
export default function MediaGrid({ items }) {
  const [active, setActive] = useState(null); // item shown in the lightbox

  if (!items || items.length === 0) {
    return <p style={styles.empty}>This gallery doesn't have any photos yet.</p>;
  }

  return (
    <>
      {/* Scoped styles: auto-fill grid is responsive with no media queries,
          and :hover effects aren't expressible via inline styles. */}
      <style>{css}</style>

      <div className="mg-grid">
        {items.map((item) => (
          <figure key={item.id} className="mg-cell">
            {item.resourceType === "video" ? (
              <video src={item.url} className="mg-media" controls preload="metadata" />
            ) : (
              <img
                src={item.url}
                alt={item.originalName || "Gallery photo"}
                className="mg-media"
                loading="lazy"
                onClick={() => setActive(item)}
              />
            )}

            <figcaption className="mg-bar">
              <span className="mg-name" title={item.originalName}>
                {item.originalName || "Untitled"}
              </span>
              <a
                href={item.downloadUrl}
                className="mg-dl"
                // Cloudinary serves these with an attachment disposition, so the
                // browser downloads rather than navigates. download attr helps
                // same-origin cases.
                download={item.originalName || undefined}
                rel="noopener noreferrer"
              >
                ↓
              </a>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div className="mg-lightbox" onClick={() => setActive(null)}>
          <button className="mg-close" aria-label="Close" onClick={() => setActive(null)}>
            ✕
          </button>
          <img src={active.url} alt={active.originalName || "Gallery photo"} className="mg-full" />
        </div>
      )}
    </>
  );
}

const styles = {
  empty: {
    textAlign: "center",
    color: "rgba(240, 232, 216, 0.6)",
    padding: "48px 0",
    fontSize: "14px",
  },
};

const css = `
.mg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
@keyframes mgIn { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
.mg-cell {
  position: relative;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(184, 134, 11, 0.15);
  animation: mgIn .5s var(--ease-out, ease) both;
}
.mg-cell:nth-child(1){animation-delay:.02s}
.mg-cell:nth-child(2){animation-delay:.06s}
.mg-cell:nth-child(3){animation-delay:.10s}
.mg-cell:nth-child(4){animation-delay:.14s}
.mg-cell:nth-child(5){animation-delay:.18s}
.mg-cell:nth-child(6){animation-delay:.22s}
.mg-cell:nth-child(n+7){animation-delay:.26s}
.mg-media {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.4s ease;
}
.mg-cell:hover .mg-media { transform: scale(1.05); }
.mg-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(transparent, rgba(13, 11, 8, 0.92));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.mg-cell:hover .mg-bar { opacity: 1; }
.mg-name {
  font-size: 12px;
  color: #f0e8d8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mg-dl {
  flex-shrink: 0;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--gold, #b8860b);
  color: #0d0b08;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}
.mg-dl:hover { background: var(--gold-light, #d4a843); }
.mg-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(8, 7, 5, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: zoom-out;
}
.mg-full {
  max-width: 92vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}
.mg-close {
  position: fixed;
  top: 20px; right: 24px;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(240, 232, 216, 0.3);
  background: rgba(255, 255, 255, 0.06);
  color: #f0e8d8;
  font-size: 18px;
  cursor: pointer;
}
@media (max-width: 600px) {
  .mg-media { height: 160px; }
  .mg-grid { gap: 12px; }
}
`;
