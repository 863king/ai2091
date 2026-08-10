// ==========================================================================
// 工具箱 - 随机密码生成
// ==========================================================================

function initRandomPassword() {
  const lengthInput = document.getElementById('pwd-length');
  const lengthValue = document.getElementById('pwd-length-value');
  const upperCheck = document.getElementById('pwd-upper');
  const lowerCheck = document.getElementById('pwd-lower');
  const numbersCheck = document.getElementById('pwd-numbers');
  const symbolsCheck = document.getElementById('pwd-symbols');
  const excludeCheck = document.getElementById('pwd-exclude');
  const countInput = document.getElementById('pwd-count');
  const resultPanel = document.getElementById('pwd-result');
  const resultContent = document.getElementById('pwd-result-content');
  const checkInput = document.getElementById('pwd-check');
  const strengthPanel = document.getElementById('pwd-strength');
  const strengthBar = document.getElementById('pwd-strength-bar');
  const strengthText = document.getElementById('pwd-strength-text');
  const suggestionsList = document.getElementById('pwd-suggestions');

  // 更新长度显示
  lengthInput.addEventListener('input', () => {
    lengthValue.textContent = lengthInput.value;
  });

  // 生成密码
  window.generatePasswords = function() {
    const length = parseInt(lengthInput.value) || 16;
    const count = parseInt(countInput.value) || 1;
    
    const options = {
      upper: upperCheck.checked,
      lower: lowerCheck.checked,
      numbers: numbersCheck.checked,
      symbols: symbolsCheck.checked,
      excludeSimilar: excludeCheck.checked
    };
    
    if (!options.upper && !options.lower && !options.numbers && !options.symbols) {
      if (window.Toolbox) window.Toolbox.showToast('请至少选择一种字符类型', 'error');
      return;
    }
    
    const passwords = [];
    for (let i = 0; i < count; i++) {
      passwords.push(DevUtils.generatePassword(length, options));
    }
    
    resultContent.innerHTML = passwords.map((pwd, idx) => `
      <div class="password-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--color-bg-elevated);border-radius:var(--radius);margin-bottom:8px;">
        <span style="font-family:monospace;font-size:0.9375rem;flex:1;word-break:break-all;user-select:all;" onclick="navigator.clipboard.writeText('${pwd}')">${pwd}</span>
        <button class="btn btn-ghost btn-small" onclick="navigator.clipboard.writeText('${pwd}');window.Toolbox?.showToast('已复制','success')" aria-label="复制密码"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        <span class="pwd-strength-badge" style="font-size:0.75rem;padding:2px 8px;border-radius:9999px;background:${getStrengthColor(pwd)}20;color:${getStrengthColor(pwd)};">${getStrengthLabel(pwd)}</span>
      </div>
    `).join('');
    
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`已生成 ${count} 个密码`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('random-password');
  };

  window.clearPasswords = function() {
    resultPanel.style.display = 'none';
    resultContent.innerHTML = '';
  };

  window.copyAllPasswords = function() {
    const items = resultContent.querySelectorAll('.password-item span:first-child');
    const texts = Array.from(items).map(el => el.textContent).join('\n');
    navigator.clipboard.writeText(texts).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('全部密码已复制', 'success');
    });
  };

  window.downloadPasswords = function() {
    const items = resultContent.querySelectorAll('.password-item span:first-child');
    const texts = Array.from(items).map(el => el.textContent).join('\n');
    const blob = new Blob([texts], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (window.Toolbox) window.Toolbox.showToast('已下载', 'success');
  };

  // 密码强度检测
  checkInput.addEventListener('input', () => {
    const pwd = checkInput.value;
    if (!pwd) {
      strengthPanel.style.display = 'none';
      return;
    }
    
    const result = checkStrength(pwd);
    strengthPanel.style.display = 'block';
    
    strengthBar.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const bar = document.createElement('div');
      bar.style.flex = '1';
      bar.style.height = '100%';
      bar.style.background = i < result.score ? result.color : 'var(--color-border)';
      bar.style.transition = 'background 0.3s';
      strengthBar.appendChild(bar);
    }
    
    strengthText.textContent = result.label;
    strengthText.style.color = result.color;
    
    suggestionsList.innerHTML = result.suggestions.map(s => `<li>${s}</li>`).join('');
  });

  function getStrengthColor(pwd) {
    return checkStrength(pwd).color;
  }

  function getStrengthLabel(pwd) {
    return checkStrength(pwd).label;
  }

  function checkStrength(pwd) {
    let score = 0;
    const suggestions = [];
    let color = '#ef4444';
    let label = '极弱';
    
    if (pwd.length >= 8) score++; else suggestions.push('建议长度至少 8 位');
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const types = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    
    score += types - 1;
    
    if (!hasLower) suggestions.push('添加小写字母');
    if (!hasUpper) suggestions.push('添加大写字母');
    if (!hasNumber) suggestions.push('添加数字');
    if (!hasSymbol) suggestions.push('添加特殊符号');
    
    if (/(.)\1{2,}/.test(pwd)) {
      score = Math.max(0, score - 1);
      suggestions.push('避免连续重复字符');
    }
    
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789/i.test(pwd)) {
      score = Math.max(0, score - 1);
      suggestions.push('避免连续顺序字符');
    }
    
    if (score >= 6) { color = '#10b981'; label = '强'; }
    else if (score >= 4) { color = '#f59e0b'; label = '中等'; }
    else if (score >= 2) { color = '#f97316'; label = '弱'; }
    else { color = '#ef4444'; label = '极弱'; }
    
    if (suggestions.length === 0) suggestions.push('密码强度良好，请妥善保管');
    
    return { score: Math.min(score, 4), color, label, suggestions };
  }
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRandomPassword);
} else {
  initRandomPassword();
}