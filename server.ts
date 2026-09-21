import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import {
  createUser,
  authenticateUser,
  getUserByToken,
  changeUserPassword,
  syncUserWorkspace,
  getUserWorkspace,
  invalidateToken,
} from "./server/authStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory cloud sync store keyed by syncCode (persists across devices during server lifetime)
interface CloudWorkspace {
  syncCode: string;
  updatedAt: string;
  data: any;
}

const cloudWorkspaces = new Map<string, CloudWorkspace>();

// Default workspace for guest/anonymous synchronization
const DEFAULT_SYNC_CODE = "STUDY-8429";

// Middleware to extract bearer token
function getBearerToken(req: express.Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ROUTES ====================

// 1. Sign Up (New user account creation)
app.post("/api/auth/signup", (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }
    const result = createUser(email, password, name || "");
    return res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "Failed to create account." });
  }
});

// 2. Log In (Existing user authentication)
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    const result = authenticateUser(email, password);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || "Authentication failed." });
  }
});

// 3. Get Current User Info
app.get("/api/auth/me", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing token." });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Session expired or invalid token." });
  }
  return res.json({ success: true, user });
});

// 4. Change Password
app.post("/api/auth/change-password", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing token." });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Session expired or invalid token." });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Both current password and new password are required." });
  }

  try {
    changeUserPassword(user.id, currentPassword, newPassword);
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "Failed to update password." });
  }
});

// 5. Sign Out
app.post("/api/auth/logout", (req, res) => {
  const token = getBearerToken(req);
  if (token) {
    invalidateToken(token);
  }
  return res.json({ success: true, message: "Logged out successfully." });
});

// 6. User Account Workspace Auto-Sync: Push Data
app.post("/api/auth/sync", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing token." });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Session expired or invalid token." });
  }

  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, error: "Missing data payload." });
  }

  const record = syncUserWorkspace(user.id, data);
  return res.json({
    success: true,
    updatedAt: record.updatedAt,
    message: "Data auto-synced across devices successfully.",
  });
});

// 7. User Account Workspace Auto-Sync: Pull Data
app.get("/api/auth/sync", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing token." });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Session expired or invalid token." });
  }

  const record = getUserWorkspace(user.id);
  if (!record) {
    return res.json({
      success: true,
      exists: false,
      data: null,
      message: "No remote workspace found for this account yet. Using fresh state.",
    });
  }

  return res.json({
    success: true,
    exists: true,
    updatedAt: record.updatedAt,
    data: record.data,
  });
});

// ==================== LEGACY / GUEST SYNC ROUTES ====================

// Cloud Sync: Pull workspace data by syncCode
app.get("/api/sync/:syncCode", (req, res) => {
  const syncCode = (req.params.syncCode || DEFAULT_SYNC_CODE).toUpperCase();
  const workspace = cloudWorkspaces.get(syncCode);

  if (!workspace) {
    return res.json({
      success: true,
      exists: false,
      syncCode,
      message: "No remote data found for this sync code yet. Using local state.",
      data: null,
    });
  }

  res.json({
    success: true,
    exists: true,
    syncCode: workspace.syncCode,
    updatedAt: workspace.updatedAt,
    data: workspace.data,
  });
});

// Cloud Sync: Push workspace data
app.post("/api/sync/:syncCode", (req, res) => {
  const syncCode = (req.params.syncCode || DEFAULT_SYNC_CODE).toUpperCase();
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: "Missing data payload" });
  }

  const workspace: CloudWorkspace = {
    syncCode,
    updatedAt: new Date().toISOString(),
    data,
  };

  cloudWorkspaces.set(syncCode, workspace);

  res.json({
    success: true,
    syncCode,
    updatedAt: workspace.updatedAt,
    message: "Cloud storage synchronized across devices successfully",
  });
});

// Vite middleware setup & immediate server start
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
  }).catch((err) => {
    console.error("Vite server creation failed:", err);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Focus Time server running on http://0.0.0.0:${PORT}`);
});
