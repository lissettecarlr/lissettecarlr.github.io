var SIDEBAR_BREAKPOINT = 1100;
var sidebarController = (function () {
  var hamburger = document.getElementById('sidebar-hamburger');
  var overlay = document.getElementById('sidebar-overlay');
  var sidebar = document.getElementById('sidebar-drawer');

  function setOpen(open) {
    if (!hamburger || !overlay || !sidebar) return;
    sidebar.classList.toggle('sidebar-open', open);
    overlay.classList.toggle('active', open);
    document.body.classList.toggle('sidebar-scroll-locked', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? '关闭菜单' : '展开菜单');
    hamburger.setAttribute('title', open ? '关闭菜单' : '展开菜单');
    hamburger.innerHTML = open
      ? '<i class="fas fa-times" aria-hidden="true"></i>'
      : '<i class="fas fa-bars" aria-hidden="true"></i>';
  }

  if (hamburger && overlay && sidebar) {
    hamburger.addEventListener('click', function () {
      setOpen(!sidebar.classList.contains('sidebar-open'));
    });
    overlay.addEventListener('click', function () {
      setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SIDEBAR_BREAKPOINT) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
        setOpen(false);
        hamburger.focus();
      }
    });
  }

  return {
    close: function () {
      setOpen(false);
    }
  };
})();

function closeSidebar() {
  sidebarController.close();
}

(function () {
  function readNightCookie() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)night\s*=\s*([^;]*).*$)|^.*$/, '$1');
  }

  var savedNightMode = readNightCookie();
  if (savedNightMode === '') {
    savedNightMode = new Date().getHours() > 22 || new Date().getHours() < 6 ? '1' : '0';
    document.cookie = 'night=' + savedNightMode + ';path=/';
  }
  document.body.classList.toggle('night', savedNightMode === '1');

  window.switchNightMode = function () {
    var enableNightMode = readNightCookie() !== '1';
    document.body.classList.toggle('night', enableNightMode);
    document.cookie = 'night=' + (enableNightMode ? '1' : '0') + ';path=/';
  };
})();

$(document).ready(function () {
  if (typeof lozad === 'function') {
    lozad().observe();
  }

  var STORAGE_KEY = 'webstack-category-collapse-v1';
  var $bookmarkSearch = $('#bookmark-search-input');
  var $bookmarkSearchClear = $('#bookmark-search-clear');
  var $bookmarkSearchStatus = $('#bookmark-search-status');
  var collapseState = {};
  var searchTimer;

  try {
    collapseState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (error) {
    collapseState = {};
  }
  if (!collapseState || typeof collapseState !== 'object' || Array.isArray(collapseState)) {
    collapseState = {};
  }

  function saveCollapseState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapseState));
    } catch (error) {
      // localStorage may be unavailable in privacy modes.
    }
  }

  function updateCategoryButton($section, collapsed) {
    $section.find('.category-toggle').first()
      .attr('aria-expanded', String(!collapsed))
      .attr('title', collapsed ? '显示此分类' : '隐藏此分类')
      .attr('aria-label', collapsed ? '显示此分类' : '隐藏此分类')
      .html(collapsed
        ? '<i class="fas fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="fas fa-eye" aria-hidden="true"></i>');
  }

  function setCategoryCollapsed($section, collapsed, persist, animate) {
    var $grid = $section.find('.bookmark-grid').first();
    var categoryId = $section.find('h4.text-gray').first().attr('id');
    $grid.stop(true, true).toggleClass('category-hidden', collapsed);
    if (animate) {
      collapsed ? $grid.slideUp(200) : $grid.slideDown(200);
    } else {
      $grid.toggle(!collapsed);
    }
    updateCategoryButton($section, collapsed);
    if (persist && categoryId) {
      collapseState[categoryId] = collapsed;
      saveCollapseState();
    }
  }

  $('h4.text-gray').each(function (index) {
    var $category = $(this);
    var $section = $category.closest('.category-section');
    var $grid = $section.find('.bookmark-grid').first();
    var categoryId = $category.attr('id');
    var gridId = 'bookmark-grid-' + index;
    $grid.attr('id', gridId);
    var $toggleButton = $('<button type="button" class="category-toggle" aria-controls="' + gridId + '"></button>');
    $category.append($toggleButton);
    setCategoryCollapsed($section, collapseState[categoryId] === true, false, false);
  });

  $(document).on('click', '.category-toggle', function () {
    var $section = $(this).closest('.category-section');
    var collapsed = !$section.find('.bookmark-grid').first().hasClass('category-hidden');
    setCategoryCollapsed($section, collapsed, true, true);
  });

  function filterBookmarks(query) {
    var keyword = $.trim(query).toLowerCase();
    var visibleCount = 0;

    $('.category-section').each(function () {
      var $section = $(this);
      var $grid = $section.find('.bookmark-grid').first();
      var sectionHasMatch = false;

      $section.find('.bookmark-item').each(function () {
        var $item = $(this);
        var $card = $item.find('.bookmark-card').first();
        var searchableText = [
          $card.attr('data-name') || '',
          $card.attr('data-tags') || '',
          $card.find('.xe-comment-description').text()
        ].join(' ').toLowerCase();
        var matches = !keyword || searchableText.indexOf(keyword) !== -1;
        $item.toggle(matches);
        if (matches) {
          sectionHasMatch = true;
          visibleCount++;
        }
      });

      $section.toggle(sectionHasMatch);
      if (keyword && sectionHasMatch) {
        $grid.stop(true, true).removeClass('category-hidden').show();
        updateCategoryButton($section, false);
      } else if (!keyword) {
        var categoryId = $section.find('h4.text-gray').first().attr('id');
        setCategoryCollapsed($section, collapseState[categoryId] === true, false, false);
      }
    });

    $bookmarkSearchClear.prop('hidden', !keyword);
    $bookmarkSearchStatus.text(keyword ? '找到 ' + visibleCount + ' 个站点' : '');
  }

  function clearSearch(focus) {
    clearTimeout(searchTimer);
    if (!$bookmarkSearch.length) return;
    $bookmarkSearch.val('');
    filterBookmarks('');
    if (focus) $bookmarkSearch.focus();
  }

  $bookmarkSearch.on('input', function () {
    var query = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      filterBookmarks(query);
    }, 150);
  }).on('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    } else if (event.key === 'Escape') {
      clearSearch(false);
      this.blur();
    }
  });

  $bookmarkSearchClear.on('click', function () {
    clearSearch(true);
  });

  $(document).on('keydown', function (event) {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k' || !$bookmarkSearch.length) return;
    var $target = $(event.target);
    var isEditing = $target.is('input, textarea, select') || $target.closest('[contenteditable="true"]').length > 0;
    if (isEditing && !$target.is($bookmarkSearch)) return;
    event.preventDefault();
    $bookmarkSearch.focus().select();
  });

  function filterByTag(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!$bookmarkSearch.length) return;
    var tag = $(event.currentTarget).text();
    $bookmarkSearch.val(tag).focus();
    clearTimeout(searchTimer);
    filterBookmarks(tag);
  }

  $(document).on('click', '.tag-item', filterByTag);
  $(document).on('keydown', '.tag-item', function (event) {
    if (event.key === 'Enter' || event.key === ' ') filterByTag(event);
  });

  $(document).on('click', '.has-sub > .submenu-toggle', function (event) {
    event.preventDefault();
    event.stopPropagation();
    var $toggle = $(this);
    var $item = $toggle.parent('.has-sub');
    var $submenu = $item.children('ul').first();
    var willExpand = !$item.hasClass('expanded');

    if (willExpand && !window.expandAll) {
      $item.siblings('.has-sub.expanded').each(function () {
        $(this).removeClass('expanded')
          .children('.submenu-toggle').attr('aria-expanded', 'false');
        $(this).children('ul').stop(true, true).slideUp(200);
      });
    }
    $item.toggleClass('expanded', willExpand);
    $toggle.attr('aria-expanded', String(willExpand));
    willExpand ? $submenu.stop(true, true).slideDown(200) : $submenu.stop(true, true).slideUp(200);
  });

  $(document).on('click', 'a.smooth', function (event) {
    event.preventDefault();
    var href = this.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;

    var target;
    try {
      target = document.getElementById(decodeURIComponent(href.slice(1)));
    } catch (error) {
      return;
    }
    if (!target) return;

    clearSearch(false);
    var $target = $(target);
    var $section = $target.closest('.category-section');
    if ($section.length) {
      $section.show();
      setCategoryCollapsed($section, false, true, false);
    }

    $('#main-menu li').removeClass('active');
    $(this).parent('li').addClass('active');
    var offset = $target.offset();
    if (offset && typeof offset.top === 'number') {
      $('html, body').stop(true).animate({ scrollTop: offset.top - 30 }, 500, 'swing');
    }
    if (window.innerWidth <= SIDEBAR_BREAKPOINT) closeSidebar();
  });
});
