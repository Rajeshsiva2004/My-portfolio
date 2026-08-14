// ===========================
// Load content and render
// ===========================
async function loadContent() {
  try {
    const res = await fetch('content/content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load content.json');
    const data = await res.json();
    renderAll(data);
  } catch (err) {
    console.error('Portfolio content failed to load:', err);
    const main = document.getElementById('main');
    if (main) {
      const notice = document.createElement('p');
      notice.style.padding = '24px';
      notice.style.color = '#B3261E';
      notice.textContent = 'Content could not be loaded. Please refresh the page.';
      main.prepend(notice);
    }
  }
}

function renderAll(data) {
  renderPersonal(data.personal);
  renderSkills(data.skills);
  renderExperience(data.experience);
  renderProjects(data.projects);
  renderEducation(data.education);
  renderCertifications(data.certifications);
  renderAdditional(data.additional);
  renderContact(data.personal);
  document.getElementById('year').textContent = new Date().getFullYear();
  initRevealObserver();
}

function renderPersonal(p) {
  if (!p) return;
  document.title = `${p.name} — ${p.title} Portfolio`;
  document.getElementById('heroName').textContent = p.name;
  document.getElementById('heroRole').textContent = p.title;
  document.getElementById('heroTagline').textContent = p.tagline || '';
  document.getElementById('heroIntro').textContent = p.summary
    ? p.summary.split('.').slice(0, 2).join('.') + '.'
    : '';
  document.getElementById('aboutSummary').textContent = p.summary || '';

  const img = document.getElementById('heroImage');
  img.src = p.profileImage;
  img.alt = `Portrait of ${p.name}`;

  const resumeBtn = document.getElementById('viewResumeBtn');
  resumeBtn.href = p.resumeFile;
  resumeBtn.setAttribute('download', '');

  document.getElementById('linkedinBtn').href = p.linkedin || '#';
  document.getElementById('githubBtn').href = p.github || '#';
}

function renderSkills(skills) {
  const grid = document.getElementById('skillsGrid');
  if (!skills || !grid) return;
  grid.innerHTML = skills.map(cat => `
    <div class="skill-card" data-reveal>
      <h3>${escapeHTML(cat.category)}</h3>
      <div class="skill-chips">
        ${cat.items.map(i => `<span class="chip">${escapeHTML(i)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderExperience(exp) {
  const list = document.getElementById('experienceList');
  if (!exp || !list) return;
  list.innerHTML = exp.map(e => `
    <div class="timeline-item" data-reveal>
      <div class="timeline-head">
        <span class="timeline-role">${escapeHTML(e.role)}</span>
        <span class="timeline-duration">${escapeHTML(e.duration)}</span>
      </div>
      <div class="timeline-company">${escapeHTML(e.company)} · ${escapeHTML(e.location)}</div>
      <ul class="timeline-points">
        ${e.points.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

let PROJECTS_DATA = [];

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!projects || !grid) return;
  PROJECTS_DATA = projects;
  grid.innerHTML = projects.map((p, idx) => `
    <div class="project-card" data-reveal>
      ${p.featured ? '<span class="project-badge">Featured</span>' : ''}
      <h3 class="project-title">${escapeHTML(p.title)}</h3>
      <p class="project-desc">${escapeHTML(p.shortDescription || '')}</p>
      <div class="project-tech">
        ${(p.technologies || []).slice(0, 5).map(t => `<span>${escapeHTML(t)}</span>`).join('')}
      </div>
      <div class="project-actions">
        <button class="btn btn-primary" data-project-details="${idx}">Project Details</button>
        ${p.github ? `<a class="btn btn-ghost" href="${escapeAttr(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}
        ${p.demo ? `<a class="btn btn-ghost" href="${escapeAttr(p.demo)}" target="_blank" rel="noopener">Live Demo</a>` : ''}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-project-details]').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(PROJECTS_DATA[+btn.dataset.projectDetails]));
  });
}

function openProjectModal(p) {
  const overlay = document.getElementById('projectModal');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <h3 id="modalTitle">${escapeHTML(p.title)}</h3>
    <p style="color:var(--muted); font-family:var(--font-mono); font-size:12px;">${(p.technologies || []).join(' · ')}</p>

    <p class="modal-section-label">Problem</p>
    <p>${escapeHTML(p.problem || '—')}</p>

    <p class="modal-section-label">Solution &amp; Technical Implementation</p>
    <p>${escapeHTML(p.solution || '—')}</p>

    ${p.results && p.results.length ? `
      <p class="modal-section-label">Results / Metrics</p>
      <ul>${p.results.map(r => `<li>${escapeHTML(r)}</li>`).join('')}</ul>
    ` : ''}

    <div class="modal-actions">
      ${p.github ? `<a class="btn btn-primary" href="${escapeAttr(p.github)}" target="_blank" rel="noopener">View on GitHub</a>` : ''}
      ${p.demo ? `<a class="btn btn-ghost" href="${escapeAttr(p.demo)}" target="_blank" rel="noopener">Live Demo</a>` : ''}
    </div>
  `;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  document.getElementById('projectModal').hidden = true;
  document.body.style.overflow = '';
}

function renderEducation(edu) {
  const list = document.getElementById('educationList');
  if (!edu || !list) return;
  list.innerHTML = edu.map(e => `
    <div class="education-card" data-reveal>
      <div>
        <div class="education-degree">${escapeHTML(e.degree)}</div>
        <div class="education-inst">${escapeHTML(e.institution)}</div>
      </div>
      <div class="education-meta">
        <div>${escapeHTML(e.years)}</div>
        ${e.cgpa ? `<div>${escapeHTML(e.cgpa)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderCertifications(certs) {
  const list = document.getElementById('certList');
  if (!certs || !list) return;
  list.innerHTML = certs.map(c => `
    <li data-reveal>
      ${c.url ? `<a href="${escapeAttr(c.url)}" target="_blank" rel="noopener">${escapeHTML(c.name)}</a>` : `<span>${escapeHTML(c.name)}</span>`}
    </li>
  `).join('');
}

function renderAdditional(add) {
  const grid = document.getElementById('additionalGrid');
  if (!add || !grid) return;
  const items = [
    ['Languages', add.languages],
    ['DSA Practice', add.dsa],
    ['Open Source', add.openSource],
    ['Availability', add.availability]
  ].filter(([, v]) => v);
  grid.innerHTML = items.map(([label, val]) => `
    <div class="additional-card" data-reveal>
      <h4>${escapeHTML(label)}</h4>
      <p>${escapeHTML(val)}</p>
    </div>
  `).join('');
}

function renderContact(p) {
  const grid = document.getElementById('contactGrid');
  if (!p || !grid) return;
  const cards = [
    ['Email', p.email, `mailto:${p.email}`],
    ['Phone', p.phone, `tel:${(p.phone || '').replace(/\s+/g, '')}`],
    ['LinkedIn', 'linkedin.com/in/rajeshsiva2404', p.linkedin],
    ['GitHub', 'github.com/Rajeshsiva2004', p.github],
    ['Location', p.location, null]
  ];
  grid.innerHTML = cards.map(([label, val, href]) => `
    <${href ? 'a' : 'div'} class="contact-card" ${href ? `href="${escapeAttr(href)}" target="_blank" rel="noopener"` : ''} data-reveal>
      <span class="label">${escapeHTML(label)}</span>
      <span class="value">${escapeHTML(val || '—')}</span>
    </${href ? 'a' : 'div'}>
  `).join('');
}

// ===========================
// Utilities
// ===========================
function escapeHTML(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, '&quot;');
}

// ===========================
// Nav: mobile toggle + active link + scroll shadow
// ===========================
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const sections = document.querySelectorAll('main .section, .hero');
  const navAnchors = document.querySelectorAll('[data-nav]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

// ===========================
// Reveal on scroll
// ===========================
function initRevealObserver() {
  const els = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

// ===========================
// Modal events
// ===========================
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeProjectModal);
  document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') closeProjectModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initModal();
  loadContent();
});
