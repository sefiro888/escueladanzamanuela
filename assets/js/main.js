/* Escuela de Danza Manuela · interacciones */
(() => {
  const $ = (s, c = document) => c.querySelector(s)
  const $$ = (s, c = document) => [...c.querySelectorAll(s)]
  const root = document.documentElement
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  const WA = '34661770718'

  /* ---------- intro (una vez por sesión) ---------- */
  const ready = () => document.body.classList.add('is-ready')
  const intro = $('.intro')
  if (root.classList.contains('first-visit') && intro && !reduce) {
    setTimeout(() => { intro.classList.add('is-out'); ready() }, 2300)
    setTimeout(() => root.classList.remove('first-visit'), 3300)
  } else {
    root.classList.remove('first-visit')
    requestAnimationFrame(ready)
  }
  try { sessionStorage.setItem('edm-intro', '1') } catch (e) {}

  /* ---------- transición entre páginas ---------- */
  const curtain = $('.curtain')
  addEventListener('pageshow', () => {
    if (curtain && curtain.classList.contains('is-in')) {
      curtain.classList.add('is-leaving')
      setTimeout(() => curtain.classList.remove('is-in', 'is-leaving'), 700)
    }
  })
  try {
    if (sessionStorage.getItem('edm-nav') && curtain && !reduce) {
      curtain.classList.add('is-in')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        curtain.classList.add('is-leaving')
        setTimeout(() => curtain.classList.remove('is-in', 'is-leaving'), 750)
      }))
    }
    sessionStorage.removeItem('edm-nav')
  } catch (e) {}
  document.addEventListener('click', e => {
    const a = e.target.closest('a')
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
    const href = a.getAttribute('href') || ''
    if (a.target === '_blank' || !/\.html(#.*)?$/.test(href) || href.startsWith('http')) return
    const url = new URL(href, location.href)
    if (url.pathname === location.pathname) return
    e.preventDefault()
    try { sessionStorage.setItem('edm-nav', '1') } catch (err) {}
    curtain.classList.add('is-in')
    setTimeout(() => { location.href = url.href }, 520)
  })

  /* ---------- cabecera ---------- */
  const header = $('.site-header')
  let lastY = scrollY
  const fab = $('.fab-wa'), bar = $('.actionbar')
  const onScroll = () => {
    const y = scrollY
    header.classList.toggle('is-scrolled', y > 40)
    const hide = y > 500 && y > lastY && !document.body.classList.contains('lock')
    header.classList.toggle('is-hidden', hide)
    root.classList.toggle('header-hidden', hide)
    lastY = y
    fab && fab.classList.toggle('is-on', y > 500)
    bar && bar.classList.toggle('is-on', y > 260)
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  /* ---------- mega menú ---------- */
  const megaBtn = $('.nav__classes'), mega = $('#mega')
  if (megaBtn && mega) {
    let t
    const set = open => {
      clearTimeout(t)
      megaBtn.setAttribute('aria-expanded', open)
      mega.classList.toggle('is-open', open)
      header.classList.toggle('mega-open', open)
    }
    megaBtn.addEventListener('click', () => set(megaBtn.getAttribute('aria-expanded') !== 'true'))
    if (fine) {
      ;[megaBtn, mega].forEach(el => {
        el.addEventListener('mouseenter', () => set(true))
        el.addEventListener('mouseleave', () => { t = setTimeout(() => set(false), 220) })
      })
    }
    $$('[data-preview]', mega).forEach(l => {
      const show = () => $$('.mega__pv', mega).forEach(p => p.classList.toggle('is-on', p.dataset.pv === l.dataset.preview))
      l.addEventListener('mouseenter', show); l.addEventListener('focus', show)
    })
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mega.classList.contains('is-open')) { set(false); megaBtn.focus() } })
    document.addEventListener('click', e => { if (!e.target.closest('.mega, .nav__classes')) set(false) })
  }

  /* ---------- menú móvil ---------- */
  const burger = $('.burger'), drawer = $('#drawer')
  if (burger && drawer) {
    const set = open => {
      burger.setAttribute('aria-expanded', open)
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
      drawer.classList.toggle('is-open', open)
      drawer.setAttribute('aria-hidden', !open)
      document.body.classList.toggle('lock', open)
      header.classList.remove('is-hidden')
    }
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'))
    $$('a', drawer).forEach(a => a.addEventListener('click', () => setTimeout(() => set(false), 300)))
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { set(false); burger.focus() } })
    const acc = $('.drawer__acc', drawer)
    acc && acc.addEventListener('click', () => acc.setAttribute('aria-expanded', acc.getAttribute('aria-expanded') !== 'true'))
    addEventListener('resize', () => { if (innerWidth > 980) set(false) })
  }

  /* ---------- banner principal: carrusel de estilos ---------- */
  const hero = $('.hero')
  if (hero) {
    const slides = $$('.hero__slide', hero), dots = $$('.hero__dot', hero)
    const now = $('.hero__class', hero), count = $('.hero__count b', hero)
    const DUR = 6000
    let i = 0, timer
    const go = n => {
      slides[i].classList.remove('is-on'); dots[i].classList.remove('is-on')
      i = (n + slides.length) % slides.length
      const s = slides[i]
      s.classList.add('is-on'); dots[i].classList.add('is-on')
      dots[i].style.setProperty('--dur', DUR + 'ms')
      now.href = s.dataset.href
      now.querySelector('strong').textContent = s.dataset.name
      now.querySelector('span').textContent = s.dataset.tag
      now.classList.remove('swap'); void now.offsetWidth; now.classList.add('swap')
      count.textContent = String(i + 1).padStart(2, '0')
      if (innerWidth < 980) dots[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
      schedule()
    }
    const schedule = () => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => go(i + 1), DUR) }
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)))
    dots[0].style.setProperty('--dur', DUR + 'ms')
    // precarga suave de las siguientes imágenes
    setTimeout(() => slides.forEach(s => { const im = s.querySelector('img'); im.loading = 'eager' }), 1500)
    document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(timer) : schedule())
    schedule()
  }

  /* ---------- destellos en el banner ---------- */
  const cv = $('.hero__sparkles')
  if (cv && !reduce) {
    const ctx = cv.getContext('2d')
    let w, h, dpr, parts = [], on = true
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; h = cv.offsetHeight
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(70, w / 22))
      parts = Array.from({ length: n }, () => mk(true))
    }
    const mk = init => ({ x: Math.random() * w, y: init ? Math.random() * h : h + 10, r: Math.random() * 2.4 + .6, s: Math.random() * .35 + .08, p: Math.random() * Math.PI * 2, star: Math.random() < .28, hue: Math.random() < .5 ? '247,201,217' : '231,181,159' })
    const star = (x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r * 3); ctx.quadraticCurveTo(x, y, x + r * 3, y); ctx.quadraticCurveTo(x, y, x, y + r * 3); ctx.quadraticCurveTo(x, y, x - r * 3, y); ctx.quadraticCurveTo(x, y, x, y - r * 3); ctx.fill() }
    const tick = t => {
      if (!on) return
      ctx.clearRect(0, 0, w, h)
      for (const q of parts) {
        q.y -= q.s; q.x += Math.sin((t / 2000) + q.p) * .15
        if (q.y < -10) Object.assign(q, mk(false))
        const a = (Math.sin(t / 700 + q.p) + 1) / 2 * .8 + .1
        ctx.fillStyle = `rgba(${q.hue},${a})`
        if (q.star) star(q.x, q.y, q.r * .9)
        else { ctx.beginPath(); ctx.arc(q.x, q.y, q.r * .6, 0, 7); ctx.fill() }
      }
      requestAnimationFrame(tick)
    }
    resize(); addEventListener('resize', resize)
    new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(tick) }).observe(cv)
    requestAnimationFrame(tick)
  }

  /* ---------- aparición al hacer scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 })
  $$('.reveal').forEach(el => io.observe(el))

  /* ---------- contadores ---------- */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return
    const el = e.target, end = +el.dataset.count, dec = +el.dataset.dec || 0, t0 = performance.now(), d = 1600
    const step = t => {
      const k = Math.min(1, (t - t0) / d), v = end * (1 - Math.pow(1 - k, 4))
      el.textContent = v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      if (k < 1) requestAnimationFrame(step)
    }
    reduce ? (el.textContent = end.toLocaleString('es-ES', { minimumFractionDigits: dec })) : requestAnimationFrame(step)
    co.unobserve(el)
  }), { threshold: .6 })
  $$('[data-count]').forEach(el => co.observe(el))

  /* ---------- filtro de clases ---------- */
  $$('.chips [data-filter]').forEach(b => b.addEventListener('click', () => {
    $$('.chips [data-filter]').forEach(x => x.classList.toggle('is-on', x === b))
    const f = b.dataset.filter
    $$('.ccard').forEach(c => {
      const ok = f === 'all' || (f === 'intenso' ? +c.dataset.energy >= 4 : c.dataset.tags.split(' ').includes(f))
      c.classList.toggle('is-hidden', !ok)
      if (ok) { c.classList.remove('is-in'); requestAnimationFrame(() => c.classList.add('is-in')) }
    })
  }))

  /* ---------- test «¿qué estilo va contigo?» ---------- */
  const quiz = $('[data-quiz]')
  if (quiz && window.EDM) {
    const steps = $$('.quiz__step', quiz), res = $('.quiz__result', quiz), bar = $('.quiz__progress i', quiz)
    let score = {}, k = 0
    const show = n => { steps.forEach((s, j) => s.classList.toggle('is-on', j === n)); bar.style.width = (n / steps.length * 100) + '%' }
    $$('.quiz__opt', quiz).forEach(o => o.addEventListener('click', () => {
      const w = JSON.parse(o.dataset.w)
      for (const s in w) score[s] = (score[s] || 0) + w[s]
      k++
      if (k < steps.length) return show(k)
      steps.forEach(s => s.classList.remove('is-on')); bar.style.width = '100%'
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]
      const c = EDM.classes[best]
      const msg = `¡Hola, Manuela! He hecho el test de la web y me ha salido ${c.name}. Me gustaría probar una clase.`
      $('.quiz__match', res).innerHTML = `<img src="assets/img/${c.photo}-640.webp" alt=""><div><h3>${c.name}</h3><p>${c.tagline}</p><small>${c.ages}</small><div class="btn-row"><a class="btn btn--rose btn--sm" href="${c.href}">Ver la clase</a><a class="btn btn--ghost btn--sm" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Reservar</a></div></div>`
      res.hidden = false
    }))
    $('.quiz__again', res).addEventListener('click', () => { score = {}; k = 0; res.hidden = true; show(0) })
    show(0)
  }

  /* ---------- horario: pestañas, hoy, próxima clase ---------- */
  const today = (new Date().getDay() + 6) % 7 // 0 = lunes
  const mins = s => { const [h, m] = s.split(':'); return +h * 60 + +m }
  const nowM = new Date().getHours() * 60 + new Date().getMinutes()
  $$('[data-sched]').forEach(sc => {
    const tabs = $$('[role="tab"]', sc), days = $$('.sched__day', sc)
    const sel = d => {
      tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.day == d))
      days.forEach(x => x.classList.toggle('is-on', x.dataset.day == d))
    }
    tabs.forEach(t => {
      t.addEventListener('click', () => sel(t.dataset.day))
      if (+t.dataset.day === today) t.classList.add('is-today')
    })
    const todayPanel = days.find(x => +x.dataset.day === today)
    if (todayPanel) {
      sel(today)
      let marked = false
      $$('.slot', todayPanel).forEach(s => {
        if (mins(s.dataset.end) < nowM) s.classList.add('is-past')
        else if (!marked) { s.classList.add('is-next'); marked = true }
      })
    }
  })
  $$('.week__col').forEach(c => c.classList.toggle('is-today', +c.dataset.day === today))
  $$('[data-sf]').forEach(b => b.addEventListener('click', () => {
    $$('[data-sf]').forEach(x => x.classList.toggle('is-on', x === b))
    $$('.wslot').forEach(s => s.classList.toggle('is-dim', b.dataset.sf !== 'all' && s.dataset.slug !== b.dataset.sf))
  }))

  /* ---------- niveles ---------- */
  $$('.levels').forEach(l => $$('[data-lv][role="tab"]', l).forEach(b => b.addEventListener('click', () => {
    $$('[role="tab"]', l).forEach(x => x.setAttribute('aria-selected', x === b))
    $$('.levels__panel', l).forEach(p => p.classList.toggle('is-on', p.dataset.lv === b.dataset.lv))
  })))

  /* ---------- carruseles (opiniones, otros estilos) ---------- */
  $$('[data-slider]').forEach(sl => {
    const track = $('.slider__track', sl), items = [...track.children]
    const sec = sl.closest('section'), prev = $('[data-prev]', sec), next = $('[data-next]', sec), barI = $('.slider__bar i', sec)
    let x = 0, auto
    const pad = () => parseFloat(getComputedStyle(track).paddingLeft)
    const max = () => Math.max(0, track.scrollWidth - sl.clientWidth)
    const stepW = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20)
    const apply = (anim = true) => {
      x = Math.max(0, Math.min(max(), x))
      track.style.transition = anim ? '' : 'none'
      track.style.transform = `translateX(${-x}px)`
      if (barI) { const r = sl.clientWidth / track.scrollWidth; barI.style.width = (r * 100) + '%'; barI.style.transform = `translateX(${(max() ? x / max() : 0) * (1 / r - 1) * 100}%)` }
    }
    const move = d => { x = (d > 0 && x >= max() - 2) ? 0 : x + d * stepW(); apply() }
    prev && prev.addEventListener('click', () => { move(-1); stop() })
    next && next.addEventListener('click', () => { move(1); stop() })
    let sx = null, sy = 0, x0 = 0, dragged = false
    sl.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; x0 = x; dragged = false; stop() })
    addEventListener('pointermove', e => {
      if (sx === null) return
      const dx = e.clientX - sx
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - sy)) { dragged = true; x = x0 - dx; apply(false) }
    })
    addEventListener('pointerup', () => { if (sx === null) return; sx = null; if (dragged) { x = Math.round(x / stepW()) * stepW(); apply() } })
    sl.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation() } }, true)
    sl.addEventListener('dragstart', e => e.preventDefault())
    const stop = () => clearInterval(auto)
    if (sec.classList.contains('reviews') && !reduce) auto = setInterval(() => move(1), 5000)
    addEventListener('resize', () => apply(false))
    apply(false)
  })

  /* ---------- galería con visor ---------- */
  const lb = $('#lightbox')
  const items = $$('[data-lb]')
  if (lb && items.length) {
    const im = $('img', lb), cap = $('figcaption', lb)
    let k = 0
    const open = n => { k = (n + items.length) % items.length; im.src = items[k].dataset.full; im.alt = items[k].querySelector('img').alt; cap.textContent = items[k].dataset.cap; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock') }
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock') }
    items.forEach((b, n) => b.addEventListener('click', () => open(n)))
    $('.lightbox__close', lb).addEventListener('click', close)
    $('.lightbox__prev', lb).addEventListener('click', () => open(k - 1))
    $('.lightbox__next', lb).addEventListener('click', () => open(k + 1))
    lb.addEventListener('click', e => { if (e.target === lb) close() })
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') open(k - 1); if (e.key === 'ArrowRight') open(k + 1)
    })
  }

  /* ---------- mapas bajo demanda ---------- */
  $$('.sede__load').forEach(b => b.addEventListener('click', () => {
    const box = b.closest('.sede__map')
    box.innerHTML = `<iframe src="${box.dataset.map}" title="Mapa de la sede" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`
  }))

  /* ---------- subnavegación activa ---------- */
  const sub = $$('.subnav a[href^="#"]:not(.subnav__cta)')
  if (sub.length) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      sub.forEach(a => {
        const on = a.getAttribute('href') === '#' + e.target.id
        a.classList.toggle('is-active', on)
        if (on) a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
      })
    }), { rootMargin: '-45% 0px -50% 0px' })
    sub.forEach(a => { const t = $(a.getAttribute('href')); t && so.observe(t) })
  }

  /* ---------- formulario → WhatsApp ---------- */
  $$('[data-wform]').forEach(f => {
    const pv = $('.wform__preview p', f), boda = f.dataset.boda === '1', cls = f.dataset.class
    const val = n => (f.elements[n] && f.elements[n].value.trim()) || ''
    const build = () => {
      const nombre = val('nombre')
      const L = [nombre ? `¡Hola, Manuela! Soy ${nombre}.` : '¡Hola, Manuela!']
      if (boda) {
        L.push('Nos casamos y nos gustaría preparar nuestro baile nupcial.')
        val('fecha') && L.push(`• Fecha de la boda: ${new Date(val('fecha') + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`)
        val('cancion') && L.push(`• Canción: ${val('cancion')}`)
      } else {
        L.push(`Me gustaría información para probar ${cls === 'una clase' ? 'una clase' : 'una clase de ' + cls}.`)
        L.push(`• ${val('para')}`)
        val('edad') && L.push(`• Edad: ${val('edad')}`)
      }
      L.push(`• Experiencia: ${val('exp').toLowerCase()}`)
      L.push(`• Franja preferida: ${val('franja').toLowerCase()}`)
      val('sede') !== 'Cualquiera' && L.push(`• Sede: ${val('sede')}`)
      val('nota') && L.push(`• ${val('nota')}`)
      L.push('¡Gracias!')
      return L.join('\n')
    }
    const upd = () => { pv.textContent = build() }
    f.addEventListener('input', upd); f.addEventListener('change', upd); upd()
    f.addEventListener('submit', e => {
      e.preventDefault()
      if (!f.reportValidity()) return
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(build())}`, '_blank', 'noopener')
    })
  })

  /* ---------- parallax suave ---------- */
  const par = $$('.wedding__media img')
  if (par.length && !reduce) {
    const run = () => par.forEach(img => {
      const r = img.parentElement.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return
      img.style.transform = `translateY(${-(r.top + r.height / 2 - innerHeight / 2) * .08 - 40}px)`
    })
    addEventListener('scroll', () => requestAnimationFrame(run), { passive: true }); run()
  }

  /* ---------- botones magnéticos y cursor ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect()
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`
      })
      b.addEventListener('mouseleave', () => { b.style.transform = '' })
    })
    const cur = $('.cursor')
    if (cur) {
      root.classList.add('has-cursor')
      let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy
      cur.style.opacity = '0'
      addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = '1' })
      const loop = () => { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop) }
      loop()
      document.addEventListener('mouseover', e => cur.classList.toggle('is-hover', !!e.target.closest('a, button, summary, [data-lb], input, select, textarea')))
    }
  }
})()
