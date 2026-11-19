from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT = Path(__file__).resolve().parent
BLUE = RGBColor(46, 116, 181)
DARK_BLUE = RGBColor(31, 77, 120)
INK = RGBColor(24, 20, 16)
MUTED = RGBColor(100, 92, 84)
FILL = "E8EEF5"
LIGHT_FILL = "F6F8FA"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    mar = tc_pr.first_child_found_in("w:tcMar")
    if mar is None:
        mar = OxmlElement("w:tcMar")
        tc_pr.append(mar)
    for m, v in {"top": top, "start": start, "bottom": bottom, "end": end}.items():
        node = mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_width(table, widths):
    table.autofit = False
    for row in table.rows:
        for idx, width in enumerate(widths):
            cell = row.cells[idx]
            cell.width = Inches(width)
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(int(width * 1440)))
            tc_w.set(qn("w:type"), "dxa")
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def set_run_font(run, size=None, color=None, bold=None):
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    if size:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color
    if bold is not None:
        run.bold = bold


def configure_doc(title, subtitle):
    doc = Document()
    section = doc.sections[0]
    for attr in ("top_margin", "right_margin", "bottom_margin", "left_margin"):
        setattr(section, attr, Inches(1))
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.font.color.rgb = INK
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    for name, size, color, before, after in [
        ("Heading 1", 16, BLUE, 18, 10),
        ("Heading 2", 13, BLUE, 14, 7),
        ("Heading 3", 12, DARK_BLUE, 10, 5),
    ]:
        style = styles[name]
        style.font.name = "Calibri"
        style.font.size = Pt(size)
        style.font.color.rgb = color
        style.font.bold = True
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    header = section.header.paragraphs[0]
    header.text = "GROUND | Meeting Package"
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header.runs[0].font.size = Pt(9)
    header.runs[0].font.color.rgb = MUTED

    footer = section.footer.paragraphs[0]
    footer.text = "Prototype discussion materials - not legal, tax, or financial advice"
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.runs[0].font.size = Pt(8)
    footer.runs[0].font.color.rgb = MUTED

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(title)
    set_run_font(r, 24, INK, True)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run(subtitle)
    set_run_font(r, 12, MUTED)

    return doc


def add_lead(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(text)
    set_run_font(r, 12, DARK_BLUE, True)


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        p.add_run(item)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        p.add_run(item)


def add_table(doc, headers, rows, widths):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    set_table_width(table, widths)
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        set_cell_shading(hdr[i], FILL)
        p = hdr[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(h)
        set_run_font(run, 10.5, DARK_BLUE, True)

    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            if i == 0:
                set_cell_shading(cells[i], LIGHT_FILL)
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            set_run_font(run, 10.5, INK, i == 0)
    set_table_width(table, widths)
    doc.add_paragraph()
    return table


def save(doc, filename):
    doc.save(OUT / filename)


def capabilities_doc():
    doc = configure_doc(
        "GROUND Capabilities Overview",
        "AI operating tools for independent coffee and hospitality businesses",
    )
    add_lead(
        doc,
        "Ground is a practical AI consulting concept: start with a focused shop audit, deploy one useful tool, then expand only where the owner's data shows a real operating need.",
    )

    doc.add_heading("What Ground Helps With", level=1)
    add_bullets(
        doc,
        [
            "Find avoidable revenue leaks in labor, menu mix, waste, vendor pricing, upselling, and review engagement.",
            "Turn POS exports, menus, reviews, and vendor documents into owner-ready insights.",
            "Create lightweight dashboards and reports that a small team can actually use.",
            "Support better customer service through preference tracking and loyalty triggers.",
            "Package recommendations into specific next actions, not vague AI summaries.",
        ],
    )

    doc.add_heading("Core Capabilities", level=1)
    add_table(
        doc,
        ["Capability", "What it does", "Meeting value"],
        [
            ("Revenue Leak Audit", "Uses a short intake plus benchmark assumptions to estimate where monthly profit may be slipping.", "Fastest proof of value and easiest first pilot."),
            ("Operations Dashboard", "Shows sales trends, rush windows, top items, labor signals, and prep recommendations.", "Gives owners a simple command center."),
            ("Customer Profile Engine", "Stores preferences, visit patterns, likely next order, staff notes, and offer triggers.", "Turns repeat customers into a loyalty system."),
            ("Menu Optimization", "Flags high-margin winners, slow movers, bundle opportunities, and testable price changes.", "Improves decisions without a full POS rebuild."),
            ("Sentiment Scanner", "Summarizes reviews into themes, issues, praise, and response or marketing ideas.", "Connects customer voice to operations."),
            ("Vendor Contract Analyzer", "Reviews contracts or invoices for risky terms, unclear renewals, and negotiation points.", "Creates leverage before signing or renewing."),
        ],
        [1.7, 3.0, 1.8],
    )

    doc.add_heading("Data Needed For A Pilot", level=1)
    add_bullets(
        doc,
        [
            "Recent POS export or weekly sales summary.",
            "Current menu with prices and core product categories.",
            "Basic staffing pattern or schedule template.",
            "Links to Google, Yelp, Facebook, or other review sources.",
            "One supplier invoice, service agreement, or vendor contract if procurement is in scope.",
        ],
    )

    doc.add_heading("Recommended First Offer", level=1)
    add_lead(doc, "14-day Ground Snapshot Pilot")
    add_bullets(
        doc,
        [
            "Deliver a revenue leak audit, owner dashboard snapshot, and top 5 action plan.",
            "Include one optional add-on demo: sentiment report, customer profile engine, or vendor analyzer.",
            "Close the pilot with a decision meeting: keep, improve, expand, or stop.",
        ],
    )
    save(doc, "GROUND_Capabilities_Overview.docx")


def quick_start_doc():
    doc = configure_doc(
        "GROUND Quick Start Plan",
        "A practical path to get the first version running soon",
    )
    add_lead(
        doc,
        "The fastest credible launch is not a full platform. It is a clear pilot that solves one owner problem, uses data already available, and creates a concrete next decision.",
    )

    doc.add_heading("Recommended Launch Sequence", level=1)
    add_table(
        doc,
        ["Phase", "Target timing", "Output"],
        [
            ("1. Intake", "Day 1-2", "Collect POS export, menu, review links, basic labor pattern, and owner pain points."),
            ("2. Baseline", "Day 3-5", "Run revenue leak audit and create a first dashboard snapshot."),
            ("3. Pilot tool", "Day 6-10", "Launch one usable module: dashboard, sentiment report, customer profiles, or vendor analyzer."),
            ("4. Review", "Day 11-14", "Meet with owner, review findings, and choose the next paid scope."),
        ],
        [1.45, 1.25, 3.8],
    )

    doc.add_heading("What To Say In Tomorrow's Meeting", level=1)
    add_numbered(
        doc,
        [
            "Open with the business problem: independent shops have data but rarely have time to turn it into decisions.",
            "Show the improved website first so the offer feels clear.",
            "Walk through the revenue leak audit because it is the easiest owner-facing entry point.",
            "Show one deeper demo based on what they care about most: dashboard, customers, reviews, or vendors.",
            "Ask for permission to run a 14-day pilot with one data export and one decision meeting at the end.",
        ],
    )

    doc.add_heading("Pilot Scope To Keep It Manageable", level=1)
    add_bullets(
        doc,
        [
            "One location.",
            "One owner or manager as the main contact.",
            "One primary outcome: revenue clarity, staffing clarity, customer loyalty, review improvement, or vendor risk.",
            "One weekly check-in.",
            "One final action plan with the next 30 days of recommendations.",
        ],
    )

    doc.add_heading("Risks To Avoid", level=1)
    add_bullets(
        doc,
        [
            "Avoid promising a specific cost reduction before seeing the shop's real numbers.",
            "Avoid building too many modules at once.",
            "Avoid positioning Ground as generic AI software. The stronger pitch is operational help plus tailored tools.",
            "Avoid asking for sensitive data before there is a clear reason and trust.",
        ],
    )
    save(doc, "GROUND_Quick_Start_Plan.docx")


def demo_index_doc():
    doc = configure_doc(
        "GROUND Demo Index",
        "A simple guide to the prototype files in this meeting package",
    )
    add_lead(
        doc,
        "Use this index during the meeting to decide which demo to open based on the owner's strongest pain point.",
    )

    doc.add_heading("Demo Files", level=1)
    add_table(
        doc,
        ["File", "Use when the buyer says", "What to show"],
        [
            ("ground_website_improved.html", "I need to understand the whole idea.", "The offer, launch plan, and demo links."),
            ("demos/revenue_leak_audit.html", "I want to know where money is leaking.", "The intake, monthly estimate, and priority recommendations."),
            ("demos/ground_dashboard.html", "I need better visibility into the shop.", "Metrics, charts, top items, and operational signals."),
            ("demos/ground_customer_engine.html", "We want more repeat customers.", "Preference profiles, offers, staff notes, and loyalty triggers."),
            ("demos/comma_cafe_sentiment_report.html", "Reviews matter, but we do not have time to read all of them.", "Themes, opportunities, competitive context, and next steps."),
            ("demos/contract_analyzer.py", "Vendors and agreements are hard to evaluate.", "Explain that this reads contracts and creates risk reports."),
        ],
        [2.0, 2.15, 2.35],
    )

    doc.add_heading("Recommended Demo Order", level=1)
    add_numbered(
        doc,
        [
            "Open the improved website and explain Ground in one minute.",
            "Open the revenue leak audit because it is interactive and easy to understand.",
            "Ask which pain is most urgent: staffing, customers, reviews, menu, or vendors.",
            "Open one matching deeper demo.",
            "Close with the 14-day pilot ask.",
        ],
    )

    doc.add_heading("Meeting Close", level=1)
    add_lead(doc, "Suggested close: Let me run a small Ground Snapshot for one location. I only need a POS export, the menu, review links, and a short owner interview. In two weeks, I will bring back the dashboard snapshot and top priorities so we can decide what is worth building next.")
    save(doc, "GROUND_Demo_Index.docx")


if __name__ == "__main__":
    capabilities_doc()
    quick_start_doc()
    demo_index_doc()
    print("Created meeting documents in", OUT)
