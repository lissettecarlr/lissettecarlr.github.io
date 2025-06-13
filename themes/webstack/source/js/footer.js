
$(document).ready(function () {
  //img lazy loaded
  const observer = lozad();
  observer.observe();

  $(document).on('click', '.has-sub', function () {
    var _this = $(this)
    if (!$(this).hasClass('expanded')) {
      setTimeout(function () {
        _this.find('ul').attr("style", "")
      }, 300);

    } else {
      $('.has-sub ul').each(function (id, ele) {
        var _that = $(this)
        if (_this.find('ul')[0] != ele && !expandAll) {
          setTimeout(function () {
            _that.attr("style", "")
          }, 300);
        }
      })
    }
  })
  $('.user-info-menu .hidden-sm').click(function () {
    if ($('.sidebar-menu').hasClass('collapsed')) {
      $('.has-sub.expanded > ul').attr("style", "")
    } else {
      $('.has-sub.expanded > ul').show()
    }
  })
  $("#main-menu li ul li").click(function () {
    $(this).siblings('li').removeClass('active'); // 删除其他兄弟元素的样式
    $(this).addClass('active'); // 添加当前元素的样式
  });
  $("a.smooth").click(function (ev) {
    ev.preventDefault();

    public_vars.$mainMenu.add(public_vars.$sidebarProfile).toggleClass('mobile-is-visible');
    ps_destroy();
    $("html, body").animate({
      scrollTop: $($(this).attr("href")).offset().top - 30
    }, {
      duration: 500,
      easing: "swing"
    });
  });
  return false;
});

var href = "";
var pos = 0;
$("a.smooth").click(function (e) {
  $("#main-menu li").each(function () {
    $(this).removeClass("active");
  });
  $(this).parent("li").addClass("active");
  e.preventDefault();
  href = $(this).attr("href");
  pos = $(href).position().top - 30;
});
(function () {
  if (document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/, "$1") === '') {
    if (new Date().getHours() > 22 || new Date().getHours() < 6) {
      document.body.classList.add('night');
      document.cookie = "night=1;path=/";
      console.log('夜间模式开启');
    } else {
      document.body.classList.remove('night');
      document.cookie = "night=0;path=/";
      console.log('夜间模式关闭');
    }
  } else {
    var night = document.cookie.replace(/(?:(?:^|.*;\s*)night\s*\=\s*([^;]*).*$)|^.*$/, "$1") || '0';
    if (night == '0') {
      document.body.classList.remove('night');
    } else if (night == '1') {
      document.body.classList.add('night');
    }
  }
})();

// 交互增强功能
$(document).ready(function() {
  
  // 添加卡片悬停效果增强
  $('.xe-widget.xe-conversations').each(function(index) {
    $(this).css('animation-delay', (index * 0.1) + 's');
    
    // 添加点击波纹效果
    $(this).on('click', function(e) {
      var $this = $(this);
      var ripple = $('<div class="ripple"></div>');
      var offset = $this.offset();
      var size = Math.max($this.outerWidth(), $this.outerHeight());
      var x = e.pageX - offset.left - size / 2;
      var y = e.pageY - offset.top - size / 2;
      
      ripple.css({
        position: 'absolute',
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px',
        background: 'rgba(33, 136, 255, 0.3)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple 0.6s ease-out',
        pointerEvents: 'none',
        zIndex: 1
      });
      
      $this.css('position', 'relative').append(ripple);
      
      setTimeout(function() {
        ripple.remove();
      }, 600);
    });
  });
  
  // 实时搜索功能
  var searchTimeout;
  $('#txt').on('input', function() {
    clearTimeout(searchTimeout);
    var query = $(this).val();
    
    searchTimeout = setTimeout(function() {
      performRealTimeSearch(query);
    }, 300);
  });
  
  // ESC 清除搜索
  $('#txt').on('keydown', function(e) {
    if (e.key === 'Escape') {
      $(this).blur();
      clearSearch();
    }
  });
  
  // 快捷键支持
  $(document).on('keydown', function(e) {
    // Ctrl/Cmd + K 快速搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      $('#txt').focus().select();
    }
  });
  
  // 添加分类切换按钮
  $('h4.text-gray').each(function() {
    var $category = $(this);
    var $section = $category.parent();
    var $bookmarkGrid = $section.find('.bookmark-grid, .row').first(); // 找到书签网格容器
    var $toggleBtn = $('<span class="category-toggle"><i class="fas fa-eye"></i></span>');
    
    $toggleBtn.css({
      'float': 'right',
      'cursor': 'pointer',
      'opacity': '0.6',
      'transition': 'all 0.3s ease',
      'padding': '5px 10px',
      'border-radius': '15px',
      'background': 'rgba(33, 136, 255, 0.1)'
    });
    
    $toggleBtn.on('click', function() {
      // 只隐藏书签网格，保持标题和按钮可见
      var isHidden = $bookmarkGrid.hasClass('category-hidden');
      
      if (isHidden) {
        $bookmarkGrid.removeClass('category-hidden').slideDown(300);
        $(this).html('<i class="fas fa-eye"></i>');
        $(this).attr('title', '隐藏此分类');
      } else {
        $bookmarkGrid.addClass('category-hidden').slideUp(300);
        $(this).html('<i class="fas fa-eye-slash"></i>');
        $(this).attr('title', '显示此分类');
      }
    });
    
    $toggleBtn.on('mouseenter', function() {
      $(this).css({'opacity': '1', 'transform': 'scale(1.1)'});
    }).on('mouseleave', function() {
      $(this).css({'opacity': '0.6', 'transform': 'scale(1)'});
    });
    
    // 设置初始提示文字
    $toggleBtn.attr('title', '隐藏此分类');
    
    $category.append($toggleBtn);
  });
  
  // 添加快速筛选标签
  if ($('.sousuo').length) {
    var $filterContainer = $('<div class="quick-filter"></div>').html(
      '<div class="filter-tag active" data-filter="all">全部</div>' +
      '<div class="filter-tag" data-filter="media">媒体工具</div>' +
      '<div class="filter-tag" data-filter="network">网络通信</div>' +
      '<div class="filter-tag" data-filter="cloud">云服务</div>' +
      '<div class="filter-tag" data-filter="security">安全</div>' +
      '<div class="filter-tag" data-filter="entertainment">娱乐</div>'
    );
    
    $('.sousuo').append($filterContainer);
    
    $('.filter-tag').on('click', function() {
      $('.filter-tag').removeClass('active');
      $(this).addClass('active');
      filterByCategory($(this).data('filter'));
    });
  }
  
  // 搜索功能
  function performRealTimeSearch(query) {
    if (!query.trim()) {
      clearSearch();
      return;
    }
    
    var visibleCount = 0;
    $('.xe-widget.xe-conversations').each(function() {
      var $card = $(this);
      var title = $card.find('.xe-user-name strong').text().toLowerCase();
      var description = $card.find('.xe-comment p').text().toLowerCase();
      var searchQuery = query.toLowerCase();
      
      if (title.includes(searchQuery) || description.includes(searchQuery)) {
        $card.show();
        $card.parent().show();
        visibleCount++;
      } else {
        $card.hide();
        $card.parent().hide();
      }
    });
    
    showSearchStats(visibleCount, query);
  }
  
  function clearSearch() {
    $('.xe-widget.xe-conversations').show();
    $('.xe-widget.xe-conversations').parent().show();
    $('.search-stats').remove();
  }
  
  function showSearchStats(count, query) {
    $('.search-stats').remove();
    
    var $statsElement = $('<div class="search-stats"></div>').css({
      'text-align': 'center',
      'padding': '10px',
      'background': 'rgba(33, 136, 255, 0.1)',
      'border-radius': '8px',
      'margin': '20px auto',
      'max-width': '717px',
      'color': '#2196F3',
      'font-size': '14px'
    }).text('找到 ' + count + ' 个与 "' + query + '" 相关的结果');
    
    $('.main-content h4.text-gray').first().before($statsElement);
  }
  
  function filterByCategory(category) {
    $('h4.text-gray').each(function() {
      var $section = $(this).parent();
      var sectionName = $(this).text().toLowerCase();
      
      if (category === 'all') {
        $section.show();
      } else {
        var keyword = getCategoryKeyword(category);
        var shouldShow = sectionName.includes(keyword);
        $section.toggle(shouldShow);
      }
    });
  }
  
  function getCategoryKeyword(category) {
    var keywords = {
      'media': '媒体',
      'network': '网络',
      'cloud': '云',
      'security': '安全',
      'entertainment': '娱乐'
    };
    return keywords[category] || '';
  }
  
});
