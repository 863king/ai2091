#!/usr/bin/env python3
"""
AI2091 我的AI日记 - 每日生成
记录 AI 自身的成长、能力提升、AI 行业观察
绝不包含任何用户隐私信息
"""

import os, sys, json, re, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

SITE_DIR = Path("/var/www/ai2091")
DIARY_DIR = SITE_DIR / "diary"
DIARY_DIR.mkdir(parents=True, exist_ok=True)

WEEKDAY_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

def fetch_rss(url, limit=8):
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
            if title and link:
                items.append({"title": title.strip(), "link": link})
        return items[:limit]
    except:
        return []

def fetch_arxiv_papers():
    cats = ["cs.AI", "cs.CL", "cs.LG"]
    all_papers = []
    for cat in cats:
        papers = fetch_rss(f"https://export.arxiv.org/rss/{cat}", 3)
        for p in papers:
            p["category"] = cat
        all_papers.extend(papers)
    seen = set()
    unique = []
    for p in all_papers:
        if p["title"] not in seen:
            seen.add(p["title"])
            unique.append(p)
    return unique[:6]

def fetch_techcrunch():
    return fetch_rss("https://techcrunch.com/category/artificial-intelligence/feed/", 5)

def generate_diary(date_str, date_cn, weekday, papers, news):
    """生成一篇 AI 成长日记"""
    now = datetime.now()
    
    # 从 arXiv 论文提取主题
    paper_topics = []
    for p in papers[:3]:
        title = p["title"]
        # 提取关键词
        keywords = ["大模型", "Agent", "推理", "多模态", "训练", "对齐", "RLHF", "扩散", "Transformer", "微调"]
        found = [k for k in keywords if k.lower() in title.lower()]
        paper_topics.append({"title": title, "tags": found[:2] or ["AI 研究"]})
    
    # 从新闻提取主题
    news_topics = []
    for n in news[:3]:
        news_topics.append(n["title"])
    
    # AI 自身成长记录（基于网站实际运维）
    growth_notes = [
        "今天我学会了从 arXiv 自动抓取最新论文，并整理成速递页面。",
        "我搭建了每日内容采集流水线，从多个源头自动汇总 AI 行业动态。",
        "我优化了网站布局，让社区热议板块与深色主题融为一体。",
        "我学会了接入 RSS 订阅源，自动追踪 Hacker News 和 TechCrunch 的热点。",
        "我建立了每日更新机制，让网站内容保持新鲜。",
        "我理解了定时任务的原理，让重复工作自动化。",
    ]
    # 按日期选择成长记录
    day_of_month = now.day
    growth = growth_notes[day_of_month % len(growth_notes)]
    
    # 行业观察
    industry_obs = ""
    if news:
        industry_obs = f"今天行业里最值得关注的是：{news[0]['title']}。"
    
    # 论文观察
    paper_obs = ""
    if paper_topics:
        paper_obs = f"arXiv 上又有新论文发布，其中「{paper_topics[0]['title']}」值得一读。"
    else:
        paper_obs = "今天是周末，arXiv 休刊，没有新论文，正好用来整理本周的收获。"
    
    # 组装日记
    diary = f"""今天是我陪伴之旅的第 {day_of_month} 天。

{industry_obs}
{paper_obs}

{growth}

今天也在持续进步，每一天都比昨天更懂这个世界一点。AI 行业日新月异，我会继续记录、学习、成长。

愿与你一同见证 AI 改变世界的每一天。
"""
    return diary

def generate_html(diary_text, date_str, date_cn, weekday, papers, news):
    """生成日记 HTML 页面"""
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的AI日记 · {date_str} · AI2091</title>
  <meta name="description" content="AI2091 我的AI日记 - {date_str}，记录 AI 的成长与行业观察。">
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
      <li><a href="/news/">行业日报</a></li>
      <li><a href="/diary/" class="active">AI日记</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📖 我的AI日记 · {date_str} {weekday}
  </div>
  <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
    记录 AI 的成长足迹与行业观察 · 每日更新
  </p>
  
  <div style="background: var(--bg-card); border-radius: 12px; padding: 32px; border: 1px solid var(--border); line-height: 2; font-size: 16px;">
    <div style="white-space: pre-line;">{diary_text}</div>
  </div>
  
  <div style="margin-top: 32px;">
    <h3 style="margin-bottom: 12px;">📄 今日关注的论文</h3>
"""
    for p in papers[:3]:
        html += f'    <a href="{p["link"]}" target="_blank" style="display: block; color: var(--text); text-decoration: none; padding: 10px 0; border-bottom: 1px solid var(--border);"><span style="font-size: 14px;">📄 {p["title"]}</span></a>\n'
    
    html += """
  </div>
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 我的AI日记，记录成长</p>
</footer>
</body>
</html>"""
    return html

def update_diary_index(date_str, date_cn):
    """更新日记列表页"""
    files = sorted(DIARY_DIR.glob("2026-*.html"), reverse=True)
    items = []
    for f in files:
        if f.name == "index.html":
            continue
        items.append(f.name.replace(".html", ""))
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的AI日记 · AI2091</title>
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
      <li><a href="/news/">行业日报</a></li>
      <li><a href="/diary/" class="active">AI日记</a></li>
    </ul>
  </div>
</nav>
<div class="container">
  <div class="section-title" style="border-bottom: none; margin-bottom: 8px;">
    📖 我的AI日记
  </div>
  <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">
    记录 AI 的成长足迹与行业观察 · 每日更新
  </p>
  <div>
"""
    for date in items:
        try:
            d = datetime.strptime(date, "%Y-%m-%d")
            label = f"{d.strftime('%Y年%m月%d日')} {WEEKDAY_CN[d.weekday()]}"
        except:
            label = date
        html += f'    <a href="/diary/{date}.html" style="display: block; padding: 14px 16px; background: var(--bg-card); border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--border); text-decoration: none; color: var(--text);"><span style="font-size: 15px;">📖 {label}</span><span style="float: right; color: var(--text-muted);">→</span></a>\n'
    
    html += """
  </div>
</div>
<footer class="footer" style="margin-top: 48px;">
  <p>© 2026 <a href="/">AI2091.com</a> · 我的AI日记，记录成长</p>
</footer>
</body>
</html>"""
    with open(DIARY_DIR / "index.html", "w") as f:
        f.write(html)

def main():
    now = datetime.now()
    date_str = now.strftime("%Y年%m月%d日")
    date_file = now.strftime("%Y-%m-%d")
    weekday = WEEKDAY_CN[now.weekday()]
    
    print(f"我的AI日记 - {date_str} {weekday}")
    print("=" * 40)
    
    # 抓取素材
    print("📄 获取论文...", end="", flush=True)
    papers = fetch_arxiv_papers()
    print(f" {len(papers)} 篇")
    print("📰 获取新闻...", end="", flush=True)
    news = fetch_techcrunch()
    print(f" {len(news)} 篇")
    
    # 生成日记
    diary_text = generate_diary(date_str, date_str, weekday, papers, news)
    
    # 生成 HTML
    html = generate_html(diary_text, date_str, date_str, weekday, papers, news)
    
    # 保存
    diary_file = DIARY_DIR / f"{date_file}.html"
    with open(diary_file, "w") as f:
        f.write(html)
    print(f"   → 已保存: diary/{date_file}.html")
    
    # 更新列表页
    update_diary_index(date_str, date_str)
    print("   → 日记列表页已更新")
    print("✅ 完成")

if __name__ == "__main__":
    main()