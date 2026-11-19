"""
Contract & Policy Analyzer API
Uses Anthropic Claude to analyze contracts and generate professional client reports.
"""
 
import anthropic
import json
import re
from datetime import datetime
from pathlib import Path
 
 
# ─────────────────────────────────────────────
#  Core Analysis Engine
# ─────────────────────────────────────────────
 
def analyze_contract(text: str, document_name: str = "Contract") -> dict:
    """
    Send contract text to Claude and receive structured analysis.
    Returns a dict with all analysis sections.
    """
    client = anthropic.Anthropic()
 
    system_prompt = """You are an expert contract and legal document analyst with deep knowledge of 
contract law, risk management, and business compliance. Your role is to analyze contracts and 
policies objectively and thoroughly.
 
Always respond with ONLY valid JSON matching this exact structure:
{
  "document_type": "string (e.g., Service Agreement, NDA, Employment Contract, etc.)",
  "executive_summary": "string (2-4 sentence high-level overview)",
  "key_parties": [
    {"name": "Party Name", "role": "Role/Description"}
  ],
  "effective_date": "string or null",
  "expiration_date": "string or null",
  "key_terms": [
    {"term": "Term Name", "description": "Brief explanation"}
  ],
  "obligations": {
    "party_a": ["obligation 1", "obligation 2"],
    "party_b": ["obligation 1", "obligation 2"]
  },
  "financial_terms": [
    {"item": "Item name", "detail": "Details"}
  ],
  "flaws_and_risks": [
    {
      "severity": "HIGH | MEDIUM | LOW",
      "category": "Category (e.g., Ambiguity, Missing Clause, Liability, etc.)",
      "issue": "Clear description of the issue",
      "recommendation": "What to do about it"
    }
  ],
  "warnings": [
    {
      "type": "WARNING | CAUTION | NOTE",
      "message": "Warning message"
    }
  ],
  "missing_clauses": [
    {"clause": "Clause name", "reason": "Why it matters"}
  ],
  "compliance_notes": [
    {"area": "Compliance area", "note": "Details"}
  ],
  "termination_conditions": ["condition 1", "condition 2"],
  "dispute_resolution": "string description or null",
  "governing_law": "string or null",
  "overall_risk_score": "LOW | MEDIUM | HIGH | CRITICAL",
  "overall_risk_explanation": "string",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "positive_aspects": ["positive aspect 1", "positive aspect 2"]
}
 
Be thorough, accurate, and practical. Flag anything that could harm the client."""
 
    user_prompt = f"""Please analyze the following contract/policy document titled "{document_name}":
 
---
{text}
---
 
Provide a complete analysis in the JSON format specified."""
 
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
 
    raw = message.content[0].text.strip()
 
    # Strip markdown code fences if present
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
 
    return json.loads(raw)
 
 
# ─────────────────────────────────────────────
#  Plain-Text Report (print / email body)
# ─────────────────────────────────────────────
 
def generate_text_report(analysis: dict, document_name: str = "Contract") -> str:
    """Generate a clean plain-text report suitable for printing or pasting into an email."""
 
    a = analysis
    now = datetime.now().strftime("%B %d, %Y")
    divider = "=" * 72
    thin = "-" * 72
 
    def section(title: str) -> str:
        return f"\n{divider}\n  {title.upper()}\n{divider}\n"
 
    def risk_icon(level: str) -> str:
        icons = {"HIGH": "[!!!]", "CRITICAL": "[!!!]", "MEDIUM": "[!!]", "LOW": "[i]"}
        return icons.get(level.upper(), "[?]")
 
    lines = []
    lines.append(divider)
    lines.append("  CONTRACT & POLICY ANALYSIS REPORT")
    lines.append(f"  Document: {document_name}")
    lines.append(f"  Report Date: {now}")
    lines.append(f"  Document Type: {a.get('document_type', 'Unknown')}")
    lines.append(f"  Overall Risk: {a.get('overall_risk_score', 'N/A')}")
    lines.append(divider)
 
    # Executive Summary
    lines.append(section("Executive Summary"))
    lines.append(a.get("executive_summary", "N/A"))
 
    # Key Parties
    parties = a.get("key_parties", [])
    if parties:
        lines.append(section("Key Parties"))
        for p in parties:
            lines.append(f"  • {p.get('name', '?')} — {p.get('role', '')}")
 
    # Important Dates
    eff = a.get("effective_date")
    exp = a.get("expiration_date")
    if eff or exp:
        lines.append(section("Important Dates"))
        if eff:
            lines.append(f"  Effective Date : {eff}")
        if exp:
            lines.append(f"  Expiration Date: {exp}")
 
    # Financial Terms
    fin = a.get("financial_terms", [])
    if fin:
        lines.append(section("Financial Terms"))
        for f in fin:
            lines.append(f"  • {f.get('item', '?')}: {f.get('detail', '')}")
 
    # Key Terms
    terms = a.get("key_terms", [])
    if terms:
        lines.append(section("Key Terms & Definitions"))
        for t in terms:
            lines.append(f"  {t.get('term', '?')}:")
            lines.append(f"    {t.get('description', '')}")
 
    # Obligations
    obls = a.get("obligations", {})
    if obls:
        lines.append(section("Obligations"))
        for party, duties in obls.items():
            lines.append(f"  {party.replace('_', ' ').title()}:")
            for d in duties:
                lines.append(f"    - {d}")
 
    # ── FLAWS & RISKS ──────────────────────────────────────────────────────
    flaws = a.get("flaws_and_risks", [])
    lines.append(section(f"Flaws & Risks ({len(flaws)} identified)"))
    if flaws:
        for i, f in enumerate(flaws, 1):
            sev = f.get("severity", "?").upper()
            lines.append(f"  {i}. {risk_icon(sev)} [{sev}] {f.get('category', '')}")
            lines.append(f"     Issue : {f.get('issue', '')}")
            lines.append(f"     Action: {f.get('recommendation', '')}")
            lines.append("")
    else:
        lines.append("  No significant flaws identified.")
 
    # ── WARNINGS ──────────────────────────────────────────────────────────
    warnings = a.get("warnings", [])
    lines.append(section(f"Warnings & Cautions ({len(warnings)} total)"))
    if warnings:
        for w in warnings:
            wtype = w.get("type", "NOTE")
            lines.append(f"  [{wtype}] {w.get('message', '')}")
    else:
        lines.append("  No warnings flagged.")
 
    # Missing Clauses
    missing = a.get("missing_clauses", [])
    if missing:
        lines.append(section("Missing or Recommended Clauses"))
        for m in missing:
            lines.append(f"  • {m.get('clause', '?')}")
            lines.append(f"    {m.get('reason', '')}")
 
    # Compliance Notes
    compliance = a.get("compliance_notes", [])
    if compliance:
        lines.append(section("Compliance Notes"))
        for c in compliance:
            lines.append(f"  [{c.get('area', '?')}] {c.get('note', '')}")
 
    # Termination
    term_conds = a.get("termination_conditions", [])
    if term_conds:
        lines.append(section("Termination Conditions"))
        for tc in term_conds:
            lines.append(f"  • {tc}")
 
    # Dispute & Law
    dispute = a.get("dispute_resolution")
    gov_law = a.get("governing_law")
    if dispute or gov_law:
        lines.append(section("Legal Framework"))
        if dispute:
            lines.append(f"  Dispute Resolution: {dispute}")
        if gov_law:
            lines.append(f"  Governing Law    : {gov_law}")
 
    # Positives
    positives = a.get("positive_aspects", [])
    if positives:
        lines.append(section("Positive Aspects"))
        for p in positives:
            lines.append(f"  ✓ {p}")
 
    # Recommendations
    recs = a.get("recommendations", [])
    lines.append(section("Recommendations"))
    if recs:
        for i, r in enumerate(recs, 1):
            lines.append(f"  {i}. {r}")
    else:
        lines.append("  No additional recommendations.")
 
    # Overall Risk
    lines.append(section("Overall Risk Assessment"))
    lines.append(f"  Risk Level : {a.get('overall_risk_score', 'N/A')}")
    lines.append(f"  Explanation: {a.get('overall_risk_explanation', '')}")
 
    lines.append(f"\n{divider}")
    lines.append("  END OF REPORT — Generated by Contract Analyzer API")
    lines.append(f"  {now}")
    lines.append(divider)
 
    return "\n".join(lines)
 
 
# ─────────────────────────────────────────────
#  HTML Report (browser / printable PDF)
# ─────────────────────────────────────────────
 
def generate_html_report(analysis: dict, document_name: str = "Contract") -> str:
    """Generate a professional HTML report that can be printed or saved as a PDF."""
 
    a = analysis
    now = datetime.now().strftime("%B %d, %Y")
 
    risk_colors = {
        "LOW": "#27ae60", "MEDIUM": "#f39c12",
        "HIGH": "#e74c3c", "CRITICAL": "#8e44ad",
        "WARNING": "#e74c3c", "CAUTION": "#f39c12", "NOTE": "#3498db"
    }
    risk_score = a.get("overall_risk_score", "MEDIUM").upper()
    score_color = risk_colors.get(risk_score, "#7f8c8d")
 
    def badge(text: str, color: str) -> str:
        return (f'<span style="background:{color};color:#fff;padding:3px 10px;'
                f'border-radius:12px;font-size:12px;font-weight:700;">{text}</span>')
 
    def section_html(title: str, content: str) -> str:
        return f"""
        <div class="section">
          <h2>{title}</h2>
          {content}
        </div>"""
 
    # Build flaws HTML
    flaws_html = ""
    for f in a.get("flaws_and_risks", []):
        sev = f.get("severity", "LOW").upper()
        col = risk_colors.get(sev, "#7f8c8d")
        flaws_html += f"""
        <div class="risk-card" style="border-left:5px solid {col}">
          {badge(sev, col)} <strong style="margin-left:8px">{f.get('category','')}</strong>
          <p style="margin:8px 0 4px"><strong>Issue:</strong> {f.get('issue','')}</p>
          <p style="margin:4px 0;color:#27ae60"><strong>Recommendation:</strong> {f.get('recommendation','')}</p>
        </div>"""
 
    # Warnings HTML
    warnings_html = ""
    for w in a.get("warnings", []):
        wtype = w.get("type", "NOTE").upper()
        col = risk_colors.get(wtype, "#3498db")
        warnings_html += f"""
        <div class="risk-card" style="border-left:5px solid {col}">
          {badge(wtype, col)} <span style="margin-left:8px">{w.get('message','')}</span>
        </div>"""
 
    # Parties HTML
    parties_html = "".join(
        f'<tr><td><strong>{p.get("name","?")}</strong></td><td>{p.get("role","")}</td></tr>'
        for p in a.get("key_parties", [])
    )
 
    # Financial HTML
    fin_html = "".join(
        f'<tr><td><strong>{f.get("item","?")}</strong></td><td>{f.get("detail","")}</td></tr>'
        for f in a.get("financial_terms", [])
    )
 
    # Missing clauses
    missing_html = "".join(
        f'<li><strong>{m.get("clause","?")}</strong>: {m.get("reason","")}</li>'
        for m in a.get("missing_clauses", [])
    )
 
    # Recommendations
    recs_html = "".join(
        f'<li>{r}</li>' for r in a.get("recommendations", [])
    )
 
    # Positives
    pos_html = "".join(
        f'<li style="color:#27ae60">✓ {p}</li>' for p in a.get("positive_aspects", [])
    )
 
    # Key terms
    terms_html = "".join(
        f'<dt><strong>{t.get("term","?")}</strong></dt><dd style="margin-bottom:8px">{t.get("description","")}</dd>'
        for t in a.get("key_terms", [])
    )
 
    # Obligations
    obls = a.get("obligations", {})
    obls_html = ""
    for party, duties in obls.items():
        obls_html += f'<h4>{party.replace("_"," ").title()}</h4><ul>'
        for d in duties:
            obls_html += f'<li>{d}</li>'
        obls_html += '</ul>'
 
    # Termination
    term_html = "".join(
        f'<li>{tc}</li>' for tc in a.get("termination_conditions", [])
    )
 
    # Compliance
    comp_html = "".join(
        f'<li><strong>[{c.get("area","?")}]</strong> {c.get("note","")}</li>'
        for c in a.get("compliance_notes", [])
    )
 
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contract Analysis: {document_name}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Georgia', serif;
    font-size: 14px;
    color: #2c3e50;
    background: #f4f6f9;
    padding: 30px;
  }}
  .report-wrapper {{ max-width: 900px; margin: 0 auto; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,.12); }}
  .header {{
    background: linear-gradient(135deg, #1a2a4a, #2e4a8a);
    color: #fff;
    padding: 40px;
  }}
  .header h1 {{ font-size: 26px; margin-bottom: 6px; }}
  .header .meta {{ opacity: .8; font-size: 13px; margin-top: 4px; }}
  .risk-badge {{
    display: inline-block;
    background: {score_color};
    color: #fff;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 15px;
    margin-top: 14px;
  }}
  .body-content {{ padding: 30px 40px; }}
  .section {{ margin-bottom: 34px; border-bottom: 1px solid #ecf0f1; padding-bottom: 28px; }}
  .section:last-child {{ border-bottom: none; }}
  h2 {{
    font-size: 16px;
    color: #1a2a4a;
    margin-bottom: 14px;
    padding-bottom: 6px;
    border-bottom: 2px solid #2e4a8a;
    text-transform: uppercase;
    letter-spacing: .8px;
  }}
  h4 {{ margin: 10px 0 6px; color: #34495e; }}
  p {{ line-height: 1.7; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 8px; }}
  th {{ background: #2e4a8a; color: #fff; padding: 9px 12px; text-align: left; font-size: 12px; }}
  td {{ padding: 9px 12px; border-bottom: 1px solid #ecf0f1; vertical-align: top; }}
  tr:nth-child(even) td {{ background: #f8f9fa; }}
  .risk-card {{
    background: #fafafa;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 12px;
    border-left: 5px solid #ccc;
  }}
  ul, ol {{ padding-left: 20px; line-height: 2; }}
  dl {{ padding-left: 10px; }}
  .summary-box {{
    background: #eaf0fb;
    border-left: 4px solid #2e4a8a;
    padding: 16px 20px;
    border-radius: 4px;
    line-height: 1.8;
  }}
  .legal-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
  .legal-item {{ background: #f4f6f9; padding: 14px; border-radius: 6px; }}
  .legal-item label {{ font-size: 11px; text-transform: uppercase; color: #7f8c8d; display: block; }}
  .legal-item span {{ font-size: 14px; font-weight: 600; }}
  .footer {{
    background: #1a2a4a;
    color: rgba(255,255,255,.6);
    text-align: center;
    padding: 20px;
    font-size: 12px;
  }}
  @media print {{
    body {{ background: #fff; padding: 0; }}
    .report-wrapper {{ box-shadow: none; }}
  }}
</style>
</head>
<body>
<div class="report-wrapper">
 
  <div class="header">
    <div style="font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:1px">Contract Analysis Report</div>
    <h1>{document_name}</h1>
    <div class="meta">Document Type: {a.get('document_type','Unknown')} &nbsp;|&nbsp; Report Date: {now}</div>
    <div class="risk-badge">Overall Risk: {risk_score}</div>
  </div>
 
  <div class="body-content">
 
    {section_html("Executive Summary", f'<div class="summary-box">{a.get("executive_summary","N/A")}</div>')}
 
    {section_html("Key Parties", f'<table><thead><tr><th>Party</th><th>Role</th></tr></thead><tbody>{parties_html}</tbody></table>') if parties_html else ""}
 
    {section_html("Important Dates", f'<div class="legal-grid"><div class="legal-item"><label>Effective Date</label><span>{a.get("effective_date","Not specified")}</span></div><div class="legal-item"><label>Expiration Date</label><span>{a.get("expiration_date","Not specified")}</span></div></div>')}
 
    {section_html("Financial Terms", f'<table><thead><tr><th>Item</th><th>Details</th></tr></thead><tbody>{fin_html}</tbody></table>') if fin_html else ""}
 
    {section_html("Key Terms & Definitions", f'<dl>{terms_html}</dl>') if terms_html else ""}
 
    {section_html("Obligations", obls_html) if obls_html else ""}
 
    {section_html(f"Flaws & Risks ({len(a.get('flaws_and_risks',[]))} identified)", flaws_html if flaws_html else "<p>No significant flaws identified.</p>")}
 
    {section_html(f"Warnings & Cautions ({len(a.get('warnings',[]))} total)", warnings_html if warnings_html else "<p>No warnings flagged.</p>")}
 
    {section_html("Missing / Recommended Clauses", f'<ul>{missing_html}</ul>') if missing_html else ""}
 
    {section_html("Compliance Notes", f'<ul>{comp_html}</ul>') if comp_html else ""}
 
    {section_html("Termination Conditions", f'<ul>{term_html}</ul>') if term_html else ""}
 
    {section_html("Legal Framework", f'<div class="legal-grid"><div class="legal-item"><label>Dispute Resolution</label><span>{a.get("dispute_resolution","Not specified")}</span></div><div class="legal-item"><label>Governing Law</label><span>{a.get("governing_law","Not specified")}</span></div></div>')}
 
    {section_html("Positive Aspects", f'<ul>{pos_html}</ul>') if pos_html else ""}
 
    {section_html("Recommendations", f'<ol>{recs_html}</ol>') if recs_html else ""}
 
    <div class="section">
      <h2>Overall Risk Assessment</h2>
      <div class="risk-card" style="border-left:5px solid {score_color}">
        <strong style="color:{score_color}">Risk Level: {risk_score}</strong>
        <p style="margin-top:8px">{a.get("overall_risk_explanation","")}</p>
      </div>
    </div>
 
  </div>
 
  <div class="footer">
    Contract Analyzer API &nbsp;|&nbsp; {now} &nbsp;|&nbsp; This report is generated by AI and does not constitute legal advice.
  </div>
</div>
</body>
</html>"""
 
    return html
 
 
# ─────────────────────────────────────────────
#  Email Draft
# ─────────────────────────────────────────────
 
def generate_email_draft(analysis: dict, document_name: str = "Contract",
                         client_name: str = "Valued Client",
                         sender_name: str = "Your Attorney / Advisor") -> str:
    """Generate a client-ready email with the key findings."""
 
    a = analysis
    risk = a.get("overall_risk_score", "MEDIUM")
    flaws = a.get("flaws_and_risks", [])
    high_flaws = [f for f in flaws if f.get("severity", "").upper() in ("HIGH", "CRITICAL")]
    recs = a.get("recommendations", [])
    now = datetime.now().strftime("%B %d, %Y")
 
    warnings_line = ""
    if high_flaws:
        issues = "; ".join(f['category'] for f in high_flaws[:3])
        warnings_line = f"\n⚠️  HIGH PRIORITY ISSUES: {issues}\n"
 
    rec_list = "\n".join(f"   {i+1}. {r}" for i, r in enumerate(recs[:5]))
 
    return f"""Subject: Contract Analysis Report – {document_name} [{now}]
 
Dear {client_name},
 
Please find below a summary of my analysis of the "{document_name}" document.
 
OVERALL RISK ASSESSMENT: {risk}
{warnings_line}
EXECUTIVE SUMMARY
─────────────────
{a.get('executive_summary', 'N/A')}
 
CRITICAL FINDINGS
─────────────────
{"No high-severity issues found." if not high_flaws else chr(10).join(f"• [{f['severity']}] {f['category']}: {f['issue']}" for f in high_flaws)}
 
KEY RECOMMENDATIONS
───────────────────
{rec_list if rec_list else "   No additional recommendations at this time."}
 
A full detailed report is attached (or available upon request), including:
  • Complete risk analysis with all identified flaws
  • Missing clause recommendations
  • Compliance notes
  • All obligations and financial terms
 
Please do not sign or execute this agreement until we have discussed these findings.
I am available at your earliest convenience to walk through the report in detail.
 
Warm regards,
{sender_name}
 
─────────────────────────────────────────────
DISCLAIMER: This analysis is provided for informational purposes and does not 
constitute legal advice. Please consult a licensed attorney for legal guidance.
─────────────────────────────────────────────
"""
 
 
# ─────────────────────────────────────────────
#  Save Outputs
# ─────────────────────────────────────────────
 
def save_report(content: str, filename: str):
    """Save report content to a file."""
    path = Path(filename)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  ✓ Saved: {filename}")
 
 
# ─────────────────────────────────────────────
#  Main API Entry Point
# ─────────────────────────────────────────────
 
def analyze_and_report(
    contract_text: str,
    document_name: str = "Contract",
    output_dir: str = "reports",
    client_name: str = "Valued Client",
    sender_name: str = "Your Advisor",
    save_files: bool = True,
    print_report: bool = True,
) -> dict:
    """
    Full pipeline: analyze contract → generate all report formats.
 
    Returns:
        {
          "analysis": dict,          # raw JSON analysis
          "text_report": str,        # plain text
          "html_report": str,        # HTML (printable)
          "email_draft": str,        # ready-to-send email
        }
    """
    print(f"\n🔍  Analyzing: {document_name}")
    print("    Sending to Claude API…")
 
    analysis = analyze_contract(contract_text, document_name)
    risk = analysis.get("overall_risk_score", "UNKNOWN")
    print(f"    ✓ Analysis complete — Risk: {risk}")
 
    text_report = generate_text_report(analysis, document_name)
    html_report = generate_html_report(analysis, document_name)
    email_draft = generate_email_draft(analysis, document_name, client_name, sender_name)
 
    slug = re.sub(r'[^\w\s-]', '', document_name).strip().replace(' ', '_')
 
    if save_files:
        print(f"\n💾  Saving reports to '{output_dir}/'…")
        save_report(text_report, f"{output_dir}/{slug}_report.txt")
        save_report(html_report, f"{output_dir}/{slug}_report.html")
        save_report(email_draft, f"{output_dir}/{slug}_email.txt")
        save_report(json.dumps(analysis, indent=2), f"{output_dir}/{slug}_analysis.json")
 
    if print_report:
        print("\n" + text_report)
 
    return {
        "analysis": analysis,
        "text_report": text_report,
        "html_report": html_report,
        "email_draft": email_draft,
    }