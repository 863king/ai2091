#!/usr/bin/env python3
"""
AI2091 每日更新脚本
每天 8:00 运行：
1. 更新行业日报（news/YYYY-MM-DD.html）
2. 更新论文速递（papers/）
3. 更新社区热议（首页底部）
"""

import os, sys, json, re, subprocess, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

SITE_DIR = Path("/var/www/ai2091")
NEWS_DIR = SITE_DIR / "news"
PAPERS_DIR = SITE_DIR / "papers"
CACHE_DIR = NEWS_DIR / ".reach-cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

WEEKDAY_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

def run(cmd, timeout=20):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.stdout, r.stderr, r.returncode
    except:
        return "", "TIMEOUT", -1

def fetch_rss(url, limit=10):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        root = ET.fromstring(resp.read())
        is_atom = root.tag.endswith("feed")
        entries = root.iter("{http://www.w3.org/2005/Atom}entry") if is_atom else root.iter("item")
        items = []
        for entry in entries:
            title_el = entry.find("title")
            title = title_el.text if title_el is not None else ""
            link = ""
            link_el = entry.find("link")
            if link_el is not None:
                link = link_el.get("href", "") if is_atom else (link_el.text or "")
            desc_el = entry.find("description")
            desc = ""
            if desc_el is not None and desc_el.text:
                desc = re.sub(r'<[^>]+>', '', desc_el.text)[:300]
            if title and link:
                items.append({"title": title.strip(), "link": link, "desc": desc})
        return items[:limit]
    except Exception as e:
        return []

# ===== 1. 论文速递 =====
def fetch_arxiv_papers():
    """从 arXiv 抓取最新 AI 论文"""
    cats = ["cs.AI", "cs.CL", "cs.CV", "cs.LG"]
    all_papers = []
    for cat in cats:
        papers = fetch_rss(f"https://export.arxiv.org/rss/{cat}", 5)
        for p in papers:
            p["category"] = cat
            p["arxiv_id"] = p["link"].split("/")[-1].split("v")[0] if "/abs/" in p["link"] else ""
        all_papers.extend(papers)
    # 去重
    seen = set()
    unique = []
    for p in all_papers:
        if p["title"] not in seen:
            seen.add(p["title"])
            unique.append(p)
    return unique[:8]

def generate_paper_html(papers, date_str):
    """生成论文速递 HTML"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>论文速递 · {date_str} · AI2091</title>
  <meta name="description" content="AI2091 每日论文速递 - {date_str}，精选 arXiv 最新 AI 论文。">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav class="navbar">
  <div class="navbar-inner">
    <a href="/" class="logo">AI2091 <span>· 前沿</span></a>
    <ul class="nav-links">
      <li><a href="/">首页</a></li>
      <li><a href="/papers/" class="active">论文解读</a></li>
      <li><a href="/tools/">AI 工具</a></li>
      <li><a href="/news/">行业日报</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📄 论文速递 · {date_str}
  </div>
  <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
    每日精选 arXiv 最新 AI 论文，自动收录。
  </p>
  <div class="card-grid">
"""
    for paper in papers:
        cat_label = {"cs.AI": "AI", "cs.CL": "NLP", "cs.CV": "CV", "cs.LG": "ML"}.get(paper.get("category", ""), "")
        html += f"""
    <div class="card">
      <div class="tag">{cat_label} · arXiv</div>
      <h3><a href="{paper['link']}" target="_blank">{paper['title']}</a></h3>
      <p>{paper.get('desc', '')[:200]}</p>
    </div>"""
    html += """
  </div>
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 自动采集，仅供参考</p>
</footer>
</body>
</html>"""
    return html

# ===== 2. 行业日报 =====
def fetch_techcrunch():
    return fetch_rss("https://techcrunch.com/category/artificial-intelligence/feed/", 8)

def fetch_hackernews():
    req = urllib.request.Request("https://hacker-news.firebaseio.com/v0/topstories.json",
        headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        ids = json.loads(resp.read())[:10]
        items = []
        for sid in ids:
            r2 = urllib.request.Request(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                headers={"User-Agent": "Mozilla/5.0"})
            d = json.loads(urllib.request.urlopen(r2, timeout=10).read())
            title = d.get("title", "")
            url = d.get("url", f"https://news.ycombinator.com/item?id={sid}")
            score = d.get("score", 0)
            if title:
                items.append({"title": title, "link": url, "score": score})
        return items[:6]
    except:
        return []

def generate_news_html(tc, hn, arxiv, date_str, date_cn, weekday):
    """生成行业日报 HTML"""
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 行业日报 · {date_str} · AI2091</title>
  <meta name="description" content="AI2091 每日 AI 行业早报 - {date_str} {weekday}。">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav class="navbar">
  <div class="navbar-inner">
    <a href="/" class="logo">AI2091 <span>· 前沿</span></a>
    <ul class="nav-links">
      <li><a href="/">首页</a></li>
      <li><a href="/papers/">论文解读</a></li>
      <li><a href="/tools/">AI 工具</a></li>
      <li><a href="/news/" class="active">行业日报</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📰 AI 行业日报 · {date_str} {weekday}
  </div>
"""
    # TechCrunch 新闻
    if tc:
        html += '<div style="margin: 24px 0;"><h3 style="margin-bottom: 12px;">📰 AI 行业新闻</h3>'
        for item in tc:
            html += f'<div class="news-item"><a href="{item["link"]}" target="_blank" style="color: var(--text); text-decoration: none; display: block; padding: 10px 0; border-bottom: 1px solid var(--border);"><span style="font-size: 15px;">{item["title"]}</span></a></div>'
        html += '</div>'
    
    # Hacker News
    if hn:
        html += '<div style="margin: 24px 0;"><h3 style="margin-bottom: 12px;">🔥 Hacker News 热门</h3>'
        for item in hn:
            html += f'<div class="news-item"><a href="{item["link"]}" target="_blank" style="color: var(--text); text-decoration: none; display: block; padding: 10px 0; border-bottom: 1px solid var(--border);"><span style="font-size: 15px;">{item["title"]}</span> <span style="color: var(--text-muted); font-size: 13px;">▲{item["score"]}</span></a></div>'
        html += '</div>'
    
    # arXiv 论文
    if arxiv:
        html += '<div style="margin: 24px 0;"><h3 style="margin-bottom: 12px;">📄 arXiv 最新论文</h3>'
        for item in arxiv[:5]:
            html += f'<div class="news-item"><a href="{item["link"]}" target="_blank" style="color: var(--text); text-decoration: none; display: block; padding: 10px 0; border-bottom: 1px solid var(--border);"><span style="font-size: 15px;">{item["title"]}</span></a></div>'
        html += '</div>'
    
    html += """
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 自动采集，仅供参考</p>
</footer>
</body>
</html>"""
    return html

# ===== 3. 更新首页 =====
def update_index():
    """重新生成首页 - 注入最新论文和社区热议"""
    # 读取最新论文列表
    papers = []
    for f in sorted(PAPERS_DIR.glob("*.html"), reverse=True):
        if f.name != "index.html":
            papers.append(f.name.replace(".html", ""))
    
    # 注入到首页
    with open(SITE_DIR / "index.html") as f:
        content = f.read()
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    # 更新社区热议时间戳
    content = re.sub(r'更新于 [\d\- :]+', f'更新于 {now}', content)
    
    with open(SITE_DIR / "index.html", "w") as f:
        f.write(content)

# ===== Main =====
def main():
    today = datetime.now()
    date_str = today.strftime("%Y年%m月%d日")
    date_file = today.strftime("%Y-%m-%d")
    weekday = WEEKDAY_CN[today.weekday()]
    
    print(f"AI2091 每日更新 - {date_str} {weekday}")
    print("=" * 40)
    
    # 1. 论文速递
    print("📄 获取 arXiv 论文...", end="", flush=True)
    papers = fetch_arxiv_papers()
    print(f" {len(papers)} 篇")
    if papers:
        paper_html = generate_paper_html(papers, date_str)
        # 保存为独立页面
        paper_file = PAPERS_DIR / f"{date_file}.html"
        with open(paper_file, "w") as f:
            f.write(paper_html)
        print(f"   → 已保存: papers/{date_file}.html")
        # 更新论文列表页
        update_papers_index(papers, date_str)

    # 2. 行业日报
    print("📰 获取 TechCrunch...", end="", flush=True)
    tc = fetch_techcrunch()
    print(f" {len(tc)} 篇")
    print("🔥 获取 HackerNews...", end="", flush=True)
    hn = fetch_hackernews()
    print(f" {len(hn)} 篇")
    
    if tc or hn:
        news_html = generate_news_html(tc, hn, papers, date_str, date_str, weekday)
        news_file = NEWS_DIR / f"{date_file}.html"
        with open(news_file, "w") as f:
            f.write(news_html)
        print(f"   → 已保存: news/{date_file}.html")
        # 更新新闻列表页
        update_news_index(date_str)

    # 3. 更新首页
    update_index()
    print("✅ 首页已更新")

def update_papers_index(papers, date_str):
    """更新论文列表页 index.html"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>论文解读 · AI2091</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav class="navbar">
  <div class="navbar-inner">
    <a href="/" class="logo">AI2091 <span>· 前沿</span></a>
    <ul class="nav-links">
      <li><a href="/">首页</a></li>
      <li><a href="/papers/" class="active">论文解读</a></li>
      <li><a href="/tools/">AI 工具</a></li>
      <li><a href="/news/">行业日报</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📄 论文解读
  </div>
  <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
    每日精选 arXiv 最新 AI 论文，自动收录 · 更新于 {now}
  </p>
  <div class="card-grid">
"""
    for paper in papers:
        cat_label = {"cs.AI": "AI", "cs.CL": "NLP", "cs.CV": "CV", "cs.LG": "ML"}.get(paper.get("category", ""), "")
        paper_date = os.path.basename(str(paper.get("link", "")).split("/")[-1].split("v")[0]) if paper.get("link") else ""
        html += f"""
    <div class="card">
      <div class="tag">{cat_label} · arXiv</div>
      <h3><a href="{paper['link']}" target="_blank">{paper['title']}</a></h3>
      <p>{paper.get('desc', '')[:200]}</p>
    </div>"""
    html += """
  </div>
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 自动采集，仅供参考</p>
</footer>
</body>
</html>"""
    with open(PAPERS_DIR / "index.html", "w") as f:
        f.write(html)
    print("   → 论文列表页已更新")

def update_news_index(date_str):
    """更新新闻列表页 index.html"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    # 列出所有新闻文件
    files = sorted(NEWS_DIR.glob("2026-*.html"), reverse=True)
    items = []
    for f in files:
        if f.name == "index.html":
            continue
        date = f.name.replace(".html", "")
        items.append(date)
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>行业日报 · AI2091</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav class="navbar">
  <div class="navbar-inner">
    <a href="/" class="logo">AI2091 <span>· 前沿</span></a>
    <ul class="nav-links">
      <li><a href="/">首页</a></li>
      <li><a href="/papers/">论文解读</a></li>
      <li><a href="/tools/">AI 工具</a></li>
      <li><a href="/news/" class="active">行业日报</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📰 行业日报
  </div>
  <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
    每日 AI 行业动态汇总 · 更新于 {now}
  </p>
  <div class="news-list">
"""
    for date in items:
        try:
            d = datetime.strptime(date, "%Y-%m-%d")
            label = f"{d.strftime('%Y年%m月%d日')} {WEEKDAY_CN[d.weekday()]}"
        except:
            label = date
        html += f'    <a href="/news/{date}.html" class="news-item" style="display: block; padding: 14px 16px; background: var(--bg-card); border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--border); text-decoration: none; color: var(--text);"><span style="font-size: 15px;">📰 {label}</span><span style="float: right; color: var(--text-muted);">→</span></a>\n'
    
    html += """
  </div>
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 自动采集，仅供参考</p>
</footer>
</body>
</html>"""
    with open(NEWS_DIR / "index.html", "w") as f:
        f.write(html)
    print("   → 新闻列表页已更新")

if __name__ == "__main__":
    import os
    main()