/**
 * AI2091 简易访问统计 - 客户端埋点
 * 自动上报 PV，生成/复用访客 ID
 * 端点：/api/stats（需配合 stats_server.py 运行在 8081 端口）
 */

(function() {
  'use strict';

  // 配置
  const ENDPOINT = 'https://www.ai2091.com/api/stats';  // 通过 Caddy 反代到 127.0.0.1:8081
  const VID_KEY = 'ai2091_vid';
  const VID_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 年

  // 生成/获取访客 ID
  function getVisitorId() {
    let vid = localStorage.getItem(VID_KEY);
    if (!vid) {
      vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(VID_KEY, vid);
    }
    return vid;
  }

  // 获取屏幕信息
  function getScreenInfo() {
    return screen.width + 'x' + screen.height;
  }

  // 发送 PV
  function sendPV() {
    const vid = getVisitorId();
    const data = {
      event: 'pv',
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      ua: navigator.userAgent,
      screen: getScreenInfo(),
      lang: navigator.language || 'zh-CN',
      ts: Date.now(),
      vid: vid
    };

    // 使用 sendBeacon（页面卸载也能发出去）或 fetch 降级
    const payload = JSON.stringify(data);
    const blob = new Blob([payload], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        credentials: 'omit'
      }).catch(() => {}); // 静默失败
    }
  }

  // 页面加载完成后发送
  if (document.readyState === 'complete') {
    sendPV();
  } else {
    window.addEventListener('load', sendPV);
  }

  // SPA 路由变化监听（如果网站以后用 SPA）
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      sendPV();
    }
  }, 1000);

  // 暴露给调试用
  window.ai2091Stats = { sendPV, getVisitorId };
})();