#!/usr/bin/env node
// Minimal static server for tests and previews: serves a built folder under a path
// prefix, like GitHub Pages or a subfolder of hostelgames.com.
//
//   hostelgames-serve [folder] [prefix]     defaults: _site and /
//   PORT=8080 (environment)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? "_site");
let PREFIX = process.argv[3] ?? "/";
if (!PREFIX.endsWith("/")) PREFIX += "/";
const PORT = Number(process.env.PORT ?? 8080);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".txt": "text/plain" };

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (!pathname.startsWith(PREFIX)) {
    res.writeHead(404).end("Not found");
    return;
  }
  let file = join(ROOT, normalize(decodeURIComponent(pathname.slice(PREFIX.length))));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}${PREFIX}`));
