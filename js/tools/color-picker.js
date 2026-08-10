// ==========================================================================
// 工具箱 - 颜色取色器
// ==========================================================================

function initColorPicker() {
  const preview = document.getElementById('color-preview');
  const input = document.getElementById('color-input');
  const hexInput = document.getElementById('color-hex');
  const rgbInput = document.getElementById('color-rgb');
  const hslInput = document.getElementById('color-hsl');
  const schemes = document.getElementById('color-schemes');
  const palettes = document.getElementById('color-palettes');

  let currentColor = '#2563eb';

  // 初始化
  updatePreview(currentColor);
  generateSchemes(currentColor);
  generatePalettes();

  // 颜色输入变化
  input.addEventListener('input', (e) => {
    currentColor = e.target.value;
    updateFromColor(currentColor);
  });

  // 点击预览区打开取色器
  preview.addEventListener('click', () => input.click());

  // 从 HEX 更新
  function updateFromHex() {
    const hex = hexInput.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      currentColor = hex;
      updateFromColor(currentColor);
    }
  }

  // 从 RGB 更新
  function updateFromRgb() {
    const match = rgbInput.value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        currentColor = DevUtils.rgbToHex(r, g, b);
        updateFromColor(currentColor);
      }
    }
  }

  // 从 HSL 更新
  function updateFromHsl() {
    const match = hslInput.value.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]), s = parseInt(match[2]), l = parseInt(match[3]);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        const rgb = DevUtils.hslToRgb(h, s, l);
        currentColor = DevUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
        updateFromColor(currentColor);
      }
    }
  }

  // 统一更新函数
  function updateFromColor(hex) {
    input.value = hex;
    const rgb = DevUtils.hexToRgb(hex);
    const hsl = DevUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hexInput.value = hex;
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    
    updatePreview(hex);
    generateSchemes(hex);
  }

  // 更新预览
  function updatePreview(hex) {
    preview.style.background = hex;
  }

  // 生成配色方案
  function generateSchemes(hex) {
    const rgb = DevUtils.hexToRgb(hex);
    const hsl = DevUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const schemeTypes = [
      { name: '单色', colors: generateMonochrome(hsl) },
      { name: '互补', colors: generateComplementary(hsl) },
      { name: '三角色', colors: generateTriadic(hsl) },
      { name: '类似色', colors: generateAnalogous(hsl) },
      { name: '分裂互补', colors: generateSplitComplementary(hsl) },
      { name: '四角色', colors: generateTetradic(hsl) }
    ];

    schemes.innerHTML = schemeTypes.map(scheme => `
      <div class="scheme-group">
        <div class="scheme-name" style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:8px;">${scheme.name}</div>
        <div class="scheme-colors" style="display:flex;gap:6px;">
          ${scheme.colors.map(c => `<div class="scheme-color" style="width:32px;height:32px;border-radius:6px;background:${c};cursor:pointer;" title="${c}" onclick="copyToClipboard('${c}')"></div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // 生成调色板
  function generatePalettes() {
    const palettesData = [
      ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16'],
      ['#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9'],
      ['#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef'],
      ['#ec4899','#f43f5e','#ef4444','#f97316','#f59e0b'],
      ['#64748b','#475569','#334155','#1e293b','#0f172a']
    ];
    
    palettes.innerHTML = palettesData.map(palette => `
      <div class="palette-row" style="display:contents;">
        ${palette.map(c => `<div class="palette-color" style="aspect-ratio:1;background:${c};cursor:pointer;" title="${c}" onclick="copyToClipboard('${c}')"></div>`).join('')}
      </div>
    `).join('');
  }

  // 复制当前颜色
  window.copyCurrentColor = () => copyToClipboard(currentColor);

  // 复制到剪贴板
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast(`已复制: ${text}`, 'success');
    });
  }

  // 配色方案生成函数
  function generateMonochrome(hsl) {
    return [0.2, 0.35, 0.5, 0.65, 0.8].map(l => DevUtils.hslToRgb(hsl.h, hsl.s, l * 100))
      .map(rgb => DevUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  function generateComplementary(hsl) {
    const h2 = (hsl.h + 180) % 360;
    return [hsl, {h: h2, s: hsl.s, l: hsl.l}, 
      {h: hsl.h, s: Math.max(0, hsl.s - 30), l: Math.min(100, hsl.l + 20)},
      {h: h2, s: Math.max(0, hsl.s - 30), l: Math.min(100, hsl.l + 20)},
      {h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l - 20)}]
      .map(c => DevUtils.rgbToHex(...Object.values(DevUtils.hslToRgb(c.h, c.s, c.l))));
  }

  function generateTriadic(hsl) {
    return [hsl, 
      {h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l},
      {h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l},
      {h: hsl.h, s: Math.max(0, hsl.s - 20), l: Math.min(100, hsl.l + 15)},
      {h: hsl.h, s: Math.min(100, hsl.s + 20), l: Math.max(0, hsl.l - 15)}]
      .map(c => DevUtils.rgbToHex(...Object.values(DevUtils.hslToRgb(c.h, c.s, c.l))));
  }

  function generateAnalogous(hsl) {
    return [-30, -15, 0, 15, 30].map(offset => {
      const h = (hsl.h + offset + 360) % 360;
      return DevUtils.rgbToHex(...Object.values(DevUtils.hslToRgb(h, hsl.s, hsl.l)));
    });
  }

  function generateSplitComplementary(hsl) {
    const h2 = (hsl.h + 180) % 360;
    return [hsl,
      {h: (h2 - 30 + 360) % 360, s: hsl.s, l: hsl.l},
      {h: (h2 + 30) % 360, s: hsl.s, l: hsl.l},
      {h: hsl.h, s: Math.max(0, hsl.s - 25), l: Math.min(100, hsl.l + 10)},
      {h: hsl.h, s: Math.min(100, hsl.s + 25), l: Math.max(0, hsl.l - 10)}]
      .map(c => DevUtils.rgbToHex(...Object.values(DevUtils.hslToRgb(c.h, c.s, c.l))));
  }

  function generateTetradic(hsl) {
    return [0, 90, 180, 270].map(offset => {
      const h = (hsl.h + offset) % 360;
      return DevUtils.rgbToHex(...Object.values(DevUtils.hslToRgb(h, hsl.s, hsl.l)));
    });
  }

  // 暴露给全局
  window.copyToClipboard = copyToClipboard;
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initColorPicker);
} else {
  initColorPicker();
}