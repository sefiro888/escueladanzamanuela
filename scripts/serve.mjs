// Servidor estático local: node scripts/serve.mjs [puerto]
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const PORT = +process.argv[2] || 5210
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' }
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p.endsWith('/')) p += 'index.html'
  const f = normalize(join(ROOT, p))
  try { const b = await readFile(f); res.writeHead(200, { 'Content-Type': T[extname(f)] || 'application/octet-stream' }); res.end(b) }
  catch { res.writeHead(404, { 'Content-Type': T['.html'] }); res.end(await readFile(join(ROOT, '404.html'))) }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`))
