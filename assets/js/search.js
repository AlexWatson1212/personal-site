(function () {
  const input = document.querySelector('#blog-search-input');
  const button = document.querySelector('#blog-search-button');
  const list = document.querySelector('#blog-search-results');
  const count = document.querySelector('#blog-search-count');

  if (!input || !list) return;

  let index = [];

  const baseUrl = document.querySelector('meta[name="baseurl"]')?.content || '';

  fetch(baseUrl + '/search.json', { cache: 'force-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    })
    .then(function (data) {
      index = Array.isArray(data) ? data : [];
      if (input.value.trim()) runSearch();
    })
    .catch(function () {
      index = [];
    });

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function parseQuery(query) {
    const parts = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filters = { emotion: [], tag: [] };
    const terms = [];

    parts.forEach(function (part) {
      const match = part.match(/^(\w+):(.*)$/);

      if (!match) {
        terms.push(part);
        return;
      }

      const key = match[1];
      const value = match[2];

      if (key === 'emotion') filters.emotion.push(value);
      else if (key === 'tag' || key === 'tags') filters.tag.push(value);
      else terms.push(part);
    });

    return { terms, filters };
  }

  function matches(post, parsed) {
    const terms = parsed.terms;
    const filters = parsed.filters;

    if (filters.emotion.length) {
      const emotions = (post.emotions || []).map(function (emotion) {
        return String(emotion).toLowerCase();
      });

      if (!filters.emotion.every(function (emotion) {
        return emotions.includes(emotion);
      })) return false;
    }

    if (filters.tag.length) {
      const tags = (post.tags || []).map(function (tag) {
        return String(tag).toLowerCase();
      });

      if (!filters.tag.every(function (tag) {
        return tags.includes(tag);
      })) return false;
    }

    if (!terms.length) return true;

    const haystack = [
      post.title,
      post.description,
      (post.tags || []).join(' '),
      (post.emotions || []).join(' '),
      post.content
    ].join(' ').toLowerCase();

    return terms.every(function (term) {
      return haystack.includes(term);
    });
  }

  function highlight(text, terms) {
    let safe = escapeHTML(text);
    const uniqueTerms = Array.from(new Set(terms.filter(function (term) {
      return term.length > 1;
    })));

    uniqueTerms.forEach(function (term) {
      const pattern = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
      safe = safe.replace(pattern, '<mark>$1</mark>');
    });

    return safe;
  }

  function snippet(content, terms, length) {
    const text = String(content || '');
    const maxLength = length || 220;

    if (!terms.length) {
      return escapeHTML(text.slice(0, maxLength)) + (text.length > maxLength ? '…' : '');
    }

    const lower = text.toLowerCase();
    let indexOfFirstHit = -1;

    terms.forEach(function (term) {
      const position = lower.indexOf(term.toLowerCase());
      if (position !== -1 && (indexOfFirstHit === -1 || position < indexOfFirstHit)) {
        indexOfFirstHit = position;
      }
    });

    const start = Math.max(0, indexOfFirstHit - Math.floor(maxLength / 3));
    const end = Math.min(text.length, start + maxLength);
    const slice = text.slice(start, end);

    return (start > 0 ? '…' : '') + highlight(slice, terms) + (end < text.length ? '…' : '');
  }

  function render(results, query) {
    list.innerHTML = '';

    if (count) {
      count.textContent = results.length + (query ? ' result' + (results.length === 1 ? '' : 's') : '');
    }

    if (!results.length) {
      list.innerHTML = '<li class="search-empty">No results.</li>';
      return;
    }

    const parsed = parseQuery(query);
    const fragment = document.createDocumentFragment();

    results.slice(0, 24).forEach(function (post) {
      const item = document.createElement('li');
      const tags = post.tags || [];
      const emotions = post.emotions || [];

      item.className = 'search-result';
      item.innerHTML = `
        <a class="search-title" href="${escapeHTML(post.url)}">${highlight(post.title, parsed.terms)}</a>
        <p class="search-snippet">${snippet(post.content || post.description || '', parsed.terms)}</p>
        <p class="search-meta">
          ${post.date ? escapeHTML(new Date(post.date).toLocaleDateString()) : ''}
          ${tags.length ? ' • ' + tags.map(function (tag) {
            return `<span class="chip">${escapeHTML(tag)}</span>`;
          }).join(' ') : ''}
          ${emotions.length ? ' • ' + emotions.map(function (emotion) {
            return `<span class="chip emo">${escapeHTML(emotion)}</span>`;
          }).join(' ') : ''}
        </p>
      `;

      fragment.appendChild(item);
    });

    list.appendChild(fragment);
  }

  function runSearch() {
    const query = input.value.trim();
    const parsed = parseQuery(query);

    const results = index
      .filter(function (post) {
        return matches(post, parsed);
      })
      .map(function (post) {
        let score = 0;
        const joinedTerms = parsed.terms.join(' ').toLowerCase();

        if (joinedTerms) {
          if (post.title?.toLowerCase().includes(joinedTerms)) score += 3;
          if ((post.description || '').toLowerCase().includes(joinedTerms)) score += 2;
          if ((post.content || '').toLowerCase().includes(joinedTerms)) score += 1;
        }

        return { post, score };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .map(function (item) {
        return item.post;
      });

    render(results, query);
  }

  input.addEventListener('input', runSearch);

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      runSearch();
    });
  }

  const urlQuery = new URLSearchParams(window.location.search).get('q');

  if (urlQuery) {
    input.value = urlQuery;
  }
})();