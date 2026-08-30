import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT

def generate_innovation_summary_pdf(output_path):
    # Standard 1-inch (72pt) margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Exact required format:
    # Font: Times-Roman (Times New Roman)
    # Font Size: 12
    # 1.5 Line Spacing (12 * 1.5 = 18 pt leading)
    # Justified Alignment

    PRIMARY = colors.HexColor("#002147")
    DARK_TEXT = colors.HexColor("#0f172a")

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Times-Bold',
        fontSize=15,
        leading=20,
        alignment=TA_CENTER,
        textColor=PRIMARY,
        spaceAfter=4
    )

    inst_style = ParagraphStyle(
        'InstHeader',
        fontName='Times-Roman',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Times-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=PRIMARY
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Times-Roman',
        fontSize=10.5,
        leading=14.5,
        textColor=DARK_TEXT
    )

    section_heading = ParagraphStyle(
        'SectionHead',
        fontName='Times-Bold',
        fontSize=12.5,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=6
    )

    body_justified = ParagraphStyle(
        'BodyJustified12pt',
        fontName='Times-Roman',
        fontSize=12,
        leading=18, # 1.5 Line Spacing for 12pt font
        alignment=TA_JUSTIFY,
        textColor=DARK_TEXT,
        spaceAfter=10
    )

    story = []

    # Institution & Document Header
    story.append(Paragraph("<b>MEPCO SCHLENK ENGINEERING COLLEGE, SIVAKASI</b>", title_style))
    story.append(Paragraph("An Autonomous Institution • Department of Information Technology", inst_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=12, spaceBefore=0))

    # Meta Table (Team & Mentor - 3rd Year)
    meta_data = [
        [
            Paragraph("<b>Project Title:</b>", meta_label),
            Paragraph("<b>Smart Beneficiary Mapping System (SBMS)</b>", meta_val)
        ],
        [
            Paragraph("<b>Team Members:</b>", meta_label),
            Paragraph("Karan Raj T, Navis joshva donel J, Srithinesh S (<b>3rd Year B.Tech IT</b>, 2026)", meta_val)
        ],
        [
            Paragraph("<b>Project Mentor:</b>", meta_label),
            Paragraph("Mr. Emerson nithiyaraj E", meta_val)
        ],
        [
            Paragraph("<b>Institution:</b>", meta_label),
            Paragraph("Mepco Schlenk Engineering College, Sivakasi – 626005", meta_val)
        ]
    ]

    t_meta = Table(meta_data, colWidths=[120, 367])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # Innovation Summary Section Header
    story.append(Paragraph("<b>A. Innovation Summary</b>", section_heading))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor("#cbd5e1"), spaceAfter=10, spaceBefore=2))

    # Paragraph 1: Problem Statement & Proposed Solution
    story.append(Paragraph(
        "The <b>Smart Beneficiary Mapping System (SBMS)</b> addresses the severe exclusion of underprivileged citizens from 4,700+ Central and State welfare schemes caused by information asymmetry, complex eligibility rules, and predatory middlemen. SBMS establishes a privacy-first Digital Public Infrastructure that autonomously maps citizens to welfare entitlements using semantic vector search and multimodal AI.",
        body_justified
    ))

    # Paragraph 2: AI, Innovation & Novelty
    story.append(Paragraph(
        "Our core innovation integrates 100% on-premise local AI models (<b>Llama 3</b> for multilingual conversational assistance, <b>Qwen 2.5-Coder</b> for structured rule evaluation, and <b>Qwen 2.5-VL</b> for multimodal document OCR) with <b>pgvector HNSW dense embeddings</b> (<code>all-MiniLM-L6-v2</code>). Unlike static portals like myScheme that mandate tedious 30-step questionnaires, SBMS enables zero-click proactive discovery, scans certificates in a secure Document Vault with automated PII scrubbing (masking Aadhaar/PAN), and dynamically distinguishes between <i>Eligible & Verified</i> and <i>Documents Pending</i> states. It provides direct, verified deep-links to authentic Ministry portals, completely eliminating circular redirects and tout exploitation.",
        body_justified
    ))

    # Paragraph 3: Beneficiaries, Impact & Stage
    story.append(Paragraph(
        "Target beneficiaries include smallholder farmers, low-income families (BPL/EWS), female entrepreneurs, students, senior citizens, and persons with disabilities across all 36 States and Union Territories, alongside government welfare administrators. Expected impact includes maximizing Direct Benefit Transfer (DBT) delivery without leakage, ensuring 100% paperless governance, and accelerating socio-economic inclusion. SBMS is currently at the <b>Working Prototype</b> stage with 4,725 live indexed schemes.",
        body_justified
    ))

    doc.build(story)
    print(f"✅ Generated Innovation Summary PDF strictly following guidelines: {output_path}")

if __name__ == "__main__":
    out_pdf = "/home/karan/Data/Academics/My-project/year-2/Smart_Beneficiary_Mapping_System/SBMS_Innovation_Summary.pdf"
    generate_innovation_summary_pdf(out_pdf)
