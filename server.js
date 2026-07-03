const path = require("path");
const fs = require("fs");

// 手动加载 .env 文件（避免引入额外依赖）
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Polyfill for @remix-run/cloudflare-workers globals (uses self.sign/self.unsign)
globalThis.self = globalThis;

// Install Remix-compatible Web API globals (Response, Request, Headers, fetch)
const { installGlobals } = require("@remix-run/node");
installGlobals();

const { createRequestHandler } = require("@remix-run/express");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.all(
  "*",
  createRequestHandler({
    build: require("./build"),
    getLoadContext() {
      return {
        waitUntil(promise) {
          return promise;
        },
      };
    },
  })
);

app.listen(PORT, () => {
  console.log(`✅ JSON Hero 已启动，访问 http://localhost:${PORT}`);
});
