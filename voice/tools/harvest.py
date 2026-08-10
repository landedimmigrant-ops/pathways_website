#!/usr/bin/env python3
"""Harvest researcher-facing pages from concordia.ca + SSHRC/CIHR/NSERC.
Saves cleaned main-content text to corpus/<site>/<slug>.txt
Uses curl (this machine's python SSL CA bundle is broken)."""
import subprocess, re, html, os, sys, time, json

OUT = "corpus"

def fetch(url, timeout=40):
    try:
        r = subprocess.run(["curl", "-sL", "--max-time", str(timeout),
                            "-A", "Mozilla/5.0 (research style audit)", url],
                           capture_output=True, text=True, errors="ignore")
        return r.stdout or ""
    except Exception:
        return ""

def main_content(h):
    """Pull the main content region, dropping chrome."""
    # AEM/Concordia + canada.ca both use <main> or role=main
    m = re.search(r'(?is)<main\b[^>]*>(.*?)</main>', h)
    if not m:
        m = re.search(r'(?is)<div[^>]+role=["\']main["\'][^>]*>(.*?)</div>\s*</div>', h)
    body = m.group(1) if m else h
    # kill non-content
    body = re.sub(r'(?is)<(script|style|nav|header|footer|form|noscript|svg|aside)\b[^>]*>.*?</\1>', ' ', body)
    body = re.sub(r'(?is)<!--.*?-->', ' ', body)
    return body

def blocks(body):
    """Return list of (tag, text) preserving heading/paragraph/list structure."""
    out = []
    for m in re.finditer(r'(?is)<(h1|h2|h3|h4|p|li|td|dt|dd|button|a)\b[^>]*>(.*?)</\1>', body):
        tag, inner = m.group(1).lower(), m.group(2)
        t = re.sub(r'(?s)<[^>]+>', ' ', inner)
        t = html.unescape(t)
        t = re.sub(r'\s+', ' ', t).strip()
        if not t or len(t) < 2:
            continue
        out.append((tag, t))
    return out

def slug(url):
    s = re.sub(r'^https?://', '', url)
    s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')
    return s[:120]

def harvest(site, urls, delay=0.6):
    d = os.path.join(OUT, site)
    os.makedirs(d, exist_ok=True)
    got = 0
    for u in urls:
        p = os.path.join(d, slug(u) + ".txt")
        if os.path.exists(p):
            got += 1
            continue
        h = fetch(u)
        if not h or len(h) < 500:
            continue
        if re.search(r'(?i)error 404|couldn.t find that web page', h[:4000]):
            continue
        bl = blocks(main_content(h))
        # need real prose
        if sum(1 for t, x in bl if t == 'p' and len(x.split()) > 8) < 2:
            continue
        with open(p, "w", encoding="utf-8") as f:
            f.write("URL\t" + u + "\n")
            for tag, t in bl:
                f.write(tag + "\t" + t + "\n")
        got += 1
        time.sleep(delay)
    return got

def discover(seed, host, pathfilter, cap=90):
    """One-hop link discovery from seed pages."""
    seen, queue, found = set(), list(seed), []
    while queue and len(found) < cap:
        u = queue.pop(0)
        if u in seen:
            continue
        seen.add(u)
        found.append(u)
        h = fetch(u)
        base = u.rsplit("/", 1)[0] + "/"
        for m in re.finditer(r'href="([^"#?]+)"', h):
            href = m.group(1)
            if href.startswith("//"):
                href = "https:" + href
            elif href.startswith("/"):
                href = "https://" + host + href
            elif not href.startswith("http"):
                # relative — resolve against the current page's directory
                href = base + href
                while "/../" in href:
                    href = re.sub(r'/[^/]+/\.\./', '/', href)
            if not href.startswith("https://" + host):
                continue
            if not re.search(pathfilter, href):
                continue
            if href.endswith((".pdf", ".docx", ".jpg", ".png", ".zip", ".xml")):
                continue
            if href not in seen and len(seen) + len(queue) < cap * 2:
                queue.append(href)
    return found[:cap]

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    tally = {}

    if which in ("all", "concordia"):
        seeds = ["https://www.concordia.ca/research/for-researchers.html",
                 "https://www.concordia.ca/research.html",
                 "https://www.concordia.ca/research/funding.html"]
        urls = discover(seeds, "www.concordia.ca", r'/research/', cap=85)
        tally["concordia"] = harvest("concordia", urls)

    if which in ("all", "sshrc"):
        seeds = ["https://sshrc-crsh.canada.ca/en/funding.aspx",
                 "https://sshrc-crsh.canada.ca/en/funding/how-to-apply.aspx",
                 "https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx",
                 "https://sshrc-crsh.canada.ca/en/funding/how-applications-are-reviewed.aspx",
                 "https://sshrc-crsh.canada.ca/en/funding/policies-regulations-and-guidelines.aspx"]
        urls = discover(seeds, "sshrc-crsh.canada.ca", r'/en/.*\.aspx$', cap=60)
        tally["sshrc"] = harvest("sshrc", urls)

    if which in ("all", "cihr"):
        seeds = ["https://cihr-irsc.gc.ca/e/193.html",
                 "https://cihr-irsc.gc.ca/e/34190.html",
                 "https://cihr-irsc.gc.ca/e/29529.html"]
        urls = discover(seeds, "cihr-irsc.gc.ca", r'/e/\d+\.html', cap=55)
        tally["cihr"] = harvest("cihr", urls)

    if which in ("all", "nserc"):
        seeds = ["https://nserc-crsng.canada.ca/en/funding",
                 "https://nserc-crsng.canada.ca/en/"]
        urls = discover(seeds, "nserc-crsng.canada.ca", r'/en/', cap=55)
        tally["nserc"] = harvest("nserc", urls)

    print(json.dumps(tally, indent=2))
