"""
Contract & Policy Analyzer
Usage:
    python3 contract_analyzer.py                        # runs built-in demo
    python3 contract_analyzer.py mycontract.txt         # analyze a file
    python3 contract_analyzer.py mycontract.txt "NDA"   # with custom name
"""

import os
import random
import sys
import json
import re
import time
from datetime import datetime
from pathlib import Path
import anthropic


DEMO_CONTRACT = """
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of January 1, 2025, between 
Acme Corp ("Client") and FastDev LLC ("Service Provider").

1. SERVICES
Service Provider agrees to develop a custom software application for Client. 
Work will begin upon signing.

2. PAYMENT
Client shall pay Service Provider $50,000 upon completion. 
Additional expenses may be billed at Service Provider's discretion.

3. INTELLECTUAL PROPERTY
All work product created under this Agreement shall belong to Service Provider 
unless otherwise agreed in writing.

4. CONFIDENTIALITY
Both parties agree to keep information confidential for a period of time.

5. LIABILITY
Service Provider's liability shall be limited to the amount paid under this Agreement. 
Client waives all rights to consequential or punitive damages.

6. TERMINATION
Either party may terminate this Agreement with notice. Upon termination, 
Client owes payment for all work completed.

7. DISPUTES
Any disputes shall be resolved through arbitration.

8. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.
"""


# ─────────────────────────────────────────────
#  Analysis
# ─────────────────────────────────────────────

def _is_transient_api_error(err: BaseException) -> bool:
    """True for overload (529), rate limits, timeouts, and short-lived server issues."""
    if isinstance(err, (anthropic.APIConnectionError, anthropic.APITimeoutError)):
        return True
    if isinstance(err, anthropic.RateLimitError):
        return True
    code = getattr(err, "status_code", None)
    if code is not None and code in (500, 502, 503, 504, 529):
        return True
    return False


def _messages_create(client: anthropic.Anthropic, **kwargs):
    """Call Messages API with retries on transient errors (e.g. 529 Overloaded)."""
    max_attempts = 8
    for attempt in range(1, max_attempts + 1):
        try:
            return client.messages.create(**kwargs)
        except Exception as e:
            if not _is_transient_api_error(e) or attempt == max_attempts:
                raise
            wait = min(90.0, 2.0**attempt) + random.uniform(0, 1.0)
            print(
                f"    API temporarily unavailable (overloaded or rate-limited). "
                f"Waiting {wait:.0f}s, then retry {attempt + 1}/{max_attempts}…",
                file=sys.stderr,
            )
            time.sleep(wait)
    raise RuntimeError("unreachable")  # pragma: no cover


_JSON_SCHEMA_BLURB = """
Rules for your reply:
- Output ONLY a single JSON object, no markdown fences, no commentary before or after.
- All keys must be present as in the template. Use null only where the template allows "string or null".
- All string values must be valid JSON strings: escape " as \\", and use \\n for line breaks (never a raw newline inside a string value).
- Keep each text field reasonably concise if the document is long, so the full object fits in the response.
"""


def _strip_model_json_fences(text: str) -> str:
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t, count=1, flags=re.IGNORECASE)
    t = re.sub(r"\s*```$", "", t, count=1)
    return t.strip()


def _try_parse_model_json(raw: str) -> dict:
    s = _strip_model_json_fences(raw)
    return json.loads(s)


def _parse_or_repair(
    client: anthropic.Anthropic,
    model: str,
    raw: str,
    err: Exception,
) -> dict:
    """One repair pass: model output was truncated or invalid JSON."""
    stripped = _strip_model_json_fences(raw)
    head = 120_000
    snippet = stripped[:head]
    if len(stripped) > head:
        snippet += "\n... [truncated in this request for length] ..."

    system = f"""The assistant tried to return JSON for a contract analysis but it failed to parse: {err}
Your job: output ONE complete, valid JSON object with the same keys as a contract report.
- Copy over any correct parts from the broken output below, fix escaping, and complete any truncated strings with brief safe summaries.
- If you must shorten content to fit, shorten bullet lists, not the required keys.
{_JSON_SCHEMA_BLURB}"""

    fix = _messages_create(
        client,
        model=model,
        max_tokens=16_384,
        system=system,
        messages=[
            {
                "role": "user",
                "content": f"Broken or incomplete JSON to fix and return as valid complete JSON only:\n\n{snippet}",
            }
        ],
    )
    out = fix.content[0].text
    try:
        return _try_parse_model_json(out)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            "Could not parse JSON from the model, even after a repair pass. "
            f"Parse error: {e}. Last 400 chars of repair output: {out[-400:]!r}"
        ) from e


def analyze_contract(text: str, document_name: str = "Contract") -> dict:
    client = anthropic.Anthropic()
    model = "claude-opus-4-7"

    system_prompt = f"""You are an expert contract and legal document analyst. Analyze contracts
objectively and thoroughly. Always respond with ONLY valid JSON matching this exact structure (types as shown; use the exact key names):
{{
  "document_type": "string",
  "executive_summary": "string",
  "key_parties": [{{"name": "string", "role": "string"}}],
  "effective_date": "string or null",
  "expiration_date": "string or null",
  "key_terms": [{{"term": "string", "description": "string"}}],
  "obligations": {{"party_a": ["string"], "party_b": ["string"]}},
  "financial_terms": [{{"item": "string", "detail": "string"}}],
  "flaws_and_risks": [{{"severity": "HIGH|MEDIUM|LOW", "category": "string", "issue": "string", "recommendation": "string"}}],
  "warnings": [{{"type": "WARNING|CAUTION|NOTE", "message": "string"}}],
  "missing_clauses": [{{"clause": "string", "reason": "string"}}],
  "compliance_notes": [{{"area": "string", "note": "string"}}],
  "termination_conditions": ["string"],
  "dispute_resolution": "string or null",
  "governing_law": "string or null",
  "overall_risk_score": "LOW|MEDIUM|HIGH|CRITICAL",
  "overall_risk_explanation": "string",
  "recommendations": ["string"],
  "positive_aspects": ["string"]
}}
{_JSON_SCHEMA_BLURB}"""

    message = _messages_create(
        client,
        model=model,
        max_tokens=16_384,
        system=system_prompt,
        messages=[{"role": "user", "content": f'Analyze this contract titled "{document_name}":\n\n{text}'}],
    )

    raw = message.content[0].text
    stop = getattr(message, "stop_reason", None)
    try:
        return _try_parse_model_json(raw)
    except json.JSONDecodeError as e:
        return _parse_or_repair(
            client,
            model,
            raw,
            Exception(f"JSON parse failed: {e}; stop_reason={stop!r}"),
        )


# ─────────────────────────────────────────────
#  Plain-Text Report
# ─────────────────────────────────────────────

def generate_text_report(a: dict, document_name: str) -> str:
    now = datetime.now().strftime("%B %d, %Y")
    div = "=" * 72
    risk_icons = {"HIGH": "[!!!]", "CRITICAL": "[!!!]", "MEDIUM": "[!!]", "LOW": "[i]"}

    def sec(title): return f"\n{div}\n  {title.upper()}\n{div}\n"

    lines = [
        div,
        "  CONTRACT & POLICY ANALYSIS REPORT",
        f"  Document  : {document_name}",
        f"  Date      : {now}",
        f"  Type      : {a.get('document_type', 'Unknown')}",
        f"  Risk Level: {a.get('overall_risk_score', 'N/A')}",
        div,
    ]

    lines.append(sec("Executive Summary"))
    lines.append(a.get("executive_summary", "N/A"))

    if a.get("key_parties"):
        lines.append(sec("Key Parties"))
        for p in a["key_parties"]:
            lines.append(f"  • {p['name']} — {p['role']}")

    eff, exp = a.get("effective_date"), a.get("expiration_date")
    if eff or exp:
        lines.append(sec("Important Dates"))
        if eff: lines.append(f"  Effective : {eff}")
        if exp: lines.append(f"  Expiration: {exp}")

    if a.get("financial_terms"):
        lines.append(sec("Financial Terms"))
        for f in a["financial_terms"]:
            lines.append(f"  • {f['item']}: {f['detail']}")

    if a.get("key_terms"):
        lines.append(sec("Key Terms"))
        for t in a["key_terms"]:
            lines.append(f"  {t['term']}:\n    {t['description']}")

    if a.get("obligations"):
        lines.append(sec("Obligations"))
        for party, duties in a["obligations"].items():
            lines.append(f"  {party.replace('_',' ').title()}:")
            for d in duties: lines.append(f"    - {d}")

    flaws = a.get("flaws_and_risks", [])
    lines.append(sec(f"Flaws & Risks ({len(flaws)} identified)"))
    if flaws:
        for i, f in enumerate(flaws, 1):
            sev = f.get("severity", "?").upper()
            lines.append(f"  {i}. {risk_icons.get(sev,'[?]')} [{sev}] {f.get('category','')}")
            lines.append(f"     Issue : {f.get('issue','')}")
            lines.append(f"     Fix   : {f.get('recommendation','')}\n")
    else:
        lines.append("  No significant flaws identified.")

    warnings = a.get("warnings", [])
    lines.append(sec(f"Warnings ({len(warnings)} total)"))
    for w in warnings:
        lines.append(f"  [{w.get('type','NOTE')}] {w.get('message','')}")
    if not warnings:
        lines.append("  No warnings flagged.")

    if a.get("missing_clauses"):
        lines.append(sec("Missing Clauses"))
        for m in a["missing_clauses"]:
            lines.append(f"  • {m['clause']}: {m['reason']}")

    if a.get("compliance_notes"):
        lines.append(sec("Compliance Notes"))
        for c in a["compliance_notes"]:
            lines.append(f"  [{c['area']}] {c['note']}")

    if a.get("termination_conditions"):
        lines.append(sec("Termination Conditions"))
        for t in a["termination_conditions"]: lines.append(f"  • {t}")

    if a.get("dispute_resolution") or a.get("governing_law"):
        lines.append(sec("Legal Framework"))
        if a.get("dispute_resolution"): lines.append(f"  Dispute Resolution: {a['dispute_resolution']}")
        if a.get("governing_law"):      lines.append(f"  Governing Law     : {a['governing_law']}")

    if a.get("positive_aspects"):
        lines.append(sec("Positive Aspects"))
        for p in a["positive_aspects"]: lines.append(f"  ✓ {p}")

    if a.get("recommendations"):
        lines.append(sec("Recommendations"))
        for i, r in enumerate(a["recommendations"], 1): lines.append(f"  {i}. {r}")

    lines.append(sec("Overall Risk Assessment"))
    lines.append(f"  Risk Level : {a.get('overall_risk_score', 'N/A')}")
    lines.append(f"  Explanation: {a.get('overall_risk_explanation', '')}")

    lines += [f"\n{div}", "  END OF REPORT — Contract Analyzer", f"  {now}", div]
    return "\n".join(lines)


# ─────────────────────────────────────────────
#  HTML Report
# ─────────────────────────────────────────────

def generate_html_report(a: dict, document_name: str) -> str:
    now = datetime.now().strftime("%B %d, %Y")
    risk_colors = {"LOW":"#27ae60","MEDIUM":"#f39c12","HIGH":"#e74c3c","CRITICAL":"#8e44ad",
                   "WARNING":"#e74c3c","CAUTION":"#f39c12","NOTE":"#3498db"}
    score = a.get("overall_risk_score","MEDIUM").upper()
    score_color = risk_colors.get(score, "#7f8c8d")

    def badge(text, color):
        return f'<span style="background:{color};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">{text}</span>'

    flaws_html = ""
    for f in a.get("flaws_and_risks", []):
        sev = f.get("severity","LOW").upper()
        col = risk_colors.get(sev,"#ccc")
        flaws_html += f'<div class="card" style="border-left:5px solid {col}">{badge(sev,col)} <strong style="margin-left:8px">{f.get("category","")}</strong><p style="margin:8px 0 4px"><strong>Issue:</strong> {f.get("issue","")}</p><p style="color:#27ae60"><strong>Fix:</strong> {f.get("recommendation","")}</p></div>'

    warnings_html = ""
    for w in a.get("warnings", []):
        wt = w.get("type","NOTE").upper()
        col = risk_colors.get(wt,"#3498db")
        warnings_html += f'<div class="card" style="border-left:5px solid {col}">{badge(wt,col)} <span style="margin-left:8px">{w.get("message","")}</span></div>'

    parties_rows = "".join(f'<tr><td><strong>{p["name"]}</strong></td><td>{p["role"]}</td></tr>' for p in a.get("key_parties",[]))
    fin_rows     = "".join(f'<tr><td><strong>{f["item"]}</strong></td><td>{f["detail"]}</td></tr>' for f in a.get("financial_terms",[]))
    missing_li   = "".join(f'<li><strong>{m["clause"]}</strong>: {m["reason"]}</li>' for m in a.get("missing_clauses",[]))
    recs_li      = "".join(f'<li>{r}</li>' for r in a.get("recommendations",[]))
    pos_li       = "".join(f'<li style="color:#27ae60">✓ {p}</li>' for p in a.get("positive_aspects",[]))
    terms_dl     = "".join(f'<dt><strong>{t["term"]}</strong></dt><dd style="margin-bottom:8px">{t["description"]}</dd>' for t in a.get("key_terms",[]))
    term_li      = "".join(f'<li>{t}</li>' for t in a.get("termination_conditions",[]))
    comp_li      = "".join(f'<li><strong>[{c["area"]}]</strong> {c["note"]}</li>' for c in a.get("compliance_notes",[]))
    obls_html    = ""
    for party, duties in a.get("obligations",{}).items():
        obls_html += f'<h4>{party.replace("_"," ").title()}</h4><ul>{"".join(f"<li>{d}</li>" for d in duties)}</ul>'

    def sec(title, body):
        return f'<div class="section"><h2>{title}</h2>{body}</div>' if body.strip() else ""

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Contract Analysis: {document_name}</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Georgia,serif;font-size:14px;color:#2c3e50;background:#f4f6f9;padding:30px}}
.wrap{{max-width:900px;margin:0 auto;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.12)}}
.header{{background:linear-gradient(135deg,#1a2a4a,#2e4a8a);color:#fff;padding:40px}}
.header h1{{font-size:26px;margin-bottom:6px}}
.meta{{opacity:.8;font-size:13px;margin-top:4px}}
.risk-badge{{display:inline-block;background:{score_color};color:#fff;padding:8px 20px;border-radius:20px;font-weight:700;font-size:15px;margin-top:14px}}
.body{{padding:30px 40px}}
.section{{margin-bottom:34px;border-bottom:1px solid #ecf0f1;padding-bottom:28px}}
h2{{font-size:16px;color:#1a2a4a;margin-bottom:14px;padding-bottom:6px;border-bottom:2px solid #2e4a8a;text-transform:uppercase;letter-spacing:.8px}}
h4{{margin:10px 0 6px;color:#34495e}}
table{{width:100%;border-collapse:collapse;margin-top:8px}}
th{{background:#2e4a8a;color:#fff;padding:9px 12px;text-align:left;font-size:12px}}
td{{padding:9px 12px;border-bottom:1px solid #ecf0f1;vertical-align:top}}
tr:nth-child(even) td{{background:#f8f9fa}}
.card{{background:#fafafa;border-radius:6px;padding:14px;margin-bottom:12px}}
ul,ol{{padding-left:20px;line-height:2}}
dl{{padding-left:10px}}
.summary{{background:#eaf0fb;border-left:4px solid #2e4a8a;padding:16px;border-radius:4px;line-height:1.8}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.box{{background:#f4f6f9;padding:14px;border-radius:6px}}
.box label{{font-size:11px;text-transform:uppercase;color:#7f8c8d;display:block}}
.footer{{background:#1a2a4a;color:rgba(255,255,255,.6);text-align:center;padding:20px;font-size:12px}}
@media print{{body{{background:#fff;padding:0}}.wrap{{box-shadow:none}}}}
</style></head><body>
<div class="wrap">
<div class="header">
  <div style="font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:1px">Contract Analysis Report</div>
  <h1>{document_name}</h1>
  <div class="meta">Type: {a.get("document_type","Unknown")} &nbsp;|&nbsp; Date: {now}</div>
  <div class="risk-badge">Overall Risk: {score}</div>
</div>
<div class="body">
  {sec("Executive Summary", f'<div class="summary">{a.get("executive_summary","")}</div>')}
  {sec("Key Parties", f'<table><thead><tr><th>Party</th><th>Role</th></tr></thead><tbody>{parties_rows}</tbody></table>') if parties_rows else ""}
  {sec("Important Dates", f'<div class="grid"><div class="box"><label>Effective Date</label><span>{a.get("effective_date","Not specified")}</span></div><div class="box"><label>Expiration Date</label><span>{a.get("expiration_date","Not specified")}</span></div></div>')}
  {sec("Financial Terms", f'<table><thead><tr><th>Item</th><th>Details</th></tr></thead><tbody>{fin_rows}</tbody></table>') if fin_rows else ""}
  {sec("Key Terms", f'<dl>{terms_dl}</dl>') if terms_dl else ""}
  {sec("Obligations", obls_html) if obls_html else ""}
  {sec(f"Flaws & Risks ({len(a.get('flaws_and_risks',[]))} identified)", flaws_html or "<p>No significant flaws identified.</p>")}
  {sec(f"Warnings ({len(a.get('warnings',[]))} total)", warnings_html or "<p>No warnings flagged.</p>")}
  {sec("Missing Clauses", f'<ul>{missing_li}</ul>') if missing_li else ""}
  {sec("Compliance Notes", f'<ul>{comp_li}</ul>') if comp_li else ""}
  {sec("Termination Conditions", f'<ul>{term_li}</ul>') if term_li else ""}
  {sec("Legal Framework", f'<div class="grid"><div class="box"><label>Dispute Resolution</label><span>{a.get("dispute_resolution","Not specified")}</span></div><div class="box"><label>Governing Law</label><span>{a.get("governing_law","Not specified")}</span></div></div>')}
  {sec("Positive Aspects", f'<ul>{pos_li}</ul>') if pos_li else ""}
  {sec("Recommendations", f'<ol>{recs_li}</ol>') if recs_li else ""}
  <div class="section">
    <h2>Overall Risk Assessment</h2>
    <div class="card" style="border-left:5px solid {score_color}">
      <strong style="color:{score_color}">Risk Level: {score}</strong>
      <p style="margin-top:8px">{a.get("overall_risk_explanation","")}</p>
    </div>
  </div>
</div>
<div class="footer">Contract Analyzer &nbsp;|&nbsp; {now} &nbsp;|&nbsp; This report does not constitute legal advice.</div>
</div></body></html>"""


# ─────────────────────────────────────────────
#  Email Draft
# ─────────────────────────────────────────────

def generate_email(a: dict, document_name: str, client_name: str = "Valued Client", sender: str = "Your Advisor") -> str:
    now = datetime.now().strftime("%B %d, %Y")
    risk = a.get("overall_risk_score", "MEDIUM")
    high_flaws = [f for f in a.get("flaws_and_risks", []) if f.get("severity","").upper() in ("HIGH","CRITICAL")]
    recs = "\n".join(f"   {i+1}. {r}" for i, r in enumerate(a.get("recommendations", [])[:5]))
    issues = "\n".join(f"• [{f['severity']}] {f['category']}: {f['issue']}" for f in high_flaws) or "   No high-severity issues found."

    return f"""Subject: Contract Analysis Report – {document_name} [{now}]

Dear {client_name},

Please find below a summary of my analysis of "{document_name}".

OVERALL RISK: {risk}

EXECUTIVE SUMMARY
─────────────────
{a.get('executive_summary', 'N/A')}

HIGH-PRIORITY ISSUES
────────────────────
{issues}

KEY RECOMMENDATIONS
───────────────────
{recs or '   No additional recommendations at this time.'}

A full detailed report (HTML/PDF) is attached covering all flaws, missing clauses,
obligations, financial terms, compliance notes, and more.

Please do not sign or execute this agreement until we have discussed these findings.

Regards,
{sender}

──────────────────────────────────────────────────────────
DISCLAIMER: AI-generated analysis. Does not constitute legal advice.
──────────────────────────────────────────────────────────
"""


# ─────────────────────────────────────────────
#  File Reading (PDF, DOCX, TXT)
# ─────────────────────────────────────────────

def read_file(file_path: Path) -> str:
    ext = file_path.suffix.lower()

    if ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(str(file_path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            print("  pypdf not found. Installing…")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "-q"])
            import pypdf
            reader = pypdf.PdfReader(str(file_path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)

    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            print("  python-docx not found. Installing…")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx", "-q"])
            import docx
            doc = docx.Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs)

    else:
        # .txt or anything else — read as plain text
        return file_path.read_text(encoding="utf-8", errors="ignore")


def paste_mode() -> str:
    """Let the user paste contract text directly into the terminal."""
    print("\n📋  PASTE MODE")
    print("    Paste your contract text below.")
    print("    When done, press Enter then type END on its own line and press Enter.\n")
    lines = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == "END":
            break
        lines.append(line)
    return "\n".join(lines)


# ─────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────

def main():
    if not (os.environ.get("ANTHROPIC_API_KEY") or "").strip():
        print("\n❌  ANTHROPIC_API_KEY is not set in this environment.")
        print("    In your terminal, run:  export ANTHROPIC_API_KEY=\"sk-ant-...\"")
        print("    (Get a key at https://console.anthropic.com/)\n")
        sys.exit(1)

    print("\n" + "=" * 56)
    print("  CONTRACT & POLICY ANALYZER")
    print("=" * 56)

    if len(sys.argv) >= 2:
        # File passed as argument
        file_path = Path(sys.argv[1])
        if not file_path.exists():
            print(f"\n❌  File not found: {file_path}")
            sys.exit(1)
        ext = file_path.suffix.lower()
        if ext not in (".txt", ".pdf", ".docx"):
            print(f"\n❌  Unsupported file type: {ext}")
            print("    Supported: .txt  .pdf  .docx")
            sys.exit(1)
        print(f"\n📄  Reading file: {file_path.name}")
        contract_text = read_file(file_path)
        doc_name = sys.argv[2] if len(sys.argv) >= 3 else file_path.stem.replace("_", " ").title()

    else:
        # Interactive menu
        print("\nHow would you like to provide the contract?\n")
        print("  1 — Run built-in demo contract")
        print("  2 — Enter a file path (.txt, .pdf, .docx)")
        print("  3 — Paste contract text directly\n")
        choice = input("Enter 1, 2, or 3: ").strip()

        if choice == "1":
            contract_text = DEMO_CONTRACT
            doc_name = "Acme Corp Service Agreement (Demo)"

        elif choice == "2":
            raw = input("\nFile path: ").strip().strip('"').strip("'")
            file_path = Path(raw)
            if not file_path.exists():
                print(f"\n❌  File not found: {file_path}")
                sys.exit(1)
            print(f"📄  Reading: {file_path.name}")
            contract_text = read_file(file_path)
            doc_name = file_path.stem.replace("_", " ").title()

        elif choice == "3":
            contract_text = paste_mode()
            if not contract_text.strip():
                print("❌  No text received.")
                sys.exit(1)
            doc_name = input("\nDocument name (e.g. 'NDA with Acme'): ").strip() or "Pasted Contract"

        else:
            print("❌  Invalid choice.")
            sys.exit(1)

    if not contract_text.strip():
        print("❌  No contract text found in file.")
        sys.exit(1)

    print(f"\n🔍  Analyzing: {doc_name}")
    print("    Contacting Claude API… (15–30 seconds)\n")

    analysis = analyze_contract(contract_text, doc_name)
    print(f"    ✓ Done — Risk: {analysis.get('overall_risk_score')}\n")

    text_report = generate_text_report(analysis, doc_name)
    html_report = generate_html_report(analysis, doc_name)
    email_draft = generate_email(analysis, doc_name)

    slug = re.sub(r'[^\w\s-]', '', doc_name).strip().replace(' ', '_')
    Path("reports").mkdir(exist_ok=True)

    Path(f"reports/{slug}_report.txt").write_text(text_report, encoding="utf-8")
    Path(f"reports/{slug}_report.html").write_text(html_report, encoding="utf-8")
    Path(f"reports/{slug}_email.txt").write_text(email_draft, encoding="utf-8")
    Path(f"reports/{slug}_analysis.json").write_text(json.dumps(analysis, indent=2), encoding="utf-8")

    print(text_report)
    print("\n📧  EMAIL DRAFT")
    print("=" * 72)
    print(email_draft)
    print("\n✅  Files saved to reports/")
    print(f"    • {slug}_report.txt")
    print(f"    • {slug}_report.html  ← open in browser → Cmd+P → Save as PDF")
    print(f"    • {slug}_email.txt")
    print(f"    • {slug}_analysis.json")


if __name__ == "__main__":
    main()