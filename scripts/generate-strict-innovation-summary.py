import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT

def generate_strict_innovation_summary(output_filename):
    # Standard 1 inch (72 pt) margins on A4
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=72,
        rightMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    # Styles strictly matching:
    # - Times New Roman
    # - Font Size 12
    # - 1.5 Line Spacing (18pt leading)
    # - Justified Alignment
    
    title_style = ParagraphStyle(
        'MainTitle',
        fontName='Times-Bold',
        fontSize=14,
        leading=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#000000"),
        spaceAfter=12
    )

    body_item = ParagraphStyle(
        'BodyJustified12pt',
        fontName='Times-Roman',
        fontSize=12,
        leading=18, # Exactly 1.5 line spacing for 12pt font
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#000000"),
        spaceAfter=10
    )

    story = []

    # Section Header as in prompt
    story.append(Paragraph("<b>A. Innovation Summary</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#000000"), spaceAfter=14, spaceBefore=0))

    # 1. Project Title
    story.append(Paragraph(
        "<b>Project Title:</b> Smart Beneficiary Mapping System (SBMS)",
        body_item
    ))

    # 2. Problem Statement
    story.append(Paragraph(
        "<b>Problem Statement:</b> Millions of eligible Indian citizens remain excluded from 4,700+ Central and State welfare schemes due to severe information asymmetry, fragmented departmental websites, complex eligibility rules, and predatory middlemen.",
        body_item
    ))

    # 3. Proposed Solution
    story.append(Paragraph(
        "<b>Proposed Solution:</b> SBMS is a privacy-first Digital Public Infrastructure that autonomously maps citizens to welfare entitlements with zero-click proactive matching and direct official portal redirection.",
        body_item
    ))

    # 4. Use of Artificial Intelligence
    story.append(Paragraph(
        "<b>Use of Artificial Intelligence:</b> SBMS integrates 100% on-premise local AI—Llama 3 for multilingual conversational assistance, Qwen 2.5-Coder for structured rule evaluation, Qwen 2.5-VL for multimodal document OCR, and pgvector HNSW dense embeddings (all-MiniLM-L6-v2) for sub-second semantic retrieval.",
        body_item
    ))

    # 5. Innovation / Novelty
    story.append(Paragraph(
        "<b>Innovation / Novelty:</b> Replaces tedious 30-step questionnaires with real-time vector matching, provides an AI Document Vault with automated PII scrubbing (masking Aadhaar/PAN), verifies certificates before application (classifying schemes as \"Eligible & Verified\" vs \"Documents Pending\"), and deep-links directly to authentic Ministry portals.",
        body_item
    ))

    # 6. Target Users / Beneficiaries
    story.append(Paragraph(
        "<b>Target Users / Beneficiaries:</b> Smallholder farmers, low-income families (BPL/EWS), female entrepreneurs, students, senior citizens, and persons with disabilities across all 36 States and Union Territories, alongside government welfare officers.",
        body_item
    ))

    # 7. Expected Impact
    story.append(Paragraph(
        "<b>Expected Impact:</b> Eliminates middleman leakage to ensure 100% Direct Benefit Transfer (DBT) delivery, enables paperless digital governance, and accelerates socio-economic inclusion.",
        body_item
    ))

    # 8. Current Development Stage
    story.append(Paragraph(
        "<b>Current Development Stage:</b> Working Prototype with 4,725 live indexed government schemes.",
        body_item
    ))

    doc.build(story)
    print(f"✅ Successfully created strict format PDF: {output_filename}")

if __name__ == "__main__":
    out_file = "/home/karan/Data/Academics/My-project/year-2/Smart_Beneficiary_Mapping_System/SBMS_Innovation_Summary_Official.pdf"
    generate_strict_innovation_summary(out_file)
