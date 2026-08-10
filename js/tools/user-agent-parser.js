// ==========================================================================
// 工具箱 - User-Agent 解析
// ==========================================================================

const UA_EXAMPLES = [
  { name: 'Chrome Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Firefox macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { name: 'Safari iPhone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' },
  { name: 'Chrome Android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'Edge Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
  { name: 'Safari macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15' },
  { name: 'Chrome Linux', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: '微信内置浏览器', ua: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36 MicroMessenger/8.0.18.1860' },
];

// 简化的 UA 解析器
const UAParser = {
  parse(ua) {
    const result = {
      ua,
      browser: { name: 'Unknown', version: 'Unknown', engine: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown', platform: 'Unknown' },
      device: { type: 'desktop', brand: 'Unknown', model: 'Unknown' },
      cpu: { architecture: 'Unknown' }
    };

    // 浏览器检测
    if (ua.includes('Edg/')) {
      result.browser.name = 'Edge';
      result.browser.version = this.extractVersion(ua, 'Edg/');
      result.browser.engine = 'Blink';
    } else if (ua.includes('OPR/') || ua.includes('Opera')) {
      result.browser.name = 'Opera';
      result.browser.version = this.extractVersion(ua, 'OPR/') || this.extractVersion(ua, 'Opera/');
      result.browser.engine = 'Blink';
    } else if (ua.includes('Chrome') && !ua.includes('Chromium')) {
      result.browser.name = 'Chrome';
      result.browser.version = this.extractVersion(ua, 'Chrome/');
      result.browser.engine = 'Blink';
    } else if (ua.includes('Firefox')) {
      result.browser.name = 'Firefox';
      result.browser.version = this.extractVersion(ua, 'Firefox/');
      result.browser.engine = 'Gecko';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      result.browser.name = 'Safari';
      result.browser.version = this.extractVersion(ua, 'Version/');
      result.browser.engine = 'WebKit';
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      result.browser.name = 'Internet Explorer';
      result.browser.version = this.extractVersion(ua, 'MSIE ') || this.extractVersion(ua, 'rv:');
      result.browser.engine = 'Trident';
    }

    // 微信内置浏览器
    if (ua.includes('MicroMessenger')) {
      result.browser.name = 'WeChat Browser';
      result.browser.version = this.extractVersion(ua, 'MicroMessenger/');
    }

    // 操作系统检测
    if (ua.includes('Windows NT 10.0') || ua.includes('Windows NT 6.3')) {
      result.os.name = 'Windows';
      result.os.version = ua.includes('Windows NT 10.0') ? '10/11' : '8.1';
      result.os.platform = 'win32';
    } else if (ua.includes('Mac OS X') || ua.includes('macOS')) {
      result.os.name = 'macOS';
      const match = ua.match(/Mac OS X ([\d_]+)/) || ua.match(/macOS ([\d.]+)/);
      result.os.version = match ? match[1].replace(/_/g, '.') : 'Unknown';
      result.os.platform = 'darwin';
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
      result.os.name = 'iOS';
      const match = ua.match(/OS ([\d_]+)/);
      result.os.version = match ? match[1].replace(/_/g, '.') : 'Unknown';
      result.os.platform = 'ios';
      result.device.type = ua.includes('iPad') ? 'tablet' : 'mobile';
    } else if (ua.includes('Android')) {
      result.os.name = 'Android';
      result.os.version = this.extractVersion(ua, 'Android ');
      result.os.platform = 'linux';
      result.device.type = ua.includes('Mobile') ? 'mobile' : 'tablet';
    } else if (ua.includes('Linux') && !ua.includes('Android')) {
      result.os.name = 'Linux';
      result.os.platform = 'linux';
    }

    // 设备类型和品牌
    if (ua.includes('iPhone')) {
      result.device.type = 'mobile';
      result.device.brand = 'Apple';
      const match = ua.match(/iPhone(\d+,\d+)/) || ua.match(/iPhone OS ([\d_]+)/);
      result.device.model = match ? 'iPhone ' + (match[1]?.replace(/_/g, '.') || '') : 'iPhone';
    } else if (ua.includes('iPad')) {
      result.device.type = 'tablet';
      result.device.brand = 'Apple';
      result.device.model = 'iPad';
    } else if (ua.includes('Macintosh')) {
      result.device.type = 'desktop';
      result.device.brand = 'Apple';
    } else if (ua.includes('Windows')) {
      result.device.type = 'desktop';
    }

    // CPU 架构
    if (ua.includes('x86_64') || ua.includes('x64') || ua.includes('WOW64')) {
      result.cpu.architecture = 'x64';
    } else if (ua.includes('arm64') || ua.includes('aarch64')) {
      result.cpu.architecture = 'ARM64';
    } else if (ua.includes('arm') || ua.includes('ARM')) {
      result.cpu.architecture = 'ARM';
    } else if (ua.includes('i686') || ua.includes('i386')) {
      result.cpu.architecture = 'x86';
    }

    return result;
  },

  extractVersion(ua, key) {
    const regex = new RegExp(key + '([\\d.]+)');
    const match = ua.match(regex);
    return match ? match[1] : 'Unknown';
  }
};

function initUAParser() {
  const uaInput = document.getElementById('ua-input');
  const resultPanel = document.getElementById('ua-result');
  const resultContent = document.getElementById('ua-result-content');
  const examplesContainer = document.getElementById('ua-examples');

  // 渲染示例
  examplesContainer.innerHTML = UA_EXAMPLES.map(ex => `
    <div class="example-card" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius);padding:12px;cursor:pointer;transition:all var(--transition);" onclick="useExampleUA('${ex.ua.replace(/'/g, "\\'")}')" title="点击使用">
      <div style="font-weight:600;margin-bottom:4px;color:var(--color-text);">${ex.name}</div>
      <div style="font-family:monospace;font-size:0.75rem;color:var(--color-text-muted);word-break:break-all;">${ex.ua}</div>
    </div>
  `).join('');

  window.useExampleUA = function(ua) {
    uaInput.value = ua;
    uaInput.focus();
  };

  window.useCurrentUA = function() {
    uaInput.value = navigator.userAgent;
    uaInput.focus();
  };

  window.parseUA = function() {
    const uaText = uaInput.value.trim();
    if (!uaText) {
      if (window.Toolbox) window.Toolbox.showToast('请输入 User-Agent', 'error');
      return;
    }

    const lines = uaText.split('\n').filter(l => l.trim());
    const results = lines.map((ua, idx) => {
      const parsed = UAParser.parse(ua);
      return { index: idx + 1, ua: ua.trim(), parsed };
    });

    resultContent.innerHTML = results.map(r => `
      <div class="ua-result-item" style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--color-border);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-weight:600;color:var(--color-primary);">User-Agent #${r.index}</span>
          <button class="btn btn-ghost btn-small" onclick="navigator.clipboard.writeText('${r.ua.replace(/'/g, "\\'")}');window.Toolbox?.showToast('已复制','success')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        </div>
        <div style="font-family:monospace;font-size:0.75rem;background:var(--color-bg);padding:12px;border-radius:var(--radius);margin-bottom:16px;max-height:100px;overflow:auto;color:var(--color-text-muted);">${r.ua}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <div class="ua-section" style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:8px;">浏览器</div><div style="font-weight:600;">${r.parsed.browser.name} ${r.parsed.browser.version}</div><div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">引擎: ${r.parsed.browser.engine}</div></div>
          <div class="ua-section" style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:8px;">操作系统</div><div style="font-weight:600;">${r.parsed.os.name} ${r.parsed.os.version}</div><div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">平台: ${r.parsed.os.platform}</div></div>
          <div class="ua-section" style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:8px;">设备</div><div style="font-weight:600;">${r.parsed.device.type}</div><div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">${r.parsed.device.brand} ${r.parsed.device.model}</div></div>
          <div class="ua-section" style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:8px;">CPU 架构</div><div style="font-weight:600;">${r.parsed.cpu.architecture}</div></div>
        </div>
      </div>
    `).join('');

    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`解析完成 (${results.length} 个)`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('user-agent-parser');
  };

  window.clearUA = function() {
    uaInput.value = '';
    resultPanel.style.display = 'none';
  };

  window.copyUAResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUAParser);
} else {
  initUAParser();
}