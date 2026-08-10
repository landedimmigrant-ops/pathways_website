#!/usr/bin/env python3
"""Measure HOW language is constructed across harvested corpora.
Not terminology — sentence architecture, heading grammar, mood, person, obligation."""
import re, os, glob, sys, statistics as st
from collections import Counter, defaultdict

# verbs that commonly open an instruction
IMP = set("""read write draft revise review check choose select find search identify
list name describe explain complete submit send contact consult attend join book
register apply prepare plan start begin follow ensure make use include add remove
avoid consider note remember allow give take keep set map focus articulate enhance
demonstrate state provide download visit see refer learn discuss meet ask tell show
put determine familiarize adhere get be do have address define outline highlight
create build develop establish maintain update verify confirm request obtain""".split())

QWORD = re.compile(r'^(what|how|why|when|where|who|which|can|do|does|is|are|should|will|may|am)\b', re.I)
MODALS = ["must", "should", "may", "can", "will", "need to", "required to", "have to"]

def sentences(t):
    t = re.sub(r'\s+', ' ', t)
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+(?=[A-Z"“])', t) if len(s.strip()) > 1]

def first_word(t):
    m = re.match(r"[\"'“(]*([A-Za-z][A-Za-z'-]*)", t.strip())
    return m.group(1).lower() if m else ""

def classify_heading(t):
    t = t.strip()
    if t.endswith("?") or QWORD.match(t):
        return "question"
    fw = first_word(t)
    if fw in IMP and not t.endswith("?"):
        # "Research security" -> noun; "Review our guidelines" -> imperative
        return "imperative"
    if re.match(r'^[A-Za-z]+ing\b', t):
        return "gerund"
    return "noun"

def load(site):
    pages = []
    for f in sorted(glob.glob(f"corpus/{site}/*.txt")):
        rows, url = [], ""
        for i, line in enumerate(open(f, encoding="utf-8")):
            if i == 0 and line.startswith("URL\t"):
                url = line.strip().split("\t", 1)[1]; continue
            if "\t" in line:
                tag, txt = line.rstrip("\n").split("\t", 1)
                rows.append((tag, txt))
        if rows:
            pages.append((url, rows))
    return pages

def analyze(pages, label):
    H = Counter(); paras = []; sents = []; lis = []
    you = we = third = 0; imp_sents = 0; tot_sents = 0
    modal = Counter(); cond = 0; li_verb = 0; li_bold = 0
    openers = []; defs = 0; support = 0
    words_total = 0

    for url, rows in pages:
        firstp = True
        for tag, txt in rows:
            if tag in ("h1", "h2", "h3", "h4"):
                H[classify_heading(txt)] += 1
            elif tag == "p":
                w = len(txt.split()); words_total += w
                if w >= 4:
                    paras.append(w)
                    if firstp and w > 10:
                        openers.append((url, txt)); firstp = False
                for s in sentences(txt):
                    n = len(s.split())
                    if n < 2: continue
                    sents.append(n); tot_sents += 1
                    fw = first_word(s)
                    if fw in IMP and not re.match(r'^(is|are|do|does|can|will|should|may)\b', s, re.I):
                        # crude: imperative if opens with base verb and no subject pronoun right after
                        if not re.match(r'^\w+\s+(is|are|was|were|will|can|should)\b', s, re.I):
                            imp_sents += 1
                    if re.match(r'^if\b', s, re.I): cond += 1
                    for m in MODALS:
                        modal[m] += len(re.findall(r'\b' + m + r'\b', s, re.I))
                you += len(re.findall(r'\b(you|your|yours|yourself)\b', txt, re.I))
                we += len(re.findall(r'\b(we|our|us|ours)\b', txt, re.I))
                third += len(re.findall(r'\b(researchers?|applicants?|faculty|students?)\b', txt, re.I))
                if re.search(r'\b(is|are|refers to|means)\b.{0,40}\b(a|an|the)\b', txt[:120], re.I): defs += 1
                if re.search(r'\b(contact|reach out|get in touch|we can help|our team|advisor|support)\b', txt, re.I): support += 1
            elif tag == "li":
                w = len(txt.split()); words_total += w
                if w >= 2:
                    lis.append(w)
                    if first_word(txt) in IMP: li_verb += 1
                    # "Concise Get right to the point." -> label followed by capital-start clause
                    if re.match(r'^[A-Z][A-Za-z-]{2,18}\s+[A-Z]', txt): li_bold += 1

    def pc(n, d): return f"{(100.0*n/d):.0f}%" if d else "—"
    nH = sum(H.values()) or 1
    out = {
        "label": label,
        "pages": len(pages),
        "words": words_total,
        "headings": {k: pc(H[k], nH) for k in ("imperative", "question", "gerund", "noun")},
        "heading_n": nH,
        "sent_mean": round(st.mean(sents), 1) if sents else 0,
        "sent_median": st.median(sents) if sents else 0,
        "sent_over30": pc(sum(1 for s in sents if s > 30), len(sents)),
        "sent_under15": pc(sum(1 for s in sents if s < 15), len(sents)),
        "para_mean": round(st.mean(paras), 1) if paras else 0,
        "li_mean": round(st.mean(lis), 1) if lis else 0,
        "li_share": pc(len(lis), len(lis) + len(paras)),
        "li_verb_first": pc(li_verb, len(lis)),
        "li_label_style": pc(li_bold, len(lis)),
        "imperative_sents": pc(imp_sents, tot_sents),
        "you_per_1k": round(1000.0 * you / words_total, 1) if words_total else 0,
        "we_per_1k": round(1000.0 * we / words_total, 1) if words_total else 0,
        "third_per_1k": round(1000.0 * third / words_total, 1) if words_total else 0,
        "conditional_sents": pc(cond, tot_sents),
        "modals": dict(modal.most_common(6)),
        "support_paras": pc(support, len(paras)),
    }
    return out, openers

def show(o):
    print(f"\n### {o['label']}  ({o['pages']} pages, {o['words']:,} words)")
    print(f"  headings (n={o['heading_n']}): " + "  ".join(f"{k}={v}" for k, v in o['headings'].items()))
    print(f"  sentences: mean {o['sent_mean']}w  median {o['sent_median']}w  "
          f"<15w {o['sent_under15']}  >30w {o['sent_over30']}")
    print(f"  paragraph mean {o['para_mean']}w | list item mean {o['li_mean']}w | list share {o['li_share']}")
    print(f"  list items verb-first {o['li_verb_first']} | label-style {o['li_label_style']}")
    print(f"  imperative sentences {o['imperative_sents']} | conditional 'If…' {o['conditional_sents']}")
    print(f"  address: you {o['you_per_1k']}/1k · we {o['we_per_1k']}/1k · 3rd-person {o['third_per_1k']}/1k")
    print(f"  modals: {o['modals']}")
    print(f"  paragraphs offering help: {o['support_paras']}")

if __name__ == "__main__":
    which = sys.argv[1:] or ["concordia", "sshrc", "cihr", "nserc"]
    allop = {}
    for site in which:
        pages = load(site)
        if not pages:
            print(f"\n### {site}: no pages"); continue
        if site == "concordia":
            instr = [p for p in pages if re.search(r'/for-researchers|/funding', p[0])]
            inst = [p for p in pages if not re.search(r'/for-researchers|/funding', p[0])]
            o, op = analyze(instr, "CONCORDIA — researcher instruction pages"); show(o); allop["conc_instr"] = op
            o2, _ = analyze(inst, "CONCORDIA — institutional / centre pages"); show(o2)
        else:
            o, op = analyze(pages, site.upper()); show(o); allop[site] = op
    import json
    json.dump({k: v[:40] for k, v in allop.items()}, open("openers.json", "w"), indent=1)
    print("\n(openers -> openers.json)")
