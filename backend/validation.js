export function validateFolderName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Folder name is required" };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Folder name cannot be empty" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Folder name must be less than 100 characters" };
  }

  // Allow alphanumeric, spaces, hyphens, underscores
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return { valid: false, error: "Folder name contains invalid characters" };
  }

  return { valid: true };
}

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 4) {
    return { valid: false, error: "Password must be at least 4 characters" };
  }

  if (password.length > 50) {
    return { valid: false, error: "Password must be less than 50 characters" };
  }

  return { valid: true };
}

export function validateDescription(description) {
  if (!description) {
    return { valid: true }; // Description is optional
  }

  if (typeof description !== "string") {
    return { valid: false, error: "Description must be a string" };
  }

  if (description.length > 1000) {
    return { valid: false, error: "Description must be less than 1000 characters" };
  }

  return { valid: true };
}

export function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 30) {
    return { valid: false, error: "Username must be less than 30 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username contains invalid characters" };
  }

  return { valid: true };
}

// Admin credentials are held to a higher standard than per-gallery access
// codes: at least 8 characters with a mix of letters and numbers.
export function validateAdminPassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (password.length > 100) {
    return { valid: false, error: "Password must be less than 100 characters" };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: "Password must include both letters and numbers" };
  }

  return { valid: true };
}
