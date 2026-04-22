
(() => {
  const site = window.NenSite;
  const bodyPage = document.body.dataset.page;
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  // mobile nav toggle
  const navToggle = $('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const wrap = $('.nav-wrap');
      wrap.classList.toggle('closed');
      navToggle.textContent = wrap.classList.contains('closed') ? 'open navigation' : 'close navigation';
    });
  }

  $$('.nav a').forEach(a => {
    if (a.dataset.page === bodyPage) a.classList.add('active');
  });

  function chipList(items, cls='tag') {
    return items.map(t => `<span class="${cls}">${t}</span>`).join('');
  }

  // home featured cards
  const featured = $('#featured-fics');
  if (featured) {
    featured.innerHTML = site.fics.slice(0,3).map(f => `
      <article class="fic-card">
        <h3>${f.title}</h3>
        <div class="muted">${f.fandom}</div>
        <div><strong>${f.pairing}</strong> · ${f.rating} · ${f.words}</div>
        <p>${f.summary}</p>
        <div class="row">${chipList(f.tags)}</div>
      </article>
    `).join('');
  }

  const stats = $('#ao3-stats');
  if (stats) {
    const s = site.stats;
    stats.innerHTML = `
      <li>Works — ${s.works}</li>
      <li>Series — ${s.series}</li>
      <li>Bookmarks — ${s.bookmarks}</li>
      <li>User Subs — ${s.userSubs}</li>
      <li>Word Count — ${s.wordCount}</li>
      <li>Kudos — ${s.kudos}</li>
    `;
  }

  const fandomList = $('#fandom-list');
  if (fandomList) fandomList.innerHTML = site.fandoms.map(f => `<li><strong>${f.name}</strong><br><span class="muted">${f.note}</span></li>`).join('');
  const characterList = $('#character-list');
  if (characterList) characterList.innerHTML = site.characters.map(c => `<li><strong>${c.name}</strong><br><span class="muted">${c.note}</span></li>`).join('');

  const journalList = $('#journal-list');
  if (journalList) {
    journalList.innerHTML = site.journal.map(j => `
      <article class="card">
        <h3>${j.date} · ${j.title}</h3>
        ${j.body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        <div class="row">${chipList(j.tags)}</div>
      </article>
    `).join('');
  }

  const allFics = $('#all-fics');
  function renderFics(items) {
    if (!allFics) return;
    allFics.innerHTML = items.map(f => `
      <article class="fic-card">
        <h3>${f.title}</h3>
        <div class="muted">${f.fandom}</div>
        <div><strong>${f.pairing}</strong> · ${f.rating} · ${f.status} · ${f.genre} · ${f.words}</div>
        <p>${f.summary}</p>
        <div class="row">${chipList(f.tags)}</div>
      </article>
    `).join('') || `<div class="card"><p>No works matched your filters yet.</p></div>`;
    const wc = $('#work-count');
    if (wc) wc.textContent = `${items.length} works found`;
  }
  function applyFilters() {
    if (!allFics) return;
    const rating = $('#filter-rating')?.value || 'All';
    const status = $('#filter-status')?.value || 'All';
    const pairing = $('#filter-pairing')?.value || 'All';
    const genre = $('#filter-genre')?.value || 'All';
    const filtered = site.fics.filter(f =>
      (rating === 'All' || f.rating === rating) &&
      (status === 'All' || f.status === status) &&
      (pairing === 'All' || f.pairing === pairing) &&
      (genre === 'All' || f.genre === genre)
    );
    renderFics(filtered);
  }
  ['filter-rating','filter-status','filter-pairing','filter-genre'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });
  if (allFics) renderFics(site.fics);

  // guestbook local storage + netlify-ready static form
  const gbList = $('#guestbook-list');
  if (gbList) {
    const KEY = 'nen-notebook-guestbook';
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') || site.guestbookSeed;
    localStorage.setItem(KEY, JSON.stringify(saved));
    drawGuestbook(saved);

    const form = $('#guestbook-form');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#guest-name').value.trim() || 'anonymous visitor';
      const siteUrl = $('#guest-site').value.trim();
      const message = $('#guest-message').value.trim();
      if (!message) return;
      const next = [{
        name, site: siteUrl, emoji: '💌',
        date: new Date().toISOString().slice(0,10),
        message
      }, ...JSON.parse(localStorage.getItem(KEY) || '[]')];
      localStorage.setItem(KEY, JSON.stringify(next));
      drawGuestbook(next);
      form.reset();
    });
    $('#reset-guestbook')?.addEventListener('click', () => {
      localStorage.setItem(KEY, JSON.stringify(site.guestbookSeed));
      drawGuestbook(site.guestbookSeed);
    });
  }

  function drawGuestbook(entries) {
    gbList.innerHTML = entries.map(entry => `
      <div class="entry">
        <div class="avatar-mini">${entry.emoji || '⭐'}</div>
        <div>
          <strong>${entry.name}</strong>
          ${entry.site ? `<div><a href="${entry.site}" target="_blank" rel="noopener">${entry.site}</a></div>` : ''}
          <div>${entry.message}</div>
        </div>
        <div class="muted">${entry.date}</div>
      </div>
    `).join('');
  }
})();
