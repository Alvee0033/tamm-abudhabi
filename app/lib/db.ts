import fs from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { LicenceData } from "@/app/types";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  password: string;
}

export interface TammDatabase {
  initialized: boolean;
  licenses: LicenceData[];
  admin: AdminUser;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 1,
  username: "admin",
  email: "admin@tamm.abudhabi",
  name: "Administrator",
  password: "admin",
};

// Global in-memory cache per Lambda instance
declare global {
  var __tamm_cached_db: TammDatabase | null;
  var __tamm_cached_time: number | undefined;
}

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "db.json");
const TMP_DATA_FILE = path.join("/tmp", "tamm_db.json");

function safeWrite(file: string, content: string): void {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, content, "utf8");
  } catch {}
}

function safeRead(file: string): string | null {
  try {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  } catch {}
  return null;
}

function getBlobToken(): string {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    "vercel_blob_rw_V1iyxnbuyCtCnkyX_RLGvSSkihGsMOAozpv6TFDnKFBpNjH"
  );
}

// ─── BLOB DATABASE STORAGE ───

async function fetchDbFromBlob(): Promise<TammDatabase | null> {
  const token = getBlobToken();
  if (!token) return null;

  try {
    const { blobs } = await list({ prefix: "tamm_database", token });
    if (!blobs || blobs.length === 0) return null;

    blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const latest = blobs[0];

    const res = await fetch(latest.downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === "object" && data.initialized === true) {
      return data as TammDatabase;
    }
  } catch (err) {
    console.error("fetchDbFromBlob error:", err);
  }
  return null;
}

async function persistDbToBlob(db: TammDatabase): Promise<void> {
  const token = getBlobToken();
  if (!token) return;

  try {
    const newBlob = await put("tamm_database.json", JSON.stringify(db), {
      access: "private",
      addRandomSuffix: true,
      token,
    });

    // Cleanup older blobs
    list({ prefix: "tamm_database", token })
      .then(({ blobs }) => {
        const toDelete = blobs.filter((b) => b.pathname !== newBlob.pathname);
        for (const old of toDelete) {
          del(old.url, { token }).catch(() => {});
        }
      })
      .catch(() => {});
  } catch (err) {
    console.error("persistDbToBlob error:", err);
  }
}

// ─── LOAD & SAVE DATABASE ───

export async function getDatabase(): Promise<TammDatabase> {
  const now = Date.now();
  // Fast memory cache if under 2 seconds old
  if (
    globalThis.__tamm_cached_db &&
    globalThis.__tamm_cached_time &&
    now - globalThis.__tamm_cached_time < 2000
  ) {
    return globalThis.__tamm_cached_db;
  }

  // 1. Fetch from authoritative Vercel Blob
  const blobDb = await fetchDbFromBlob();
  if (blobDb) {
    globalThis.__tamm_cached_db = blobDb;
    globalThis.__tamm_cached_time = now;
    safeWrite(TMP_DATA_FILE, JSON.stringify(blobDb));
    safeWrite(LOCAL_DATA_FILE, JSON.stringify(blobDb));
    return blobDb;
  }

  // 2. Fetch from local files if blob not yet initialized
  for (const filePath of [LOCAL_DATA_FILE, TMP_DATA_FILE]) {
    const content = safeRead(filePath);
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (parsed && parsed.initialized === true) {
          globalThis.__tamm_cached_db = parsed;
          globalThis.__tamm_cached_time = now;
          persistDbToBlob(parsed).catch(() => {});
          return parsed;
        }
      } catch {}
    }
  }

  // 3. First-ever initialization: empty licenses list or clean state
  const initialDb: TammDatabase = {
    initialized: true,
    licenses: [],
    admin: { ...DEFAULT_ADMIN },
  };

  globalThis.__tamm_cached_db = initialDb;
  globalThis.__tamm_cached_time = now;
  safeWrite(TMP_DATA_FILE, JSON.stringify(initialDb));
  safeWrite(LOCAL_DATA_FILE, JSON.stringify(initialDb));
  await persistDbToBlob(initialDb);

  return initialDb;
}

export async function saveDatabase(db: TammDatabase): Promise<void> {
  db.initialized = true;
  globalThis.__tamm_cached_db = db;
  globalThis.__tamm_cached_time = Date.now();
  safeWrite(TMP_DATA_FILE, JSON.stringify(db));
  safeWrite(LOCAL_DATA_FILE, JSON.stringify(db));
  await persistDbToBlob(db);
}

// ─── LICENSES API ───

export async function getLicenses(): Promise<LicenceData[]> {
  const db = await getDatabase();
  return db.licenses || [];
}

export async function saveLicenses(licenses: LicenceData[]): Promise<void> {
  const db = await getDatabase();
  db.licenses = licenses;
  await saveDatabase(db);
}

export async function getLicenseByRef(ref: string): Promise<LicenceData | undefined> {
  const licenses = await getLicenses();
  const clean = decodeURIComponent(ref).trim().toLowerCase();
  return licenses.find(
    (l) => l.tradeLicenseNumber?.trim().toLowerCase() === clean
  );
}

export async function upsertLicense(license: LicenceData): Promise<LicenceData> {
  const db = await getDatabase();
  const list = db.licenses || [];
  const clean = license.tradeLicenseNumber?.trim().toLowerCase();

  const idx = list.findIndex(
    (l) => l.tradeLicenseNumber?.trim().toLowerCase() === clean
  );

  if (idx >= 0) {
    list[idx] = { ...list[idx], ...license };
  } else {
    list.unshift(license);
  }

  db.licenses = list;
  await saveDatabase(db);
  return license;
}

export async function deleteLicense(ref: string): Promise<boolean> {
  const db = await getDatabase();
  const list = db.licenses || [];
  const clean = decodeURIComponent(ref).trim().toLowerCase();
  const initialCount = list.length;

  const filtered = list.filter(
    (l) => l.tradeLicenseNumber?.trim().toLowerCase() !== clean
  );

  if (filtered.length < initialCount) {
    db.licenses = filtered;
    await saveDatabase(db);
    return true;
  }
  return false;
}

export async function syncLicensesFromClient(incomingLicenses: LicenceData[]): Promise<LicenceData[]> {
  if (!Array.isArray(incomingLicenses)) {
    return await getLicenses();
  }
  await saveLicenses(incomingLicenses);
  return incomingLicenses;
}

// ─── ADMIN USER API ───

export async function getAdminUser(): Promise<AdminUser> {
  const db = await getDatabase();
  return db.admin || { ...DEFAULT_ADMIN };
}

export async function updateAdminUser(data: Partial<AdminUser>): Promise<AdminUser> {
  const db = await getDatabase();
  const updated = { ...(db.admin || DEFAULT_ADMIN), ...data };
  db.admin = updated;
  await saveDatabase(db);
  return updated;
}
