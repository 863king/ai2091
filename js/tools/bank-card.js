// ==========================================================================
// 工具箱 - 银行卡归属查询
// ==========================================================================

// 常见银行 BIN 码数据 (前6-8位)
const BANK_BINS = [
  // 中国工商银行
  { bin: '6222', bank: '中国工商银行', type: '借记卡', level: '普卡' },
  { bin: '622202', bank: '中国工商银行', type: '借记卡', level: '普卡' },
  { bin: '622208', bank: '中国工商银行', type: '借记卡', level: '金卡' },
  { bin: '622203', bank: '中国工商银行', type: '借记卡', level: '普卡' },
  { bin: '621226', bank: '中国工商银行', type: '信用卡', level: '普卡' },
  { bin: '621227', bank: '中国工商银行', type: '信用卡', level: '金卡' },
  
  // 中国农业银行
  { bin: '6228', bank: '中国农业银行', type: '借记卡', level: '普卡' },
  { bin: '622848', bank: '中国农业银行', type: '借记卡', level: '普卡' },
  { bin: '622849', bank: '中国农业银行', type: '借记卡', level: '金卡' },
  { bin: '622828', bank: '中国农业银行', type: '信用卡', level: '普卡' },
  { bin: '622846', bank: '中国农业银行', type: '信用卡', level: '金卡' },
  
  // 中国建设银行
  { bin: '6227', bank: '中国建设银行', type: '借记卡', level: '普卡' },
  { bin: '622700', bank: '中国建设银行', type: '借记卡', level: '普卡' },
  { bin: '622701', bank: '中国建设银行', type: '借记卡', level: '金卡' },
  { bin: '622702', bank: '中国建设银行', type: '借记卡', level: '普卡' },
  { bin: '622703', bank: '中国建设银行', type: '信用卡', level: '普卡' },
  
  // 中国银行
  { bin: '6216', bank: '中国银行', type: '借记卡', level: '普卡' },
  { bin: '621661', bank: '中国银行', type: '借记卡', level: '普卡' },
  { bin: '621662', bank: '中国银行', type: '借记卡', level: '金卡' },
  { bin: '621663', bank: '中国银行', type: '信用卡', level: '普卡' },
  
  // 交通银行
  { bin: '6215', bank: '交通银行', type: '借记卡', level: '普卡' },
  { bin: '621545', bank: '交通银行', type: '借记卡', level: '普卡' },
  { bin: '621546', bank: '交通银行', type: '借记卡', level: '金卡' },
  { bin: '621547', bank: '交通银行', type: '信用卡', level: '普卡' },
  
  // 招商银行
  { bin: '6225', bank: '招商银行', type: '借记卡', level: '普卡' },
  { bin: '622578', bank: '招商银行', type: '借记卡', level: '普卡' },
  { bin: '622588', bank: '招商银行', type: '借记卡', level: '金卡' },
  { bin: '622598', bank: '招商银行', type: '信用卡', level: '普卡' },
  { bin: '622609', bank: '招商银行', type: '信用卡', level: '金卡' },
  { bin: '622608', bank: '招商银行', type: '信用卡', level: '普卡' },
  
  // 平安银行
  { bin: '6223', bank: '平安银行', type: '借记卡', level: '普卡' },
  { bin: '622321', bank: '平安银行', type: '借记卡', level: '普卡' },
  { bin: '622322', bank: '平安银行', type: '借记卡', level: '金卡' },
  { bin: '622323', bank: '平安银行', type: '信用卡', level: '普卡' },
  
  // 中信银行
  { bin: '6224', bank: '中信银行', type: '借记卡', level: '普卡' },
  { bin: '622491', bank: '中信银行', type: '借记卡', level: '普卡' },
  { bin: '622492', bank: '中信银行', type: '信用卡', level: '普卡' },
  
  // 光大银行
  { bin: '6226', bank: '光大银行', type: '借记卡', level: '普卡' },
  { bin: '622666', bank: '光大银行', type: '借记卡', level: '普卡' },
  { bin: '622667', bank: '光大银行', type: '信用卡', level: '普卡' },
  
  // 华夏银行
  { bin: '6226', bank: '华夏银行', type: '借记卡', level: '普卡' },
  { bin: '622633', bank: '华夏银行', type: '借记卡', level: '普卡' },
  { bin: '622634', bank: '华夏银行', type: '信用卡', level: '普卡' },
  
  // 民生银行
  { bin: '6226', bank: '民生银行', type: '借记卡', level: '普卡' },
  { bin: '622622', bank: '民生银行', type: '借记卡', level: '普卡' },
  { bin: '622623', bank: '民生银行', type: '信用卡', level: '普卡' },
  
  // 兴业银行
  { bin: '6229', bank: '兴业银行', type: '借记卡', level: '普卡' },
  { bin: '622908', bank: '兴业银行', type: '借记卡', level: '普卡' },
  { bin: '622909', bank: '兴业银行', type: '信用卡', level: '普卡' },
  
  // 广发银行
  { bin: '6225', bank: '广发银行', type: '信用卡', level: '普卡' },
  { bin: '622568', bank: '广发银行', type: '信用卡', level: '普卡' },
  { bin: '622569', bank: '广发银行', type: '信用卡', level: '金卡' },
  
  // 浦发银行
  { bin: '6225', bank: '浦发银行', type: '信用卡', level: '普卡' },
  { bin: '622589', bank: '浦发银行', type: '信用卡', level: '普卡' },
  
  // 邮储银行
  { bin: '6221', bank: '中国邮政储蓄银行', type: '借记卡', level: '普卡' },
  { bin: '622188', bank: '中国邮政储蓄银行', type: '借记卡', level: '普卡' },
  { bin: '622189', bank: '中国邮政储蓄银行', type: '借记卡', level: '金卡' },
  { bin: '622150', bank: '中国邮政储蓄银行', type: '信用卡', level: '普卡' },
  
  // 北京银行
  { bin: '6222', bank: '北京银行', type: '借记卡', level: '普卡' },
  { bin: '622288', bank: '北京银行', type: '借记卡', level: '普卡' },
  
  // 上海银行
  { bin: '6225', bank: '上海银行', type: '借记卡', level: '普卡' },
  
  // 南京银行
  { bin: '6223', bank: '南京银行', type: '借记卡', level: '普卡' },
  
  // 宁波银行
  { bin: '6223', bank: '宁波银行', type: '借记卡', level: '普卡' },
  
  // 杭州银行
  { bin: '6223', bank: '杭州银行', type: '借记卡', level: '普卡' },
];

function initBankCard() {
  const input = document.getElementById('bankcard-input');
  const resultPanel = document.getElementById('bankcard-result');
  const resultContent = document.getElementById('bankcard-result-content');
  const batchInput = document.getElementById('bankcard-batch');
  const batchResultPanel = document.getElementById('bankcard-batch-result');
  const batchResultContent = document.getElementById('bankcard-batch-content');
  const binTable = document.getElementById('bank-bin-table');

  // 渲染 BIN 码参考表
  binTable.innerHTML = BANK_BINS.map(item => `
    <div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;">${item.bank}</div>
        <div style="font-family:monospace;font-size:0.8125rem;color:var(--color-text-muted);">BIN: ${item.bin}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;">
        <span style="padding:2px 8px;border-radius:9999px;font-size:0.75rem;background:var(--color-bg);border:1px solid var(--color-border);">${item.type}</span>
        <span style="padding:2px 8px;border-radius:9999px;font-size:0.75rem;background:var(--color-bg);border:1px solid var(--color-border);">${item.level}</span>
      </div>
    </div>
  `).join('');

  // Luhn 算法校验
  function luhnCheck(card) {
    let sum = 0;
    let alternate = false;
    for (let i = card.length - 1; i >= 0; i--) {
      let n = parseInt(card[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // 单个查询
  window.queryBankCard = function() {
    const card = input.value.trim().replace(/\s/g, '');
    if (!card) {
      if (window.Toolbox) window.Toolbox.showToast('请输入银行卡号', 'error');
      return;
    }
    if (!/^\d{16,19}$/.test(card)) {
      if (window.Toolbox) window.Toolbox.showToast('卡号格式错误，应为 16-19 位数字', 'error');
      return;
    }

    // 匹配 BIN 码
    let matched = null;
    for (const bin of BANK_BINS) {
      if (card.startsWith(bin.bin)) {
        if (!matched || bin.bin.length > matched.bin.length) {
          matched = bin;
        }
      }
    }

    const isLuhnValid = luhnCheck(card);
    const cardType = card.startsWith('62') ? '借记卡' : (card.startsWith('4') || card.startsWith('5') || card.startsWith('3') ? '信用卡' : '未知');

    let html = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">银行卡号</div><div style="font-family:monospace;font-weight:600;word-break:break-all;">${card}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">Luhn 校验</div><div style="font-weight:600;color:${isLuhnValid ? '#10b981' : '#ef4444'};">${isLuhnValid ? '✓ 通过' : '✗ 失败'}</div></div>
    `;

    if (matched) {
      html += `
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">发卡行</div><div style="font-weight:600;">${matched.bank}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">卡类型</div><div>${matched.type}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">卡等级</div><div>${matched.level}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">BIN 码</div><div style="font-family:monospace;">${matched.bin}</div></div>
      `;
    } else {
      html += `
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">发卡行</div><div style="font-weight:600;color:#ef4444;">未识别 (本地库暂无该 BIN)</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">推测类型</div><div>${cardType}</div></div>
      `;
    }

    html += `
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">卡号长度</div><div>${card.length} 位</div></div>
      </div>
    `;

    resultContent.innerHTML = html;
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast('查询完成', 'success');
    if (window.Toolbox) window.Toolbox.addHistory('bank-card');
  };

  window.clearBankCard = function() {
    input.value = '';
    resultPanel.style.display = 'none';
  };

  window.copyBankCardResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };

  // 批量查询
  window.batchQueryBankCard = function() {
    const text = batchInput.value.trim();
    if (!text) {
      if (window.Toolbox) window.Toolbox.showToast('请输入银行卡号', 'error');
      return;
    }

    const lines = text.split('\n').filter(l => l.trim());
    const results = lines.map((line, idx) => {
      const card = line.trim().replace(/\s/g, '');
      if (!/^\d{16,19}$/.test(card)) {
        return { index: idx + 1, card, valid: false, error: '格式错误' };
      }
      
      let matched = null;
      for (const bin of BANK_BINS) {
        if (card.startsWith(bin.bin)) {
          if (!matched || bin.bin.length > matched.bin.length) {
            matched = bin;
          }
        }
      }
      
      const isLuhnValid = luhnCheck(card);
      
      return {
        index: idx + 1,
        card,
        valid: true,
        bank: matched?.bank || '未识别',
        type: matched?.type || '未知',
        level: matched?.level || '未知',
        luhn: isLuhnValid
      };
    });

    const validCount = results.filter(r => r.valid && r.luhn).length;
    const invalidCount = results.length - validCount;

    batchResultContent.innerHTML = `
      <div style="margin-bottom:12px;padding:12px;background:var(--color-bg-elevated);border-radius:var(--radius);">
        <div style="display:flex;gap:24px;font-size:0.875rem;">
          <span>总计: <strong>${results.length}</strong></span>
          <span style="color:#10b981;">Luhn通过: <strong>${validCount}</strong></span>
          <span style="color:#ef4444;">Luhn失败: <strong>${invalidCount}</strong></span>
        </div>
      </div>
      <div style="max-height:300px;overflow:auto;">
        ${results.map(r => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;margin-bottom:4px;background:${r.luhn ? '#f0fdf4' : '#fef2f2'};border:1px solid ${r.luhn ? '#bbf7d0' : '#fecaca'};border-radius:var(--radius);font-size:0.8125rem;">
            <span style="width:40px;color:var(--color-text-muted);">#${r.index}</span>
            <span style="font-family:monospace;flex:1;">${r.card}</span>
            <span style="padding:2px 8px;border-radius:9999px;font-size:0.75rem;background:${r.luhn ? '#dcfce7' : '#fef2f2'};color:${r.luhn ? '#166534' : '#991b1b'};">${r.luhn ? 'Luhn通过' : 'Luhn失败'}</span>
            <span style="color:var(--color-text-muted);">${r.bank}</span>
            <span style="padding:2px 6px;border-radius:4px;font-size:0.7rem;background:var(--color-bg);border:1px solid var(--color-border);">${r.type}</span>
          </div>
        `).join('')}
      </div>
    `;
    batchResultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`批量查询完成: ${validCount} 通过, ${invalidCount} 失败`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('bank-card');
  };

  window.clearBatchBankCard = function() {
    batchInput.value = '';
    batchResultPanel.style.display = 'none';
  };

  window.copyBankCardResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };

  function luhnCheck(card) {
    let sum = 0;
    let alternate = false;
    for (let i = card.length - 1; i >= 0; i--) {
      let n = parseInt(card[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBankCard);
} else {
  initBankCard();
}