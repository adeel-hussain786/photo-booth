import { useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../lib/api";
import MediaGrid from "../components/gallery/MediaGrid";

/**
 * Customer-facing gallery. The visitor lands on /g/:folderId, enters the
 * access code, and — only after the backend verifies it — receives signed
 * media URLs to view and download. The access code is held in memory for the
 * session so the "Download All" request can re-authorize without re-prompting.
 */
export default function CustomerGallery() {
  const { folderId } = useParams();

  const [password, setPassword] = useState("");
  const [gallery, setGallery] = useState(null); // { folderName, description, items }
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl(`/api/gallery/${folderId}/verify`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map the backend's status codes to friendly copy.
        const messages = {
          401: "That access code isn't right. Please check and try again.",
          404: "We couldn't find this gallery. Double-check your link.",
          410: "This gallery has expired and is no longer available.",
        };
        setError(messages[res.status] || data.error || "Something went wrong.");
        return;
      }

      setGallery(data);
    } catch {
      setError("Couldn't reach the server. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    setError("");
    setZipping(true);

    try {
      const res = await fetch(apiUrl(`/api/gallery/${folderId}/download`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Couldn't prepare the ZIP download. Please try again.");
        return;
      }

      // Stream the ZIP blob into a temporary link and click it.
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${gallery?.folderName || "gallery"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setZipping(false);
    }
  };

  // ─── Locked state: ask for the access code ───
  if (!gallery) {
    return (
      <div style={styles.gate}>
        <div style={styles.gateCard}>
          <h1 style={styles.gateTitle}>Private Gallery</h1>
          <p style={styles.gateSub}>Enter the access code shared with you to view your photos.</p>

          <form onSubmit={handleVerify} style={styles.gateForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              style={styles.gateInput}
              autoFocus
              disabled={loading}
            />
            <button type="submit" style={styles.gateBtn} disabled={loading || !password}>
              {loading ? "Unlocking…" : "View Gallery"}
            </button>
          </form>

          {error && <p style={styles.gateError}>{error}</p>}
        </div>
      </div>
    );
  }

  // ─── Unlocked state: show the gallery ───
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>{gallery.folderName}</h1>
          {gallery.description && <p style={styles.desc}>{gallery.description}</p>}
          <p style={styles.count}>
            {gallery.items.length} item{gallery.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {gallery.items.length > 0 && (
          <button onClick={handleDownloadAll} style={styles.zipBtn} disabled={zipping}>
            {zipping ? "Preparing ZIP…" : "⬇ Download All"}
          </button>
        )}
      </header>

      {error && <p style={styles.inlineError}>{error}</p>}

      <MediaGrid items={gallery.items} />
    </div>
  );
}

const FONT = "var(--ff-body, 'Outfit', sans-serif)";
const BG = "linear-gradient(135deg, #0d0b08 0%, #1a1612 100%)";

const styles = {
  // Locked
  gate: {
    minHeight: "100vh",
    background: BG,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: FONT,
  },
  gateCard: {
    width: "100%",
    maxWidth: "380px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(184, 134, 11, 0.2)",
    borderRadius: "10px",
    padding: "40px 32px",
    textAlign: "center",
  },
  gateTitle: { fontSize: "26px", fontWeight: 600, color: "#f0e8d8", margin: 0, letterSpacing: "0.5px" },
  gateSub: { fontSize: "14px", color: "rgba(240, 232, 216, 0.6)", margin: "12px 0 28px", lineHeight: 1.5 },
  gateForm: { display: "flex", flexDirection: "column", gap: "14px" },
  gateInput: {
    padding: "12px 16px",
    fontSize: "15px",
    textAlign: "center",
    letterSpacing: "2px",
    border: "1px solid rgba(184, 134, 11, 0.3)",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.02)",
    color: "#f0e8d8",
    outline: "none",
    fontFamily: "inherit",
  },
  gateBtn: {
    padding: "12px",
    background: "var(--gold, #b8860b)",
    color: "#0d0b08",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    cursor: "pointer",
  },
  gateError: { color: "#fca5a5", fontSize: "13px", marginTop: "18px", marginBottom: 0 },

  // Unlocked
  page: { minHeight: "100vh", background: BG, color: "#f0e8d8", padding: "40px 20px", fontFamily: FONT },
  header: {
    maxWidth: "1300px",
    margin: "0 auto 32px",
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: { fontSize: "30px", fontWeight: 600, margin: 0, letterSpacing: "0.5px" },
  desc: { fontSize: "15px", color: "rgba(240, 232, 216, 0.7)", margin: "10px 0 0", maxWidth: "640px", lineHeight: 1.5 },
  count: { fontSize: "13px", color: "rgba(184, 134, 11, 0.85)", margin: "10px 0 0", fontWeight: 500 },
  zipBtn: {
    padding: "12px 22px",
    background: "var(--gold, #b8860b)",
    color: "#0d0b08",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  inlineError: {
    maxWidth: "1300px",
    margin: "0 auto 20px",
    color: "#fca5a5",
    fontSize: "13px",
  },
};
