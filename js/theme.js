// ==========================================================================
// 工具箱 - 主题切换模块
// ==========================================================================

(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'toolbox-theme';
  const THEMES = ['light', 'dark', 'auto'];

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
    applyTheme(savedTheme);
    updateThemeToggleUI(savedTheme);
    
    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
        if (currentTheme === 'auto') {
          applyTheme('auto');
        }
      });
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  function updateThemeToggleUI(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const sunIcon = toggleBtn.querySelector('.icon-sun');
    const moonIcon = toggleBtn.querySelector('.icon-moon');
    const isDark = document.documentElement.classList.contains('dark');

    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', isDark);
      moonIcon.classList.toggle('hidden', !isDark);
    }

    // 更新按钮的 aria-label
    const labels = {
      light: '当前为浅色模式，点击切换',
      dark: '当前为深色模式，点击切换',
      auto: '当前跟随系统，点击切换'
    };
    toggleBtn.setAttribute('aria-label', labels[theme] || labels.auto);
  }

  function cycleTheme() {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    
    applyTheme(nextTheme);
    updateThemeToggleUI(nextTheme);
    
    // 显示提示
    const messages = {
      light: '已切换到浅色模式',
      dark: '已切换到深色模式',
      auto: '已切换到跟随系统'
    };
    showThemeToast(messages[nextTheme]);
  }

  function showThemeToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    toast.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 200ms ease-out reverse';
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }

  // 绑定事件
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', cycleTheme);
    }
  });

  // 暴露给全局
  window.ThemeManager = {
    getCurrentTheme: () => localStorage.getItem(THEME_STORAGE_KEY) || 'auto',
    setTheme: (theme) => {
      if (THEMES.includes(theme)) {
        applyTheme(theme);
        updateThemeToggleUI(theme);
      }
    },
    toggleTheme: cycleTheme
  };
})();