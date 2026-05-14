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
  if(aw.image){
    const img = document.createElement('img');
    img.src = aw.image; img.alt = aw.title||'Artwork'; img.loading = 'lazy';
    item.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'artwork-placeholder'; ph.textContent = aw.title||'Image';
    item.appendChild(ph);
  }
  if(aw.title){
    const cap = document.createElement('figcaption');
    cap.className = 'artwork-caption'; cap.textContent = aw.title;
    item.appendChild(cap);
  }
  return item;
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