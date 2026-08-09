#!/usr/bin/env python3
"""
AI2091 Daily Content Engine v3
每天自动更新网站内容：社区热议 + 行业新闻 + 论文速递
"""

import os, sys, json, re, subprocess
from datetime import datetime
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET

SITE_DIR = Path("/var/www/ai2091")
NEWS_DIR = SITE_DIR / "news"
CACHE_DIR = NEWS_DIR / ".reach-cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def run(cmd, timeout=20):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.stdout, r.stderr, r.returncode
    except:
        return "", "TIMEOUT", -1

def fetch_rss(url, limit=8):
    """Fetch RSS feed and extract titles + links"""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        root = ET.fromstring(resp.read())
        # Detect Atom vs RSS
        is_atom = root.tag.endswith("feed")
        entries = root.iter("{http://www.w3.org/2005/Atom}entry") if is_atom else root.iter("item")
        items = []
        for entry in entries:
            title_el = entry.find("title")
            title = title_el.text if title_el is not None else ""
            link = ""
            link_el = entry.find("link")
            if link_el is not None:
                if is_atom:
                    link = link_el.get("href", "")
                else:
                    link = link_el.text or ""
            pub_el = entry.find("pubDate") or entry.find("published") or entry.find("updated")
            pub_date = pub_el.text[:10] if pub_el is not None and pub_el.text else ""
            if title and link:
                items.append({"title": title.strip(), "link": link, "date": pub_date})
        return items[:limit]
    except Exception as e:
        return []

def fetch_arxiv_ai():
    """Fetch latest AI papers from arXiv"""
    return fetch_rss("http://export.arxiv.org/rss/cs.AI", 6)

def fetch_techcrunch():
    """Fetch TechCrunch via RSS (not Jina)"""
    return fetch_rss("https://techcrunch.com/category/artificial-intelligence/feed/", 6)

def fetch_hackernews():
    """Fetch Hacker News top stories"""
    req = urllib.request.Request("https://hacker-news.firebaseio.com/v0/topstories.json",
        headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        ids = json.loads(resp.read())[:10]
        items = []
        for sid in ids:
            req2 = urllib.request.Request(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                headers={"User-Agent": "Mozilla/5.0"})
            resp2 = urllib.request.urlopen(req2, timeout=10)
            data = json.loads(resp2.read())
            title = data.get("title", "")
            url = data.get("url", f"https://news.ycombinator.com/item?id={sid}")
            score = data.get("score", 0)
            if title:
                items.append({"title": title, "link": url, "score": score})
        return items[:6]
    except:
        return []

def fetch_v2ex():
    """V2EX hot topics via Jina Reader"""
    out, err, code = run(["curl", "-s", "-m", "15",
        "https://r.jina.ai/https://www.v2ex.com/?tab=hot",
        "-H", "User-Agent: Mozilla/5.0"])
    if code != 0 or not out:
        return []
    topics = []
    for line in out.split("\n"):
        m = re.search(r'\[([^\]]+)\]\(https://www\.v2ex\.com/t/(\d+)\)', line)
        if m and not m.group(1).startswith("Image") and len(m.group(1)) > 5 and "Promoted" not in line:
            topics.append({"title": m.group(1), "url": f"https://www.v2ex.com/t/{m.group(2)}"})
    return topics[:8]

def fetch_bilibili():
    """B站热门视频"""
    out, err, code = run(["curl", "-s", "-m", "10",
        "https://api.bilibili.com/x/web-interface/popular",
        "-H", "User-Agent: Mozilla/5.0",
        "-H", "Referer: https://www.bilibili.com"])
    if code != 0:
        return []
    try:
        data = json.loads(out)
        items = []
        for item in data.get("data", {}).get("list", [])[:8]:
            title = item.get("title", "")
            author = item.get("owner", {}).get("name", "")
            bvid = item.get("bvid", "")
            items.append({"title": title, "author": author, "url": f"https://www.bilibili.com/video/{bvid}"})
        return items
    except:
        return []

def generate_html(data):
    """Generate HTML with proper content sections"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    today = datetime.now().strftime("%Y-%m-%d")
    
    html = f"""<!-- Agent Reach 实时采集 - 更新于 {now} -->
<div class="reach-module">
  <h2>🌐 今日社区热议 <span class="time">更新于 {now}</span></h2>
  <div class="reach-grid">
"""
    # TechCrunch AI News
    if data.get("tc"):
        html += '<div class="reach-card"><h3>📰 AI 行业新闻</h3><ul>'
        for item in data["tc"]:
            html += f'<li><a href="{item["link"]}" target="_blank">{item["title"]}</a></li>'
        html += '</ul></div>'

    # Hacker News
    if data.get("hn"):
        html += '<div class="reach-card"><h3>🔥 Hacker News 热门</h3><ul>'
        for item in data["hn"]:
            html += f'<li><a href="{item["link"]}" target="_blank">{item["title"]}</a> <span class="meta">▲{item["score"]}</span></li>'
        html += '</ul></div>'

    # arXiv AI Papers
    if data.get("arxiv"):
        html += '<div class="reach-card"><h3>📄 arXiv 最新论文</h3><ul>'
        for item in data["arxiv"]:
            html += f'<li><a href="{item["link"]}" target="_blank">{item["title"]}</a> <span class="meta">{item["date"]}</span></li>'
        html += '</ul></div>'

    # V2EX
    if data.get("v2ex"):
        html += '<div class="reach-card"><h3>💬 V2EX 技术讨论</h3><ul>'
        for item in data["v2ex"]:
            html += f'<li><a href="{item["url"]}" target="_blank">{item["title"]}</a></li>'
        html += '</ul></div>'

    # Bilibili
    if data.get("bili"):
        html += '<div class="reach-card"><h3>📺 B站推荐</h3><ul>'
        for item in data["bili"]:
            html += f'<li><a href="{item["url"]}" target="_blank">{item["title"]}</a> <span class="tag">{item["author"]}</span></li>'
        html += '</ul></div>'

    html += """
  </div>
</div>
<style>
.reach-module { margin: 2rem 0; }
.reach-module h2 { font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.reach-module .time { font-size: 0.8rem; color: #999; font-weight: normal; }
.reach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; }
.reach-card { background: #f8f9fa; border-radius: 10px; padding: 1rem; border: 1px solid #eee; }
.reach-card h3 { margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #333; }
.reach-card ul { list-style: none; padding: 0; margin: 0; }
.reach-card li { padding: 0.35rem 0; border-bottom: 1px solid #eee; font-size: 0.85rem; line-height: 1.4; }
.reach-card li:last-child { border-bottom: none; }
.reach-card a { color: #1a73e8; text-decoration: none; display: block; }
.reach-card a:hover { text-decoration: underline; }
.tag { display: inline-block; background: #e9ecef; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; }
.meta { color: #999; font-size: 0.75rem; }
</style>
"""
    return html

def inject_to_index(html):
    """Inject reach content into the homepage"""
    with open(SITE_DIR / "index.html") as f:
        content = f.read()
    
    # Remove old reach content if any
    old_start = content.find("<!-- Agent Reach 实时采集")
    old_end = content.find("</style>", old_start) + len("</style>") if old_start > -1 else -1
    if old_start > -1 and old_end > -1:
        before = content[:old_start]
        after = content[old_end:]
    else:
        last_section = content.rfind("</section>")
        before = content[:last_section + len("</section>")]
        after = content[last_section + len("</section>"):]
    
    new_content = before + "\n" + html + "\n" + after
    with open(SITE_DIR / "index.html", "w") as f:
        f.write(new_content)
    return True

def main():
    print(f"AI2091 Content Engine v3 - {datetime.now().isoformat()}")
    print("=" * 50)
    
    print("📰 Fetching TechCrunch AI news...")
    tc = fetch_techcrunch()
    print(f"   → {len(tc)} articles")
    
    print("🔥 Fetching Hacker News...")
    hn = fetch_hackernews()
    print(f"   → {len(hn)} stories")
    
    print("📄 Fetching arXiv AI papers...")
    arxiv = fetch_arxiv_ai()
    print(f"   → {len(arxiv)} papers")
    
    print("💬 Fetching V2EX...")
    v2ex = fetch_v2ex()
    print(f"   → {len(v2ex)} topics")
    
    print("📺 Fetching Bilibili...")
    bili = fetch_bilibili()
    print(f"   → {len(bili)} videos")
    
    data = {"tc": tc, "hn": hn, "arxiv": arxiv, "v2ex": v2ex, "bili": bili}
    
    # Save cache
    with open(CACHE_DIR / "latest.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    html = generate_html(data)
    with open(CACHE_DIR / "latest.html", "w") as f:
        f.write(html)
    
    inject_to_index(html)
    print(f"\n✅ Injected into index.html")
    print("=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()