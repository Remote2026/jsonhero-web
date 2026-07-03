import fs from "fs";
import path from "path";

const DATA_DIR = process.env.JSONHERO_DATA_DIR || path.join(process.cwd(), ".jsonhero-data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_");
}

type KvPutOptions = {
  expirationTtl?: number;
  metadata?: any;
};

type StoredValue = {
  value: string;
  createdAt: number;
  ttl?: number;
};

export const KV = {
  async put(key: string, value: string, options?: KvPutOptions): Promise<void> {
    const filePath = path.join(DATA_DIR, sanitizeKey(key) + ".json");
    const data: StoredValue = {
      value,
      createdAt: Date.now(),
      ttl: options?.expirationTtl,
    };
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
  },

  async get(key: string): Promise<string | null> {
    const filePath = path.join(DATA_DIR, sanitizeKey(key) + ".json");
    if (!fs.existsSync(filePath)) return null;

    try {
      const data: StoredValue = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      // 检查 TTL 是否过期
      if (data.ttl && Date.now() - data.createdAt > data.ttl * 1000) {
        fs.unlinkSync(filePath);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    const filePath = path.join(DATA_DIR, sanitizeKey(key) + ".json");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },
};
