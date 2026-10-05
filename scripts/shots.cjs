// Capturas de página completa: node scripts/shots.cjs <carpeta> [pagina...]   (servidor en 5210)
const path = require('path')
const { chromium } = require(path.join(process.env.APPDATA, 'npm/node_modules/playwright'))
const out = process.argv[2] || 'shots'
const pages = process.argv.slice(3).length ? process.argv.slice(3) : ['index']
;(async () => {
  const b = await chromium.launch()
  for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: name === 'mob', hasTouch: name === 'mob' })
    await ctx.addInitScript(() => { try { sessionStorage.setItem('edm-intro', '1') } catch (e) {} })
    const p = await ctx.newPage()
    const errs = []
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()))
    for (const pg of pages) {
      await p.goto(`http://localhost:5210/${pg}.html`, { waitUntil: 'networkidle' })
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 140)) } document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); scrollTo(0, 0); document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in')) })
      await p.waitForTimeout(2500)
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      await p.screenshot({ path: `${out}/${pg}-${name}.png`, fullPage: true })
      console.log(pg, name, 'overflow', ov, errs.length ? errs.join(' | ') : '')
      errs.length = 0
    }
    await ctx.close()
  }
  await b.close()
})()
