import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function AdminDashboard() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    folderName: "",
    password: "",
    description: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Account settings
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsErr, setSettingsErr] = useState("");
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Website (public) gallery management
  const [siteImages, setSiteImages] = useState([]);
  const [siteUploading, setSiteUploading] = useState(false);

  // Edit client gallery
  const [editFolder, setEditFolder] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editForm, setEditForm] = useState({
    folderName: "",
    description: "",
    password: "",
    expiryDays: 7,
  });

  const navigate = useNavigate();
  const sessionToken = localStorage.getItem("adminSessionToken");

  // Load folders + account on mount
  useEffect(() => {
    if (!sessionToken) {
      navigate("/admin/login");
      return;
    }
    loadFolders();
    loadAccount();
    loadSiteImages();
  }, [sessionToken, navigate]);

  const loadSiteImages = async () => {
    try {
      const res = await fetch(apiUrl("/api/site-gallery"));
      if (res.ok) setSiteImages(await res.json());
    } catch {
      // non-fatal
    }
  };

  const handleSiteUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = ""; // allow re-selecting the same file later

    setSiteUploading(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch(apiUrl("/api/admin/site-gallery"), {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: fd,
      });
      if (res.ok) {
        setSuccess("✅ Photos added to website gallery");
        setTimeout(() => setSuccess(""), 2000);
        loadSiteImages();
      } else if (!handleAuthExpired(res)) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to add photos");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setSiteUploading(false);
    }
  };

  const handleSiteDelete = async (id) => {
    if (!window.confirm("Remove this photo from the website gallery?")) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/site-gallery/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        loadSiteImages();
      } else if (!handleAuthExpired(res)) {
        setError("Failed to delete photo");
      }
    } catch {
      setError("Could not connect to server");
    }
  };

  const loadAccount = async () => {
    try {
      const res = await fetch(apiUrl("/api/admin/me"), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
        setSettingsForm((prev) => ({ ...prev, newUsername: data.username }));
      }
    } catch {
      // non-fatal; header just won't show the username
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsErr("");

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsErr("New passwords don't match");
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch(apiUrl("/api/admin/credentials"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          currentPassword: settingsForm.currentPassword,
          newUsername: settingsForm.newUsername,
          newPassword: settingsForm.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSettingsErr(data.error || "Failed to update credentials");
        return;
      }

      // Credentials changed → all sessions were invalidated server-side.
      // Sign out locally and send the admin back to login.
      localStorage.removeItem("adminSessionToken");
      alert("Credentials updated. Please log in again with your new details.");
      navigate("/admin/login");
    } catch {
      setSettingsErr("Could not connect to server");
    } finally {
      setSavingSettings(false);
    }
  };

  // When the session has expired or been invalidated, clear it and bounce the
  // admin back to the login screen instead of leaving them on a dead dashboard.
  const handleAuthExpired = (res) => {
    if (res.status === 401) {
      localStorage.removeItem("adminSessionToken");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  const loadFolders = async () => {
    try {
      const res = await fetch(apiUrl("/api/admin/folders"), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      } else if (!handleAuthExpired(res)) {
        setError("Failed to load folders");
      }
    } catch (err) {
      setError("Could not connect to server");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Create folder first
      const folderRes = await fetch(apiUrl("/api/admin/folders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          folderName: formData.folderName,
          password: formData.password,
          description: formData.description,
        }),
      });

      if (!folderRes.ok) {
        if (handleAuthExpired(folderRes)) return;
        const errData = await folderRes.json().catch(() => ({}));
        setError(errData.error || "Failed to create folder");
        setLoading(false);
        return;
      }

      const folderData = await folderRes.json();
      const folderId = folderData.folderId;

      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploadingFiles(true);

        const uploadFormData = new FormData();
        uploadFormData.append("folderId", folderId);
        uploadedFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });

        const uploadRes = await fetch(apiUrl("/api/admin/upload"), {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}` },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          setError("Files uploaded but failed to save metadata");
          setUploadingFiles(false);
          setLoading(false);
          return;
        }

        setUploadingFiles(false);
      }

      setSuccess(`✅ Folder "${formData.folderName}" created successfully!`);
      setFormData({ folderName: "", password: "", description: "" });
      setUploadedFiles([]);

      setTimeout(() => {
        loadFolders();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError("Error creating folder: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/folders/${folderId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (res.ok) {
        setSuccess("✅ Folder deleted");
        loadFolders();
        setTimeout(() => setSuccess(""), 2000);
      } else if (!handleAuthExpired(res)) {
        setError("Failed to delete folder");
      }
    } catch (err) {
      setError("Error deleting folder");
    }
  };

  const handleCopyLink = (folderId) => {
    const link = `${window.location.origin}/g/${folderId}`;
    navigator.clipboard.writeText(link).then(
      () => {
        setSuccess("✅ Gallery link copied to clipboard");
        setTimeout(() => setSuccess(""), 2000);
      },
      () => setError("Couldn't copy link")
    );
  };

  const openEdit = (folder) => {
    setEditErr("");
    setEditForm({
      folderName: folder.folderName,
      description: folder.description || "",
      password: "",
      expiryDays: Math.max(1, folder.daysUntilExpiry || 7),
    });
    setEditFolder(folder);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditErr("");
    setSavingEdit(true);
    try {
      const days = Math.max(1, Number(editForm.expiryDays) || 1);
      const body = {
        folderName: editForm.folderName,
        description: editForm.description,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
      };
      if (editForm.password) body.password = editForm.password; // blank = keep current

      const res = await fetch(apiUrl(`/api/admin/folders/${editFolder.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (handleAuthExpired(res)) return;
        setEditErr(data.error || "Failed to update gallery");
        return;
      }

      setEditFolder(null);
      setSuccess("✅ Gallery updated");
      setTimeout(() => setSuccess(""), 2000);
      loadFolders();
    } catch {
      setEditErr("Could not connect to server");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSessionToken");
    navigate("/admin/login");
  };

  return (
    <div style={styles.container}>
      {/* Responsive overrides (inline styles can't express media queries) */}
      <style>{`
        @media (max-width: 860px) {
          .admin-content { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .admin-header { flex-direction: column; align-items: flex-start !important; }
          .admin-modal { padding: 20px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="admin-header" style={styles.header}>
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>📁 Client Gallery Admin</h1>
          <p style={styles.subtitle}>
            {username ? `Signed in as ${username}` : "Manage photo & video folders for clients"}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => { setSettingsErr(""); setShowSettings(true); }} style={styles.settingsBtn}>
            ⚙ Account
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Account Settings modal */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className="admin-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.panelTitle}>Account Settings</h2>
            <p style={styles.helperText}>
              Update your login. Your current password is required to confirm any change.
            </p>

            <form onSubmit={handleSaveSettings} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Username</label>
                <input
                  type="text"
                  name="newUsername"
                  value={settingsForm.newUsername}
                  onChange={handleSettingsChange}
                  style={styles.input}
                  disabled={savingSettings}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={settingsForm.newPassword}
                  onChange={handleSettingsChange}
                  placeholder="Leave blank to keep current"
                  style={styles.input}
                  disabled={savingSettings}
                />
                <p style={styles.helperText}>Min 8 characters, with letters and numbers.</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={settingsForm.confirmPassword}
                  onChange={handleSettingsChange}
                  style={styles.input}
                  disabled={savingSettings}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={settingsForm.currentPassword}
                  onChange={handleSettingsChange}
                  placeholder="Required to confirm"
                  style={styles.input}
                  required
                  disabled={savingSettings}
                />
              </div>

              {settingsErr && <div style={styles.errorMessage}>{settingsErr}</div>}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  style={styles.logoutBtn}
                  disabled={savingSettings}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={savingSettings}>
                  {savingSettings ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit gallery modal */}
      {editFolder && (
        <div style={styles.modalOverlay} onClick={() => setEditFolder(null)}>
          <div className="admin-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.panelTitle}>Edit Gallery</h2>
            <form onSubmit={handleEditSave} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Gallery Name</label>
                <input
                  type="text"
                  name="folderName"
                  value={editForm.folderName}
                  onChange={handleEditChange}
                  style={styles.input}
                  required
                  disabled={savingEdit}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  style={styles.textarea}
                  rows="2"
                  disabled={savingEdit}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Access Code</label>
                <input
                  type="text"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  placeholder="Leave blank to keep current code"
                  style={styles.input}
                  disabled={savingEdit}
                />
                <p style={styles.helperText}>Min 4 characters. Only changes if you type a new one.</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Expires In (days from now)</label>
                <input
                  type="number"
                  name="expiryDays"
                  min="1"
                  value={editForm.expiryDays}
                  onChange={handleEditChange}
                  style={styles.input}
                  disabled={savingEdit}
                />
              </div>

              {editErr && <div style={styles.errorMessage}>{editErr}</div>}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setEditFolder(null)}
                  style={styles.logoutBtn}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={savingEdit}>
                  {savingEdit ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      <div className="admin-content" style={styles.content}>
        {/* Left Panel: Folders List */}
        <div style={styles.leftPanel}>
          <h2 style={styles.panelTitle}>Existing Folders</h2>
          <div style={styles.foldersList}>
            {folders.length === 0 ? (
              <p style={styles.emptyState}>No folders yet. Create one to get started!</p>
            ) : (
              folders.map((folder) => (
                <div key={folder.id} style={styles.folderCard}>
                  <div>
                    <h3 style={styles.folderName}>{folder.folderName}</h3>
                    <p style={styles.folderDate}>
                      Created: {new Date(folder.createdAt).toLocaleDateString()}
                    </p>
                    <p style={styles.folderExpiry}>
                      ⏰ Expires in {Math.max(0, folder.daysUntilExpiry)} days
                    </p>
                  </div>
                  <div style={styles.folderActions}>
                    <button
                      onClick={() => handleCopyLink(folder.id)}
                      style={styles.copyBtn}
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => openEdit(folder)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Create Folder Form */}
        <div style={styles.rightPanel}>
          <h2 style={styles.panelTitle}>Create New Folder</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Folder Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Folder Name (Client Name)</label>
              <input
                type="text"
                name="folderName"
                value={formData.folderName}
                onChange={handleInputChange}
                placeholder="e.g., Sarah & Ahmed"
                style={styles.input}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Access Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="e.g., 1234"
                style={styles.input}
                required
                disabled={loading}
              />
              <p style={styles.helperText}>Min 4 characters. Share this with the client.</p>
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Note / Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Wedding photos - Please enjoy! 🎉"
                style={styles.textarea}
                rows="3"
                disabled={loading}
              />
            </div>

            {/* File Upload */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Photos & Videos</label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                style={styles.dropZone}
              >
                <div style={styles.dropZoneContent}>
                  <p style={styles.dropZoneText}>Drag & drop files here or click to select</p>
                  <p style={styles.dropZoneSubtext}>JPG, PNG, MP4, MOV (max 50MB each)</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                  disabled={loading}
                />
              </label>
            </div>

            {/* File Previews */}
            {uploadedFiles.length > 0 && (
              <div style={styles.filesList}>
                <h4 style={styles.filesTitle}>
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} selected
                </h4>
                <div style={styles.filesGrid}>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} style={styles.filePreview}>
                      <div style={styles.fileType}>
                        {file.type.startsWith("image/") ? "🖼️" : "🎬"}
                      </div>
                      <p style={styles.fileName}>{file.name}</p>
                      <p style={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        style={styles.removeFileBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" style={styles.submitBtn} disabled={loading || uploadingFiles}>
              {loading || uploadingFiles
                ? "Creating folder..."
                : `Create Folder ${uploadedFiles.length > 0 ? `& Upload ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""}` : ""}`}
            </button>
          </form>
        </div>
      </div>

      {/* Website Gallery management (the public /gallery page) */}
      <div style={styles.siteSection}>
        <div style={styles.siteHeader}>
          <div>
            <h2 style={styles.panelTitle}>Website Gallery</h2>
            <p style={styles.helperText}>
              Photos shown on your public Gallery page. Add or remove them anytime.
            </p>
          </div>
          <label style={styles.uploadLabel}>
            {siteUploading ? "Uploading…" : "+ Add Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSiteUpload}
              style={{ display: "none" }}
              disabled={siteUploading}
            />
          </label>
        </div>

        {siteImages.length === 0 ? (
          <p style={styles.emptyState}>No photos added yet. Click "Add Photos" to upload.</p>
        ) : (
          <div style={styles.siteGrid}>
            {siteImages.map((img) => (
              <div key={img.id} style={styles.siteCard}>
                <img src={img.url} alt={img.originalName || "Gallery"} style={styles.siteImg} />
                <button
                  onClick={() => handleSiteDelete(img.id)}
                  style={styles.siteDeleteBtn}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0d0b08 0%, #1a1612 100%)",
    color: "#f0e8d8",
    padding: "32px 20px",
    fontFamily: "var(--ff-body, 'Outfit', sans-serif)",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    maxWidth: "1400px",
    margin: "0 auto 40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    margin: 0,
    letterSpacing: "0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(240, 232, 216, 0.6)",
    margin: "8px 0 0",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "transparent",
    color: "#f0e8d8",
    border: "1px solid rgba(184, 134, 11, 0.5)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  settingsBtn: {
    padding: "10px 20px",
    background: "rgba(184, 134, 11, 0.12)",
    color: "#e8c97a",
    border: "1px solid rgba(184, 134, 11, 0.5)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(8, 7, 5, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "440px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "linear-gradient(135deg, #14110c 0%, #1a1612 100%)",
    border: "1px solid rgba(184, 134, 11, 0.25)",
    borderRadius: "10px",
    padding: "28px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  errorMessage: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "12px 16px",
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "4px",
    color: "#fca5a5",
    fontSize: "13px",
  },
  successMessage: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "12px 16px",
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "4px",
    color: "#86efac",
    fontSize: "13px",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  leftPanel: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(184, 134, 11, 0.1)",
    borderRadius: "8px",
    padding: "24px",
    height: "fit-content",
  },
  rightPanel: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(184, 134, 11, 0.1)",
    borderRadius: "8px",
    padding: "24px",
  },
  panelTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 20px",
    letterSpacing: "0.5px",
  },
  foldersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  emptyState: {
    fontSize: "13px",
    color: "rgba(240, 232, 216, 0.5)",
    textAlign: "center",
    padding: "32px 0",
    margin: 0,
  },
  folderCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(184, 134, 11, 0.05)",
    border: "1px solid rgba(184, 134, 11, 0.15)",
    borderRadius: "6px",
    padding: "16px",
    gap: "12px",
  },
  folderName: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 6px",
    color: "#f0e8d8",
  },
  folderDate: {
    fontSize: "12px",
    color: "rgba(240, 232, 216, 0.5)",
    margin: "4px 0",
  },
  folderExpiry: {
    fontSize: "12px",
    color: "rgba(184, 134, 11, 0.8)",
    margin: "4px 0 0",
    fontWeight: "500",
  },
  folderActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  copyBtn: {
    padding: "6px 12px",
    background: "rgba(184, 134, 11, 0.15)",
    color: "#e8c97a",
    border: "1px solid rgba(184, 134, 11, 0.4)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.3s",
    whiteSpace: "nowrap",
  },
  editBtn: {
    padding: "6px 12px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#f0e8d8",
    border: "1px solid rgba(184, 134, 11, 0.3)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.3s",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    padding: "6px 12px",
    background: "rgba(220, 38, 38, 0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.3s",
    whiteSpace: "nowrap",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f0e8d8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid rgba(184, 134, 11, 0.3)",
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.02)",
    color: "#f0e8d8",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
  },
  textarea: {
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid rgba(184, 134, 11, 0.3)",
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.02)",
    color: "#f0e8d8",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  helperText: {
    fontSize: "12px",
    color: "rgba(240, 232, 216, 0.5)",
    margin: 0,
  },
  dropZone: {
    padding: "32px 20px",
    border: "2px dashed rgba(184, 134, 11, 0.3)",
    borderRadius: "6px",
    background: "rgba(184, 134, 11, 0.02)",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.3s",
  },
  dropZoneContent: {
    pointerEvents: "none",
  },
  dropZoneText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#f0e8d8",
    margin: "0 0 6px",
  },
  dropZoneSubtext: {
    fontSize: "12px",
    color: "rgba(240, 232, 216, 0.5)",
    margin: 0,
  },
  filesList: {
    marginTop: "16px",
  },
  filesTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f0e8d8",
    margin: "0 0 12px",
    letterSpacing: "0.08em",
  },
  filesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "12px",
  },
  filePreview: {
    position: "relative",
    background: "rgba(184, 134, 11, 0.1)",
    border: "1px solid rgba(184, 134, 11, 0.2)",
    borderRadius: "6px",
    padding: "12px 8px",
    textAlign: "center",
  },
  fileType: {
    fontSize: "24px",
    marginBottom: "6px",
  },
  fileName: {
    fontSize: "11px",
    color: "#f0e8d8",
    margin: "4px 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: "10px",
    color: "rgba(240, 232, 216, 0.5)",
    margin: "4px 0 0",
  },
  removeFileBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    padding: 0,
    background: "rgba(220, 38, 38, 0.8)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s",
  },
  submitBtn: {
    padding: "12px 24px",
    background: "var(--gold, #b8860b)",
    color: "#0d0b08",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "background 0.3s",
    marginTop: "12px",
  },
  siteSection: {
    maxWidth: "1400px",
    margin: "32px auto 0",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(184, 134, 11, 0.1)",
    borderRadius: "8px",
    padding: "24px",
  },
  siteHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  uploadLabel: {
    padding: "10px 20px",
    background: "var(--gold, #b8860b)",
    color: "#0d0b08",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  siteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
  },
  siteCard: {
    position: "relative",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid rgba(184, 134, 11, 0.15)",
    aspectRatio: "1 / 1",
  },
  siteImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  siteDeleteBtn: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "26px",
    height: "26px",
    padding: 0,
    background: "rgba(220, 38, 38, 0.9)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
