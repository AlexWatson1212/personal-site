(function () {
  const INPUT = document.querySelector('#blog-search-input');
  const BTN   = document.querySelector('#blog-search-button');
  const LIST  = document.querySelector('#blog-search-results');
  const COUNT = document.querySelector('#blog-search-count');

  if (!INPUT || !LIST) return; // not on the blog page

  let INDEX = [];

  // Fetch the index
  fetch((document.querySelector('meta[name="baseurl"]')?.content || '') + '/search.json', {cache: 'no-store'})
    .then(r => r.json())
    .then(data => { INDEX = data; })
    .catch(() => { /* silent fail; just leaves INDEX empty */ });

  function parseQuery(q) {
    // Supports emotion:grief, tag:boundaries, key:value pairs; remaining terms are keywords
    const parts = q.trim().toLowerCase().split(/\s+/);
    const filters = { emotion: [], tag: [] };
    const terms = [];
    parts.forEach(p => {
      const m = p.match(/^(\w+):(.*)$/);
      if (m) {
        const key = m[1];
        const val = m[2];
        if (key === 'emotion') filters.emotion.push(val);
        else if (key === 'tag' || key === 'tags') filters.tag.push(val);
        else { terms.push(p); }
      } else {
        terms.push(p);
      }
    });
    return { terms, filters };
  }

  function matches(post, { terms, filters }) {
    // Filter by emotions/tags if provided
    if (filters.emotion.length) {
      const emos = (post.emotions || []).map(e => String(e).toLowerCase());
      if (!filters.emotion.every(x => emos.includes(x))) return false;
    }
    if (filters.tag.length) {
      const tags = (post.tags || []).map(t => String(t).toLowerCase());
      if (!filters.tag.every(x => tags.includes(x))) return false;
    }

    if (!terms.length) return true;

    const hay = [
      post.title,
      post.description,
      (post.tags || []).join(' '),
      (post.emotions || []).join(' '),
      post.content
    ].join(' ').toLowerCase();

    // ALL terms must appear (AND search)
    return terms.every(t => hay.includes(t));
  }

  function highlight(text, terms) {
    if (!terms.length) return escapeHTML(text);
    // collapse duplicates, ignore stop-words-length 1
    const uniq = [...new Set(terms.filter(t => t.length > 1))];
    let s = escapeHTML(text);
    uniq.forEach(t => {
      const re = new RegExp(`(${escapeRegExp(t)})`, 'gi');
      s = s.replace(re, '<mark>$1</mark>');
    });
    return s;
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function snippet(content, terms, len = 220) {
    const text = content || '';
    if (!terms.length) return escapeHTML(text.slice(0, len)) + (text.length > len ? '…' : '');
    // find first hit
    const lc = text.toLowerCase();
    let idx = -1;
    for (const t of terms) {
      const i = lc.indexOf(t.toLowerCase());
      if (i !== -1 && (idx === -1 || i < idx)) idx = i;
    }
    let start = Math.max(0, idx - Math.floor(len / 3));
    let end   = Math.min(text.length, start + len);
    if (end - start < len) start = Math.max(0, end - len);
    const slice = text.slice(start, end);
    return (start > 0 ? '…' : '') + highlight(slice, terms) + (end < text.length ? '…' : '');
  }

  function render(results, query) {
    LIST.innerHTML = '';
    if (COUNT) COUNT.textContent = results.length + (query ? ` result${results.length !== 1 ? 's' : ''}` : '');
    if (!results.length) {
      LIST.innerHTML = `<li class="search-empty">No results.</li>`;
      return;
    }
    const { terms } = parseQuery(query);
    const frag = document.createDocumentFragment();
    results.forEach(p => {
      const li = document.createElement('li');
      li.className = 'search-result';
      li.innerHTML = `
        <a class="search-title" href="${p.url}">${highlight(p.title, terms)}</a>
        <p class="search-snippet">${snippet(p.content || p.description || '', terms)}</p>
        <p class="search-meta">
          ${p.date ? new Date(p.date).toLocaleDateString() : ''}
          ${p.tags?.length ? ' • ' + p.tags.map(t => `<span class="chip">${escapeHTML(t)}</span>`).join(' ') : ''}
          ${p.emotions?.length ? ' • ' + p.emotions.map(e => `<span class="chip emo">${escapeHTML(e)}</span>`).join(' ') : ''}
        </p>`;
      frag.appendChild(li);
    });
    LIST.appendChild(frag);
  }

  function runSearch() {
    const q = (INPUT.value || '').trim();
    const parsed = parseQuery(q);
    const res = INDEX.filter(p => matches(p, parsed))
                     // simple score: title hit > description > content
                     .map(p => {
                        let score = 0;
                        const qq = (parsed.terms || []).join(' ').toLowerCase();
                        if (qq) {
                          if (p.title?.toLowerCase().includes(qq)) score += 3;
                          if ((p.description || '').toLowerCase().includes(qq)) score += 2;
                          if ((p.content || '').toLowerCase().includes(qq)) score += 1;
                        }
                        return { p, score };
                      })
                     .sort((a,b) => b.score - a.score)
                     .map(x => x.p);
    render(res, q);
  }

  INPUT.addEventListener('input', runSearch);
  BTN && BTN.addEventListener('click', (e) => { e.preventDefault(); runSearch(); });

  // Run once if there’s a prefilled query (e.g., from link ?q=foo)
  const urlQ = new URLSearchParams(location.search).get('q');
  if (urlQ) { INPUT.value = urlQ; runSearch(); }
})();
