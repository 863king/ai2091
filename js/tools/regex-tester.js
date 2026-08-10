// ==========================================================================
// 工具箱 - 正则测试
// ==========================================================================

const REGEX_LIBRARY = [
  { name: '手机号 (中国)', pattern: '^1[3-9]\\d{9}$', desc: '匹配中国大陆手机号' },
  { name: '邮箱地址', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: '标准邮箱格式验证' },
  { name: '身份证号 (18位)', pattern: '^\\d{17}[\\dXx]$', desc: '中国大陆身份证号码' },
  { name: 'URL 网址', pattern: '^https?://[^\\s/$.?#].[^\\s]*$', desc: 'HTTP/HTTPS 网址验证' },
  { name: 'IPv4 地址', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'IPv4 格式验证' },
  { name: '中文汉字', pattern: '^[\\u4e00-\\u9fa5]+$', desc: '仅包含中文字符' },
  { name: '邮政编码 (中国)', pattern: '^\\d{6}$', desc: '中国 6 位邮政编码' },
  { name: '车牌号 (新能源)', pattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[DF]$', desc: '新能源车牌' },
  { name: '车牌号 (普通)', pattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{5}$', desc: '普通车牌' },
  { name: '银行卡号', pattern: '^\\d{16,19}$', desc: '16-19 位银行卡号' },
  { name: 'IPv6 地址', pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', desc: '标准 IPv6 格式' },
  { name: 'MAC 地址', pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', desc: 'MAC 地址格式' },
  { name: '日期 (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', desc: 'ISO 日期格式' },
  { name: '时间 (HH:mm:ss)', pattern: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$', desc: '24 小时制时间' },
  { name: 'HTML 标签', pattern: '<[^>]+>', desc: '匹配 HTML 标签' },
  { name: 'JSON 格式', pattern: '^\\s*(\\{.*\\}|\\[.*\\])\\s*$', desc: '简单 JSON 格式检测' },
  { name: 'Base64 字符串', pattern: '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$', desc: 'Base64 编码验证' },
  { name: '强密码', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$', desc: '包含大小写、数字、特殊字符，8位以上' },
  { name: '用户名 (字母数字下划线)', pattern: '^[a-zA-Z0-9_]{3,16}$', desc: '3-16 位字母数字下划线' },
  { name: '颜色十六进制', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', desc: '#RRGGBB 或 #RGB' },
  { name: '版本号 (SemVer)', pattern: '^\\d+\\.\\d+\\.\\d+(-[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?(\\+[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?$', desc: '语义化版本号' },
];

function initRegexTester() {
  const patternInput = document.getElementById('regex-pattern');
  const textInput = document.getElementById('regex-text');
  const replaceInput = document.getElementById('regex-replace');
  const flags = {
    global: document.getElementById('regex-global'),
    ignoreCase: document.getElementById('regex-ignore'),
    multiline: document.getElementById('regex-multiline'),
    dotAll: document.getElementById('regex-dotall'),
    unicode: document.getElementById('regex-unicode'),
    sticky: document.getElementById('regex-sticky')
  };
  const resultPanel = document.getElementById('regex-result');
  const resultContent = document.getElementById('regex-result-content');
  const replacePanel = document.getElementById('regex-replace-result');
  const replaceContent = document.getElementById('regex-replace-result-content');
  const libraryContainer = document.getElementById('regex-library');

  // 渲染常用正则库
  libraryContainer.innerHTML = REGEX_LIBRARY.map(item => `
    <div class="library-item" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:all var(--transition);" onclick="useRegex('${escapeHtml(item.pattern)}')" title="${item.desc}">
      <div style="font-weight:600;margin-bottom:4px;color:var(--color-text);">${item.name}</div>
      <div style="font-family:monospace;font-size:0.8125rem;color:var(--color-primary);background:var(--color-bg);padding:8px;border-radius:4px;word-break:break-all;">${item.pattern}</div>
      <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">${item.desc}</div>
    </div>
  `).join('');

  // 使用正则
  window.useRegex = function(pattern) {
    patternInput.value = pattern;
    patternInput.focus();
  };

  // 测试正则
  window.testRegex = function() {
    const pattern = patternInput.value.trim();
    const text = textInput.value;
    const replace = replaceInput.value;
    
    if (!pattern) {
      if (window.Toolbox) window.Toolbox.showToast('请输入正则表达式', 'error');
      return;
    }
    
    if (!text) {
      if (window.Toolbox) window.Toolbox.showToast('请输入测试文本', 'error');
      return;
    }
    
    // 构建标志
    let flagStr = '';
    if (flags.global.checked) flagStr += 'g';
    if (flags.ignoreCase.checked) flagStr += 'i';
    if (flags.multiline.checked) flagStr += 'm';
    if (flags.dotAll.checked) flagStr += 's';
    if (flags.unicode.checked) flagStr += 'u';
    if (flags.sticky.checked) flagStr += 'y';
    
    try {
      const regex = new RegExp(pattern, flagStr);
      
      // 匹配结果
      const matches = [...text.matchAll(regex)];
      
      if (matches.length === 0) {
        resultContent.innerHTML = '<div class="no-matches" style="text-align:center;padding:24px;color:var(--color-text-muted);">未找到匹配</div>';
      } else {
        resultContent.innerHTML = matches.map((match, idx) => `
          <div class="match-item" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius);padding:12px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="match-index" style="font-weight:600;color:var(--color-primary);">匹配 ${idx + 1}</span>
              <span class="match-position" style="font-size:0.75rem;color:var(--color-text-muted);">位置: ${match.index} - ${match.index + match[0].length}</span>
            </div>
            <div style="font-family:monospace;font-size:0.875rem;background:var(--color-bg);padding:8px;border-radius:4px;word-break:break-all;color:var(--color-text);">${escapeHtml(match[0])}</div>
            ${match.length > 1 ? `
              <div class="match-groups" style="margin-top:8px;">
                <div style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);margin-bottom:4px;">捕获组:</div>
                ${match.slice(1).map((g, i) => `
                  <div style="font-family:monospace;font-size:0.8125rem;padding:4px 8px;background:var(--color-bg);border-radius:4px;margin:2px 0;">
                    <span style="color:var(--color-primary);">$${i + 1}:</span> ${escapeHtml(g ?? '')}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('');
      }
      resultPanel.style.display = 'block';
      
      // 替换结果
      if (replace !== undefined && replace !== '') {
        try {
          const replaced = text.replace(regex, replace);
          replaceContent.innerHTML = `
            <div style="font-family:monospace;font-size:0.875rem;background:var(--color-bg);padding:16px;border-radius:var(--radius);white-space:pre-wrap;word-break:break-word;color:var(--color-text);">${escapeHtml(replaced)}</div>
          `;
          replacePanel.style.display = 'block';
        } catch (e) {
          replaceContent.innerHTML = `<div style="color:#ef4444;padding:16px;">替换错误: ${e.message}</div>`;
          replacePanel.style.display = 'block';
        }
      } else {
        replacePanel.style.display = 'none';
      }
      
      if (window.Toolbox) window.Toolbox.showToast(`找到 ${matches.length} 个匹配`, 'success');
      if (window.Toolbox) window.Toolbox.addHistory('regex-tester');
    } catch (e) {
      resultContent.innerHTML = `<div style="color:#ef4444;padding:16px;background:#fef2f2;border-radius:var(--radius);"><strong>正则错误:</strong> ${e.message}</div>`;
      resultPanel.style.display = 'block';
    }
  };

  // 清空
  window.clearRegex = function() {
    patternInput.value = '';
    textInput.value = '';
    replaceInput.value = '';
    resultPanel.style.display = 'none';
    replacePanel.style.display = 'none';
  };

  // 加载示例
  window.loadRegexSample = function() {
    patternInput.value = '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b';
    textInput.value = '联系电话: 138-0013-8000 或 13900138000，也可以是 (010) 12345678';
    replaceInput.value = '';
    flags.global.checked = true;
    testRegex();
  };

  // 复制匹配结果
  window.copyRegexResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制匹配结果', 'success');
    });
  };

  // 复制替换结果
  window.copyRegexReplaceResult = function() {
    const text = replaceContent.innerText || replaceContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制替换结果', 'success');
    });
  };

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRegexTester);
} else {
  initRegexTester();
}