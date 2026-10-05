// Comprueba enlaces internos e imágenes: node scripts/check.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs'
let bad = 0
for (const f of readdirSync('.').filter(f => f.endsWith('.html'))) {
  const h = readFileSync(f, 'utf8')
  const refs = [...h.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g), ...h.matchAll(/srcset="([^"]+)"/g)].flatMap(m => m[1].split(',').map(s => s.trim().split(' ')[0]))
  for (const r of refs) if (r && !/^(https?:|mailto:|tel:|data:)/.test(r) && !existsSync(r)) { console.log(f, '→', r); bad++ }
  for (const m of h.matchAll(/href="#([^"]+)"/g)) if (!h.includes(`id="${m[1]}"`)) { console.log(f, '→ #' + m[1]); bad++ }
}
console.log(bad ? `${bad} problemas` : 'Todo OK')
