// Genera todas las páginas HTML a partir de content.mjs
// Uso: node scripts/build.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  SITE, ANNOUNCE, GROUPS, CLASSES, BODAS, REVIEWS, STATS, MILESTONES, TEAM, VALUES,
  SCHEDULE, DAYS, FAQ, QUIZ,
} from './content.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ALL = [...CLASSES, BODAS]
const BY = Object.fromEntries(ALL.map(c => [c.slug, c]))
const V = '20261005b'

// ---------- utilidades ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = s => String(s).replace(/<[^>]+>/g, '')
const wa = text => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
const href = slug => `${slug}.html`
const sedeBy = id => SITE.sedes.find(s => s.id === id)

const SIZES = { 'bodas': [640, 720] }
function img(slug, alt, { sizes = '100vw', cls = '', eager = false, attrs = '' } = {}) {
  const ws = SIZES[slug] || [640, 1280, 1920]
  const src = `assets/img/${slug}-${ws[Math.min(1, ws.length - 1)]}.webp`
  const set = ws.map(w => `assets/img/${slug}-${w}.webp ${w}w`).join(', ')
  return `<img src="${src}" srcset="${set}" sizes="${sizes}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${attrs ? ' ' + attrs : ''}>`
}
const deco = (slug, alt = '', cls = 'deco') =>
  `<img class="${cls}" src="assets/img/deco-${slug}-720.webp" srcset="assets/img/deco-${slug}-720.webp 720w, assets/img/deco-${slug}-1400.webp 1400w" sizes="(max-width: 760px) 90vw, 600px" alt="${esc(alt)}" loading="lazy" decoding="async"${alt ? '' : ' aria-hidden="true"'}>`

const I = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" class="dot"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.5-3.5h-3V7.8c0-.6.5-1 1-1H15Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M12 1c.6 5.4 2.6 8.4 11 11-8.4 2.6-10.4 5.6-11 11-.6-5.4-2.6-8.4-11-11 8.4-2.6 10.4-5.6 11-11Z"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  level: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20v-5M10 20V10M16 20V6M22 20V3"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M8 5v14l11-7z"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  ring: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14" r="6"/><circle cx="15" cy="10" r="6"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/></svg>',
}
const stars = n => `<span class="stars" aria-label="${n} de 5 estrellas">${I.star.repeat(n)}</span>`
const energy = n => `<span class="energy" aria-label="Energía ${n} de 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`
const TAGS = { peques: 'Peques', jovenes: 'Jóvenes', adultos: 'Adultos', parejas: 'Parejas' }

// ---------- piezas comunes ----------
function head(p) {
  const title = p.slug === 'index' ? `${SITE.name} · Clases de baile en San Blas-Canillejas, Madrid` : `${p.title} · ${SITE.name}`
  const url = SITE.url + (p.slug === 'index' ? '' : `${p.slug}.html`)
  const ld = {
    '@context': 'https://schema.org', '@type': 'DanceSchool', name: SITE.name, slogan: SITE.slogan,
    telephone: SITE.phoneIntl, email: SITE.email, url: SITE.url, image: SITE.url + 'assets/img/og-escuela-danza-manuela.jpg',
    address: { '@type': 'PostalAddress', streetAddress: 'Av. de Canillejas a Vicálvaro, 139', postalCode: '28022', addressLocality: 'Madrid', addressCountry: 'ES' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: SITE.ratingValue, reviewCount: SITE.reviewCount },
    sameAs: [SITE.instagram, SITE.facebook],
  }
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0e080b">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}assets/img/og-escuela-danza-manuela.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="48x48" href="assets/img/favicon-48.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css?v=${V}">
${p.preload ? `<link rel="preload" as="image" href="${p.preload}" fetchpriority="high">` : ''}
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('edm-intro'))document.documentElement.classList.add('first-visit')}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>`
}

function announce() {
  const items = ANNOUNCE.map(t => `<span>${esc(t)}</span><i>${I.spark}</i>`).join('')
  return `<div class="announce" role="region" aria-label="Avisos de la escuela"><div class="announce__track">${items}${items.replace(/<span>/g, '<span aria-hidden="true">')}</div></div>`
}

function megaMenu() {
  const cols = GROUPS.map(g => `
        <div class="mega__col">
          <p class="mega__group">${g.name}</p>
          ${g.classes.map(s => {
            const c = BY[s]
            return `<a class="mega__link" href="${href(s)}" data-preview="${s}"><span class="mega__name">${c.name}</span><span class="mega__desc">${c.menu}</span></a>`
          }).join('')}
        </div>`).join('')
  const previews = ALL.map((c, i) => `<figure class="mega__pv${i === 0 ? ' is-on' : ''}" data-pv="${c.slug}">${img(c.photo, c.alt, { sizes: '420px' })}<figcaption><strong>${c.name}</strong><span>${c.ages}</span></figcaption></figure>`).join('')
  return `
    <div class="mega" id="mega" role="region" aria-label="Clases">
      <div class="mega__inner">
        <div class="mega__cols">${cols}
          <a class="mega__feature" href="${href(BODAS.slug)}" data-preview="${BODAS.slug}">
            <span class="eyebrow">${I.ring} A medida</span>
            <strong>Baile nupcial</strong>
            <span>Vuestro primer baile, coreografiado para vosotros en unas 10 clases.</span>
            <span class="link-arrow">Descubrir ${I.arrow}</span>
          </a>
        </div>
        <div class="mega__preview" aria-hidden="true">${previews}</div>
      </div>
      <div class="mega__foot">
        <a href="horarios.html">${I.clock} Ver horario semanal</a>
        <a href="index.html#encuentra">${I.spark} ¿No sabes cuál elegir? Haz el test</a>
        <a href="${wa('¡Hola, Manuela! Me gustaría información sobre las clases de la escuela.')}" target="_blank" rel="noopener">${I.wa} Pregunta por WhatsApp</a>
      </div>
    </div>`
}

function header(p) {
  const cur = s => (p.nav === s ? ' aria-current="page"' : '')
  return `
<a class="skip" href="#main">Saltar al contenido</a>
${announce()}
<header class="site-header${p.lightTop ? ' on-light' : ''}" id="top">
  <div class="site-header__bar">
    <a class="brand" href="index.html" aria-label="${SITE.name}, inicio">
      <img class="brand__light" src="assets/img/logo-light.webp" alt="${SITE.name}" width="640" height="389">
    </a>
    <nav class="nav" aria-label="Principal">
      <button class="nav__item nav__classes" aria-expanded="false" aria-controls="mega"${p.nav === 'clases' ? ' data-current' : ''}>Clases ${I.chev}</button>
      <a class="nav__item" href="horarios.html"${cur('horarios')}>Horarios</a>
      <a class="nav__item" href="${href(BODAS.slug)}"${cur('bodas')}>Baile nupcial</a>
      <a class="nav__item" href="la-escuela.html"${cur('escuela')}>La escuela</a>
      <a class="nav__item" href="contacto.html"${cur('contacto')}>Contacto</a>
    </nav>
    <div class="site-header__actions">
      <a class="tel-pill" href="tel:${SITE.phoneIntl}">${I.phone}<span>${SITE.phone}</span></a>
      <a class="btn btn--rose btn--sm" href="${wa('¡Hola, Manuela! Me gustaría reservar una clase de prueba. ¿Qué disponibilidad tenéis?')}" target="_blank" rel="noopener">Reserva tu clase</a>
      <button class="burger" aria-expanded="false" aria-controls="drawer" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    </div>
  </div>
  ${megaMenu()}
</header>
${drawer()}`
}

function drawer() {
  const tiles = ALL.map((c, i) => `<a class="dtile" href="${href(c.slug)}" style="--i:${i}">${img(c.photo, '', { sizes: '45vw' })}<span>${c.name}</span></a>`).join('')
  return `
<div class="drawer" id="drawer" aria-hidden="true" aria-label="Menú">
  <div class="drawer__glow" aria-hidden="true"></div>
  <div class="drawer__inner">
    <nav class="drawer__nav" aria-label="Menú móvil">
      <a href="index.html" style="--i:0">Inicio</a>
      <button class="drawer__acc" aria-expanded="true" aria-controls="dclasses" style="--i:1">Clases <span>${ALL.length}</span>${I.chev}</button>
      <div class="drawer__tiles" id="dclasses">${tiles}</div>
      <a href="horarios.html" style="--i:2">Horarios</a>
      <a href="${href(BODAS.slug)}" style="--i:3">Baile nupcial</a>
      <a href="la-escuela.html" style="--i:4">La escuela</a>
      <a href="contacto.html" style="--i:5">Contacto</a>
    </nav>
    <div class="drawer__cta">
      <a class="btn btn--rose" href="${wa('¡Hola, Manuela! Me gustaría información sobre las clases.')}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>
      <a class="btn btn--ghost" href="tel:${SITE.phoneIntl}">${I.phone} Llamar</a>
    </div>
    <div class="drawer__foot">
      <p>${SITE.sedes.map(s => s.street).join(' · ')}</p>
      <div class="socials"><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a><a href="mailto:${SITE.email}" aria-label="Correo">${I.mail}</a></div>
    </div>
  </div>
</div>`
}

function footer() {
  return `
<footer class="footer">
  <div class="footer__ribbon" aria-hidden="true">${deco('cintas', '', 'footer__cintas')}</div>
  <div class="wrap">
    <div class="footer__sign">
      <p class="footer__slogan">Baila con el <em>corazón</em>,<br> los pies te seguirán.</p>
      <a class="btn btn--rose btn--lg" href="${wa('¡Hola, Manuela! Quiero empezar a bailar. ¿Me contáis cómo funciona?')}" target="_blank" rel="noopener">${I.wa} Empieza a bailar</a>
    </div>
    <div class="footer__grid">
      <div class="footer__brand">
        <img src="assets/img/logo-light.webp" alt="${SITE.name}" width="640" height="389" loading="lazy">
        <p>Escuela de danza familiar en San Blas-Canillejas. Flamenco, ballet, funky, moderno, salsa, K-pop, comercial, zumba, country y baile nupcial.</p>
        <div class="socials">
          <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>
          <a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a>
          <a href="mailto:${SITE.email}" aria-label="Correo electrónico">${I.mail}</a>
        </div>
      </div>
      <div>
        <p class="footer__h">Clases</p>
        <ul>${ALL.map(c => `<li><a href="${href(c.slug)}">${c.name}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="footer__h">La escuela</p>
        <ul>
          <li><a href="la-escuela.html">Quiénes somos</a></li>
          <li><a href="horarios.html">Horarios</a></li>
          <li><a href="index.html#opiniones">Opiniones</a></li>
          <li><a href="contacto.html#preguntas">Preguntas frecuentes</a></li>
          <li><a href="contacto.html">Contacto</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__h">Visítanos</p>
        ${SITE.sedes.map(s => `<p class="footer__sede"><strong>${s.name}</strong><a href="${s.maps}" target="_blank" rel="noopener">${s.street}</a><span>${s.city}</span></p>`).join('')}
        <p class="footer__sede"><strong>Teléfono y WhatsApp</strong><a href="tel:${SITE.phoneIntl}">${SITE.phone}</a><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </div>
    </div>
    <div class="footer__legal">
      <p>© ${new Date().getFullYear()} ${SITE.name} · Madrid</p>
      <p><a href="aviso-legal.html">Aviso legal</a> · <a href="privacidad.html">Privacidad</a> · <a href="cookies.html">Cookies</a></p>
      <p class="footer__demo">Web de demostración · horarios orientativos</p>
    </div>
  </div>
</footer>
<a class="fab-wa" href="${wa('¡Hola, Manuela! Me gustaría información sobre las clases.')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${I.wa}<span>¿Hablamos?</span></a>
<nav class="actionbar" aria-label="Acciones rápidas">
  <a href="index.html#clases">${I.spark}<span>Clases</span></a>
  <a href="horarios.html">${I.clock}<span>Horarios</span></a>
  <a class="actionbar__wa" href="${wa('¡Hola, Manuela! Me gustaría información sobre las clases.')}" target="_blank" rel="noopener">${I.wa}<span>WhatsApp</span></a>
  <a href="tel:${SITE.phoneIntl}">${I.phone}<span>Llamar</span></a>
  <a href="contacto.html">${I.pin}<span>Sedes</span></a>
</nav>
<div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Galería">
  <button class="lightbox__close" aria-label="Cerrar">×</button>
  <button class="lightbox__nav lightbox__prev" aria-label="Anterior">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lightbox__nav lightbox__next" aria-label="Siguiente">›</button>
</div>`
}

function intro() {
  return `
<div class="intro" aria-hidden="true">
  <div class="intro__inner">
    <img class="intro__dancer" src="assets/img/bailarina.png" alt="">
    <img class="intro__logo" src="assets/img/logo-light.webp" alt="">
    <p class="intro__line">${SITE.slogan}</p>
    <span class="intro__bar"><i></i></span>
  </div>
</div>
<div class="curtain" aria-hidden="true"><img src="assets/img/bailarina.png" alt=""></div>`
}

function page(p, body) {
  return `${head(p)}
<body class="page-${p.slug}">
${intro()}
${header(p)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/data.js?v=${V}"></script>
<script src="assets/js/main.js?v=${V}" defer></script>
</body>
</html>
`
}

// ---------- bloques reutilizables ----------
const sectionHead = (kicker, title, text = '', cls = '') => `
      <div class="shead ${cls} reveal">
        <p class="kicker">${I.spark}${kicker}</p>
        <h2>${title}</h2>
        ${text ? `<p class="shead__text">${text}</p>` : ''}
      </div>`

function classCard(c, i) {
  return `
        <a class="ccard reveal" href="${href(c.slug)}" data-tags="${c.tags.join(' ')}" data-energy="${c.energy}" style="--d:${(i % 3) * 80}ms">
          <div class="ccard__media">${img(c.photo, c.alt, { sizes: '(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 30vw' })}</div>
          <span class="ccard__num">${String(i + 1).padStart(2, '0')}</span>
          <div class="ccard__body">
            <div class="ccard__tags">${c.tags.map(t => `<span>${TAGS[t]}</span>`).join('')}</div>
            <h3>${c.name}</h3>
            <p>${c.tagline}</p>
            <div class="ccard__meta"><span>${energy(c.energy)}</span><span class="link-arrow">Descubrir ${I.arrow}</span></div>
          </div>
        </a>`
}

function reviewsBlock(list = REVIEWS, title = 'Lo que dicen <em>las familias</em>') {
  const cards = list.map(r => `
          <figure class="review">
            <div class="review__top">${stars(r.rating)}<span class="review__tag">${r.tag}</span></div>
            <blockquote>${esc(r.text)}</blockquote>
            <figcaption><span class="review__avatar">${esc(r.name.trim()[0].toUpperCase())}</span><span><strong>${esc(r.name)}</strong><small>Google · ${r.when}</small></span></figcaption>
          </figure>`).join('')
  return `
  <section class="section section--noir reviews" id="opiniones">
    <div class="wrap">
      <div class="reviews__head">
        ${sectionHead('Opiniones reales de Google', title)}
        <div class="rating-card reveal">
          <strong>${SITE.rating}</strong>
          <div>${stars(5)}<span>${SITE.reviewCount} reseñas en Google</span></div>
          <a class="link-arrow" href="${SITE.reviewsUrl}" target="_blank" rel="noopener">Ver en Google ${I.arrowUp}</a>
        </div>
      </div>
    </div>
    <div class="slider" data-slider>
      <div class="slider__track">${cards}</div>
    </div>
    <div class="wrap slider__ctrl">
      <button class="round-btn" data-prev aria-label="Opinión anterior">${I.arrow}</button>
      <div class="slider__bar"><i></i></div>
      <button class="round-btn" data-next aria-label="Opinión siguiente">${I.arrow}</button>
    </div>
  </section>`
}

function faqBlock(list, id = 'preguntas', kicker = 'Preguntas frecuentes', title = 'Todo lo que <em>sueles preguntar</em>') {
  return `
  <section class="section faq" id="${id}">
    <div class="wrap faq__grid">
      <div>
        ${sectionHead(kicker, title, '¿No encuentras tu respuesta? Escríbenos y te contestamos enseguida.')}
        <a class="btn btn--dark reveal" href="${wa('¡Hola! Tengo una pregunta sobre la escuela:')}" target="_blank" rel="noopener">${I.wa} Preguntar por WhatsApp</a>
      </div>
      <div class="acc reveal">
        ${list.map(([q, a], i) => `
        <details class="acc__item"${i === 0 ? ' open' : ''}>
          <summary>${q}<span class="acc__icon" aria-hidden="true"></span></summary>
          <div class="acc__body"><p>${a}</p></div>
        </details>`).join('')}
      </div>
    </div>
  </section>`
}

function scheduleTable(entries, { showClass = true, id = 'horario' } = {}) {
  const days = DAYS.map((d, i) => ({ d, i, items: entries.filter(e => e.day === i) })).filter(x => x.items.length)
  return `
      <div class="sched" data-sched id="${id}-cuadro">
        <div class="sched__tabs" role="tablist" aria-label="Días de la semana">
          ${days.map((x, k) => `<button role="tab" data-day="${x.i}" aria-selected="${k === 0}">${x.d.slice(0, 3)}<span>${x.d}</span></button>`).join('')}
        </div>
        <div class="sched__days">
          ${days.map((x, k) => `
          <div class="sched__day${k === 0 ? ' is-on' : ''}" data-day="${x.i}" role="tabpanel">
            <h3 class="sched__dname">${x.d}</h3>
            ${x.items.map(e => {
              const c = BY[e.slug]; const s = sedeBy(e.sede)
              const msg = `¡Hola, Manuela! Me gustaría reservar una clase de ${c.name} (${e.group}) del ${x.d.toLowerCase()} a las ${e.start}. ¿Queda plaza?`
              return `
            <div class="slot" data-start="${e.start}" data-end="${e.end}" data-slug="${e.slug}">
              <span class="slot__time">${e.start}<small>${e.end}</small></span>
              <span class="slot__info">${showClass ? `<a href="${href(e.slug)}">${c.name}</a>` : `<strong>${c.name}</strong>`}<small>${e.group} · ${s.name.replace('Sede ', '')}</small></span>
              <a class="slot__book" href="${wa(msg)}" target="_blank" rel="noopener" aria-label="Reservar ${c.name} ${x.d} ${e.start}">${I.wa}<span>Reservar</span></a>
            </div>`
            }).join('')}
          </div>`).join('')}
        </div>
        <p class="sched__note">${I.clock} Horario orientativo de ejemplo. Confírmalo por WhatsApp antes de venir.</p>
      </div>`
}

function bookingForm(c) {
  const isBoda = c.slug === BODAS.slug
  return `
  <section class="section section--noir booking" id="reserva">
    ${deco(c.decor, '', 'booking__deco')}
    <div class="wrap booking__grid">
      <div>
        ${sectionHead('Reserva sin compromiso', isBoda ? 'Contadnos <em>vuestra boda</em>' : `Prueba <em>${c.name}</em>`, isBoda ? 'Rellenad estos datos y se abrirá WhatsApp con el mensaje ya escrito. No se envía nada hasta que pulséis «Enviar».' : 'Completa estos datos y se abrirá WhatsApp con el mensaje preparado. No se envía nada hasta que pulses «Enviar».')}
        <ul class="ticks reveal">
          <li>${I.spark} Respuesta personal de la escuela</li>
          <li>${I.spark} Te orientamos sobre el grupo y el nivel</li>
          <li>${I.spark} Sin compromiso de matrícula</li>
        </ul>
      </div>
      <form class="wform reveal" data-wform data-class="${esc(c.name)}" data-boda="${isBoda ? 1 : 0}">
        <div class="wform__row">
          <label>Nombre<input name="nombre" required autocomplete="given-name" placeholder="${isBoda ? 'Vuestros nombres' : 'Tu nombre'}"></label>
          ${isBoda ? `<label>Fecha de la boda<input name="fecha" type="month"></label>` : `
          <label>¿Para quién?<select name="para"><option>Para mí</option><option>Para mi hija o hijo</option><option>Para dos personas</option></select></label>`}
        </div>
        <div class="wform__row">
          ${isBoda ? `<label>Canción (si la tenéis)<input name="cancion" placeholder="Título o artista"></label>` : `<label>Edad<input name="edad" inputmode="numeric" placeholder="Ej.: 7 años / adulto"></label>`}
          <label>Experiencia<select name="exp"><option>Ninguna, empezamos de cero</option><option>Algo de experiencia</option><option>Bastante experiencia</option></select></label>
        </div>
        <div class="wform__row">
          <label>Franja preferida<select name="franja"><option>Tarde (17–19 h)</option><option>Tarde-noche (19–21:30 h)</option><option>Sábado por la mañana</option><option>Me adapto</option></select></label>
          <label>Sede<select name="sede"><option>Cualquiera</option>${SITE.sedes.map(s => `<option>${s.street}</option>`).join('')}</select></label>
        </div>
        <label>Comentario (opcional)<textarea name="nota" rows="2" placeholder="${isBoda ? 'Ej.: queremos un mashup sorpresa' : 'Cuéntanos lo que quieras'}"></textarea></label>
        <div class="wform__preview" aria-live="polite"><span>Vista previa del mensaje</span><p></p></div>
        <button class="btn btn--rose btn--lg" type="submit">${I.wa} Enviar por WhatsApp</button>
      </form>
    </div>
  </section>`
}

function moreClasses(current) {
  const others = ALL.filter(c => c.slug !== current)
  return `
  <section class="section more">
    <div class="wrap more__head">
      ${sectionHead('Sigue explorando', 'Otros <em>estilos</em>')}
      <div class="more__ctrl"><button class="round-btn round-btn--dark" data-prev aria-label="Anterior">${I.arrow}</button><button class="round-btn round-btn--dark" data-next aria-label="Siguiente">${I.arrow}</button></div>
    </div>
    <div class="slider slider--more" data-slider>
      <div class="slider__track">
        ${others.map(c => `<a class="mcard" href="${href(c.slug)}">${img(c.photo, c.alt, { sizes: '320px' })}<span class="mcard__body"><strong>${c.name}</strong><small>${c.menu}</small></span></a>`).join('')}
      </div>
    </div>
  </section>`
}

const marquee = (reverse = false) => {
  const row = ALL.map(c => `<a href="${href(c.slug)}" class="mq__item"><span class="mq__pic">${img(c.photo, '', { sizes: '120px' })}</span><span class="mq__word">${c.name}</span><i>${I.spark}</i></a>`).join('')
  return `<div class="mq${reverse ? ' mq--rev' : ''}"><div class="mq__track">${row}${row.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')}</div></div>`
}

// ---------- PORTADA ----------
function home() {
  const slides = CLASSES.map((c, i) => `
      <div class="hero__slide${i === 0 ? ' is-on' : ''}" data-name="${c.name}" data-tag="${esc(c.tagline)}" data-href="${href(c.slug)}">
        ${img(c.photo, c.alt, { eager: i === 0, sizes: '100vw' })}
      </div>`).join('')
  const rail = CLASSES.map((c, i) => `<button class="hero__dot${i === 0 ? ' is-on' : ''}" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${c.name}<i></i></button>`).join('')
  const quiz = QUIZ.map((q, qi) => `
          <fieldset class="quiz__step${qi === 0 ? ' is-on' : ''}" data-step="${qi}">
            <legend><span>Pregunta ${qi + 1} de ${QUIZ.length}</span>${q.q}</legend>
            <div class="quiz__opts">${q.options.map(([t, w], oi) => `<button type="button" class="quiz__opt" data-w='${JSON.stringify(w)}'><b>${String.fromCharCode(65 + oi)}</b>${t}</button>`).join('')}</div>
          </fieldset>`).join('')
  const gallery = CLASSES.map(c => [`assets/img/${c.photo}-640.webp`, `assets/img/${c.photo}-1920.webp`, c.alt, c.name])
  gallery.splice(4, 0, ['assets/img/deco-ballet-720.webp', 'assets/img/deco-ballet-1400.webp', 'Zapatillas de punta rosas con lazos de satén', 'El alma del ballet'])
  return page({ slug: 'index', title: 'Inicio', description: `${SITE.name}: clases de flamenco, ballet, funky, moderno, salsa, K-pop, comercial, zumba, country y baile nupcial en San Blas-Canillejas (Madrid). ${SITE.rating}★ en Google.`, preload: 'assets/img/flamenco-1920.webp', nav: 'inicio' }, `
  <section class="hero" aria-label="Presentación">
    <div class="hero__slides" aria-hidden="true">${slides}</div>
    <canvas class="hero__sparkles" aria-hidden="true"></canvas>
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="wrap hero__content">
      <p class="hero__kicker"><span class="pulse"></span>Escuela de danza · San Blas-Canillejas, Madrid</p>
      <h1 class="hero__title"><span class="line"><span>Baila con el</span></span> <span class="line"><em>corazón,</em></span> <span class="line line--sm"><span>los pies te seguirán.</span></span></h1>
      <div class="hero__now" aria-live="polite"><span class="hero__label">Ahora suena</span><a class="hero__class" href="flamenco.html"><strong>Flamenco</strong><span>${esc(CLASSES[0].tagline)}</span></a></div>
      <div class="hero__cta">
        <a class="btn btn--rose btn--lg" href="#clases">Descubre las clases ${I.arrow}</a>
        <a class="btn btn--glass btn--lg" href="${wa('¡Hola, Manuela! Me gustaría reservar una clase de prueba.')}" target="_blank" rel="noopener">${I.wa} Clase de prueba</a>
      </div>
      <a class="hero__rating" href="#opiniones">${stars(5)}<span><strong>${SITE.rating}</strong> · ${SITE.reviewCount} reseñas en Google</span></a>
    </div>
    <div class="hero__rail" role="tablist" aria-label="Estilos de danza">${rail}</div>
    <div class="hero__count" aria-hidden="true"><b>01</b><span>/ ${String(CLASSES.length).padStart(2, '0')}</span></div>
    <a class="hero__scroll" href="#marquee" aria-label="Bajar"><span></span></a>
  </section>

  <section class="marquee" id="marquee" aria-label="Nuestros estilos">
    ${marquee()}
    ${marquee(true)}
  </section>

  <section class="section section--porcelain about" id="escuela">
    <div class="wrap about__grid">
      <div class="about__media reveal">
        <figure class="about__img about__img--a">${img('ballet', CLASSES[1].alt, { sizes: '(max-width: 900px) 70vw, 34vw' })}</figure>
        <figure class="about__img about__img--b">${img('funky', CLASSES[2].alt, { sizes: '(max-width: 900px) 50vw, 22vw' })}</figure>
        <div class="about__badge"><img src="assets/img/bailarina.png" alt=""><span>Desde la predanza<br>hasta adultos</span></div>
      </div>
      <div class="about__copy">
        ${sectionHead('La escuela', 'Una escuela <em>familiar</em> donde la danza se vive en serio')}
        <p class="lead reveal">En la Escuela de Danza Manuela conviven el compás del flamenco, la elegancia del ballet y la energía del funky. Es una escuela de barrio, cercana y profesional, donde cada alumna y alumno tiene su sitio en el escenario.</p>
        <p class="reveal">Manuela e Inés lideran un equipo renovado que acompaña a cada persona desde su primera clase: peques que descubren la música jugando, jóvenes que compiten en el Campeonato de España y adultos que por fin se atreven con las sevillanas.</p>
        <div class="stats reveal">
          ${STATS.map(s => `<div class="stat"><strong><span data-count="${s.value}" data-dec="${s.decimals || 0}">0</span>${s.suffix}</strong><span>${s.label}</span><small>${s.sub}</small></div>`).join('')}
        </div>
        <a class="link-arrow reveal" href="la-escuela.html">Conoce la escuela ${I.arrow}</a>
      </div>
    </div>
  </section>

  <section class="section section--noir classes" id="clases">
    <div class="classes__glow" aria-hidden="true"></div>
    <div class="wrap">
      <div class="classes__head">
        ${sectionHead('Diez estilos, una escuela', 'Elige tu <em>ritmo</em>', 'Del clásico al urbano, del flamenco al pop coreano. Filtra por edad o por energía y entra en cada clase para conocerla a fondo.')}
        <div class="chips reveal" role="group" aria-label="Filtrar clases">
          <button class="chip is-on" data-filter="all">Todas</button>
          <button class="chip" data-filter="peques">Peques</button>
          <button class="chip" data-filter="jovenes">Jóvenes</button>
          <button class="chip" data-filter="adultos">Adultos</button>
          <button class="chip" data-filter="parejas">Parejas</button>
          <button class="chip" data-filter="intenso">Mucha energía</button>
        </div>
      </div>
      <div class="cgrid">${ALL.map(classCard).join('')}</div>
    </div>
  </section>

  <section class="section section--porcelain quiz" id="encuentra">
    <div class="wrap quiz__grid">
      <div>
        ${sectionHead('Test de 20 segundos', '¿Qué estilo <em>va contigo?</em>', 'Responde tres preguntas y te recomendamos la clase que mejor encaja contigo o con tu peque.')}
        ${deco('k-pop', '', 'quiz__deco')}
      </div>
      <div class="quiz__card reveal" data-quiz>
        <div class="quiz__progress"><i></i></div>
        ${quiz}
        <div class="quiz__result" hidden>
          <p class="kicker">${I.spark}Tu estilo ideal</p>
          <div class="quiz__match"></div>
          <button type="button" class="quiz__again">Repetir el test</button>
        </div>
      </div>
    </div>
  </section>

  <section class="wedding" id="bodas">
    <div class="wedding__media">${img('bodas-wide', BODAS.alt, { sizes: '(max-width: 900px) 100vw, 55vw' })}</div>
    <div class="wedding__copy">
      ${sectionHead('Baile nupcial', 'Vuestro <em>primer baile</em>, a medida')}
      <p class="lead reveal">Elegís la canción y Manuela crea una coreografía pensada para vosotros. En unas diez clases, con horarios flexibles, saldréis a la pista disfrutando de cada paso.</p>
      <blockquote class="wedding__quote reveal">«En 10 clases nos montó el baile nupcial y fue maravilloso. Coreografía preciosa y encima, muchísimas facilidades para cuadrar horarios.»<cite>Andrea Jiménez · Google</cite></blockquote>
      <ol class="wedding__steps reveal">${BODAS.steps.slice(0, 4).map(([n, t]) => `<li><b>${n}</b>${t}</li>`).join('')}</ol>
      <div class="btn-row reveal">
        <a class="btn btn--rose" href="${href(BODAS.slug)}">Ver baile nupcial ${I.arrow}</a>
        <a class="btn btn--ghost" href="${wa('¡Hola, Manuela! Nos casamos y nos gustaría preparar nuestro baile nupcial.')}" target="_blank" rel="noopener">${I.wa} Pedir cita</a>
      </div>
    </div>
  </section>

  <section class="section section--porcelain schedule" id="horario">
    <div class="wrap">
      <div class="schedule__head">
        ${sectionHead('Horario semanal', 'Encuentra <em>tu hueco</em>', 'Mañanas de sábado y tardes de lunes a viernes, en nuestras dos sedes. Pulsa «Reservar» y te escribimos con la plaza.')}
        <a class="btn btn--dark reveal" href="horarios.html">Horario completo ${I.arrow}</a>
      </div>
      ${scheduleTable(SCHEDULE)}
    </div>
  </section>

  <section class="section section--noir stage" id="escenario">
    ${deco('cintas', '', 'stage__ribbon')}
    <div class="wrap">
      ${sectionHead('Sobre el escenario', 'Bailar es también <em>compartir</em>', 'La danza se entrena en el aula y se disfruta en el escenario. Estos son algunos de los momentos de los que más orgullosas estamos.', 'shead--center')}
      <div class="stage__grid">
        ${MILESTONES.map((m, i) => `<article class="mile reveal" style="--d:${i * 90}ms"><span class="mile__n">0${i + 1}</span><p class="mile__k">${m.kicker}</p><h3>${m.title}</h3><p>${m.text}</p></article>`).join('')}
      </div>
    </div>
  </section>

  ${reviewsBlock()}

  <section class="section section--porcelain gallery" id="galeria">
    <div class="wrap">
      ${sectionHead('Galería', 'La danza <em>en imágenes</em>', 'Un vistazo a la energía de cada estilo. Pulsa una imagen para verla en grande.')}
      <div class="masonry">
        ${gallery.map(([src, full, a, n], i) => `<button class="mitem reveal" data-lb="${i}" data-full="${full}" data-cap="${esc(n)}" style="--d:${(i % 4) * 70}ms"><img src="${src}" alt="${esc(a)}" loading="lazy" decoding="async"><span>${n}</span></button>`).join('')}
      </div>
      <a class="btn btn--dark reveal" href="${SITE.instagram}" target="_blank" rel="noopener">${I.ig} Síguenos en Instagram · ${SITE.followers}</a>
    </div>
  </section>

  ${faqBlock(FAQ.slice(0, 6))}

  ${sedesBlock()}
`)
}

function sedesBlock() {
  return `
  <section class="section section--noir sedes" id="sedes">
    <div class="wrap">
      ${sectionHead('Dónde estamos', 'Dos sedes en <em>San Blas-Canillejas</em>', 'A pocos minutos una de otra. Pregúntanos en cuál se imparte tu grupo.')}
      <div class="sedes__grid">
        ${SITE.sedes.map((s, i) => `
        <article class="sede reveal" style="--d:${i * 100}ms">
          <div class="sede__map" data-map="${s.embed}">
            <div class="sede__art" aria-hidden="true"><span class="sede__pin">${I.pin}</span><svg viewBox="0 0 400 220" preserveAspectRatio="none"><path d="M0 160 C80 120 140 190 220 140 S340 60 400 90" /><path d="M0 60 C90 90 160 30 240 70 S350 150 400 130" /><path d="M120 0 C130 80 100 140 140 220" /><path d="M300 0 C280 70 320 150 290 220" /></svg></div>
            <button class="btn btn--glass btn--sm sede__load">${I.map} Ver mapa interactivo</button>
          </div>
          <div class="sede__body">
            <p class="kicker">${s.note}</p>
            <h3>${s.name}</h3>
            <p>${s.street}<br>${s.city}</p>
            <div class="btn-row"><a class="btn btn--rose btn--sm" href="${s.maps}" target="_blank" rel="noopener">${I.pin} Cómo llegar</a><a class="btn btn--ghost btn--sm" href="tel:${SITE.phoneIntl}">${I.phone} ${SITE.phone}</a></div>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>`
}

// ---------- PÁGINA DE CLASE ----------
function classPage(c) {
  const isBoda = c.slug === BODAS.slug
  const sched = SCHEDULE.filter(e => e.slug === c.slug)
  const review = REVIEWS.find(r => (isBoda && r.tag === 'Baile nupcial') || (c.slug === 'flamenco' && r.tag === 'Flamenco')) || REVIEWS[(ALL.indexOf(c) * 3) % REVIEWS.length]
  const msg = isBoda ? '¡Hola, Manuela! Nos casamos y nos gustaría preparar nuestro baile nupcial. ¿Podemos pedir cita?' : `¡Hola, Manuela! Me gustaría probar una clase de ${c.name}. ¿Qué grupos y horarios tenéis?`
  const facts = [
    [I.users, 'Para quién', c.ages],
    [I.level, 'Nivel', c.level],
    [I.clock, 'Duración', c.duration],
  ]
  return page({ slug: c.slug, title: isBoda ? 'Baile nupcial en Madrid' : `Clases de ${c.name} en Madrid`, description: `${c.tagline} Clases de ${c.name.toLowerCase()} en la ${SITE.name}, San Blas-Canillejas (Madrid). ${c.ages}.`, preload: `assets/img/${c.photo}-1920.webp`, nav: isBoda ? 'bodas' : 'clases' }, `
  <section class="phero">
    <div class="phero__img">${img(c.photo, c.alt, { eager: true })}</div>
    <div class="phero__shade" aria-hidden="true"></div>
    <div class="wrap phero__content">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span>${isBoda ? '' : '<a href="index.html#clases">Clases</a><span>/</span>'}<span aria-current="page">${c.name}</span></nav>
      <p class="hero__kicker"><span class="pulse"></span>${isBoda ? 'Coreografía a medida' : 'Clase de ' + c.name.toLowerCase()}</p>
      <h1 class="phero__title">${c.title}</h1>
      <p class="phero__tag">${c.tagline}</p>
      <div class="phero__facts">
        ${facts.map(([ic, k, v]) => `<div class="fact">${ic}<span><small>${k}</small>${v}</span></div>`).join('')}
        <div class="fact fact--energy"><span><small>Energía</small>${energy(c.energy)}</span></div>
      </div>
      <div class="hero__cta">
        <a class="btn btn--rose btn--lg" href="#reserva">${isBoda ? 'Pedir cita' : 'Reservar clase de prueba'} ${I.arrow}</a>
        <a class="btn btn--glass btn--lg" href="${wa(msg)}" target="_blank" rel="noopener">${I.wa} WhatsApp directo</a>
      </div>
    </div>
  </section>

  <nav class="subnav" aria-label="En esta página">
    <div class="wrap subnav__in">
      <a href="#sobre">La clase</a>
      <a href="#aprenderas">${isBoda ? 'El proceso' : 'Qué aprenderás'}</a>
      ${isBoda ? '' : '<a href="#sesion">Una sesión</a>'}
      <a href="#para-quien">${isBoda ? 'Opciones' : 'Para quién'}</a>
      ${sched.length ? '<a href="#horario">Horario</a>' : ''}
      <a href="#preguntas">Preguntas</a>
      <a class="subnav__cta" href="#reserva">Reservar</a>
    </div>
  </nav>

  <section class="section section--porcelain cintro" id="sobre">
    <div class="wrap cintro__grid">
      <div>
        ${sectionHead(isBoda ? 'Vuestro baile' : 'Sobre la clase', isBoda ? 'Un momento <em>para recordar</em>' : `Descubre el <em>${c.name.toLowerCase()}</em>`)}
        <p class="lead reveal">${c.lead}</p>
        ${c.intro.map(t => `<p class="reveal">${t}</p>`).join('')}
        ${c.highlight ? `<aside class="note reveal">${I.spark}<p>${c.highlight}</p></aside>` : ''}
      </div>
      <div class="cintro__art reveal">
        <div class="cintro__deco">${deco(c.decor, `Ilustración decorativa de ${c.name.toLowerCase()}`)}</div>
        <figure class="cintro__photo">${img(isBoda ? 'bodas' : c.photo, c.alt, { sizes: '(max-width: 900px) 60vw, 26vw' })}</figure>
      </div>
    </div>
  </section>

  ${isBoda ? `
  <section class="section section--noir process" id="aprenderas">
    <div class="wrap">
      ${sectionHead('Paso a paso', 'Así preparamos <em>vuestro baile</em>', '', 'shead--center')}
      <ol class="timeline">
        ${c.steps.map(([n, t, d], i) => `<li class="reveal" style="--d:${i * 90}ms"><span class="timeline__n">${n}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
      </ol>
    </div>
  </section>
  <section class="section section--porcelain" id="para-quien">
    <div class="wrap">
      ${sectionHead('Opciones', 'Todo lo que <em>podemos preparar</em>')}
      <div class="learn">${c.extras.map(([t, d], i) => `<article class="lcard reveal" style="--d:${(i % 4) * 80}ms"><span class="lcard__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    </div>
  </section>` : `
  <section class="section section--noir learnsec" id="aprenderas">
    <div class="wrap">
      ${sectionHead('Qué aprenderás', `Lo que te llevas de <em>cada clase</em>`)}
      <div class="learn">${c.learn.map(([t, d], i) => `<article class="lcard reveal" style="--d:${(i % 3) * 80}ms"><span class="lcard__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    </div>
  </section>

  <section class="section section--porcelain session" id="sesion">
    <div class="wrap session__grid">
      <div>
        ${sectionHead('Una sesión', 'Así es <em>una clase</em>', `${c.duration} pensados para que salgas habiendo aprendido algo nuevo… y con ganas de volver.`)}
        <figure class="session__img reveal">${img(c.photo, c.alt, { sizes: '(max-width: 900px) 92vw, 40vw' })}</figure>
      </div>
      <ol class="steps">
        ${c.session.map(([t, n, d], i) => `<li class="reveal" style="--d:${i * 90}ms"><span class="steps__t">${t}</span><div><h3>${n}</h3><p>${d}</p></div></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="section section--noir who" id="para-quien">
    <div class="wrap who__grid">
      <div class="who__col reveal">
        <p class="kicker">${I.spark}Para quién es</p>
        <h2>Pensada <em>para ti</em> si…</h2>
        <ul class="ticks">${c.forWho.map(t => `<li>${I.spark}${t}</li>`).join('')}</ul>
      </div>
      <div class="who__col reveal">
        <p class="kicker">${I.spark}Qué llevar</p>
        <h2>Tu <em>bolsa</em> de baile</h2>
        <ul class="ticks">${c.wear.map(t => `<li>${I.spark}${t}</li>`).join('')}</ul>
      </div>
      <div class="levels reveal">
        <p class="kicker">${I.spark}Niveles</p>
        <div class="levels__tabs" role="tablist">${c.levels.map(([n], i) => `<button role="tab" aria-selected="${i === 0}" data-lv="${i}">${n}</button>`).join('')}</div>
        ${c.levels.map(([n, d], i) => `<div class="levels__panel${i === 0 ? ' is-on' : ''}" data-lv="${i}" role="tabpanel"><strong>${n}</strong><p>${d}</p></div>`).join('')}
      </div>
    </div>
  </section>`}

  ${sched.length ? `
  <section class="section section--porcelain schedule" id="horario">
    <div class="wrap">
      ${sectionHead('Horario', `Cuándo hay <em>${c.name.toLowerCase()}</em>`, 'Grupos y horarios orientativos. Pulsa «Reservar» y te confirmamos la plaza por WhatsApp.')}
      ${scheduleTable(sched, { showClass: false, id: 'horario-clase' })}
    </div>
  </section>` : ''}

  <section class="section quote-sec">
    <div class="wrap">
      <figure class="bigquote reveal">
        ${stars(review.rating)}
        <blockquote>«${esc(review.text)}»</blockquote>
        <figcaption>${esc(review.name)} · reseña en Google</figcaption>
      </figure>
    </div>
  </section>

  ${faqBlock(c.faq, 'preguntas', 'Preguntas frecuentes', `Dudas sobre <em>${c.name.toLowerCase()}</em>`)}

  ${bookingForm(c)}

  ${moreClasses(c.slug)}
`)
}

// ---------- HORARIOS ----------
function horarios() {
  return page({ slug: 'horarios', title: 'Horarios de clases', description: `Horario semanal de clases de la ${SITE.name}: ballet, flamenco, funky, K-pop, salsa, zumba y más en San Blas-Canillejas.`, nav: 'horarios' }, `
  <section class="phero phero--short">
    <div class="phero__img">${img('comercial', CLASSES[4].alt, { eager: true })}</div>
    <div class="phero__shade" aria-hidden="true"></div>
    <div class="wrap phero__content">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span><span aria-current="page">Horarios</span></nav>
      <h1 class="phero__title">Horario <em>semanal</em></h1>
      <p class="phero__tag">Tardes de lunes a viernes y sábados por la mañana. Filtra por estilo y reserva en un toque.</p>
    </div>
  </section>
  <section class="section section--porcelain schedule schedule--full" id="horario">
    <div class="wrap">
      <div class="sfilter reveal" role="group" aria-label="Filtrar por estilo">
        <button class="chip chip--dark is-on" data-sf="all">Todos</button>
        ${ALL.filter(c => SCHEDULE.some(e => e.slug === c.slug)).map(c => `<button class="chip chip--dark" data-sf="${c.slug}">${c.name}</button>`).join('')}
      </div>
      <div class="week reveal">
        ${DAYS.map((d, i) => `
        <div class="week__col" data-day="${i}">
          <h2 class="week__d">${d}</h2>
          ${SCHEDULE.filter(e => e.day === i).map(e => {
            const c = BY[e.slug]; const s = sedeBy(e.sede)
            return `<a class="wslot" data-slug="${e.slug}" data-start="${e.start}" data-end="${e.end}" href="${wa(`¡Hola, Manuela! Me gustaría reservar una clase de ${c.name} (${e.group}) del ${d.toLowerCase()} a las ${e.start}. ¿Queda plaza?`)}" target="_blank" rel="noopener" ><img class="wslot__bg" src="assets/img/${c.photo}-640.webp" alt="" loading="lazy" decoding="async"><span class="wslot__t">${e.start} – ${e.end}</span><strong>${c.name}</strong><small>${e.group}</small><small class="wslot__s">${I.pin}${s.name.replace('Sede ', '')}</small><span class="wslot__go">${I.wa} Reservar</span></a>`
          }).join('')}
        </div>`).join('')}
      </div>
      <p class="sched__note">${I.clock} Horario orientativo de ejemplo para la demostración. Confirma grupos, edades y plazas por WhatsApp o teléfono.</p>
    </div>
  </section>
  ${faqBlock(FAQ.slice(0, 5))}
  ${sedesBlock()}
`)
}

// ---------- LA ESCUELA ----------
function escuela() {
  return page({ slug: 'la-escuela', title: 'La escuela', description: `Conoce la ${SITE.name}: una escuela familiar y profesional en San Blas-Canillejas, con dos sedes, diez estilos y grupos subcampeones de España.`, nav: 'escuela' }, `
  <section class="phero">
    <div class="phero__img">${img('flamenco', CLASSES[0].alt, { eager: true })}</div>
    <div class="phero__shade" aria-hidden="true"></div>
    <div class="wrap phero__content">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span><span aria-current="page">La escuela</span></nav>
      <p class="hero__kicker"><span class="pulse"></span>Quiénes somos</p>
      <h1 class="phero__title">Una escuela con <em>alma</em></h1>
      <p class="phero__tag">«${SITE.slogan}». Esa frase lo resume todo: aquí primero se disfruta, y la técnica llega sola.</p>
    </div>
  </section>

  <section class="section section--porcelain">
    <div class="wrap cintro__grid">
      <div>
        ${sectionHead('Nuestra historia', 'Danza de barrio, <em>nivel de escenario</em>')}
        <p class="lead reveal">La Escuela de Danza Manuela nació con una idea sencilla: que cualquier persona del barrio, tenga la edad que tenga, pueda aprender a bailar con profesionales y sentirse como en casa.</p>
        <p class="reveal">Empezó con el flamenco, el baile de Manuela, y fue creciendo con el ballet, el funky, el moderno, los bailes de salón y los estilos que piden las nuevas generaciones, como el K-pop o el comercial. Hoy tiene dos sedes en San Blas-Canillejas y un equipo renovado con especialistas en cada estilo.</p>
        <p class="reveal">Las familias la describen igual en sus reseñas: <strong>familiar, cercana y profesional</strong>. Y sus grupos lo demuestran sobre el escenario, con segundos puestos en el Campeonato de España.</p>
      </div>
      <div class="cintro__art reveal">
        <div class="cintro__deco">${deco('flamenco', 'Abanico flamenco con flor y notas musicales')}</div>
        <figure class="cintro__photo">${img('ballet', CLASSES[1].alt, { sizes: '30vw' })}</figure>
      </div>
    </div>
  </section>

  <section class="section section--noir values">
    <div class="wrap">
      ${sectionHead('Lo que nos define', 'Cuatro <em>pilares</em>', '', 'shead--center')}
      <div class="learn learn--4">${VALUES.map(([t, d], i) => `<article class="lcard reveal" style="--d:${i * 80}ms"><span class="lcard__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    </div>
  </section>

  <section class="section section--porcelain team">
    <div class="wrap">
      ${sectionHead('El equipo', 'Quién te <em>enseña</em>', 'Un equipo renovado, con Manuela al frente y profesoras especialistas en cada estilo.')}
      <div class="team__grid">
        ${TEAM.map((t, i) => `<article class="tcard reveal" style="--d:${i * 100}ms"><figure>${img(t.img, `Clase de ${t.img} en la escuela`, { sizes: '(max-width: 760px) 92vw, 45vw' })}</figure><div><p class="kicker">${t.role}</p><h3>${t.name}</h3><p>${t.text}</p></div></article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section--noir stage">
    ${deco('cintas', '', 'stage__ribbon')}
    <div class="wrap">
      ${sectionHead('Logros y escenario', 'Momentos de los que <em>presumimos</em>', '', 'shead--center')}
      <div class="stage__grid">${MILESTONES.map((m, i) => `<article class="mile reveal" style="--d:${i * 90}ms"><span class="mile__n">0${i + 1}</span><p class="mile__k">${m.kicker}</p><h3>${m.title}</h3><p>${m.text}</p></article>`).join('')}</div>
    </div>
  </section>

  <section class="marquee" aria-label="Nuestros estilos">${marquee()}</section>
  ${reviewsBlock(REVIEWS, 'Las familias <em>lo cuentan</em>')}
  ${sedesBlock()}
`)
}

// ---------- CONTACTO ----------
function contacto() {
  const channels = [
    [I.wa, 'WhatsApp', 'La forma más rápida', wa('¡Hola, Manuela! Me gustaría información sobre las clases.'), 'Escribir ahora', true],
    [I.phone, 'Teléfono', SITE.phone, `tel:${SITE.phoneIntl}`, 'Llamar'],
    [I.mail, 'Correo', SITE.email, `mailto:${SITE.email}`, 'Enviar correo'],
    [I.ig, 'Instagram', `${SITE.instagramUser} · ${SITE.followers} seguidores`, SITE.instagram, 'Ver perfil', true],
    [I.fb, 'Facebook', 'Escuela de Danza Manuela', SITE.facebook, 'Ver página', true],
  ]
  return page({ slug: 'contacto', title: 'Contacto', description: `Contacta con la ${SITE.name}: WhatsApp y teléfono ${SITE.phone}, correo ${SITE.email}. Sedes en Av. de Canillejas a Vicálvaro, 139 y C/ Longares, 48 (Madrid).`, nav: 'contacto' }, `
  <section class="phero phero--short">
    <div class="phero__img">${img('salsa', CLASSES[6].alt, { eager: true })}</div>
    <div class="phero__shade" aria-hidden="true"></div>
    <div class="wrap phero__content">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span><span aria-current="page">Contacto</span></nav>
      <h1 class="phero__title">Hablemos de <em>danza</em></h1>
      <p class="phero__tag">Pregúntanos por horarios, edades, niveles o precios. Te respondemos personalmente.</p>
    </div>
  </section>

  <section class="section section--porcelain">
    <div class="wrap">
      <div class="channels">
        ${channels.map(([ic, t, d, h, cta, ext], i) => `<a class="channel reveal${i === 0 ? ' channel--main' : ''}" href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''} style="--d:${i * 70}ms"><span class="channel__ic">${ic}</span><strong>${t}</strong><span>${d}</span><span class="link-arrow">${cta} ${I.arrow}</span></a>`).join('')}
      </div>
    </div>
  </section>

  ${bookingForm({ slug: 'contacto', name: 'una clase', decor: 'comercial' })}
  ${sedesBlock()}
  ${faqBlock(FAQ)}
`)
}

// ---------- LEGALES y 404 ----------
function legal(slug, title, sections) {
  return page({ slug, title, description: `${title} de la web de ${SITE.name}.`, nav: '' }, `
  <section class="phero phero--mini">
    <div class="phero__shade" aria-hidden="true"></div>
    <div class="wrap phero__content">
      <nav class="crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a><span>/</span><span aria-current="page">${title}</span></nav>
      <h1 class="phero__title">${title}</h1>
    </div>
  </section>
  <section class="section section--porcelain">
    <div class="wrap prose">
      <p class="note">${I.spark}<span>Borrador de demostración. Los datos marcados como «Pendiente» deben completarse con la información real del titular antes de publicar la web.</span></p>
      ${sections.map(([h, t]) => `<h2>${h}</h2><p>${t}</p>`).join('')}
    </div>
  </section>`)
}

const LEGAL = {
  'aviso-legal': ['Aviso legal', [
    ['Titular', `Escuela de Danza Manuela. Titular: Pendiente. NIF: Pendiente. Domicilio: Av. de Canillejas a Vicálvaro, 139, 28022 Madrid. Correo: ${SITE.email}. Teléfono: ${SITE.phone}.`],
    ['Objeto', 'Esta web informa sobre las clases, horarios y actividades de la escuela. El uso de la web implica la aceptación de este aviso.'],
    ['Propiedad intelectual', 'Los textos, el logotipo y el diseño pertenecen a la escuela o se usan con autorización. Las fotografías de las clases son ilustrativas.'],
    ['Responsabilidad', 'La escuela procura que la información sea correcta y esté actualizada, pero los horarios y precios deben confirmarse directamente.'],
  ]],
  privacidad: ['Política de privacidad', [
    ['Responsable', `Escuela de Danza Manuela (titular: Pendiente). Contacto: ${SITE.email}.`],
    ['Qué datos tratamos', 'Esta web no tiene formularios que envíen datos a un servidor. Los formularios de reserva solo preparan un mensaje en tu navegador y abren WhatsApp: nada se envía hasta que tú lo decides.'],
    ['Finalidad', 'Si nos escribes por WhatsApp, teléfono o correo, usaremos tus datos únicamente para responderte y gestionar tu inscripción.'],
    ['Derechos', `Puedes ejercer tus derechos de acceso, rectificación, supresión y oposición escribiendo a ${SITE.email}.`],
  ]],
  cookies: ['Política de cookies', [
    ['Cookies propias', 'Esta web no usa cookies de análisis ni de publicidad. Solo guarda en tu navegador (sessionStorage) un valor técnico, «edm-intro», para no repetir la animación de bienvenida.'],
    ['Servicios de terceros', 'Las tipografías se cargan desde Google Fonts. El mapa de Google solo se carga si pulsas «Ver mapa interactivo».'],
    ['Cómo desactivarlas', 'Puedes borrar el almacenamiento del sitio desde la configuración de tu navegador en cualquier momento.'],
  ]],
}

function notFound() {
  return page({ slug: '404', title: 'Página no encontrada', description: 'Esta página no existe.', nav: '' }, `
  <section class="nf">
    ${deco('baile-moderno', '', 'nf__deco')}
    <div class="wrap nf__in">
      <p class="kicker">${I.spark}Error 404</p>
      <h1>Este paso <em>no existe</em></h1>
      <p>Parece que te has salido de la coreografía. Vuelve al inicio o elige una clase.</p>
      <div class="btn-row"><a class="btn btn--rose" href="index.html">Volver al inicio ${I.arrow}</a><a class="btn btn--ghost" href="index.html#clases">Ver clases</a></div>
    </div>
  </section>`)
}

// ---------- escribir ----------
const out = (name, html) => writeFileSync(join(ROOT, name), html)
out('index.html', home())
ALL.forEach(c => out(`${c.slug}.html`, classPage(c)))
out('horarios.html', horarios())
out('la-escuela.html', escuela())
out('contacto.html', contacto())
Object.entries(LEGAL).forEach(([slug, [t, s]]) => out(`${slug}.html`, legal(slug, t, s)))
out('404.html', notFound())

// datos para el JS (test de estilo)
const data = { classes: Object.fromEntries(ALL.map(c => [c.slug, { name: c.name, tagline: c.tagline, ages: c.ages, photo: c.photo, href: href(c.slug) }])) }
writeFileSync(join(ROOT, 'assets/js/data.js'), `window.EDM=${JSON.stringify(data)};\n`)

writeFileSync(join(ROOT, 'site.webmanifest'), JSON.stringify({
  name: SITE.name, short_name: SITE.short, start_url: './', display: 'standalone', background_color: '#0e080b', theme_color: '#0e080b',
  icons: [{ src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2))

const pages = ['index', ...ALL.map(c => c.slug), 'horarios', 'la-escuela', 'contacto']
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${SITE.url}${p === 'index' ? '' : p + '.html'}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(join(ROOT, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
console.log(`OK · ${pages.length + 4} páginas generadas`)
