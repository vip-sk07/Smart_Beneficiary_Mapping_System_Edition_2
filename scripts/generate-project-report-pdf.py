import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas for dynamic total page count and professional running header/footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return # Skip cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#002147"))

        # Header
        self.drawString(45, A4[1] - 30, "SMART BENEFICIARY MAPPING SYSTEM (SBMS)")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(A4[0] - 45, A4[1] - 30, "Mepco Schlenk Engineering College")
        
        # Header Rule
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.6)
        self.line(45, A4[1] - 34, A4[0] - 45, A4[1] - 34)

        # Footer Rule
        self.line(45, 38, A4[0] - 45, 38)

        # Tricolor mini-accent
        self.setFillColor(colors.HexColor("#FF9933"))
        self.rect(45, 36, 25, 2, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#002147"))
        self.rect(70, 36, 25, 2, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#138808"))
        self.rect(95, 36, 25, 2, fill=1, stroke=0)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(130, 26, "Academic & Technical Project Documentation • Academic Year 2025–2026")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 45, 26, page_text)

        self.restoreState()


def generate_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    PRIMARY = colors.HexColor("#002147")
    SECONDARY = colors.HexColor("#0f4c81")
    ACCENT = colors.HexColor("#FF9933")
    DARK_TEXT = colors.HexColor("#0f172a")
    MUTED_TEXT = colors.HexColor("#475569")
    BORDER_COLOR = colors.HexColor("#cbd5e1")

    # Typography
    h1_style = ParagraphStyle(
        'Header1',
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=DARK_TEXT,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=DARK_TEXT,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.2,
        textColor=DARK_TEXT,
        alignment=0
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.2,
        textColor=PRIMARY,
        alignment=0
    )

    story = []

    # ═════════════════════════════════════════════════════════════
    # PAGE 1: TITLE & COVER
    # ═════════════════════════════════════════════════════════════
    story.append(Spacer(1, 15))
    
    # Tricolor Top Header
    story.append(Table([["", "", ""]], colWidths=[168, 168, 169], rowHeights=6, style=[
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#FF9933")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#FFFFFF")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#138808")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    story.append(Spacer(1, 30))

    story.append(Paragraph("<b>MEPCO SCHLENK ENGINEERING COLLEGE</b>", ParagraphStyle('InstHead', fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=PRIMARY, alignment=1)))
    story.append(Paragraph("An Autonomous Institution • Affiliated to Anna University, Chennai", ParagraphStyle('InstSub', fontName='Helvetica', fontSize=10, leading=14, textColor=MUTED_TEXT, alignment=1)))
    story.append(Paragraph("Sivakasi, Tamil Nadu – 626005", ParagraphStyle('InstLoc', fontName='Helvetica', fontSize=9, leading=12, textColor=MUTED_TEXT, alignment=1)))
    story.append(Spacer(1, 25))

    story.append(HRFlowable(width="60%", thickness=1.5, color=ACCENT, spaceAfter=20, spaceBefore=5))

    story.append(Paragraph("<b>PROJECT DOCUMENTATION & TECHNICAL REPORT</b>", ParagraphStyle('DocType', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=ACCENT, alignment=1, spaceAfter=6)))
    story.append(Paragraph("<b>SMART BENEFICIARY MAPPING SYSTEM (SBMS)</b>", ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=PRIMARY, alignment=1, spaceAfter=10)))
    story.append(Paragraph("An AI-Powered Digital Public Infrastructure for Automated Welfare Scheme Discovery, Document Verification & Direct Citizen Delivery", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=11, leading=15, textColor=MUTED_TEXT, alignment=1, spaceAfter=30)))
    
    # Meta Information Table
    team_data = [
        [Paragraph("<b>PROJECT SPECIFICATIONS & CREDITS</b>", ParagraphStyle('CreditHead', fontName='Helvetica-Bold', fontSize=9.5, textColor=PRIMARY)), ""],
        [Paragraph("<b>Domain / Category:</b>", table_cell_bold), Paragraph("GovTech, Social Welfare & Digital Public Infrastructure (DPI)", table_cell_style)],
        [Paragraph("<b>Project Team Members:</b>", table_cell_bold), Paragraph("<b>1. Karan Raj T</b><br/><b>2. Navis joshva donel J</b><br/><b>3. Srithinesh S</b>", table_cell_style)],
        [Paragraph("<b>Project Mentor:</b>", table_cell_bold), Paragraph("<b>Mr. Emerson nithiyaraj E</b>", table_cell_style)],
        [Paragraph("<b>Institution:</b>", table_cell_bold), Paragraph("Mepco Schlenk Engineering College, Sivakasi", table_cell_style)],
        [Paragraph("<b>Academic Year:</b>", table_cell_bold), Paragraph("Year 2 / Academic Period 2025–2026", table_cell_style)],
        [Paragraph("<b>Live Database Scale:</b>", table_cell_bold), Paragraph("4,725 Official Government Schemes Indexed across 36 Indian States & UTs", table_cell_style)],
        [Paragraph("<b>Development Status:</b>", table_cell_bold), Paragraph("Fully Functional Working Prototype (Next.js 16 + pgvector + Local Ollama AI)", table_cell_style)],
    ]

    t_team = Table(team_data, colWidths=[150, 355])
    t_team.setStyle(TableStyle([
        ('SPAN', (0,0), (1,0)),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#ffffff")),
    ]))
    story.append(t_team)

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════
    # PAGE 2: ABSTRACT, PROBLEMS & CORE MODULES
    # ═════════════════════════════════════════════════════════════
    story.append(Paragraph("1. Executive Summary & Abstract", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))
    story.append(Paragraph(
        "The <b>Smart Beneficiary Mapping System (SBMS)</b> is a privacy-first Digital Public Infrastructure platform designed to solve the critical information and bureaucratic hurdles in India's public welfare ecosystem. While the Government of India operates over <b>4,700+ Central and State welfare schemes</b> allocating hundreds of billions annually, millions of eligible rural, underprivileged, and marginalized citizens remain excluded due to fragmented departmental websites, complex eligibility criteria, language barriers, and predatory middlemen.",
        body_style
    ))
    story.append(Paragraph(
        "SBMS replaces tedious 30-step questionnaire wizards with <b>Zero-Click Semantic Vector Matching (pgvector)</b> and <b>Multimodal Local Vision AI (Qwen 2.5-VL)</b>. Citizens set up their profile once; the local AI extracts verified data from certificates, cross-references eligibility rules, and classifies schemes as <i>Eligible & Verified</i> or <i>Documents Pending</i> with direct links to official Ministry portals.",
        body_style
    ))

    story.append(Paragraph("2. Problem Statement & Ground Challenges", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))
    problems = [
        ("Information Asymmetry & Portal Fragmentation:", "Citizens struggle to navigate hundreds of disjointed State and Central websites with complex, unstandardized guidelines."),
        ("Middlemen Exploitation & Financial Leakage:", "Illiterate and rural beneficiaries frequently pay bribes to touts just to discover and apply for entitlements."),
        ("Document Verification Bottlenecks:", "Applications get rejected arbitrarily because citizens are unaware of exact missing certificates or expiry dates."),
        ("Data Sovereignty & Cloud AI Risks:", "Existing third-party tools leak sensitive citizen PII (Aadhaar, income) to commercial cloud AI vendors.")
    ]
    for title, desc in problems:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", bullet_style))

    story.append(Paragraph("3. Key System Modules & Innovations", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))

    modules_data = [
        [Paragraph("<b>Module</b>", table_header_style), Paragraph("<b>Technical Functionality & Innovation</b>", table_header_style)],
        [
            Paragraph("<b>1. Semantic RAG Vector Engine</b>", table_cell_bold),
            Paragraph("Converts citizen profiles into 384-dimensional dense vector embeddings using <code>all-MiniLM-L6-v2</code>. Executes cosine similarity over <code>pgvector</code> HNSW indexes to instantly rank all 4,725 schemes.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Multimodal Vision Document Vault</b>", table_cell_bold),
            Paragraph("Local <code>Qwen 2.5-VL (3B)</code> vision model scans Aadhaar, Income, Caste, and Domicile certificates. Auto-extracts certified parameters with automated PII scrubbing (masking Aadhaar/PAN).", table_cell_style)
        ],
        [
            Paragraph("<b>3. Document-Aware Verification</b>", table_cell_bold),
            Paragraph("Cross-checks scheme mandatory checklists against the citizen's Document Vault. Accurately flags <i>Eligible & Verified</i> vs <i>Documents Pending</i> with missing document alerts.", table_cell_style)
        ],
        [
            Paragraph("<b>4. 100% Direct Official Deep-Linking</b>", table_cell_bold),
            Paragraph("Eliminates circular redirect loops by routing citizens straight to authentic Ministry application portals (StandUp Mitra, Saral Haryana, NSP, Shiksha CG).", table_cell_style)
        ],
        [
            Paragraph("<b>5. Admin Review & Redressal Suite</b>", table_cell_bold),
            Paragraph("Enables welfare officers to inspect high-resolution applicant certificates, approve/reject applications with official remarks, and resolve citizen grievances.", table_cell_style)
        ]
    ]

    t_mod = Table(modules_data, colWidths=[150, 355])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.8, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_mod)

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════
    # PAGE 3: TECH ARCHITECTURE & COMPARATIVE BENCHMARK
    # ═════════════════════════════════════════════════════════════
    story.append(Paragraph("4. Technical Architecture & Technology Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))

    tech_data = [
        [Paragraph("<b>Layer</b>", table_header_style), Paragraph("<b>Technologies & Models Deployed</b>", table_header_style), Paragraph("<b>Key Role in SBMS</b>", table_header_style)],
        [Paragraph("<b>Frontend UI/UX</b>", table_cell_bold), Paragraph("Next.js 16 (React 19), Tailwind CSS, Framer Motion", table_cell_style), Paragraph("Classical myScheme-inspired accessible Indian government UI", table_cell_style)],
        [Paragraph("<b>Backend & Auth</b>", table_cell_bold), Paragraph("Node.js, Next.js Server Actions, NextAuth.js v5 (OIDC + Credentials)", table_cell_style), Paragraph("REST APIs, role-based access control, session management", table_cell_style)],
        [Paragraph("<b>Database & Vector Store</b>", table_cell_bold), Paragraph("PostgreSQL (Podman) + <code>pgvector</code> extension with HNSW Index", table_cell_style), Paragraph("High-dimensional semantic vector search over 4,725 schemes", table_cell_style)],
        [Paragraph("<b>Local LLM Engine</b>", table_cell_bold), Paragraph("Ollama: <code>Llama 3:latest</code> & <code>Qwen 2.5-Coder:7b</code>", table_cell_style), Paragraph("Multilingual citizen conversational assistance & structured JSON reasoning", table_cell_style)],
        [Paragraph("<b>Multimodal Vision OCR</b>", table_cell_bold), Paragraph("<code>Qwen 2.5-VL:3b</code> (Ollama Vision)", table_cell_style), Paragraph("On-premise document OCR and parameter extraction", table_cell_style)],
        [Paragraph("<b>Embedding Pipeline</b>", table_cell_bold), Paragraph("<code>@xenova/transformers</code> (<code>all-MiniLM-L6-v2</code>)", table_cell_style), Paragraph("Local 384-dimensional dense semantic embedding generation", table_cell_style)],
        [Paragraph("<b>Security & Privacy</b>", table_cell_bold), Paragraph("Automated Regex PII Scrubber (Aadhaar/PAN), Token Rate Limiting", table_cell_style), Paragraph("Zero cloud leakage, UIDAI & DPDP Act compliance", table_cell_style)],
    ]

    t_tech = Table(tech_data, colWidths=[105, 200, 200])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.8, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_tech)

    story.append(Paragraph("5. Comparative Benchmark: SBMS vs myScheme.gov.in", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))

    comp_data = [
        [Paragraph("<b>Evaluation Dimension</b>", table_header_style), Paragraph("<b>🏛️ Official myScheme.gov.in Portal</b>", table_header_style), Paragraph("<b>🚀 SBMS Platform (Our Innovation)</b>", table_header_style)],
        [
            Paragraph("<b>Eligibility Discovery</b>", table_cell_bold),
            Paragraph("Forces users through a tedious 20-30 question questionnaire every session.", table_cell_style),
            Paragraph("<b>Zero-Click Semantic RAG:</b> Real-time match scores via local pgvector embeddings.", table_cell_style)
        ],
        [
            Paragraph("<b>Document Intelligence</b>", table_cell_bold),
            Paragraph("Static text checklist only; no document storage, OCR, or verification.", table_cell_style),
            Paragraph("<b>AI Document Vault:</b> Local Qwen 2.5-VL extracts data, checks validity, and verifies proofs.", table_cell_style)
        ],
        [
            Paragraph("<b>Eligibility Accuracy</b>", table_cell_bold),
            Paragraph("Binary lists without checking if user actually holds required certificates.", table_cell_style),
            Paragraph("<b>Document-Aware States:</b> Distinguishes between <i>Eligible & Verified</i> and <i>Docs Pending</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>Application Links</b>", table_cell_bold),
            Paragraph("Frequent circular redirection loops back to the myScheme search page.", table_cell_style),
            Paragraph("<b>100% Direct Official Deep-Links</b> to genuine Central & State application portals.", table_cell_style)
        ],
        [
            Paragraph("<b>Conversational AI</b>", table_cell_bold),
            Paragraph("Rule-based scripted bot with rigid keyword responses.", table_cell_style),
            Paragraph("<b>Local Llama 3 BenefitBot:</b> Natural language conversational guidance with RAG citations.", table_cell_style)
        ],
        [
            Paragraph("<b>Administration Suite</b>", table_cell_bold),
            Paragraph("Citizen discovery directory only; no officer review dashboard.", table_cell_style),
            Paragraph("<b>Full E-Governance Dashboard:</b> Officers review high-res proofs and approve/reject applications.", table_cell_style)
        ],
        [
            Paragraph("<b>Data Sovereignty</b>", table_cell_bold),
            Paragraph("Centralized cloud web application.", table_cell_style),
            Paragraph("<b>100% Local AI & Automated PII Scrubbing:</b> Zero data sent to commercial cloud AI vendors.", table_cell_style)
        ],
    ]

    t_comp = Table(comp_data, colWidths=[110, 195, 200])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.8, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(t_comp)

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════
    # PAGE 4: SDGS, IMPACT, CONCLUSION & ROADMAP
    # ═════════════════════════════════════════════════════════════
    story.append(Paragraph("6. UN Sustainable Development Goals (SDG) Alignment", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))
    sdg_items = [
        ("SDG 1 – No Poverty (Primary Target):", "Connects BPL and low-income families to direct cash transfers (DBT), pensions, and shelter subsidies."),
        ("SDG 10 – Reduced Inequalities (Primary Target):", "Dismantles information asymmetry for marginalized castes (SC/ST/OBC), rural poor, and Divyangjan."),
        ("SDG 16 – Peace, Justice & Strong Institutions (Primary):", "Eliminates corrupt middlemen with direct portal deep-linking and provides citizen grievance redressal."),
        ("SDG 9 – Industry, Innovation & Infrastructure:", "Establishes modern Digital Public Infrastructure leveraging dense vector embeddings and on-premise vision AI."),
        ("SDG 8 & SDG 5 – Economic Growth & Gender Equality:", "Maps youth and women to MSME capital (Mudra, Stand-Up India) and maternity/education assistance.")
    ]
    for title, desc in sdg_items:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", bullet_style))

    story.append(Paragraph("7. Multi-Dimensional Impact Analysis", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))
    story.append(Paragraph("• <b>Economic Impact:</b> Ensures 100% DBT fund delivery without middleman leakage, accelerates MSME/farmer capital infusion, and eliminates citizen travel and paperwork expenses.<br/>• <b>Social Impact:</b> Empowers vulnerable demographics (women, disabled, senior citizens), improves scholarship retention for students, and provides transparent grievance redressal.<br/>• <b>Environmental Impact:</b> Delivers a 100% paperless digital verification workflow and actively promotes green subsidies (PM Surya Ghar Solar Rooftop and PM-KUSUM Solar Pumps).", bullet_style))

    story.append(Paragraph("8. Conclusion & Future Roadmap", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6))
    story.append(Paragraph(
        "The <b>Smart Beneficiary Mapping System (SBMS)</b> demonstrates how modern Artificial Intelligence, dense vector embeddings, and on-premise multimodal vision can be harmonized to construct secure, accessible, and citizen-first Digital Public Infrastructure. By transforming static government directories into proactive, zero-click, document-verified welfare pipelines, SBMS ensures that no eligible citizen is left behind.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Future Roadmap:</b> <b>(1) Voice-First Telephony (IVR):</b> Integrating AI4Bharat IndicWav2Vec for toll-free speech discovery by non-literate citizens. <b>(2) DigiLocker Federation:</b> Direct federated pulling of digital certificates via national APIs. <b>(3) Offline PWA Sync:</b> Local synchronization for rural Common Service Centers.",
        bullet_style
    ))

    story.append(Spacer(1, 15))

    # Academic Endorsement Signatures Box
    sig_data = [
        [
            Paragraph("<b>Project Team Members</b><br/><br/><br/>_______________________<br/><b>Karan Raj T</b><br/><b>Navis joshva donel J</b><br/><b>Srithinesh S</b>", table_cell_style),
            Paragraph("<b>Project Mentor</b><br/><br/><br/>_______________________<br/><b>Mr. Emerson nithiyaraj E</b><br/>Department of Information Technology", table_cell_style),
            Paragraph("<b>Head of Department / Institution</b><br/><br/><br/>_______________________<br/><b>Mepco Schlenk Engineering College</b><br/>Sivakasi – 626005", table_cell_style)
        ]
    ]
    t_sig = Table(sig_data, colWidths=[170, 170, 165])
    t_sig.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.8, BORDER_COLOR),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_sig)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Generated crisp 4-page PDF: {output_filename}")

if __name__ == "__main__":
    output_path = "/home/karan/Data/Academics/My-project/year-2/Smart_Beneficiary_Mapping_System/Smart_Beneficiary_Mapping_System_Project_Report.pdf"
    generate_pdf(output_path)
