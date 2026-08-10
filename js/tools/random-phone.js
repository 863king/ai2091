// ==========================================================================
// 工具箱 - 随机手机号生成
// ==========================================================================

const PHONE_SEGMENTS = {
  mobile: [
    '134','135','136','137','138','139',
    '147','150','151','152','157','158','159',
    '172','178','182','183','184','187','188',
    '198'
  ],
  unicom: [
    '130','131','132',
    '145','155','156',
    '166','171','175','176',
    '185','186'
  ],
  telecom: [
    '133',
    '149','153',
    '173','177','180','181','189',
    '199'
  ],
  virtual: [
    '165','167','170','171'
  ]
};

const CARRIER_INFO = [
  { key: 'mobile', name: '中国移动', color: '#00a0e9', segments: PHONE_SEGMENTS.mobile },
  { key: 'unicom', name: '中国联通', color: '#e60012', segments: PHONE_SEGMENTS.unicom },
  { key: 'telecom', name: '中国电信', color: '#f8981d', segments: PHONE_SEGMENTS.telecom },
  { key: 'virtual', name: '虚拟运营商', color: '#6c757d', segments: PHONE_SEGMENTS.virtual }
];

function initRandomPhone() {
  const carrierSelect = document.getElementById('phone-carrier');
  const countInput = document.getElementById('phone-count');
  const formatSelect = document.getElementById('phone-format');
  const resultPanel = document.getElementById('phone-result');
  const resultContent = document.getElementById('phone-result-content');
  const segmentsTable = document.getElementById('carrier-segments');

  // 渲染号段参考表
  segmentsTable.innerHTML = CARRIER_INFO.map(carrier => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:8px;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${carrier.color};margin-right:8px;vertical-align:middle;"></span>${carrier.name}</td>
      <td style="padding:8px;font-family:monospace;font-size:0.8125rem;">${carrier.segments.join('、')}</td>
      <td style="padding:8px;color:var(--color-text-secondary);">${carrier.segments.length} 个号段</td>
    </tr>
  `).join('');

  // 生成手机号
  window.generatePhones = function() {
    const carrier = carrierSelect.value;
    const count = parseInt(countInput.value) || 20;
    const format = formatSelect.value;
    
    // 获取选中的号段
    let segments = [];
    if (carrier === 'all') {
      segments = [...PHONE_SEGMENTS.mobile, ...PHONE_SEGMENTS.unicom, ...PHONE_SEGMENTS.telecom, ...PHONE_SEGMENTS.virtual];
    } else {
      segments = PHONE_SEGMENTS[carrier];
    }
    
    // 获取运营商映射
    const carrierMap = {};
    CARRIER_INFO.forEach(c => {
      c.segments.forEach(seg => { carrierMap[seg] = c.key; });
    });
    
    const phones = [];
    for (let i = 0; i < count; i++) {
      const prefix = segments[Math.floor(Math.random() * segments.length)];
      const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
      const phone = prefix + suffix;
      const carr = carrierMap[prefix] || carrier;
      phones.push({ phone, carrier: carr });
    }
    
    // 根据格式生成输出
    let output = '';
    switch (formatSelect.value) {
      case 'plain':
        output = phones.map(p => p.phone).join('\n');
        break;
      case 'json':
        output = JSON.stringify(phones.map(p => p.phone), null, 2);
        break;
      case 'csv':
        output = '号码,运营商\n' + phones.map(p => `${p.phone},${p.carrier}`).join('\n');
        break;
      case 'sql':
        output = phones.map(p => `INSERT INTO phones (phone, carrier) VALUES ('${p.phone}', '${p.carrier}');`).join('\n');
        break;
    }
    
    resultContent.innerHTML = `
      <div style="font-family:monospace;font-size:0.875rem;background:var(--color-bg);padding:16px;border-radius:var(--radius);white-space:pre-wrap;word-break:break-word;color:var(--color-text);max-height:400px;overflow:auto;">${output}</div>
      <div style="margin-top:12px;padding:12px;background:var(--color-bg-elevated);border-radius:var(--radius);font-size:0.8125rem;color:var(--color-text-secondary);">
        共生成 ${phones.length} 个号码 · 格式: ${formatSelect.options[formatSelect.selectedIndex].text}
      </div>
    `;
    
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`已生成 ${phones.length} 个手机号`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('random-phone');
  };

  window.clearPhones = function() {
    resultPanel.style.display = 'none';
    resultContent.innerHTML = '';
  };

  window.copyAllPhones = function() {
    const text = resultContent.querySelector('div[style*="font-family:monospace"]').innerText;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制全部号码', 'success');
    });
  };

  window.downloadPhones = function() {
    const text = resultContent.querySelector('div[style*="font-family:monospace"]').innerText;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = formatSelect.value === 'json' ? 'json' : formatSelect.value === 'csv' ? 'csv' : formatSelect.value === 'sql' ? 'sql' : 'txt';
    a.download = `phones.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.Toolbox) window.Toolbox.showToast('已下载', 'success');
  };
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRandomPhone);
} else {
  initRandomPhone();
}