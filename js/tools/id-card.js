// ==========================================================================
// 工具箱 - 身份证号码查询
// ==========================================================================

// 简化的地区码数据 (前6位)
const ID_CARD_REGIONS = {
  '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
  '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
  '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
  '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区', '46': '海南省',
  '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省', '54': '西藏自治区',
  '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区',
  '71': '台湾省', '81': '香港特别行政区', '82': '澳门特别行政区'
};

function initIdCard() {
  const input = document.getElementById('idcard-input');
  const resultPanel = document.getElementById('idcard-result');
  const resultContent = document.getElementById('idcard-result-content');
  const batchInput = document.getElementById('idcard-batch');
  const batchResultPanel = document.getElementById('idcard-batch-result');
  const batchResultContent = document.getElementById('idcard-batch-content');

  // 校验码权重
  const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  // 单个身份证校验
  window.verifyIdCard = function() {
    const id = input.value.trim().toUpperCase();
    if (!id) {
      if (window.Toolbox) window.Toolbox.showToast('请输入身份证号码', 'error');
      return;
    }

    const result = validateIdCard(id);
    if (!result.valid) {
      resultContent.innerHTML = `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius);padding:16px;color:#ef4444;">
          <strong>校验失败:</strong> ${result.error}
        </div>
      `;
      resultPanel.style.display = 'block';
      if (window.Toolbox) window.Toolbox.showToast(result.error, 'error');
      return;
    }

    const age = new Date().getFullYear() - result.birthYear;
    const nextBirthday = getNextBirthday(result.birthMonth, result.birthDay);
    const daysUntil = Math.ceil((nextBirthday - new Date()) / 86400000);

    resultContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">身份证号码</div><div style="font-family:monospace;font-weight:600;">${result.idCard}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">校验状态</div><div style="font-weight:600;color:#10b981;">✓ 校验通过</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">地区</div><div>${result.province}${result.city}${result.district}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">出生日期</div><div>${result.birthYear}-${String(result.birthMonth).padStart(2,'0')}-${String(result.birthDay).padStart(2,'0')}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">性别</div><div>${result.gender}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">年龄</div><div>${age} 周岁</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">下次生日</div><div>${daysUntil} 天后 (${nextBirthday.getMonth()+1}月${nextBirthday.getDate()}日)</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">星座</div><div>${getConstellation(result.birthMonth, result.birthDay)}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">生肖</div><div>${getZodiac(result.birthYear)}</div></div>
      </div>
    `;
    resultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast('解析完成', 'success');
    if (window.Toolbox) window.Toolbox.addHistory('id-card');
  };

  window.clearIdCard = function() {
    input.value = '';
    resultPanel.style.display = 'none';
  };

  window.copyIdCardResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };

  // 批量校验
  window.batchVerifyIdCard = function() {
    const text = batchInput.value.trim();
    if (!text) {
      if (window.Toolbox) window.Toolbox.showToast('请输入身份证号码', 'error');
      return;
    }

    const lines = text.split('\n').filter(l => l.trim());
    const results = lines.map((line, idx) => {
      const id = line.trim().toUpperCase();
      const result = validateIdCard(id);
      return { index: idx + 1, id, ...result };
    });

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;

    batchResultContent.innerHTML = `
      <div style="margin-bottom:12px;padding:12px;background:var(--color-bg-elevated);border-radius:var(--radius);">
        <div style="display:flex;gap:24px;font-size:0.875rem;">
          <span>总计: <strong>${results.length}</strong></span>
          <span style="color:#10b981;">有效: <strong>${validCount}</strong></span>
          <span style="color:#ef4444;">无效: <strong>${invalidCount}</strong></span>
        </div>
      </div>
      <div style="max-height:300px;overflow:auto;">
        ${results.map(r => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;margin-bottom:4px;background:${r.valid ? '#f0fdf4' : '#fef2f2'};border:1px solid ${r.valid ? '#bbf7d0' : '#fecaca'};border-radius:var(--radius);font-size:0.8125rem;">
            <span style="width:40px;color:var(--color-text-muted);">#${r.index}</span>
            <span style="font-family:monospace;flex:1;">${r.id}</span>
            <span style="padding:2px 8px;border-radius:9999px;font-size:0.75rem;background:${r.valid ? '#dcfce7' : '#fef2f2'};color:${r.valid ? '#166534' : '#991b1b'};">${r.valid ? '有效' : '无效'}</span>
            ${!r.valid ? `<span style="color:#ef4444;font-size:0.75rem;">${r.error}</span>` : `<span style="color:var(--color-text-muted);">${r.province}${r.city} ${r.gender}</span>`}
          </div>
        `).join('')}
      </div>
    `;
    batchResultPanel.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast(`批量校验完成: 有效 ${validCount}, 无效 ${invalidCount}`, 'success');
    if (window.Toolbox) window.Toolbox.addHistory('id-card');
  };

  window.clearBatchIdCard = function() {
    batchInput.value = '';
    batchResultPanel.style.display = 'none';
  };

  window.copyIdCardResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };

  // 核心校验逻辑
  function validateIdCard(id) {
    if (!/^\d{17}[\dX]$/.test(id)) {
      return { valid: false, error: '格式错误：必须为 18 位，最后一位可以是数字或 X' };
    }

    // 校验码计算
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(id[i]) * WEIGHTS[i];
    }
    const checkCode = CHECK_CODES[sum % 11];
    if (id[17] !== checkCode) {
      return { valid: false, error: `校验码错误：应为 ${checkCode}，实际为 ${id[17]}` };
    }

    // 解析信息
    const birthStr = id.slice(6, 14);
    const birthYear = parseInt(birthStr.slice(0, 4));
    const birthMonth = parseInt(birthStr.slice(4, 6));
    const birthDay = parseInt(birthStr.slice(6, 8));
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    
    if (birthDate.getFullYear() !== birthYear || birthDate.getMonth() !== birthMonth - 1 || birthDate.getDate() !== birthDay) {
      return { valid: false, error: '出生日期无效' };
    }

    const regionCode = id.slice(0, 6);
    const provinceCode = regionCode.slice(0, 2);
    const cityCode = regionCode.slice(2, 4);
    const districtCode = regionCode.slice(4, 6);

    const province = ID_CARD_REGIONS[provinceCode] || '未知';
    const city = cityCode !== '00' ? (ID_CARD_REGIONS[provinceCode + cityCode] || '未知') : '';
    const district = districtCode !== '00' ? (ID_CARD_REGIONS[regionCode] || '') : '';

    const gender = parseInt(id[16]) % 2 === 1 ? '男' : '女';

    return {
      valid: true,
      idCard: id,
      province: province,
      city: city,
      district: district,
      birthYear,
      birthMonth,
      birthDay,
      gender,
      age: new Date().getFullYear() - birthYear
    };
  }

  function getNextBirthday(month, day) {
    const now = new Date();
    const next = new Date(now.getFullYear(), month - 1, day);
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return next;
  }

  function getConstellation(month, day) {
    const constellations = [
      {m:1,d:20,n:'水瓶座'},{m:2,d:19,n:'双鱼座'},{m:3,d:21,n:'白羊座'},
      {m:4,d:20,n:'金牛座'},{m:5,d:21,n:'双子座'},{m:6,d:22,n:'巨蟹座'},
      {m:7,d:23,n:'狮子座'},{m:8,d:23,n:'处女座'},{m:9,d:23,n:'天秤座'},
      {m:10,d:24,n:'天蝎座'},{m:11,d:23,n:'射手座'},{m:12,d:22,n:'摩羯座'}
    ];
    for (let i = constellations.length - 1; i >= 0; i--) {
      const c = constellations[i];
      if (month > c.m || (month === c.m && day >= c.d)) return c.n;
    }
    return '摩羯座';
  }

  function getZodiac(year) {
    const zodiacs = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    return zodiacs[(year - 4) % 12];
  }

  window.clearIdCard = function() {
    input.value = '';
    resultPanel.style.display = 'none';
  };

  window.clearBatchIdCard = function() {
    batchInput.value = '';
    batchResultPanel.style.display = 'none';
  };

  window.copyIdCardResult = function() {
    const text = resultContent.innerText || resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.Toolbox) window.Toolbox.showToast('已复制', 'success');
    });
  };
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIdCard);
} else {
  initIdCard();
}