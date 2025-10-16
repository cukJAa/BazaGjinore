document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('langDropdownBtn');
    const menu = document.getElementById('langDropdownMenu');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', function () {
      menu.classList.add('hidden');
    });
  });


// laws-carousel.js
document.addEventListener('DOMContentLoaded', () => {
  // --- SAMPLE DATA (replace or pass your own using window.initLawCarousel) ---
  const sampleLaws = [
    { title: 'Ligji Nr. 1234/2020 për Mbrojtjen Sociale', description: 'Ky ligj përcakton masat për mbrojtjen sociale të individëve në nevojë. Përfshin dispozita për ndihmë financiare, shërbime sociale dhe mbështetje psikologjike.', pdf: '/pdfs/ligji-mbrojtja-sociale.pdf' },
    { title: 'Ligji Nr. 2345/2021 për Arsimin', description: 'Rregullon sistemin arsimor publik dhe privat, standardet dhe financimin.', pdf: '/pdfs/ligji-arsimi.pdf' },
    { title: 'Ligji Nr. 3456/2019 për Punësimin', description: 'Rregullon marrëdhëniet e punës, kontratat dhe mbrojtjen e të drejtave të punonjësve.', pdf: '/pdfs/ligji-punesimi.pdf' },
    { title: 'Ligji Nr. 4567/2018 për Mjedisin', description: 'Kufizon ndotjen, vendos detyrime për mbrojtjen e natyrës dhe menaxhimin e mbetjeve.', pdf: '/pdfs/ligji-mjedisi.pdf' },
    { title: 'Ligji Nr. 5678/2022 për Sigurinë Publike', description: 'Përcakton rregullat për marrëdhënien mes qytetarit dhe strukturave të sigurisë publike.', pdf: '/pdfs/ligji-sigurise.pdf' },
    { title: 'Ligji Nr. 6789/2017 për Taksimin', description: 'Rregullon taksat e bizneseve dhe individëve, zbatimin dhe kontrollin fiskal.', pdf: '/pdfs/ligji-taksave.pdf' },
    { title: 'Ligji Nr. 7890/2023 për Teknologjinë', description: 'Përcakton kornizën ligjore për teknologjinë dhe të dhënat.', pdf: '/pdfs/ligji-teknologjise.pdf' },
    { title: 'Ligji Nr. 8901/2016 për Transportin', description: 'Rregullon infrastrukturën dhe sigurinë rrugore, hekurudhore dhe detare.', pdf: '/pdfs/ligji-transportit.pdf' },
    { title: 'Ligji Nr. 9012/2015 Për Shëndetësinë', description: 'Përcakton organizimin e sistemit shëndetësor dhe të drejtat e pacientit.', pdf: '/pdfs/ligji-shendetesise.pdf' }
  ];

  // --- Configurable vars ---
  let allLaws = sampleLaws.slice();
  let filteredLaws = allLaws.slice();
  const PER_PAGE = 3;
  let currentPage = 0;
  let totalPages = Math.max(1, Math.ceil(filteredLaws.length / PER_PAGE));
  let intervalId = null;

  // DOM references (must exist in your HTML)
  const track = document.querySelector('#laws-carousel-window .laws-carousel-track');
  const carouselWindow = document.getElementById('laws-carousel-window');
  const searchInput = document.getElementById('law-search');

  if (!track || !carouselWindow) {
    console.warn('laws-carousel: required DOM nodes not found (#laws-carousel-window .laws-carousel-track)');
    return;
  }

  // keep track element from jumping too much during swaps
  track.style.transition = 'opacity 300ms ease';
  track.style.opacity = 1;

  // Utility: HTML escape
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
  }

  // Renders one page (up to PER_PAGE laws)
  function renderPage(pageIndex = 0) {
    pageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
    currentPage = pageIndex;
    const start = pageIndex * PER_PAGE;
    const pageItems = filteredLaws.slice(start, start + PER_PAGE);

    // build cards — we only change inner HTML of .laws-carousel-track (no structural changes outside)
    const cardsHtml = pageItems.map(item => `
      <article class="law-card p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${escapeHtml(item.title)}</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-3">${escapeHtml(item.description)}</p>
        <a href="${escapeHtml(item.pdf)}" download class="text-blue-600 dark:text-blue-400 hover:underline">Shkarko PDF</a>
      </article>
    `).join('');

    const wrapper = `<div class="laws-page grid grid-cols-1 md:grid-cols-3 gap-4">${cardsHtml}</div>`;

    // fade-out -> update -> fade-in
    track.style.opacity = 0;
    setTimeout(() => {
      track.innerHTML = wrapper;
      track.style.opacity = 1;
      updateDots(); // highlight active dot
    }, 260);
  }

  // DOTS: create or update the dots container (one dot per page)
  function createDots() {
    totalPages = Math.max(1, Math.ceil(filteredLaws.length / PER_PAGE));
    let dots = document.getElementById('laws-dots');
    if (!dots) {
      dots = document.createElement('div');
      dots.id = 'laws-dots';
      // Tailwind classes to center and space dots; you don't need to change your HTML — this is injected
      dots.className = 'laws-dots flex justify-center gap-2 mt-4';
      carouselWindow.after(dots);
    }
    dots.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `Shfaq faqen ${i + 1}`);
      btn.className = 'w-3 h-3 rounded-full transition-transform';
      btn.addEventListener('click', () => {
        goToPage(i);
      });
      dots.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    const buttons = document.querySelectorAll('#laws-dots button');
    buttons.forEach((b, i) => {
      // active = blue; inactive = gray (uses Tailwind utility classes)
      b.classList.toggle('bg-blue-600', i === currentPage);
      b.classList.toggle('bg-gray-300', i !== currentPage);
      if (i === currentPage) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  // Auto-advance controls
  function startAutoAdvance() {
    stopAutoAdvance();
    if (totalPages <= 1) return;
    intervalId = setInterval(() => {
      goToPage((currentPage + 1) % totalPages);
    }, 5000); // 5 seconds
  }
  function stopAutoAdvance() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function goToPage(index) {
    index = Math.max(0, Math.min(index, totalPages - 1));
    renderPage(index);
    startAutoAdvance(); // reset timer so user has time on manually selected page
  }

  // SEARCH: filter the laws using the existing #law-search input (if present)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      filteredLaws = q
        ? allLaws.filter(l => (l.title + ' ' + l.description).toLowerCase().includes(q))
        : allLaws.slice();
      currentPage = 0;
      createDots();
      renderPage(0);
    });
  }

  // Pause auto-advance on hover
  carouselWindow.addEventListener('mouseenter', stopAutoAdvance);
  carouselWindow.addEventListener('mouseleave', startAutoAdvance);

  // Expose initializer so you can call it with your own array from server-side or another script:
  // Usage: window.initLawCarousel(yourArrayOfLaws);
  window.initLawCarousel = function(customArray) {
    if (!Array.isArray(customArray)) {
      console.warn('initLawCarousel expects an array');
      return;
    }
    allLaws = customArray.slice();
    filteredLaws = allLaws.slice();
    currentPage = 0;
    createDots();
    renderPage(0);
    startAutoAdvance();
  };

  // INITIALIZE with the sample or with data already set on window.LAWS_DATA
  if (Array.isArray(window.LAWS_DATA) && window.LAWS_DATA.length) {
    window.initLawCarousel(window.LAWS_DATA);
  } else {
    window.initLawCarousel(allLaws);
  }
});







/**
 * initLawsCarousel(options)
 * - laws: array of { id?, title, description, pdfUrl? }
 * - itemsPerPage: number (default 3)
 * - autoAdvanceMs: number (milliseconds, default 5000)
 * - containerSelector: selector to the carousel window (default '#laws-carousel-window')
 * - trackSelector: selector for the track inside the window (default '.laws-carousel-track')
 * - searchInputSelector: selector for the search input (default '#law-search')
 */
// function initLawsCarousel({
//   laws = [],
//   itemsPerPage = 3,
//   autoAdvanceMs = 5000,
//   containerSelector = '#laws-carousel-window',
//   trackSelector = '.laws-carousel-track',
//   searchInputSelector = '#law-search',
// } = {}) {
//   // DOM references
//   const container = document.querySelector(containerSelector);
//   if (!container) {
//     console.warn('initLawsCarousel: container not found:', containerSelector);
//     return;
//   }
//   const track = container.querySelector(trackSelector);
//   if (!track) {
//     console.warn('initLawsCarousel: track element not found inside container:', trackSelector);
//     return;
//   }
//   const searchInput = document.querySelector(searchInputSelector);

//   // We'll create the dots container dynamically (so no HTML change required).
//   let dotsContainer = container.querySelector('.laws-dots');
//   if (!dotsContainer) {
//     dotsContainer = document.createElement('div');
//     dotsContainer.className = 'laws-dots flex justify-center mt-4';
//     container.appendChild(dotsContainer);
//   }

//   // State
//   let filteredLaws = Array.from(laws);
//   let currentPage = 0;
//   let pageCount = Math.max(1, Math.ceil(filteredLaws.length / itemsPerPage));
//   let timer = null;

//   // Helpers
//   function buildLawItemHTML(law) {
//     // Re-uses the same tailwind classes shown in your snippet
//     // Keep titles/descriptions and optional PDF link
//     const title = escapeHtml(law.title || 'Pa titull');
//     const desc = escapeHtml(law.description || '');
//     const pdf = law.pdfUrl ? `<a href="${escapeAttr(law.pdfUrl)}" download class="text-blue-600 dark:text-blue-400 hover:underline transition">Shkarko PDF</a>` : '';

//     return `
//       <article class="law-item p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
//         <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${title}</h2>
//         <p class="text-gray-600 dark:text-gray-300 mb-2">${desc}</p>
//         <div>${pdf}</div>
//       </article>
//     `;
//   }

//   function escapeHtml(str) {
//     return String(str)
//       .replace(/&/g, '&amp;')
//       .replace(/</g, '&lt;')
//       .replace(/>/g, '&gt;');
//   }
//   function escapeAttr(str) {
//     return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
//   }

//   function renderPage(pageIndex = 0) {
//     currentPage = Math.max(0, Math.min(pageIndex, pageCount - 1));
//     const start = currentPage * itemsPerPage;
//     const pageItems = filteredLaws.slice(start, start + itemsPerPage);

//     // Clear track and inject items
//     track.innerHTML = '';
//     if (pageItems.length === 0) {
//       track.innerHTML = `<div class="p-4 text-gray-700 dark:text-gray-300">Nuk u gjetën ligje.</div>`;
//     } else {
//       // Put items inside a flex grid so up to 3 will be shown nicely.
//       const wrapper = document.createElement('div');
//       wrapper.className = 'laws-grid grid gap-4';
//       // If itemsPerPage is 3, create 1 row of 3; otherwise let CSS flow
//       wrapper.style.gridTemplateColumns = (itemsPerPage === 1) ? '1fr' :
//                                           (itemsPerPage === 2) ? 'repeat(2, minmax(0, 1fr))' :
//                                           'repeat(3, minmax(0, 1fr))';
//       pageItems.forEach(l => {
//         const tmp = document.createElement('div');
//         tmp.innerHTML = buildLawItemHTML(l);
//         wrapper.appendChild(tmp.firstElementChild);
//       });
//       track.appendChild(wrapper);
//     }

//     updateDots();
//   }

//   function createDots() {
//     dotsContainer.innerHTML = '';
//     pageCount = Math.max(1, Math.ceil(filteredLaws.length / itemsPerPage));
//     for (let i = 0; i < pageCount; i++) {
//       const btn = document.createElement('button');
//       btn.type = 'button';
//       btn.className = 'dot w-3 h-3 rounded-full mx-1 focus:outline-none';
//       // base styling using tailwind classes (works if you use Tailwind)
//       btn.classList.add('bg-gray-300', 'dark:bg-gray-600');
//       btn.dataset.page = String(i);
//       btn.setAttribute('aria-label', `Shko te faqja ${i + 1}`);
//       btn.addEventListener('click', () => {
//         goToPage(i, /*userClicked=*/ true);
//       });
//       dotsContainer.appendChild(btn);
//     }
//     // If only one page, hide dots (optional)
//     if (pageCount <= 1) dotsContainer.style.display = 'none';
//     else dotsContainer.style.display = '';
//     updateDots();
//   }

//   function updateDots() {
//     const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
//     dots.forEach((d, i) => {
//       d.classList.remove('ring-2', 'ring-blue-300', 'bg-blue-500', 'dark:bg-blue-400');
//       // active style
//       if (i === currentPage) {
//         d.classList.add('bg-blue-500', 'dark:bg-blue-400');
//       } else {
//         // ensure inactive
//         d.classList.remove('bg-blue-500', 'dark:bg-blue-400');
//         d.classList.add('bg-gray-300', 'dark:bg-gray-600');
//       }
//     });
//   }

//   function goToPage(pageIndex, userClicked = false) {
//     renderPage(pageIndex);
//     resetAuto(userClicked);
//   }

//   // Auto advance
//   function startAuto() {
//     stopAuto();
//     if (autoAdvanceMs > 0) {
//       timer = setInterval(() => {
//         const next = (currentPage + 1) % pageCount;
//         renderPage(next);
//       }, autoAdvanceMs);
//     }
//   }
//   function stopAuto() {
//     if (timer) {
//       clearInterval(timer);
//       timer = null;
//     }
//   }
//   function resetAuto(userClicked = false) {
//     // If user clicked, reset the timer so it waits full autoAdvanceMs again
//     stopAuto();
//     startAuto();
//   }

//   // Search/filter handling (optional — uses existing #law-search input)
//   function applyFilter(query = '') {
//     if (!query) {
//       filteredLaws = Array.from(laws);
//     } else {
//       const q = query.trim().toLowerCase();
//       filteredLaws = laws.filter(l => {
//         const title = (l.title || '').toLowerCase();
//         const desc = (l.description || '').toLowerCase();
//         return title.includes(q) || desc.includes(q);
//       });
//     }
//     currentPage = 0;
//     createDots();
//     renderPage(0);
//   }

//   // Pause on hover (nice UX)
//   container.addEventListener('mouseenter', () => stopAuto());
//   container.addEventListener('mouseleave', () => startAuto());

//   // Listen for search input (if available)
//   if (searchInput) {
//     let searchTimer = null;
//     searchInput.addEventListener('input', (e) => {
//       // debounce small delay
//       if (searchTimer) clearTimeout(searchTimer);
//       searchTimer = setTimeout(() => {
//         applyFilter(e.target.value || '');
//       }, 200);
//     });
//   }

//   // Initialize
//   createDots();
//   renderPage(0);
//   startAuto();
// }

// /* ---------------------------
//    Example usage (replace with your real data)
//    Put this below the function (or in your site's JS file).
//    --------------------------- */
// document.addEventListener('DOMContentLoaded', () => {
//   // Example data (replace with your real array)
//   const sampleLaws = [
//     { id: 1, title: 'Ligji Nr. 1234/2020 për Mbrojtjen Sociale', description: 'Ky ligj përcakton masat për mbrojtjen sociale të individëve në nevojë. Përfshin dispozita për ndihmë financiare, shërbime sociale dhe mbështetje psikologjike.', pdfUrl: '/pdfs/ligji-mbrojtja-sociale.pdf' },
//     { id: 2, title: 'Ligji Nr. 2345/2019 për Sigurinë në Punë', description: 'Rregullime për mbrojtjen e punëtorëve dhe kushtet e punës.', pdfUrl: '/pdfs/ligji-siguria-pune.pdf' },
//     { id: 3, title: 'Ligji Nr. 3456/2018 për Arsimin', description: 'Rregullat dhe strukturat e sistemit arsimor kombëtar.', pdfUrl: '/pdfs/ligji-arsim.pdf' },
//     { id: 4, title: 'Ligji Nr. 4567/2021 për Tatimet', description: 'Dispozitat mbi taksat dhe tatimet.', pdfUrl: '/pdfs/ligji-tatime.pdf' },
//     { id: 5, title: 'Ligji Nr. 5678/2017 për Mjedisin', description: 'Parashikimet për mbrojtjen e mjedisit natyror.', pdfUrl: '/pdfs/ligji-mjedisi.pdf' },
//     { id: 6, title: 'Ligji Nr. 6789/2016 për Pronësinë', description: 'Rregullime për pronën private dhe të drejtat e pronësisë.', pdfUrl: '/pdfs/ligji-pronesi.pdf' },
//     { id: 7, title: 'Ligji Nr. 7890/2015 për Transportin', description: 'Standarde dhe rregulla për sistemin e transportit.', pdfUrl: '/pdfs/ligji-transport.pdf' },
//   ];

//   initLawsCarousel({
//     laws: sampleLaws,
//     itemsPerPage: 3,
//     autoAdvanceMs: 5000,
//     // containerSelector: '#laws-carousel-window', // default
//     // trackSelector: '.laws-carousel-track', // default
//     // searchInputSelector: '#law-search', // default
//   });
// });




// document.addEventListener('DOMContentLoaded', () => {
//   // Find the container by matching the heading text you provided
//   const headingText = 'Blogu jone me keshilla';
//   const h2nodes = Array.from(document.querySelectorAll('h2'));
//   const heading = h2nodes.find(h => (h.textContent || '').trim() === headingText);

//   if (!heading) {
//     console.warn('news-carousel: heading not found - expected exact text:', headingText);
//     return;
//   }

//   // The container is the parent of that h2 (the exact div you posted)
//   const container = heading.parentElement;
//   if (!container) return;

//   // Get the direct child item DIVs (these are the three blocks under the heading)
//   const items = Array.from(container.querySelectorAll(':scope > div')).filter(d => d !== null);

//   if (items.length === 0) {
//     console.warn('news-carousel: no item divs found under the container.');
//     return;
//   }

//   // We'll make exactly 2 slides
//   const SLIDES = 2;
//   const INTERVAL_MS = 5000;
//   let current = 0;
//   let timer = null;

//   // Create dots container (insert after container's last child)
//   let dotsWrap = document.createElement('div');
//   dotsWrap.setAttribute('id', 'news-carousel-dots');
//   // Tailwind utility-like classes to keep visual consistent with your project (no external CSS needed)
//   dotsWrap.className = 'flex gap-2 justify-center mt-3';
//   container.appendChild(dotsWrap);

//   const dotButtons = [];
//   for (let i = 0; i < SLIDES; i++) {
//     const b = document.createElement('button');
//     b.type = 'button';
//     b.dataset.idx = String(i);
//     b.setAttribute('aria-label', `Shfaq slide ${i + 1}`);
//     // small circular dot — uses utility classes that Tailwind already provides in your project
//     b.className = 'w-3 h-3 rounded-full transition-transform';
//     b.addEventListener('click', () => {
//       goTo(i);
//     });
//     dotsWrap.appendChild(b);
//     dotButtons.push(b);
//   }

//   // Function that decides which item indices show for each slide
//   // For your case with 3 items:
//   // - slide 0 => items 0,1
//   // - slide 1 => items 2,0  (wrap so layout shows two tiles consistently)
//   function indicesForSlide(slideIndex) {
//     if (items.length === 1) return [0];
//     if (items.length === 2) return [0, 1]; // both slides identical if only 2 items
//     // default for >=3:
//     if (slideIndex === 0) return [0, 1];
//     return [2, 0]; // slide 1: show third item and wrap first
//   }

//   // Show/hide items according to slide
//   function renderSlide(slideIndex) {
//     const showIdx = indicesForSlide(slideIndex);
//     items.forEach((it, i) => {
//       if (showIdx.includes(i)) {
//         // clear inline display to let CSS define layout; fallback to block if computed equals none
//         it.style.display = '';
//         // ensure visible (some layouts require block)
//         if (getComputedStyle(it).display === 'none') it.style.display = 'block';
//       } else {
//         it.style.display = 'none';
//       }
//     });

//     // update dots visual
//     dotButtons.forEach((b, idx) => {
//       b.classList.toggle('bg-blue-600', idx === slideIndex);
//       b.classList.toggle('bg-gray-300', idx !== slideIndex);
//       if (idx === slideIndex) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
//     });
//   }

//   function startTimer() {
//     stopTimer();
//     timer = setInterval(() => {
//       goTo((current + 1) % SLIDES);
//     }, INTERVAL_MS);
//   }
//   function stopTimer() {
//     if (timer) { clearInterval(timer); timer = null; }
//   }

//   function goTo(idx) {
//     current = Math.max(0, Math.min(idx, SLIDES - 1));
//     renderSlide(current);
//     startTimer(); // reset timer on manual change
//   }

//   // Pause on mouse enter and resume on leave (nice UX)
//   container.addEventListener('mouseenter', stopTimer);
//   container.addEventListener('mouseleave', startTimer);

//   // Initialize
//   renderSlide(0);
//   startTimer();

//   // Expose small API if needed by other scripts:
//   window.newsCarousel = {
//     goTo,
//     start: startTimer,
//     stop: stopTimer
//   };
// });


// news-carousel-dynamic.js
document.addEventListener('DOMContentLoaded', () => {
  // Identify the container by the heading text you used earlier (keeps no changes to HTML)
  const headingText = 'Blogu jone me keshilla';
  const h2nodes = Array.from(document.querySelectorAll('h2'));
  const heading = h2nodes.find(h => (h.textContent || '').trim() === headingText);

  if (!heading) {
    console.warn('news-carousel-dynamic: heading not found - expected exact text:', headingText);
    return;
  }

  const container = heading.parentElement;
  if (!container) return;

  // Keep an internal array of item objects { title, img, desc, url, domEl }
  const ITEMS = []; // will store objects {title,img,desc,url,el}
  const ITEMS_PER_SLIDE = 2;
  const INTERVAL_MS = 5000;
  let currentSlide = 0;
  let timer = null;

  // Where we'll put the dots (created once)
  let dotsWrap = null;

  // Read any existing static items already present in the container (direct children that are divs)
  function importExistingDOMItems() {
    const existing = Array.from(container.querySelectorAll(':scope > div')).filter(d => d !== dotsWrap && d !== null);

    // We assume each existing div follows the structure: <a> <img> ... <h3> ... <p> ... </a>
    existing.forEach((div) => {
      // try to extract fields where possible
      const a = div.querySelector('a');
      const img = a ? a.querySelector('img') : div.querySelector('img');
      const h3 = div.querySelector('h3');
      const p = div.querySelector('p');
      const href = a ? (a.getAttribute('href') || '#') : '#';

      const item = {
        title: h3 ? h3.textContent.trim() : 'Pa titull',
        img: img ? (img.getAttribute('src') || '') : '',
        desc: p ? p.textContent.trim() : '',
        url: href === '#' ? null : href,
        el: div
      };
      ITEMS.push(item);
    });
  }

  // Build a DOM item from data and return the wrapper div (same markup as your existing items)
  function buildDOMItem({ title, img, desc, url }) {
    const wrapper = document.createElement('div');
    // Keep classes and structure identical to your markup for consistent styling
    wrapper.className = '';

    const anchor = document.createElement('a');
    anchor.className = 'block p-2 rounded-lg shadow hover:shadow-lg transition bg-white dark:bg-gray-800';
    anchor.href = url || '#';
    // open full news in same tab — you can change to target="_blank" if you prefer a new tab
    if (!url) anchor.removeAttribute('href');

    const image = document.createElement('img');
    image.src = img || './assets/pexels-kovyrina-1692984.jpg';
    image.alt = title || 'News';
    image.className = 'w-full h-24 object-cover';

    const content = document.createElement('div');
    content.className = 'p-4';

    const h3 = document.createElement('h3');
    h3.className = 'text-l font-bold text-gray-800 dark:text-white mb-2';
    h3.textContent = title || 'Pa titull';

    const p = document.createElement('p');
    p.className = 'text-gray-600 dark:text-gray-300 text-sm';
    p.innerHTML = (desc ? escapeHtml(desc) + ' ' : '') + '<span class="text-blue-600 dark:text-blue-400 hover:underline">Lexo me shume</span>';

    content.appendChild(h3);
    content.appendChild(p);

    anchor.appendChild(image);
    anchor.appendChild(content);
    wrapper.appendChild(anchor);

    return wrapper;
  }

  // small helper: escape HTML for description
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
  }

  // Re-render DOM: we will keep the original container children but show/hide them according to ITEMS array.
  // For dynamic items created via JS, we append them to container.
  function syncDOMToItems() {
    // Ensure all item.dom elements are present in the container in the same order as ITEMS
    ITEMS.forEach((it, idx) => {
      if (!it.el || !container.contains(it.el)) {
        // create DOM from data and append
        it.el = buildDOMItem(it);
        container.appendChild(it.el);
      }
    });

    // Remove any extra DOM nodes that were migrated from original static but are no longer in ITEMS
    // We'll not remove nodes that are not part of ITEMS (e.g., the heading or dotsWrap) — keep them.
    const nodes = Array.from(container.querySelectorAll(':scope > div'));
    nodes.forEach((node) => {
      const found = ITEMS.some(it => it.el === node);
      if (!found && node !== dotsWrap) {
        // remove old static elements that were not imported into ITEMS (to avoid duplicates)
        // BUT be cautious: if node contains the heading we shouldn't remove — headings are h2 not div so safe
        container.removeChild(node);
      }
    });

    // After ensuring DOM elements exist, hide/show according to current slide
    renderSlide(currentSlide);
    createOrUpdateDots();
  }

  // Determine number of slides
  function totalSlides() {
    return Math.max(1, Math.ceil(ITEMS.length / ITEMS_PER_SLIDE));
  }

  // Given a slide index, return the indices of items to show
  function indicesForSlide(slideIdx) {
    const res = [];
    const start = slideIdx * ITEMS_PER_SLIDE;
    for (let i = 0; i < ITEMS_PER_SLIDE; i++) {
      const idx = (start + i) % ITEMS.length;
      if (idx < ITEMS.length) res.push(idx);
    }
    return res;
  }

  // Render a slide by toggling inline display on item DOM nodes
  function renderSlide(slideIdx) {
    if (ITEMS.length === 0) return;
    slideIdx = Math.max(0, Math.min(slideIdx, totalSlides() - 1));
    currentSlide = slideIdx;

    const visibleIdx = [];
    for (let i = 0; i < ITEMS_PER_SLIDE; i++) {
      const idx = slideIdx * ITEMS_PER_SLIDE + i;
      if (idx < ITEMS.length) visibleIdx.push(idx);
    }
    // If last slide is not full and you want wrapping behavior, use modulo; here we don't wrap — we show remaining items only
    // If you want wrapping like earlier version, change logic to use modulo and ensure ITEMS.length >= ITEMS_PER_SLIDE

    ITEMS.forEach((it, i) => {
      if (!it.el) return;
      if (visibleIdx.includes(i)) {
        it.el.style.display = '';
        if (getComputedStyle(it.el).display === 'none') it.el.style.display = 'block';
      } else {
        it.el.style.display = 'none';
      }
    });

    updateDotsVisual();
  }

  // Create or update dots (one per slide)
  function createOrUpdateDots() {
    const n = totalSlides();
    if (!dotsWrap) {
      dotsWrap = document.createElement('div');
      dotsWrap.id = 'news-carousel-dots';
      dotsWrap.className = 'flex gap-2 justify-center mt-3';
      container.appendChild(dotsWrap);
    }

    // Clear and re-create if slide count changed
    dotsWrap.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.idx = String(i);
      b.setAttribute('aria-label', `Shfaq slide ${i + 1}`);
      b.className = 'w-3 h-3 rounded-full transition-transform';
      b.addEventListener('click', () => {
        goToSlide(i);
      });
      dotsWrap.appendChild(b);
    }
    updateDotsVisual();
  }

  function updateDotsVisual() {
    if (!dotsWrap) return;
    const btns = Array.from(dotsWrap.querySelectorAll('button'));
    btns.forEach((b, idx) => {
      b.classList.toggle('bg-blue-600', idx === currentSlide);
      b.classList.toggle('bg-gray-300', idx !== currentSlide);
      if (idx === currentSlide) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  // Timer controls
  function startTimer() {
    stopTimer();
    if (totalSlides() <= 1) return;
    timer = setInterval(() => {
      goToSlide((currentSlide + 1) % totalSlides());
    }, INTERVAL_MS);
  }
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function goToSlide(idx) {
    currentSlide = Math.max(0, Math.min(idx, totalSlides() - 1));
    renderSlide(currentSlide);
    startTimer(); // reset timer
  }

  // Public API to add a news item (dynamically). item = {title, img, desc, url}
  function addNewsItem(item) {
    const normalized = {
      title: item.title || 'Pa titull',
      img: item.img || './assets/pexels-kovyrina-1692984.jpg',
      desc: item.desc || '',
      url: item.url || null,
      el: null
    };
    ITEMS.push(normalized);
    syncDOMToItems();
    // go to last slide (so the newly added item is visible) OR stay on current; we'll stay but user can navigate
    // Optionally: goToSlide(totalSlides() - 1);
    return ITEMS.length - 1; // return index
  }

  // Remove an item by index (returns true if removed)
  function removeNewsItem(index) {
    if (index < 0 || index >= ITEMS.length) return false;
    const it = ITEMS[index];
    if (it && it.el && container.contains(it.el)) container.removeChild(it.el);
    ITEMS.splice(index, 1);
    // adjust currentSlide if out of range
    if (currentSlide >= totalSlides()) currentSlide = Math.max(0, totalSlides() - 1);
    syncDOMToItems();
    return true;
  }

  // Initialize from an array of item objects: [{title,img,desc,url}, ...]
  function initWithArray(arr) {
    // Clear existing dynamic items (but keep heading)
    // We will attempt to preserve any original static DOM items imported earlier — so first clear ITEMS and re-import if arr not provided
    ITEMS.length = 0;
    if (Array.isArray(arr) && arr.length) {
      arr.forEach(a => ITEMS.push({ title: a.title || 'Pa titull', img: a.img || '', desc: a.desc || '', url: a.url || null, el: null }));
    } else {
      // If no array, attempt import from existing DOM elements
      importExistingDOMItems();
    }
    syncDOMToItems();
    currentSlide = 0;
    startTimer();
  }

  // Pause on hover and resume on leave
  container.addEventListener('mouseenter', stopTimer);
  container.addEventListener('mouseleave', startTimer);

  // Expose API on window
  window.newsCarouselDynamic = {
    addNewsItem,
    removeNewsItem,
    init: initWithArray,
    goToSlide,
    start: startTimer,
    stop: stopTimer,
    _internal: { ITEMS } // for debugging if you want to inspect items from console
  };

  // Auto-initialize:
  // If the page set window.NEWS_DATA = [...] before script, use it. Otherwise try to import existing DOM items.
  if (Array.isArray(window.NEWS_DATA) && window.NEWS_DATA.length) {
    initWithArray(window.NEWS_DATA);
  } else {
    // import existing static blocks as initial items
    importExistingDOMItems();
    syncDOMToItems();
    startTimer();
  }
});
