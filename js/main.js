// ==========================================================================
// 工具箱 - 主入口文件
// 核心功能初始化、通用工具函数、全局状态管理
// ==========================================================================

(function() {
  'use strict';

  // 全局状态
  window.Toolbox = {
    state: {
      theme: 'light',
      favorites: [],
      history: [],
      searchCache: new Map(),
    },

    // 初始化
    init() {
      this.loadState();
      this.applyTheme();
      this.bindGlobalEvents();
      this.initScrollTop();
      this.initMobileNav();
      this.initKeyboardShortcuts();
      console.log('[Toolbox] 初始化完成');
    },

    // 从 localStorage 加载状态
    loadState() {
      try {
        const saved = localStorage.getItem('toolbox-state');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = { ...this.state, ...parsed };
        }
      } catch (e) {
        console.warn('[Toolbox] 状态加载失败:', e);
      }
    },

    // 保存状态到 localStorage
    saveState() {
      try {
        localStorage.setItem('toolbox-state', JSON.stringify(this.state));
      } catch (e) {
        console.warn('[Toolbox] 状态保存失败:', e);
      }
    },

    // 主题相关
    applyTheme() {
      const { theme } = this.state;
      if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      this.updateThemeIcons();
    },

    toggleTheme() {
      const themes = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(this.state.theme);
      this.state.theme = themes[(currentIndex + 1) % themes.length];
      this.saveState();
      this.applyTheme();
      this.showToast(this.state.theme === 'dark' ? '已切换到深色模式' : this.state.theme === 'light' ? '已切换到浅色模式' : '已切换到跟随系统', 'info');
    },

    updateThemeIcons() {
      const sunIcon = document.querySelector('.icon-sun');
      const moonIcon = document.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        const isDark = document.documentElement.classList.contains('dark');
        sunIcon.classList.toggle('hidden', isDark);
        moonIcon.classList.toggle('hidden', !isDark);
      }
    },

    // 收藏功能
    toggleFavorite(toolId) {
      const index = this.state.favorites.indexOf(toolId);
      if (index === -1) {
        this.state.favorites.push(toolId);
        this.showToast('已添加到收藏', 'success');
      } else {
        this.state.favorites.splice(index, 1);
        this.showToast('已取消收藏', 'info');
      }
      this.saveState();
      this.updateFavoriteButtons();
      return index === -1;
    },

    isFavorite(toolId) {
      return this.state.favorites.includes(toolId);
    },

    updateFavoriteButtons() {
      document.querySelectorAll('.favorite-btn').forEach(btn => {
        const toolId = btn.dataset.toolId;
        if (toolId) {
          btn.classList.toggle('active', this.isFavorite(toolId));
          btn.setAttribute('aria-label', this.isFavorite(toolId) ? '取消收藏' : '收藏工具');
        }
      });
    },

    // 历史记录
    addHistory(toolId) {
      const tool = getToolById(toolId);
      if (!tool) return;

      this.state.history = this.state.history.filter(h => h.id !== toolId);
      this.state.history.unshift({
        id: toolId,
        name: tool.name,
        category: tool.category,
        timestamp: Date.now()
      });
      this.state.history = this.state.history.slice(0, 20);
      this.saveState();
      this.renderHistory();
    },

    renderHistory() {
      const container = document.getElementById('history-list');
      if (!container) return;

      if (this.state.history.length === 0) {
        container.innerHTML = '<div class="history-empty">暂无使用记录</div>';
        return;
      }

      container.innerHTML = this.state.history.map(item => `
        <div class="history-item">
          <a href="/tools/${item.id}.html" class="flex items-center gap-2 flex-1">
            <span class="tool-tag" style="background: ${this.getCategoryColor(item.category)}20; color: ${this.getCategoryColor(item.category)};">${this.getCategoryName(item.category)}</span>
            <span>${item.name}</span>
          </a>
          <time>${this.formatTime(item.timestamp)}</time>
        </div>
      `).join('');
    },

    formatTime(ts) {
      const diff = Date.now() - ts;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    },

    getCategoryColor(cat) {
      const c = CATEGORIES.find(c => c.id === cat);
      return c ? c.color : '#6b7280';
    },

    getCategoryName(cat) {
      const c = CATEGORIES.find(c => c.id === cat);
      return c ? c.name : cat;
    },

    // Toast 提示
    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
        </svg>
        <span>${message}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideIn 200ms ease-out reverse';
        setTimeout(() => toast.remove(), 200);
      }, 3000);
    },

    // 工具函数
    copyToClipboard(text) {
      return navigator.clipboard.writeText(text).then(() => {
        this.showToast('已复制到剪贴板', 'success');
        return true;
      }).catch(() => {
        this.showToast('复制失败', 'error');
        return false;
      });
    },

    downloadText(text, filename) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('文件已下载', 'success');
    },

    // 滚动顶部按钮
    initScrollTop() {
      const btn = document.getElementById('scroll-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btn.classList.remove('opacity-0', 'invisible');
          btn.classList.add('opacity-100', 'visible');
        } else {
          btn.classList.add('opacity-0', 'invisible');
          btn.classList.remove('opacity-100', 'visible');
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    // 移动端导航
    initMobileNav() {
      const btn = document.getElementById('mobile-menu-btn');
      const nav = document.getElementById('mobile-nav');
      const overlay = document.getElementById('mobile-nav-overlay');
      const closeBtn = document.getElementById('mobile-nav-close');

      if (!btn || !nav) return;

      const openNav = () => {
        nav.classList.remove('hidden');
        nav.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      };

      const closeNav = () => {
        nav.classList.add('hidden');
        nav.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };

      btn.addEventListener('click', openNav);
      closeBtn?.addEventListener('click', closeNav);
      overlay?.addEventListener('click', closeNav);

      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !nav.classList.contains('hidden')) closeNav();
      });
    },

    // 键盘快捷键
    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // ⌘/Ctrl + K 打开搜索
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          const searchInput = document.getElementById('global-search') || document.getElementById('hero-search');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
        // ESC 关闭搜索结果
        if (e.key === 'Escape') {
          document.querySelectorAll('.search-results').forEach(el => el.classList.add('hidden'));
        }
      });
    },

    // 绑定全局事件
    bindGlobalEvents() {
      // 主题切换
      document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

      // 收藏按钮委托
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.favorite-btn');
        if (btn && btn.dataset.toolId) {
          e.preventDefault();
          this.toggleFavorite(btn.dataset.toolId);
        }
      });

      // 平滑滚动锚点
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.focus({ preventScroll: true });
          }
        });
      });
    },

    // 渲染热门工具（首页用）
    renderFeaturedTools() {
      const container = document.getElementById('featured-tools');
      if (!container) return;

      const popularTools = TOOLS_DATA.filter(t => t.popular).slice(0, 8);
      container.innerHTML = popularTools.map(tool => `
        <article class="tool-card" role="listitem" data-tool-id="${tool.id}">
          <div class="tool-card-icon" style="background: ${this.getCategoryColor(tool.category)}20; color: ${this.getCategoryColor(tool.category)};">
            ${this.getCategoryIcon(tool.category)}
          </div>
          <h3><a href="/tools/${tool.id}.html">${tool.name}</a></h3>
          <p>${tool.description}</p>
          <div class="tool-tags">
            ${tool.tags.slice(0, 3).map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
          </div>
          <div class="tool-meta">
            <span>${tool.popular ? '⭐ 热门' : ''}</span>
          </div>
        </article>
      `).join('');

      // 点击卡片跳转
      container.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            window.location.href = `/tools/${card.dataset.toolId}.html`;
          }
        });
      });
    },

    // 获取分类图标
    getCategoryIcon(cat) {
      const icons = {
        life: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M9 14H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
        text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
        math: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
        dev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><path d="M8 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8"/></svg>',
        utility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
      };
      return icons[cat] || icons.utility;
    },

    // 渲染所有工具（工具分类页用）
    renderAllTools() {
      const grid = document.getElementById('all-tools-grid');
      if (!grid) return;

      const filteredTools = this.getFilteredTools();
      grid.innerHTML = filteredTools.map(tool => `
        <article class="tool-card" role="listitem" data-tool-id="${tool.id}">
          <div class="tool-card-icon" style="background: ${this.getCategoryColor(tool.category)}20; color: ${this.getCategoryColor(tool.category)};">
            ${this.getCategoryIcon(tool.category)}
          </div>
          <h3><a href="/tools/${tool.id}.html">${tool.name}</a></h3>
          <p>${tool.description}</p>
          <div class="tool-tags">
            ${tool.tags.slice(0, 3).map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            ${tool.tags.length > 3 ? `<span class="tool-tag">+${tool.tags.length - 3}</span>` : ''}
          </div>
          <div class="tool-meta">
            <span>${tool.popular ? '⭐ 热门' : ''}</span>
          </div>
        </article>
      `).join('');

      grid.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            window.location.href = `/tools/${card.dataset.toolId}.html`;
          }
        });
      });
    },

    getFilteredTools() {
      let tools = TOOLS_DATA;
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('cat');
      if (catParam && CATEGORIES.some(c => c.id === catParam)) {
        tools = tools.filter(t => t.category === catParam);
      }
      return tools;
    },

    // 初始化分类筛选
    initToolsFilter() {
      // 分类筛选按钮
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          this.currentFilter = btn.dataset.category;
          this.renderAllTools();
        });
      });

      // Hero 搜索
      const heroSearch = document.getElementById('hero-search');
      if (heroSearch) {
        let debounceTimer = null;
        heroSearch.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.searchQuery = e.target.value.trim();
            this.renderAllTools();
          }, 150);
        });
      }

      // 全局搜索
      const globalSearch = document.getElementById('global-search');
      if (globalSearch) {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
          let debounceTimer = null;
          globalSearch.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const query = e.target.value.trim();
              if (query.length < 1) {
                resultsContainer.classList.add('hidden');
                return;
              }
              const results = this.searchTools(query);
              this.renderSearchResults(results, resultsContainer);
              resultsContainer.classList.remove('hidden');
            }, 100);
          });

          globalSearch.addEventListener('focus', () => {
            if (globalSearch.value.trim().length >= 1) {
              resultsContainer.classList.remove('hidden');
            }
          });

          document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box') && !e.target.closest('.hero-search')) {
              resultsContainer.classList.add('hidden');
            }
          });
        }
      }

      // URL 参数初始化筛选
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('cat');
      if (catParam && CATEGORIES.some(c => c.id === catParam)) {
        this.currentFilter = catParam;
        const btn = document.querySelector(`.filter-btn[data-category="${catParam}"]`);
        if (btn) {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      }

      this.currentFilter = 'all';
      this.searchQuery = '';
      this.renderAllTools();
    },

    searchTools(query) {
      const q = query.toLowerCase();
      return TOOLS_DATA.filter(tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some(tag => tag.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q)
      ).slice(0, 8);
    },

    renderSearchResults(results, container) {
      if (results.length === 0) {
        container.innerHTML = '<div class="search-result-empty">未找到相关工具</div>';
        return;
      }
      container.innerHTML = results.map(tool => `
        <a href="/tools/${tool.id}.html" class="search-result-item" data-tool-id="${tool.id}">
          <div class="search-result-icon" style="background: ${this.getCategoryColor(tool.category)}20; color: ${this.getCategoryColor(tool.category)};">
            ${this.getCategoryIcon(tool.category)}
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${tool.name}</div>
            <div class="search-result-category">${this.getCategoryName(tool.category)}</div>
          </div>
        </a>
      `).join('');
    },

    // Hero 搜索初始化
    initHeroSearch() {
      const input = document.getElementById('hero-search');
      if (!input) return;

      let debounceTimer = null;
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.renderFeaturedTools();
        }, 150);
      });
    }
  };

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Toolbox.init());
  } else {
    window.Toolbox.init();
  }

  // 暴露工具函数
  window.getToolById = getToolById;
  window.getToolsByCategory = getToolsByCategory;
  window.getCategoryById = getCategoryById;

})();