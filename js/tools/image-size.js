// ==========================================================================
// 工具箱 - 图片尺寸换算
// ==========================================================================

function initImageSize() {
  const wPx = document.getElementById('img-w-px');
  const hPx = document.getElementById('img-h-px');
  const dpi = document.getElementById('img-dpi');
  const wPhys = document.getElementById('img-w-physical');
  const hPhys = document.getElementById('img-h-physical');
  const dpi2 = document.getElementById('img-dpi2');
  const unitRadios = document.getElementsByName('img-unit');
  const resultPanel = document.getElementById('img-result');
  const resultContent = document.getElementById('img-result-content');
  const presetsContainer = document.getElementById('img-presets');

  // 常用尺寸预设
  const presets = [
    { name: '身份证/证件照', w: 358, h: 441, desc: '358×441px (小1寸)' },
    { name: '护照/签证照', w: 480, h: 640, desc: '480×640px (2寸)' },
    { name: '1寸照片', w: 295, h: 413, desc: '295×413px (1寸)' },
    { name: '2寸照片', w: 413, h: 626, desc: '413×626px (大1寸/2寸)' },
    { name: 'A4 纸 (300 DPI)', w: 2480, h: 3508, desc: 'A4 打印尺寸' },
    { name: 'A3 纸 (300 DPI)', w: 3508, h: 4961, desc: 'A3 打印尺寸' },
    { name: '4K 屏幕', w: 3840, h: 2160, desc: '3840×2160px' },
    { name: '1080P 屏幕', w: 1920, h: 1080, desc: '1920×1080px' },
    { name: '720P 屏幕', w: 1280, h: 720, desc: '1280×720px' },
    { name: 'iPhone 15 Pro', w: 1179, h: 2556, desc: 'iPhone 15 Pro 屏幕' },
    { name: 'iPhone 15 Pro Max', w: 1290, h: 2796, desc: 'iPhone 15 Pro Max 屏幕' },
    { name: 'Instagram 正方形', w: 1080, h: 1080, desc: '1080×1080px' },
    { name: 'Instagram 故事', w: 1080, h: 1920, desc: '1080×1920px' },
    { name: 'YouTube 缩略图', w: 1280, h: 720, desc: '1280×720px (16:9)' },
    { name: '微信朋友圈', w: 1080, h: 1080, desc: '1080×1080px' },
    { name: '微信公众号封面', w: 900, h: 383, desc: '900×383px (2.35:1)' },
  ];

  // 渲染预设
  presetsContainer.innerHTML = presets.map(p => `
    <button type="button" class="preset-btn" onclick="applyPreset(${p.w}, ${p.h})" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius);padding:12px;text-align:left;cursor:pointer;transition:all var(--transition);">
      <div style="font-weight:600;color:var(--color-text);">${p.name}</div>
      <div style="font-family:monospace;font-size:0.8125rem;color:var(--color-primary);margin:4px 0;">${p.w} × ${p.h} px</div>
      <div style="font-size:0.75rem;color:var(--color-text-muted);">${p.desc}</div>
    </button>
  `).join('');

  window.applyPreset = function(w, h) {
    wPx.value = w;
    hPx.value = h;
  };

  // 获取当前单位
  function getCurrentUnit() {
    for (const radio of unitRadios) {
      if (radio.checked) return radio.value;
    }
    return 'inch';
  }

  // 像素 → 物理尺寸
  window.calcFromPx = function() {
    const w = parseFloat(wPx.value);
    const h = parseFloat(hPx.value);
    const d = parseFloat(dpi.value);
    
    if (!w || !h || !d) {
      if (window.Toolbox) window.Toolbox.showToast('请填写完整信息', 'error');
      return;
    }

    const wInch = w / d;
    const hInch = h / d;
    const wCm = wInch * 2.54;
    const hCm = hInch * 2.54;
    const wMm = wCm * 10;
    const hMm = hCm * 10;
    const megapixels = (w * h / 1000000).toFixed(2);
    const aspect = (w / h).toFixed(2);
    const aspectRatio = simplifyRatio(w, h);

    resultContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">宽度</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;">${wInch.toFixed(2)} in</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;color:var(--color-primary);">${wCm.toFixed(2)} cm</div><div style="font-family:monospace;font-size:0.875rem;color:var(--color-text-muted);">${wMm.toFixed(1)} mm</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">高度</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;">${hInch.toFixed(2)} in</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;color:var(--color-primary);">${hCm.toFixed(2)} cm</div><div style="font-family:monospace;font-size:0.875rem;color:var(--color-text-muted);">${hMm.toFixed(1)} mm</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">分辨率</div><div style="font-weight:600;">${w} × ${h} px</div><div style="font-size:0.875rem;color:var(--color-text-muted);margin-top:4px;">${megapixels} MP</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">宽高比</div><div style="font-weight:600;">${aspectRatio}</div><div style="font-size:0.875rem;color:var(--color-text-muted);margin-top:4px;">约 ${aspect}:1</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">DPI 设置</div><div style="font-weight:600;">${d} DPI</div><div style="font-size:0.875rem;color:var(--color-text-muted);margin-top:4px;">${d >= 300 ? '✓ 适合高质量打印' : d >= 150 ? '⚠ 适合一般打印' : '✗ 仅适合屏幕显示'}</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">对角线</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;">${Math.sqrt(wInch*wInch + hInch*hInch).toFixed(2)} in</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;color:var(--color-primary);">${Math.sqrt(wCm*wCm + hCm*hCm).toFixed(2)} cm</div></div>
      </div>
    `;
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast('换算完成', 'success');
    if (window.Toolbox) window.Toolbox.addHistory('image-size');
  };

  // 物理尺寸 → 像素
  window.calcFromPhysical = function() {
    const w = parseFloat(wPhys.value);
    const h = parseFloat(hPhys.value);
    const d = parseFloat(dpi2.value);
    const unit = getCurrentUnit();
    
    if (!w || !h || !d) {
      if (window.Toolbox) window.Toolbox.showToast('请填写完整信息', 'error');
      return;
    }

    const wInch = unit === 'inch' ? w : w / 2.54;
    const hInch = unit === 'inch' ? h : h / 2.54;
    const wPxCalc = Math.round(wInch * d);
    const hPxCalc = Math.round(hInch * d);
    const wCm = wInch * 2.54;
    const hCm = hInch * 2.54;
    const megapixels = (wPxCalc * hPxCalc / 1000000).toFixed(2);
    const aspect = (wPxCalc / hPxCalc).toFixed(2);
    const aspectRatio = simplifyRatio(wPxCalc, hPxCalc);

    resultContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">像素宽度</div><div style="font-family:monospace;font-size:1.5rem;font-weight:600;color:var(--color-primary);">${wPxCalc} px</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">像素高度</div><div style="font-family:monospace;font-size:1.5rem;font-weight:600;color:var(--color-primary);">${hPxCalc} px</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">总像素</div><div style="font-weight:600;">${megapixels} MP</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">宽高比</div><div style="font-weight:600;">${aspectRatio} (约 ${aspect}:1)</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">物理尺寸</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;">${wInch.toFixed(2)} × ${hInch.toFixed(2)} in</div><div style="font-family:monospace;font-size:1.25rem;font-weight:600;color:var(--color-primary);">${wCm.toFixed(2)} × ${hCm.toFixed(2)} cm</div></div>
        <div class="result-item" style="background:var(--color-bg-elevated);padding:16px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:4px;">DPI 设置</div><div style="font-weight:600;">${d} DPI</div></div>
      </div>
    `;
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast('换算完成', 'success');
    if (window.Toolbox) window.Toolbox.addHistory('image-size');
  };

  window.clearImageCalc = function() {
    wPx.value = '';
    hPx.value = '';
    wPhys.value = '';
    hPhys.value = '';
    resultPanel.style.display = 'none';
  };

  window.copyImageResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };

  // 最大公约数
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }

  // 化简比例
  function simplifyRatio(w, h) {
    const g = gcd(w, h);
    return `${w/g}:${h/g}`;
  }
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageSize);
} else {
  initImageSize();
}