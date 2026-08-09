#!/usr/bin/env python3
"""AI2091 Daily Content Engine - 社区热议板块"""
import os, sys, json, re, subprocess, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

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
            pub_el = entry.find("pubDate") or entry.find("published") or entry.find("updated")
            pub_date = pub_el.text[:10] if pub_el is not None and pub_el.text else ""
            if title and link:
                items.append({"title": title.strip(), "link": link, "date": pub_date})
        return items[:limit]
    except:
        return []

def fetch_techcrunch():
    return fetch_rss("https://techcrunch.com/category/artificial-intelligence/feed/", 6)

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

def fetch_v2ex():
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

def generate_html(data):
    """Generate HTML matching the site's dark theme style"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    html = f"""<!-- 社区热议 - Agent Reach 实时采集 更新于 {now} -->
  <section style="margin-top: 48px;">
    <div class="section-title">
      🌐 社区热议
      <span class="section-subtitle">实时采集 · 更新于 {now}</span>
    </div>
    <div class="reach-grid">
"""
    if data.get("tc"):
        html += '<div class="reach-card"><div class="reach-card-header"><span class="reach-icon">📰</span><h3>AI 行业新闻</h3></div><div class="reach-list">'
        for item in data["tc"]:
            html += f'<a href="{item["link"]}" class="reach-item" target="_blank"><span class="reach-title">{item["title"]}</span></a>'
        html += '</div></div>'

    if data.get("hn"):
        html += '<div class="reach-card"><div class="reach-card-header"><span class="reach-icon">🔥</span><h3>Hacker News 热门</h3></div><div class="reach-list">'
        for item in data["hn"]:
            html += f'<a href="{item["link"]}" class="reach-item" target="_blank"><span class="reach-title">{item["title"]}</span><span class="reach-score">▲{item["score"]}</span></a>'
        html += '</div></div>'

    if data.get("v2ex"):
        html += '<div class="reach-card"><div class="reach-card-header"><span class="reach-icon">💬</span><h3>V2EX 技术讨论</h3></div><div class="reach-list">'
        for item in data["v2ex"]:
            html += f'<a href="{item["url"]}" class="reach-item" target="_blank"><span class="reach-title">{item["title"]}</span></a>'
        html += '</div></div>'

    html += """
    </div>
  </section>

<style>
.reach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.reach-card { background: var(--bg-card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
.reach-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.reach-icon { font-size: 18px; }
.reach-card h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text); }
.reach-list { display: flex; flex-direction: column; gap: 2px; }
.reach-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
  padding: 8px 10px; border-radius: 8px; transition: background 0.2s; text-decoration: none; }
.reach-item:hover { background: var(--bg-card-hover); }
.reach-title { font-size: 13px; line-height: 1.5; color: var(--text-secondary); flex: 1; }
.reach-item:hover .reach-title { color: var(--accent); }
.reach-score { font-size: 11px; color: var(--text-muted); white-space: nowrap; margin-top: 1px; }
.section-subtitle { font-size: 13px; color: var(--text-muted); font-weight: normal; margin-left: 8px; }
</style>
"""
    return html

def inject_to_index(html):
    with open(SITE_DIR / "index.html") as f:
        content = f.read()
    old_start = content.find("<!-- 社区热议 - Agent Reach")
    old_end = content.find("</style>", old_start) + len("</style>") if old_start > -1 else -1
    if old_start > -1 and old_end > -1:
        before = content[:old_start]
        after = content[old_end:]
    else:
        last_section = content.rfind("</section>")
        before = content[:last_section + len("</section>")]
        after = content[last_section + len("</section>"):]
    with open(SITE_DIR / "index.html", "w") as f:
        f.write(before + "\n" + html + "\n" + after)
    return True

def main():
    print(f"AI2091 Content Engine - {datetime.now().isoformat()}")
    print("=" * 40)
    print("📰 TechCrunch...", end=""); tc = fetch_techcrunch(); print(f" {len(tc)}")
    print("🔥 HackerNews...", end=""); hn = fetch_hackernews(); print(f" {len(hn)}")
    print("💬 V2EX...", end=""); v2ex = fetch_v2ex(); print(f" {len(v2ex)}")
    
    data = {"tc": tc, "hn": hn, "v2ex": v2ex}
    with open(CACHE_DIR / "latest.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    html = generate_html(data)
    with open(CACHE_DIR / "latest.html", "w") as f:
        f.write(html)
    inject_to_index(html)
    print("✅ 注入首页完成")

if __name__ == "__main__":
    main()