(function () {
  // Navbar: solid-on-scroll + mobile menu
  var nav = document.querySelector('.nav');
  var links = document.querySelector('.nav-links');
  var btn = document.querySelector('.menu-btn');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (btn) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); btn.innerHTML = '<i class="fas fa-bars"></i>'; }
    });
  }

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Music Video switcher + YouTube embed
  var mvStage = document.querySelector('[data-mv-stage]');
  var mvTitle = document.querySelector('[data-mv-title]');
  var mvSub = document.querySelector('[data-mv-sub]');
  var mvLink = document.querySelector('[data-mv-link]');
  var mvItems = document.querySelectorAll('.mv-item');

  if (mvStage && mvItems.length) {
    function loadMvIframe(ytId, title, thumb) {
      mvStage.innerHTML = '';
      if (window.location.protocol === 'file:') {
        if (ytId === 'woKq2sD8xho') {
          var vid = document.createElement('video');
          vid.src = 'img/misamo.mp4';
          vid.poster = 'img/misamo1.jpeg';
          vid.controls = true;
          vid.autoplay = true;
          vid.playsInline = true;
          mvStage.appendChild(vid);
          return;
        }
        var link = document.createElement('a');
        link.className = 'mv-poster';
        link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(ytId);
        link.target = '_blank';
        link.rel = 'noopener';
        link.innerHTML =
          '<img src="' + thumb + '" alt="MISAMO ' + title + ' Music Video">' +
          '<span class="mv-play">Watch on YouTube &rarr;</span>';
        mvStage.appendChild(link);
        return;
      }
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(ytId) + '?autoplay=1&rel=0';
      iframe.title = 'MISAMO ' + title + ' Music Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      mvStage.appendChild(iframe);
    }

    var activeItem = document.querySelector('.mv-item.active') || mvItems[0];
    var playTrigger = mvStage.querySelector('[data-mv-play]');
    if (playTrigger) {
      playTrigger.addEventListener('click', function () {
        loadMvIframe(
          activeItem.getAttribute('data-yt'),
          activeItem.getAttribute('data-title'),
          activeItem.getAttribute('data-thumb')
        );
      });
    }

    mvItems.forEach(function (item) {
      item.addEventListener('click', function () {
        mvItems.forEach(function (x) { x.classList.remove('active'); });
        item.classList.add('active');
        activeItem = item;
        var yt = item.getAttribute('data-yt');
        var title = item.getAttribute('data-title');
        var sub = item.getAttribute('data-sub');
        var thumb = item.getAttribute('data-thumb');
        if (mvTitle) mvTitle.textContent = title;
        if (mvSub) mvSub.textContent = sub;
        if (mvLink) mvLink.href = 'https://www.youtube.com/watch?v=' + yt;
        loadMvIframe(yt, title, thumb);
      });
    });
  }

  // Gallery filter + pagination
  var gallery = document.querySelector('.gallery');
  var filterBtns = document.querySelectorAll('.gallery-filters button');
  var moreBtn = document.querySelector('[data-gallery-more]');
  var allBtn = document.querySelector('[data-gallery-all]');
  var countEl = document.querySelector('[data-gallery-count]');
  var STEP = 24;
  var activeFilter = 'all';
  var visibleLimit = STEP;

  function updateGallery() {
    if (!gallery) return;
    var figures = Array.prototype.slice.call(gallery.querySelectorAll('figure'));
    var matched = figures.filter(function (f) {
      return activeFilter === 'all' || f.getAttribute('data-member') === activeFilter;
    });
    var shown = 0;
    figures.forEach(function (f) {
      var isMatch = activeFilter === 'all' || f.getAttribute('data-member') === activeFilter;
      if (isMatch && shown < visibleLimit) {
        f.classList.remove('is-hidden');
        shown++;
      } else {
        f.classList.add('is-hidden');
      }
    });
    if (countEl) {
      countEl.textContent = 'Showing ' + shown + ' of ' + matched.length;
    }
    var remaining = matched.length - shown;
    if (moreBtn) {
      moreBtn.style.display = remaining > 0 ? '' : 'none';
      moreBtn.textContent = 'Load more (' + Math.min(STEP, remaining) + ')';
    }
    if (allBtn) {
      allBtn.style.display = remaining > 0 ? '' : 'none';
      allBtn.textContent = 'Show all ' + matched.length;
    }
  }

  if (gallery && filterBtns.length) {
    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        filterBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        activeFilter = b.getAttribute('data-filter');
        visibleLimit = STEP;
        updateGallery();
      });
    });
    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        visibleLimit += STEP;
        updateGallery();
      });
    }
    if (allBtn) {
      allBtn.addEventListener('click', function () {
        visibleLimit = Infinity;
        updateGallery();
      });
    }
    updateGallery();
  }

  // Lightbox with prev/next navigation
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-zoom]'));
  if (targets.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close"><i class="fas fa-times"></i></button>' +
      '<button class="lb-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>' +
      '<img alt="">' +
      '<button class="lb-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>' +
      '<span class="lb-count"></span>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var lbCount = lb.querySelector('.lb-count');
    var visibleList = [];
    var currentIndex = 0;

    function showAt(idx) {
      if (!visibleList.length) return;
      currentIndex = (idx + visibleList.length) % visibleList.length;
      var img = visibleList[currentIndex].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lbCount.textContent = (currentIndex + 1) + ' / ' + visibleList.length;
    }

    targets.forEach(function (t) {
      t.addEventListener('click', function () {
        visibleList = targets.filter(function (el) { return !el.classList.contains('is-hidden'); });
        var idx = visibleList.indexOf(t);
        showAt(idx >= 0 ? idx : 0);
        lb.classList.add('open');
      });
    });

    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); showAt(currentIndex - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); showAt(currentIndex + 1); });
    lbImg.addEventListener('click', function (e) { e.stopPropagation(); });
    lb.addEventListener('click', function () { lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      else if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
      else if (e.key === 'ArrowRight') showAt(currentIndex + 1);
    });
  }
})();
