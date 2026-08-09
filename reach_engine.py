#!/usr/bin/env python3
"""
Agent Reach Content Engine for AI2091
Uses Agent Reach to collect content from V2EX, B站, RSS, YouTube
Enhances daily news with real-time community discussions and video content
"""

import os
import sys
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path

# === Config ===
SITE_DIR = Path("/home/ubuntu/ai2091")
NEWS_DIR = SITE_DIR / "news"
AGENT_REACH_VENV = os.path.expanduser("~/.agent-reach-venv")
AGENT_REACH_PYTHON = f"{AGENT_REACH_VENV}/bin/python3"

# === Agent Reach Wrapper ===
def run_agent_reach(cmd, timeout=30):
    """Run an Agent Reach command"""
    env = os.environ.copy()
    env["PATH"] = f"{AGENT_REACH_VENV}/bin:" + env.get("PATH", "")
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, env=env
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", -1

def fetch_webpage(url):
    """Use Jina Reader to read any webpage"""
    import urllib.request
    req = urllib.request.Request(f"https://r.jina.ai/{url}", 
        headers={"User-Agent": "Mozilla/5.0", "Accept": "text/plain"})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return resp.read().decode("utf-8", errors="replace")[:5000]
    except:
        return None

def fetch_v2ex_hot():
    """Fetch V2EX hot topics"""
    import urllib.request
    req = urllib.request.Request("https://www.v2ex.com/api/v2/topics/hot",
        headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        results = []
        for item in data[:10]:
            title = item.get("title", "")
            node = item.get("node", {}).get("title", "")
            replies = item.get("replies", 0)
            url = f"https://www.v2ex.com/t/{item.get('id', '')}"
            results.append({"title": title, "source": "V2EX", "tag": node, "url": url, "replies": replies})
        return results
    except:
        return []

def fetch_bilibili_hot():
    """Fetch Bilibili hot tech videos"""
    import urllib.request
    req = urllib.request.Request(
        "https://api.bilibili.com/x/web-interface/popular/series/one?number=1",
        headers={"User-Agent": "Mozilla/5.0", "Referer": "https://www.bilibili.com"})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        results = []
        for item in data.get("data", {}).get("list", [])[:8]:
            title = item.get("title", "")
            author = item.get("owner", {}).get("name", "")
            play = item.get("stat", {}).get("view", 0)
            url = f"https://www.bilibili.com/video/{item.get('bvid', '')}"
            results.append({"title": title, "source": "B站", "tag": "热门视频", "url": url, "author": author, "play": play})
        return results
    except:
        return []

def fetch_rss_summary():
    """Fetch key RSS feeds for AI news"""
    import feedparser
    feeds = [
        "https://feeds.feedburner.com/TechCrunch/",
        "https://feeds.arxiv.org/abs/2302.04761",
        "https://rsshub.app/36kr/motif/ai",
    ]
    results = []
    for feed_url in feeds:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:5]:
                results.append({
                    "title": entry.get("title", ""),
                    "source": feed.feed.get("title", "RSS"),
                    "url": entry.get("link", ""),
                    "summary": entry.get("summary", "")[:200]
                })
        except:
            continue
        break  # Only first feed for now
    return results

def collect_all():
    """Collect content from all sources"""
    print("🔍 Collecting V2EX hot topics...")
    v2ex = fetch_v2ex_hot()
    print(f"   → {len(v2ex)} topics")
    
    print("🔍 Collecting Bilibili hot videos...")
    bili = fetch_bilibili_hot()
    print(f"   → {len(bili)} videos")
    
    print("🔍 Collecting RSS feeds...")
    rss = fetch_rss_summary()
    print(f"   → {len(rss)} items")
    
    return {"v2ex": v2ex, "bilibili": bili, "rss": rss, "timestamp": datetime.now().isoformat()}

def generate_html(data):
    """Generate HTML snippet for the site"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    html = f"""
    <!-- Agent Reach 实时采集内容 - 更新时间: {now} -->
    <div class="reach-content">
      <h2>🌐 社区热议</h2>
      <div class="reach-grid">
    """
    
    # V2EX topics
    if data.get("v2ex"):
        html += '<div class="reach-section"><h3>💬 V2EX 技术讨论</h3><ul>'
        for item in data["v2ex"][:6]:
            html += f'<li><a href="{item["url"]}" target="_blank">{item["title"]}</a> <span class="tag">{item["tag"]}</span> <span class="replies">{item["replies"]}回复</span></li>'
        html += '</ul></div>'
    
    # Bilibili videos
    if data.get("bilibili"):
        html += '<div class="reach-section"><h3>📺 B站热门推荐</h3><ul>'
        for item in data["bilibili"][:6]:
            html += f'<li><a href="{item["url"]}" target="_blank">{item["title"]}</a> <span class="tag">{item["author"]}</span> <span class="views">{item["play"]}播放</span></li>'
        html += '</ul></div>'
    
    # RSS
    if data.get("rss"):
        html += '<div class="reach-section"><h3>📡 行业动态</h3><ul>'
        for item in data["rss"][:4]:
            html += f'<li><a href="{item["url"]}" target="_blank">{item["title"]}</a></li>'
        html += '</ul></div>'
    
    html += """
      </div>
    </div>
    <style>
    .reach-content { margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 12px; }
    .reach-content h2 { margin-top: 0; font-size: 1.5rem; }
    .reach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .reach-section h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
    .reach-section ul { list-style: none; padding: 0; margin: 0; }
    .reach-section li { padding: 0.4rem 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
    .reach-section li:last-child { border-bottom: none; }
    .tag { display: inline-block; background: #e9ecef; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.3rem; }
    .replies, .views { color: #6c757d; font-size: 0.8rem; margin-left: 0.3rem; }
    .reach-section a { color: #1a73e8; text-decoration: none; }
    .reach-section a:hover { text-decoration: underline; }
    </style>
    """
    return html

def update_site(data):
    """Update the AI2091 site with collected content"""
    html = generate_html(data)
    
    # Save to cache
    cache_dir = NEWS_DIR / ".reach-cache"
    cache_dir.mkdir(parents=True, exist_ok=True)
    with open(cache_dir / "latest.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(cache_dir / "latest.html", "w") as f:
        f.write(html)
    
    print(f"✅ Content cached to {cache_dir}")
    return html

def main():
    print("=" * 50)
    print("Agent Reach Content Engine")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 50)
    
    data = collect_all()
    html = update_site(data)
    
    print("=" * 50)
    print("Done! Next steps:")
    print("1. Include .reach-cache/latest.html in your site template")
    print("2. Set up cron to run this script every 2-4 hours")
    print("=" * 50)

if __name__ == "__main__":
    main()