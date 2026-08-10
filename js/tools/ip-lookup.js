// ==========================================================================
// 工具箱 - IP本地查询
// ==========================================================================

const PRIVATE_IP_RANGES = [
  { range: '10.0.0.0 - 10.255.255.255', cidr: '10.0.0.0/8', count: 16777216, usage: 'A 类私有网络，大型企业内网' },
  { range: '172.16.0.0 - 172.31.255.255', cidr: '172.16.0.0/12', count: 1048576, usage: 'B 类私有网络，中型企业内网' },
  { range: '192.168.0.0 - 192.168.255.255', cidr: '192.168.0.0/16', count: 65536, usage: 'C 类私有网络，家庭/小型办公网络' },
  { range: '127.0.0.0 - 127.255.255.255', cidr: '127.0.0.0/8', count: 16777216, usage: '回环地址，本机测试' },
  { range: '169.254.0.0 - 169.254.255.255', cidr: '169.254.0.0/16', count: 65536, usage: '链路本地地址，DHCP 失败时自动分配' },
  { range: '::1/128', cidr: '::1/128', count: 1, usage: 'IPv6 回环地址' },
  { range: 'fe80::/10', cidr: 'fe80::/10', count: '巨大', usage: 'IPv6 链路本地单播地址' },
  { range: 'fc00::/7', cidr: 'fc00::/7', count: '巨大', usage: 'IPv6 唯一本地地址 (ULA)' },
];

function initIPLookup() {
  const publicIPv4El = document.getElementById('public-ipv4');
  const publicIPv6El = document.getElementById('public-ipv6');
  const localIPEl = document.getElementById('local-ip');
  const privateTable = document.getElementById('private-ip-table');
  const cidrInput = document.getElementById('cidr-input');
  const cidrResult = document.getElementById('cidr-result');
  const cidrContent = document.getElementById('cidr-content');
  const ipLookupInput = document.getElementById('ip-lookup-input');
  const ipLookupResult = document.getElementById('ip-lookup-result');
  const ipLookupContent = document.getElementById('ip-lookup-content');

  // 渲染私有 IP 表格
  privateTable.innerHTML = PRIVATE_IP_RANGES.map(item => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:8px;font-family:monospace;">${item.range}</td>
      <td style="padding:8px;font-family:monospace;">${item.cidr}</td>
      <td style="padding:8px;">${item.count}</td>
      <td style="padding:8px;color:var(--color-text-secondary);">${item.usage}</td>
    </tr>
  `).join('');

  // 获取本机 IP
  async function fetchIPs() {
    // 获取公网 IPv4
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      publicIPv4El.textContent = data.ip;
    } catch (e) {
      publicIPv4El.textContent = '获取失败';
      publicIPv4El.style.color = '#ef4444';
    }

    // 获取公网 IPv6
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      if (data.ip.includes(':')) {
        publicIPv6El.textContent = data.ip;
      } else {
        publicIPv6El.textContent = '当前网络无 IPv6';
        publicIPv6El.style.color = 'var(--color-text-muted)';
      }
    } catch (e) {
      publicIPv6El.textContent = '获取失败';
      publicIPv6El.style.color = '#ef4444';
    }

    // 获取本地 IP (通过 WebRTC)
    try {
      const localIP = await getLocalIP();
      localIPEl.textContent = localIP || '无法获取 (需 HTTPS)';
    } catch (e) {
      localIPEl.textContent = '需要 HTTPS 环境';
      localIPEl.style.color = 'var(--color-text-muted)';
    }
  }

  // WebRTC 获取本地 IP
  function getLocalIP() {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const ipMatch = ipRegex.exec(ice.candidate.candidate);
        if (ipMatch) {
          pc.onicecandidate = null;
          pc.close();
          resolve(ipMatch[1]);
        }
      };
      setTimeout(() => {
        pc.close();
        resolve('获取超时');
      }, 3000);
    });
  }

  // 刷新 IP
  window.refreshIP = function() {
    publicIPv4El.textContent = '检测中...';
    publicIPv4El.style.color = '';
    publicIPv6El.textContent = '检测中...';
    publicIPv6El.style.color = '';
    localIPEl.textContent = '检测中...';
    localIPEl.style.color = '';
    fetchIPs();
  };

  // IP 归属地查询 (使用免费 API)
  window.lookupIP = async function() {
    const ip = ipLookupInput.value.trim();
    if (!ip) {
      if (window.Toolbox) window.Toolbox.showToast('请输入 IP 地址', 'error');
      return;
    }
    
    ipLookupContent.innerHTML = '<div style="text-align:center;padding:16px;">查询中...</div>';
    ipLookupResult.style.display = 'block';
    
    try {
      // 使用 ip-api.com 免费 API
      const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,message,country,regionName,city,isp,org,as,query`);
      const data = await response.json();
      
      if (data.status === 'fail') {
        throw new Error(data.message || '查询失败');
      }
      
      ipLookupContent.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">IP 地址</div><div style="font-family:monospace;font-weight:600;">${data.query}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">国家/地区</div><div>${data.country || '未知'}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">省份/州</div><div>${data.regionName || '未知'}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">城市</div><div>${data.city || '未知'}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">ISP 运营商</div><div>${data.isp || '未知'}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">组织</div><div>${data.org || '未知'}</div></div>
          <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">AS 编号</div><div>${data.as || '未知'}</div></div>
        </div>
      `;
      if (window.Toolbox) window.Toolbox.showToast('查询成功', 'success');
      if (window.Toolbox) window.Toolbox.addHistory('ip-lookup');
    } catch (e) {
      ipLookupContent.innerHTML = `<div style="color:#ef4444;padding:16px;text-align:center;">查询失败: ${e.message}<br><small>注意: 免费 API 有频率限制，请稍后重试</small></div>`;
    }
  };

  // CIDR 计算器
  window.calculateCIDR = function() {
    const input = cidrInput.value.trim();
    if (!input) {
      if (window.Toolbox) window.Toolbox.showToast('请输入 CIDR', 'error');
      return;
    }
    
    const match = input.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!match) {
      if (window.Toolbox) window.Toolbox.showToast('格式错误，如: 192.168.1.0/24', 'error');
      return;
    }
    
    const ip = match[1];
    const prefix = parseInt(match[2]);
    if (prefix < 0 || prefix > 32) {
      if (window.Toolbox) window.Toolbox.showToast('前缀长度必须 0-32', 'error');
      return;
    }
    
    const result = DevUtils.cidrToRange(input);
    cidrContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">网络地址</div><div style="font-family:monospace;font-weight:600;">${result.start}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">广播地址</div><div style="font-family:monospace;font-weight:600;">${result.end}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">可用主机数</div><div style="font-weight:600;color:var(--color-primary);">${result.count - 2 > 0 ? result.count - 2 : 0}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">总地址数</div><div style="font-weight:600;">${result.count}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">子网掩码</div><div style="font-family:monospace;">${prefixToMask(prefix)}</div></div>
        <div style="background:var(--color-bg-elevated);padding:12px;border-radius:var(--radius);"><div style="font-size:0.75rem;color:var(--color-text-muted);">通配符掩码</div><div style="font-family:monospace;">${wildcardMask(prefix)}</div></div>
      </div>
    `;
    cidrResult.style.display = 'block';
    if (window.Toolbox) window.Toolbox.showToast('计算完成', 'success');
  };

  window.clearCIDR = function() {
    cidrInput.value = '';
    cidrResult.style.display = 'none';
  };

  // 前缀长度转子网掩码
  function prefixToMask(prefix) {
    const mask = ~((1 << (32 - prefix)) - 1);
    return DevUtils.longToIp(mask);
  }

  // 前缀长度转通配符掩码
  function wildcardMask(prefix) {
    const mask = (1 << (32 - prefix)) - 1;
    return DevUtils.longToIp(mask);
  }

  // 初始化
  fetchIPs();
}

// 页面加载初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIPLookup);
} else {
  initIPLookup();
}