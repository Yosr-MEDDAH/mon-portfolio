/* ── Translations ────────────────────────────────────── */
const T = {
  fr:{
    'nav.skills':'Compétences','nav.experience':'Expérience',
    'nav.projects':'Projets','nav.presentations':'Présentations','nav.artworks':'Artworks','nav.contact':'Contact',
    'hero.label':'Portfolio · Disponible pour un stage',
    'section.skills':'Compétences','heading.skills':'Ce que je maîtrise',
    'section.experience':'Expérience','heading.experience':'Expérience professionnelle',
    'section.projects':'Projets','heading.projects':'Projets',
    'section.presentations':'Présentations','heading.presentations':'Présentations & Talks',
    'section.artworks':'Artworks','heading.artworks':'Créations',
    'section.education':'Formation','heading.education':'Parcours académique',
    'section.contact':'Contact','heading.contact':'Travaillons ensemble',
    'contact.sub':'Disponible pour un stage. N\'hésitez pas à me contacter.',
    'btn.cv':'Télécharger le CV','btn.contact':'Me contacter',
    'link.github':'GitHub','link.linkedin':'LinkedIn',
    'footer.made':'Fait avec soin',
    'back':'Retour',
    'see.skills':'Voir toutes les compétences',
    'see.experience':'Voir toute l\'expérience',
    'see.projects':'Voir tous les projets',
    'see.presentations':'Voir toutes les présentations',
    'see.artworks':'Voir toutes les créations',
    'page.skills':'Compétences techniques',
    'page.experience':'Expérience professionnelle',
    'page.projects':'Projets',
    'page.presentations':'Présentations & Talks',
    'page.artworks':'Créations & Artworks',
  },
  en:{
    'nav.skills':'Skills','nav.experience':'Experience',
    'nav.projects':'Projects','nav.presentations':'Presentations','nav.artworks':'Artworks','nav.contact':'Contact',
    'hero.label':'Portfolio · Open to internship',
    'section.skills':'Skills','heading.skills':'What I work with',
    'section.experience':'Experience','heading.experience':'Professional Experience',
    'section.projects':'Projects','heading.projects':'Projects',
    'section.presentations':'Presentations','heading.presentations':'Presentations & Talks',
    'section.artworks':'Artworks','heading.artworks':'Artworks',
    'section.education':'Education','heading.education':'Academic Background',
    'section.contact':'Contact','heading.contact':'Let\'s work together',
    'contact.sub':'Available for internship. Feel free to reach out.',
    'btn.cv':'Download CV','btn.contact':'Contact me',
    'link.github':'GitHub','link.linkedin':'LinkedIn',
    'footer.made':'Made with care',
    'back':'Back',
    'see.skills':'See all skills',
    'see.experience':'See all experience',
    'see.projects':'See all projects',
    'see.presentations':'See all presentations',
    'see.artworks':'See all artworks',
    'page.skills':'Technical Skills',
    'page.experience':'Professional Experience',
    'page.projects':'Projects',
    'page.presentations':'Presentations & Talks',
    'page.artworks':'Artworks & Creations',
  },
  ar:{
    'nav.skills':'المهارات','nav.experience':'الخبرة',
    'nav.projects':'المشاريع','nav.presentations':'العروض','nav.artworks':'الأعمال الفنية','nav.contact':'التواصل',
    'hero.label':'معرض أعمال · متاح للتدريب',
    'section.skills':'المهارات','heading.skills':'ما أتقنه',
    'section.experience':'الخبرة','heading.experience':'الخبرة المهنية',
    'section.projects':'المشاريع','heading.projects':'المشاريع',
    'section.presentations':'العروض التقديمية','heading.presentations':'العروض والمحاضرات',
    'section.artworks':'الأعمال الفنية','heading.artworks':'الأعمال الفنية',
    'section.education':'التعليم','heading.education':'المسار الأكاديمي',
    'section.contact':'التواصل','heading.contact':'لنعمل معاً',
    'contact.sub':'متاح للتدريب. لا تتردد في التواصل.',
    'btn.cv':'تحميل السيرة الذاتية','btn.contact':'تواصل معي',
    'link.github':'GitHub','link.linkedin':'LinkedIn',
    'footer.made':'صُنع باهتمام',
    'back':'رجوع',
    'see.skills':'عرض كل المهارات',
    'see.experience':'عرض كل الخبرات',
    'see.projects':'عرض كل المشاريع',
    'see.presentations':'عرض كل العروض',
    'see.artworks':'عرض كل الأعمال الفنية',
    'page.skills':'المهارات التقنية',
    'page.experience':'الخبرة المهنية',
    'page.projects':'المشاريع',
    'page.presentations':'العروض والمحاضرات',
    'page.artworks':'الأعمال الفنية',
  }
};

/* ── Lang ────────────────────────────────────────────── */
let lang = localStorage.getItem('lang') || 'fr';

function t(k){ return (T[lang]||T.fr)[k] || k; }

function setLang(l){
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = l==='ar' ? 'rtl' : 'ltr';
  const skip = document.getElementById('skip-link');
  if(skip) skip.textContent =
    l==='ar' ? 'انتقل إلى المحتوى الرئيسي' :
    l==='en' ? 'Skip to main content' : 'Aller au contenu principal';
  applyTheme();
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.dataset.i18n);
  });
  if(typeof renderDynamic === 'function') renderDynamic();
}

/* ── Theme ───────────────────────────────────────────── */
let theme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');

function applyTheme(){
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('theme-btn');
  if(btn) btn.setAttribute('aria-label',
    theme==='dark'
      ? (lang==='ar'?'تفعيل الوضع النهاري':lang==='en'?'Switch to light mode':'Activer le mode clair')
      : (lang==='ar'?'تفعيل الوضع الليلي':lang==='en'?'Switch to dark mode':'Activer le mode sombre')
  );
}
function toggleTheme(){
  theme = theme==='dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  applyTheme();
}

/* ── Helpers ─────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const initials = n => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

/* ── Artwork renderer (shared) ───────────────────────── */
function buildArtworkItem(aw){
  const item = document.createElement('figure');
  item.className = 'artwork-item reveal';
  item.setAttribute('role','listitem');
  if(aw.image && aw.image !== 'placeholder.png'){
    if (aw.image.endsWith('.mp4')) {
      const vid = document.createElement('video');
      vid.src = aw.image; vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
      vid.style.width = '100%'; vid.style.height = '100%'; vid.style.objectFit = 'cover';
      item.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = aw.image; img.alt = aw.title||'Artwork'; img.loading = 'lazy';
      item.appendChild(img);
    }
  } else {
    const ph = document.createElement('div');
    ph.className = 'artwork-placeholder'; ph.textContent = aw.title||'Image';
    item.appendChild(ph);
  }
  if(aw.title){
    const cap = document.createElement('figcaption');
    cap.className = 'artwork-caption'; 
    cap.style.display = 'flex';
    cap.style.justifyContent = 'space-between';
    cap.style.alignItems = 'center';
    
    const t = document.createElement('span');
    t.textContent = aw.title;
    cap.appendChild(t);
    
    if(aw.youtube || aw.behance){
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      
      if(aw.youtube){
        const y = document.createElement('a');
        y.href = aw.youtube; y.target = '_blank'; y.innerHTML = '▶';
        y.style.cssText = 'color:#ff4e4e; text-decoration:none; font-size:16px;';
        y.setAttribute('aria-label', `Voir ${aw.title} sur YouTube`);
        actions.appendChild(y);
      }
      if(aw.behance){
        const b = document.createElement('a');
        b.href = aw.behance; b.target = '_blank'; b.innerHTML = 'Bē';
        b.style.cssText = 'color:#5b8eff; text-decoration:none; font-size:16px; font-weight:bold; font-family:sans-serif;';
        b.setAttribute('aria-label', `Voir ${aw.title} sur Behance`);
        actions.appendChild(b);
      }
      cap.appendChild(actions);
    }
    
    item.appendChild(cap);
  }
  return item;
}

/* ── Tech visual maps ────────────────────────────────── */
const DEVICON_MAP = {
  'React':'react-original','React 18':'react-original',
  'Angular':'angularjs-plain','TypeScript':'typescript-plain',
  'JavaScript':'javascript-plain','Python':'python-plain',
  'Java':'java-plain','PHP':'php-plain','Node.js':'nodejs-plain',
  'Express.js':'express-original','MongoDB':'mongodb-plain',
  'PostgreSQL':'postgresql-plain','MySQL':'mysql-plain',
  'Docker':'docker-plain','Git':'git-plain','Flutter':'flutter-plain',
  'Firebase':'firebase-plain','Figma':'figma-plain',
  'HTML/CSS':'html5-plain','Tailwind CSS':'tailwindcss-plain',
  'FastAPI':'fastapi-plain','Laravel':'laravel-plain',
  'Unity':'unity-original','Three.js':'threejs-original',
  'Arduino':'arduino-plain','C++':'cplusplus-plain','C#':'csharp-plain',
  'Azure':'azure-plain','Spring Boot':'spring-plain',
  'Flask':'flask-original','Symfony':'symfony-original',
  'Android Studio':'android-plain','NumPy':'numpy-plain',
  'Pandas':'pandas-original','SQL':'mysql-plain',
  'Playwright':'playwright-plain','Cypress':'cypressio-plain',
  'AWS':'amazonwebservices-original','Material UI':'materialdesign-plain',
};

const TECH_GRAD = {
  'React':'#61DAFB,#1a9cc4','React 18':'#61DAFB,#1a9cc4',
  'Angular':'#DD0031,#7b001a','TypeScript':'#3178C6,#1a4a8a',
  'JavaScript':'#F7DF1E,#c4a800','Python':'#3776AB,#FFD43B',
  'Java':'#ED8B00,#5382A1','Flutter':'#54C5F8,#0175C2',
  'Unity':'#464646,#1a1a1a','Arduino':'#00979D,#005f63',
  'C++':'#00599C,#003a6b','CUDA':'#76B900,#3d6100',
  'MongoDB':'#47A248,#1a5c1a','FastAPI':'#009688,#004d40',
  'Laravel':'#FF2D20,#8b1b14','Three.js':'#222,#444',
  'Node.js':'#339933,#1a5c1a','Docker':'#2496ED,#0d5faa',
  'Flask':'#555,#222','Spring Boot':'#6DB33F,#2e5c10',
  'Firebase':'#FFCA28,#e09400','Flutter':'#54C5F8,#0175C2',
};

const TECH_EMOJI = {
  'React':'⚛️','Angular':'🔺','Python':'🐍','Java':'☕',
  'Flutter':'🦋','Unity':'🎮','Arduino':'🤖','Three.js':'🌐',
  'Docker':'🐳','Node.js':'🟢','MongoDB':'🍃','CUDA':'⚡',
  'C++':'⚙️','Laravel':'🎨','FastAPI':'⚡','Firebase':'🔥',
  'Spring Boot':'🍃','IoT':'🌱','NLP':'💬','ML':'🧠',
};

function _projGrad(tags){ for(const t of tags||[]){ if(TECH_GRAD[t]) return TECH_GRAD[t]; } return '#3d5229,#6a7f55'; }
function _projEmoji(tags){ for(const t of tags||[]){ if(TECH_EMOJI[t]) return TECH_EMOJI[t]; } return '💻'; }

/* ── Shared project card builder ─────────────────────── */
function buildProjectCard(p){
  const card = document.createElement('article');
  card.className = 'proj-card reveal';
  card.setAttribute('role','listitem');
  const desc  = p.description[lang] || p.description['fr'] || p.description;
  const title = p.title[lang]       || p.title['fr']       || p.title;

  /* — media area — */
  const media = document.createElement('div');
  media.className = 'proj-media';
  const hasReal = p.image && p.image !== 'placeholder.png';
  if(hasReal){
    if (p.image.endsWith('.mp4')) {
      const vid = document.createElement('video');
      vid.src = p.image; vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
      vid.style.width = '100%'; vid.style.height = '100%'; vid.style.objectFit = 'cover';
      vid.style.transition = 'transform .4s ease';
      media.appendChild(vid);
      // Hover effect for video
      card.addEventListener('mouseenter', () => vid.style.transform = 'scale(1.05)');
      card.addEventListener('mouseleave', () => vid.style.transform = 'scale(1)');
    } else {
      const img = document.createElement('img');
      img.src = p.image; img.alt = title; img.loading = 'lazy';
      media.appendChild(img);
    }
  } else {
    const bg = document.createElement('div');
    bg.className = 'proj-media-bg';
    bg.style.background = `linear-gradient(135deg,${_projGrad(p.tags)})`;
    const em = document.createElement('span');
    em.className = 'proj-media-emoji';
    em.textContent = _projEmoji(p.tags);
    em.setAttribute('aria-hidden','true');
    bg.appendChild(em);
    media.appendChild(bg);
  }
  card.appendChild(media);

  /* — body — */
  const body = document.createElement('div');
  body.className = 'proj-body';

  const titleEl = document.createElement('p');
  titleEl.className = 'proj-title'; titleEl.textContent = title;
  body.appendChild(titleEl);

  if(p.context){
    const ctx = document.createElement('p');
    ctx.className = 'proj-context'; ctx.textContent = p.context;
    body.appendChild(ctx);
  }

  const descEl = document.createElement('p');
  descEl.className = 'proj-desc'; descEl.textContent = desc;
  body.appendChild(descEl);

  /* — tags with devicon — */
  const tagWrap = document.createElement('div');
  tagWrap.className = 'tags';
  (p.tags||[]).forEach(tag => {
    const sp = document.createElement('span');
    sp.className = 'tag';
    const di = DEVICON_MAP[tag];
    if(di){
      const ico = document.createElement('i');
      ico.className = `devicon-${di} colored tag-icon`;
      ico.setAttribute('aria-hidden','true');
      sp.appendChild(ico);
    }
    sp.appendChild(document.createTextNode(tag));
    tagWrap.appendChild(sp);
  });
  body.appendChild(tagWrap);

  /* — action buttons (only if link exists) — */
  const actions = document.createElement('div');
  actions.className = 'proj-actions';
  if(p.github){
    const a = document.createElement('a');
    a.href=p.github; a.target='_blank'; a.rel='noopener';
    a.className='proj-btn'; a.textContent='⌥ GitHub';
    a.setAttribute('aria-label',`${title} — GitHub`);
    actions.appendChild(a);
  }
  if(p.demo){
    const a = document.createElement('a');
    a.href=p.demo; a.target='_blank'; a.rel='noopener';
    a.className='proj-btn'; a.textContent='↗ Demo';
    a.setAttribute('aria-label',`${title} — Demo`);
    actions.appendChild(a);
  }
  if(p.pdf){
    const a = document.createElement('a');
    a.href=p.pdf; a.target='_blank'; a.rel='noopener';
    a.className='proj-btn'; a.textContent='📄 PDF';
    a.setAttribute('aria-label',`${title} — Rapport PDF`);
    actions.appendChild(a);
  }
  if(p.notebook){
    const a = document.createElement('a');
    a.href=p.notebook; a.target='_blank'; a.rel='noopener';
    a.className='proj-btn'; a.textContent='📓 Notebook';
    a.setAttribute('aria-label',`${title} — Jupyter Notebook`);
    actions.appendChild(a);
  }
  if(actions.children.length) body.appendChild(actions);

  card.appendChild(body);
  return card;
}

/* ── Intersection observer ───────────────────────────── */
function observe(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── Nav active link ─────────────────────────────────── */
function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
    if(a.dataset.page === path) a.classList.add('active');
    else a.classList.remove('active');
  });
}

/* ── Common footer ───────────────────────────────────── */
function renderFooter(){
  const fn = $('footer-name'); if(fn) fn.textContent = DATA.name;
  const fy = $('footer-year'); if(fy) fy.textContent = t('footer.made') + ' · ' + new Date().getFullYear();
}

/* ── Init ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang==='ar' ? 'rtl' : 'ltr';
  applyTheme();
  markActiveNav();
  if(typeof renderStatic  === 'function') renderStatic();
  if(typeof renderDynamic === 'function') renderDynamic();
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.dataset.i18n);
  });
  renderFooter();
  observe();
});