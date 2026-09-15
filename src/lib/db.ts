import fs from 'fs';
import path from 'path';
import os from 'os';
import { defaultBlogs } from '@/data/initialBlogs';
import { defaultContent } from '@/data/initialContent';
import { BlogPost } from '@/types/blog';
import { SiteContent } from '@/types/content';

export interface DonationRecord {
  id: string;
  amount: string;
  frequency: string;
  name: string;
  email: string;
  phone?: string;
  utr?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface AppDatabase {
  content: SiteContent;
  blogs: BlogPost[];
  donations: DonationRecord[];
  contacts?: Array<Record<string, unknown>>;
  updatedAt?: string;
}

// Local project path
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Writable serverless fallback path in /tmp (works in AWS Lambda / Vercel Serverless)
const TMP_DB_PATH = path.join(os.tmpdir(), 'act_ngo_db.json');

// In-memory runtime cache
let memoryDb: AppDatabase | null = null;

function normalizeDb(data: Partial<AppDatabase>): AppDatabase {
  return {
    content: data.content || defaultContent,
    blogs: Array.isArray(data.blogs) && data.blogs.length > 0 ? data.blogs : defaultBlogs,
    donations: Array.isArray(data.donations) ? data.donations : [],
    contacts: Array.isArray(data.contacts) ? data.contacts : [],
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export function getDb(): AppDatabase {
  if (memoryDb) {
    return memoryDb;
  }

  // 1. Try reading from /tmp if updated previously during container lifecycle
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const dataStr = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const parsed = JSON.parse(dataStr) as Partial<AppDatabase>;
      if (parsed && typeof parsed === 'object') {
        memoryDb = normalizeDb(parsed);
        return memoryDb;
      }
    } catch (e) {
      console.warn('Error reading TMP_DB_PATH:', e);
    }
  }

  // 2. Try reading from bundled LOCAL_DB_PATH (read-only allowed on Vercel)
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const dataStr = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(dataStr) as Partial<AppDatabase>;
      if (parsed && typeof parsed === 'object') {
        memoryDb = normalizeDb(parsed);
        return memoryDb;
      }
    } catch (e) {
      console.warn('Error reading LOCAL_DB_PATH:', e);
    }
  }

  // 3. Fallback to initial defaults
  memoryDb = {
    content: defaultContent,
    blogs: defaultBlogs,
    donations: [],
    contacts: [],
    updatedAt: new Date().toISOString(),
  };

  return memoryDb;
}

export function saveDb(db: AppDatabase): boolean {
  memoryDb = db;
  db.updatedAt = new Date().toISOString();
  const jsonStr = JSON.stringify(db, null, 2);

  // 1. Try writing to local project directory (works in local dev)
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, jsonStr, 'utf-8');
    return true;
  } catch {
    // Expected on Vercel / AWS Lambda (EROFS: read-only file system)
  }

  // 2. Fallback to writable /tmp directory on serverless
  try {
    fs.writeFileSync(TMP_DB_PATH, jsonStr, 'utf-8');
    return true;
  } catch (tmpErr) {
    console.warn('Failed to write to tmp filesystem, retained in memory cache:', tmpErr);
    return true;
  }
}
