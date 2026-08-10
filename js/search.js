// ==========================================================================
// 工具箱 - 搜索模块
// 模糊搜索、实时匹配、键盘导航
// ==========================================================================

(function() {
  'use strict';

  // 简单的模糊搜索实现
  function fuzzySearch(query, items, keys) {
    const q = query.toLowerCase().trim();
    if (!q) return items;

    return items.map(item => {
      let score = 0;
      let matchedKey = '';
      
      for (const key of keys) {
        const value = String(item[key] || '').toLowerCase();
        if (value.includes(q)) {
          // 完全匹配得分最高
          if (value === q) score += 100;
          // 前缀匹配次之
          else if (value.startsWith(q)) score += 50;
          // 包含匹配
          else score += 20;
          matchedKey = key;
        }
        // 标签数组匹配
        if (Array.isArray(item[key])) {
          for (const tag of item[key]) {
            if (tag.toLowerCase().includes(q)) {
              score += 15;
              matchedKey = key;
            }
          }
        }
      }
      
      return { item, score, matchedKey };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
  }

  // 搜索管理器
  const SearchManager = {
    init() {
      this.bindGlobalSearch();
      this.bindHeroSearch();
      console.log('[Search] 初始化完成');
    },

    // 全局搜索框（导航栏）
    bindGlobalSearch() {
      const input = document.getElementById('global-search');
      const resultsContainer = document.getElementById('search-results');
      if (!input || !resultsContainer) return;

      let debounceTimer = null;
      let selectedIndex = -1;

      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 1) {
          resultsContainer.classList.add('hidden');
          selectedIndex = -1;
          return;
        }

        debounceTimer = setTimeout(() => {
          const results = this.search(query);
          this.renderResults(results, resultsContainer);
          resultsContainer.classList.remove('hidden');
          selectedIndex = -1;
        }, 100);
      });

      // 键盘导航
      input.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            this.updateSelection(items, selectedIndex);
            break;
          case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            this.updateSelection(items, selectedIndex);
            break;
          case 'Enter':
            if (selectedIndex >= 0 && items[selectedIndex]) {
              e.preventDefault();
              items[selectedIndex].click();
            }
            break;
          case 'Escape':
            resultsContainer.classList.add('hidden');
            input.blur();
            break;
        }
      });

      input.addEventListener('focus', () => {
        if (input.value.trim().length >= 1) {
          resultsContainer.classList.remove('hidden');
        }
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
          resultsContainer.classList.add('hidden');
        }
      });
    },

    // Hero 区域搜索（首页大搜索框）
    bindHeroSearch() {
      const input = document.getElementById('hero-search');
      if (!input) return;

      let debounceTimer = null;

      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = e.target.value.trim();
          // 触发首页热门工具重新渲染（由主模块处理）
          if (window.Toolbox && typeof window.Toolbox.renderFeaturedTools === 'function') {
            window.Toolbox.searchQuery = query;
            window.Toolbox.renderFeaturedTools();
          }
        }, 150);
      });
    },

    // 核心搜索逻辑
    search(query) {
      if (!window.TOOLS_DATA) return [];
      return fuzzySearch(query, window.TOOLS_DATA, ['name', 'description', 'category', 'tags']);
    },

    // 渲染搜索结果
    renderResults(results, container) {
      if (results.length === 0) {
        container.innerHTML = '<div class="search-result-empty p-3 text-center text-gray-500 dark:text-gray-400">未找到相关工具</div>';
        return;
      }

      const catColors = {
        life: '#2563eb', text: '#0d9488', math: '#d97706', dev: '#7c3aed', utility: '#16a34a'
      };
      const catNames = {
        life: '生活查询', text: '文本工具', math: '数字计算', dev: '开发工具', utility: '便民工具'
      };
      const catIcons = {
        life: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M9 14H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
        text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
        math: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
        dev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><path d="M8 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8"/></svg>',
        utility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
      };

      container.innerHTML = results.slice(0, 8).map(tool => `
        <a href="/tools/${tool.id}.html" class="search-result-item flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" data-tool-id="${tool.id}">
          <div class="search-result-icon w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background: ${catColors[tool.category] || '#6b7280'}20; color: ${catColors[tool.category] || '#6b7280'};">
            ${catIcons[tool.category] || catIcons.utility}
          </div>
          <div class="search-result-info flex-1 min-w-0">
            <div class="search-result-name font-medium text-gray-900 dark:text-white truncate">${tool.name}</div>
            <div class="search-result-category text-xs text-gray-500 dark:text-gray-400">${catNames[tool.category] || tool.category}</div>
          </div>
        </a>
      `).join('');
    },

    // 更新键盘选中状态
    updateSelection(items, index) {
      items.forEach((item, i) => {
        if (i === index) {
          item.classList.add('bg-gray-100', 'dark:bg-gray-800');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('bg-gray-100', 'dark:bg-gray-800');
        }
      });
    }
  };

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchManager.init());
  } else {
    SearchManager.init();
  }

  // 暴露给全局
  window.SearchManager = SearchManager;
})();