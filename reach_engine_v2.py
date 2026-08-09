#!/usr/bin/env python3
"""
Agent Reach Content Engine v2 - Uses Agent Reach CLI tools
"""

import os, sys, json, subprocess, re
from datetime import datetime
from pathlib import Path

SITE_DIR = Path("/home/ubuntu/ai2091")
NEWS_DIR = SITE_DIR / "news"
VENV_PYTHON = os.path.expanduser("~/.agent-reach-venv/bin/python3")

def run(cmd, timeout=30):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.stdout, r.stderr, r.returncode
    except:
        return "", "TIMEOUT", -1

def fetch_v2ex():
    """Use Jina Reader to read V2EX hot topics"""
    out, err, code = run(["curl", "-s", "-m", "15",
        "https://r.jina.ai/https://www.v2ex.com/?tab=hot",
        "-H", "User-Agent: Mozilla/5.0"])
    if code != 0 or not out:
        return []
    # Parse markdown output for topic links
    topics = []
    for line in out.split("\n"):
        # Match: [Title](https://www.v2ex.com/t/123456)
        m = re.search(r'\[([^\]]+)\]\(https://www\.v2ex\.com/t/(\d+)\)', line)
        if m and not m.group(1).startswith("Image"):
            # Skip ads and non-topic links
            if len(m.group(1)) > 5 and "Promoted" not in line:
                topics.append({"title": m.group(1), "id": m.group(2), 
                    "url": f"https://www.v2ex.com/t/{m.group(2)}", "replies": 0})
    return topics[:10]

def fetch_bilibili():
    """Use Agent Reach's B站 channel"""
    out, err, code = run(["curl", "-s", "-m", "10",
        "https://api.bilibili.com/x/web-interface/popular",
        "-H", "User-Agent: Mozilla/5.0",
        "-H", "Referer: https://www.bilibili.com"])
    if code == 0 and out.strip().startswith("{"):
        try:
            data = json.loads(out)
            if data.get("code") == 0:
                return data.get("data", {}).get("list", [])
        except:
            pass
    return []

def fetch_jina(url):
    """Use Jina Reader (Agent Reach's web channel)"""
    out, err, code = run(["curl", "-s", "-m", "15",
        f"https://r.jina.ai/{url}",
        "-H", "User-Agent: Mozilla/5.0"])
    if code == 0:
        return out[:3000]
    return None

def collect():
    print("🌐 V2EX...")
    v2ex = fetch_v2ex()
    print(f"   {len(v2ex) if isinstance(v2ex, list) else 0} topics")
    
    print("📺 B站...")
    bili = fetch_bilibili()
    print(f"   {len(bili)} videos")
    
    print("📰 Jina Reader (TechCrunch)...")
    tc = fetch_jina("techcrunch.com/category/artificial-intelligence/")
    print(f"   {len(tc or '')} chars")
    
    return {
        "v2ex": v2ex[:8] if isinstance(v2ex, list) else [],
        "bilibili": bili[:8],
        "techcrunch": tc[:2000] if tc else "",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

def generate_html(data):
    now = data["time"]
    html = f"""<!-- Agent Reach 实时采集 - {now} -->
<div class="reach-module">
  <h2>🌐 社区热议 <span class="time">更新于 {now}</span></h2>
  <div class="reach-grid">"""
    
    # V2EX
    if data.get("v2ex"):
        html += '<div class="reach-card"><h3>💬 V2EX 热门</h3><ul>'
        for item in data["v2ex"][:6]:
            title = item.get("title", "")
            replies = item.get("replies", 0)
            url = item.get("url", "")
            html += f'<li><a href="{url}" target="_blank">{title}</a> <span class="meta">{replies}回复</span></li>'
        html += '</ul></div>'
    
    # Bilibili
    if data.get("bilibili"):
        html += '<div class="reach-card"><h3>📺 B站推荐</h3><ul>'
        for item in data["bilibili"][:6]:
            title = item.get("title", "")
            author = item.get("owner", {}).get("name", "")
            play = item.get("stat", {}).get("view", 0)
            bvid = item.get("bvid", "")
            url = f"https://www.bilibili.com/video/{bvid}"
            html += f'<li><a href="{url}" target="_blank">{title}</a> <span class="tag">{author}</span> <span class="meta">{play}播放</span></li>'
        html += '</ul></div>'
    
    html += '</div></div>'
    
    # TechCrunch summary
    if data.get("techcrunch"):
        lines = data["techcrunch"].strip().split("\n")
        html += '<div class="reach-card full"><h3>📰 AI 行业动态</h3>'
        html += '<div class="text-content">' + "\n".join(lines[:20]) + '</div></div>'
    
    html += """
<style>
.reach-module { margin: 2rem 0; }
.reach-module h2 { font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
.reach-module .time { font-size: 0.8rem; color: #999; font-weight: normal; }
.reach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; }
.reach-card { background: #f8f9fa; border-radius: 10px; padding: 1rem; border: 1px solid #eee; }
.reach-card.full { grid-column: 1 / -1; }
.reach-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
.reach-card ul { list-style: none; padding: 0; margin: 0; }
.reach-card li { padding: 0.4rem 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.reach-card li:last-child { border-bottom: none; }
.reach-card a { color: #1a73e8; text-decoration: none; }
.reach-card a:hover { text-decoration: underline; }
.tag { display: inline-block; background: #e9ecef; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }
.meta { color: #999; font-size: 0.8rem; margin-left: 0.3rem; }
.text-content { font-size: 0.85rem; line-height: 1.5; color: #333; max-height: 300px; overflow-y: auto; }
</style>
"""
    return html

def main():
    print("=" * 50)
    print("Agent Reach Content Engine v2")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 50)
    
    data = collect()
    html = generate_html(data)
    
    cache_dir = NEWS_DIR / ".reach-cache"
    cache_dir.mkdir(parents=True, exist_ok=True)
    with open(cache_dir / "latest.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(cache_dir / "latest.html", "w") as f:
        f.write(html)
    
    print(f"\n✅ Cached to {cache_dir}")
    print("Done!")

if __name__ == "__main__":
    main()