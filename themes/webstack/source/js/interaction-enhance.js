/**
 * 交互增强脚本 - 书签网站优化
 * 提供平滑的用户体验和现代化的交互效果
 */

(function() {
    'use strict';

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        initInteractionEnhancements();
    });

    function initInteractionEnhancements() {
        // 初始化各种交互功能
        initSmoothScroll();
        initCategoryFilter();
        initSidebarEnhancement();
        initCardAnimations();
        initSearchEnhancement();
        initLazyLoading();
        initQuickFilter();
        initKeyboardShortcuts();
    }

    // 平滑滚动优化
    function initSmoothScroll() {
        const menuLinks = document.querySelectorAll('.smooth');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 添加高亮效果
                    highlightSection(targetElement);
                }
            });
        });
    }

    // 分类筛选功能
    function initCategoryFilter() {
        // 为每个分类添加切换功能
        const categories = document.querySelectorAll('h4.text-gray');
        
        categories.forEach(category => {
            const categoryId = category.getAttribute('id');
            const categorySection = category.parentElement;
            
            // 添加切换按钮
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'category-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.style.cssText = `
                float: right;
                cursor: pointer;
                opacity: 0.6;
                transition: all 0.3s ease;
                padding: 5px 10px;
                border-radius: 15px;
                background: rgba(33, 136, 255, 0.1);
            `;
            
            toggleBtn.addEventListener('click', function() {
                toggleCategory(categorySection, this);
            });
            
            toggleBtn.addEventListener('mouseenter', function() {
                this.style.opacity = '1';
                this.style.transform = 'scale(1.1)';
            });
            
            toggleBtn.addEventListener('mouseleave', function() {
                this.style.opacity = '0.6';
                this.style.transform = 'scale(1)';
            });
            
            category.appendChild(toggleBtn);
        });
    }

    // 侧边栏增强
    function initSidebarEnhancement() {
        const menuItems = document.querySelectorAll('.main-menu li');
        
        menuItems.forEach(item => {
            const submenu = item.querySelector('ul');
            const link = item.querySelector('a');
            
            if (submenu) {
                // 为有子菜单的项目添加展开/收起功能
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleSubmenu(item, submenu);
                });
                
                // 添加悬停预览效果
                item.addEventListener('mouseenter', function() {
                    if (!item.classList.contains('expanded')) {
                        previewSubmenu(item, submenu);
                    }
                });
                
                item.addEventListener('mouseleave', function() {
                    if (!item.classList.contains('expanded')) {
                        hidePreviewSubmenu(item, submenu);
                    }
                });
            }
        });
    }

    // 卡片动画增强
    function initCardAnimations() {
        const cards = document.querySelectorAll('.xe-widget.xe-conversations');
        
        // 为卡片添加序列动画
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            
            // 添加点击波纹效果
            card.addEventListener('click', function(e) {
                createRippleEffect(this, e);
            });
            
            // 添加长按预览功能
            let pressTimer;
            card.addEventListener('mousedown', function(e) {
                pressTimer = setTimeout(() => {
                    showCardPreview(this);
                }, 500);
            });
            
            card.addEventListener('mouseup', function() {
                clearTimeout(pressTimer);
            });
            
            card.addEventListener('mouseleave', function() {
                clearTimeout(pressTimer);
            });
        });
    }

    // 搜索功能增强
    function initSearchEnhancement() {
        const searchInput = document.getElementById('txt');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            // 实时搜索功能
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performRealTimeSearch(this.value);
                }, 300);
            });
            
            // 搜索建议
            searchInput.addEventListener('focus', function() {
                showSearchSuggestions();
            });
            
            // 键盘快捷键
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.blur();
                    clearSearch();
                }
            });
        }
    }

    // 懒加载优化
    function initLazyLoading() {
        // 图片懒加载
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // 内容懒加载
        const sections = document.querySelectorAll('.row');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => sectionObserver.observe(section));
    }

    // 快速筛选功能
    function initQuickFilter() {
        // 创建快速筛选栏
        const filterContainer = document.createElement('div');
        filterContainer.className = 'quick-filter';
        filterContainer.innerHTML = `
            <div class="filter-tag active" data-filter="all">全部</div>
            <div class="filter-tag" data-filter="media">媒体工具</div>
            <div class="filter-tag" data-filter="network">网络通信</div>
            <div class="filter-tag" data-filter="cloud">云服务</div>
            <div class="filter-tag" data-filter="security">安全</div>
            <div class="filter-tag" data-filter="entertainment">娱乐</div>
            <div class="filter-tag" data-filter="platform">平台</div>
            <div class="filter-tag" data-filter="other">其他</div>
        `;
        
        // 插入到搜索框下方
        const searchSection = document.querySelector('.sousuo');
        if (searchSection) {
            searchSection.appendChild(filterContainer);
            
            // 绑定筛选事件
            const filterTags = filterContainer.querySelectorAll('.filter-tag');
            filterTags.forEach(tag => {
                tag.addEventListener('click', function() {
                    filterTags.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    filterByCategory(this.dataset.filter);
                });
            });
        }
    }

    // 键盘快捷键
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K 快速搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('txt');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // ESC 关闭搜索
            if (e.key === 'Escape') {
                clearSearch();
                const searchInput = document.getElementById('txt');
                if (searchInput) {
                    searchInput.blur();
                }
            }
            
            // 数字键快速导航
            if (e.key >= '1' && e.key <= '9' && !e.target.matches('input')) {
                const index = parseInt(e.key) - 1;
                const categories = document.querySelectorAll('h4.text-gray');
                if (categories[index]) {
                    categories[index].scrollIntoView({ behavior: 'smooth' });
                    highlightSection(categories[index]);
                }
            }
        });
    }

    // 辅助函数
    function toggleCategory(categorySection, toggleBtn) {
        const isHidden = categorySection.classList.contains('category-hidden');
        
        if (isHidden) {
            categorySection.classList.remove('category-hidden');
            categorySection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        } else {
            categorySection.classList.add('category-hidden');
            categorySection.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        }
    }

    function toggleSubmenu(item, submenu) {
        const isExpanded = item.classList.contains('expanded');
        
        if (isExpanded) {
            item.classList.remove('expanded');
            submenu.style.display = 'none';
        } else {
            item.classList.add('expanded');
            submenu.style.display = 'block';
        }
    }

    function previewSubmenu(item, submenu) {
        submenu.style.opacity = '0.3';
        submenu.style.display = 'block';
        submenu.style.pointerEvents = 'none';
    }

    function hidePreviewSubmenu(item, submenu) {
        if (!item.classList.contains('expanded')) {
            submenu.style.display = 'none';
            submenu.style.opacity = '1';
            submenu.style.pointerEvents = 'auto';
        }
    }

    function highlightSection(element) {
        element.style.backgroundColor = 'rgba(33, 136, 255, 0.1)';
        element.style.borderRadius = '8px';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }

    function createRippleEffect(card, event) {
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(33, 136, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    function showCardPreview(card) {
        const preview = document.createElement('div');
        const url = card.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        preview.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 9999;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            ">
                <h3>${card.querySelector('.xe-user-name strong').textContent}</h3>
                <p>${card.querySelector('.xe-comment p').textContent}</p>
                <div style="margin-top: 15px;">
                    <a href="${url}" target="_blank" style="
                        background: #2196F3;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 6px;
                        text-decoration: none;
                        display: inline-block;
                    ">访问网站</a>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #f5f5f5;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        margin-left: 10px;
                        cursor: pointer;
                    ">关闭</button>
                </div>
            </div>
            <div onclick="this.parentElement.remove()" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
            "></div>
        `;
        
        document.body.appendChild(preview);
    }

    function performRealTimeSearch(query) {
        if (!query.trim()) {
            clearSearch();
            return;
        }
        
        const cards = document.querySelectorAll('.xe-widget.xe-conversations');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const title = card.querySelector('.xe-user-name strong').textContent.toLowerCase();
            const description = card.querySelector('.xe-comment p').textContent.toLowerCase();
            const searchQuery = query.toLowerCase();
            
            if (title.includes(searchQuery) || description.includes(searchQuery)) {
                card.style.display = 'block';
                card.parentElement.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.parentElement.style.display = 'none';
            }
        });
        
        // 显示搜索结果统计
        showSearchStats(visibleCount, query);
    }

    function clearSearch() {
        const cards = document.querySelectorAll('.xe-widget.xe-conversations');
        cards.forEach(card => {
            card.style.display = 'block';
            card.parentElement.style.display = 'block';
        });
        
        const searchStats = document.querySelector('.search-stats');
        if (searchStats) {
            searchStats.remove();
        }
    }

    function showSearchStats(count, query) {
        let statsElement = document.querySelector('.search-stats');
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.className = 'search-stats';
            statsElement.style.cssText = `
                text-align: center;
                padding: 10px;
                background: rgba(33, 136, 255, 0.1);
                border-radius: 8px;
                margin: 20px auto;
                max-width: 717px;
                color: #2196F3;
                font-size: 14px;
            `;
            document.querySelector('.main-content').insertBefore(statsElement, document.querySelector('h4.text-gray'));
        }
        
        statsElement.textContent = `找到 ${count} 个与 "${query}" 相关的结果`;
    }

    function showSearchSuggestions() {
        // 可以在这里添加搜索建议功能
        console.log('显示搜索建议');
    }

    function filterByCategory(category) {
        const sections = document.querySelectorAll('h4.text-gray');
        
        sections.forEach(section => {
            const sectionContainer = section.parentElement;
            
            if (category === 'all') {
                sectionContainer.style.display = 'block';
            } else {
                const sectionName = section.textContent.toLowerCase();
                const shouldShow = sectionName.includes(getCategoryKeyword(category));
                sectionContainer.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    function getCategoryKeyword(category) {
        const keywords = {
            'media': '媒体',
            'network': '网络',
            'cloud': '云',
            'security': '安全',
            'entertainment': '娱乐',
            'platform': '平台',
            'other': '其他'
        };
        return keywords[category] || '';
    }

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -60%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

})(); 