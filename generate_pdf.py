import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable, KeepTogether
)

def create_project_pdf(filename="Project_Progress_Report_AI_LMS.pdf"):
    # Target PDF file path in current directory
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Dark slate
    ACCENT = colors.HexColor("#2563EB")     # Royal blue
    TEXT_DARK = colors.HexColor("#1E293B")  # Deep gray text
    MUTED = colors.HexColor("#64748B")      # Slate muted text
    BORDER = colors.HexColor("#E2E8F0")     # Light gray border

    # Cover Page Styles
    cover_title_label = ParagraphStyle(
        'CoverTitleLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=MUTED,
        spaceAfter=15
    )

    cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=PRIMARY,
        spaceAfter=30
    )

    student_detail = ParagraphStyle(
        'StudentDetail',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=22,
        textColor=TEXT_DARK
    )

    student_detail_bold = ParagraphStyle(
        'StudentDetailBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=22,
        textColor=PRIMARY
    )

    # Log Page Styles
    header_title = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=10
    )

    date_header = ParagraphStyle(
        'DateHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=6
    )

    log_bullet = ParagraphStyle(
        'LogBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=TEXT_DARK,
        leftIndent=15,
        spaceAfter=4
    )

    story = []

    # =========================================================
    # COVER PAGE (Matching Image 1 Format)
    # =========================================================
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("Title :", cover_title_label))
    story.append(Paragraph("AI-Powered Learning Management System (AI-LMS)", cover_title))
    
    # Divider line
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=20, spaceAfter=40))
    story.append(Spacer(1, 2.5 * inch))

    # Student & Guide details block
    details_data = [
        [Paragraph("Adarsh Krishna V", student_detail_bold)],
        [Paragraph("Roll No : 03", student_detail)],
        [Paragraph("KTE25MCA - 2003", student_detail)],
        [Paragraph("Guide : Dr. Reena Murali", student_detail)]
    ]
    
    details_table = Table(details_data, colWidths=[6.5 * inch])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(details_table)

    story.append(PageBreak())

    # =========================================================
    # WORK PROGRESS LOG (Matching Image 2 Format)
    # =========================================================
    story.append(Paragraph("PROJECT WORK LOG & PROGRESS RECORD", header_title))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=5, spaceAfter=15))

    logs = [
        {
            "date": "11 - 07 - 2026",
            "points": [
                "Installed the required software tools (Node.js, Express.js, MongoDB, React, Vite).",
                "Initialized React.js framework for frontend web application development.",
                "Organized all project development tools, dependencies, and environment configurations."
            ]
        },
        {
            "date": "15 - 07 - 2026",
            "points": [
                "Planned implementation of the project architecture and technology stack.",
                "Selected core backend and frontend modules for the AI-LMS project.",
                "Setup developer workflow, version control, and coding standards."
            ]
        },
        {
            "date": "19 - 07 - 2026",
            "points": [
                "Noted down detailed database requirements and entity attributes.",
                "Discussed entity relationships between database tables/collections (Users, Courses, Enrollments).",
                "Started designing the MongoDB Mongoose database structure."
            ]
        },
        {
            "date": "21 - 07 - 2026",
            "points": [
                "Planned the project folder structure (client/ and server/ separation).",
                "Created folders for frontend, backend, models, controllers, services, and documentation.",
                "Created README.md file and updated initial project details.",
                "Initialized Git repository and pushed project baseline files to GitHub."
            ]
        },
        {
            "date": "22 - 07 - 2026",
            "points": [
                "Finalized the project scope and identified major project modules:",
                "&nbsp;&nbsp;&nbsp;&nbsp;1. Authentication & Authorization &nbsp;&nbsp;&nbsp;&nbsp;6. AI Tutor (RAG)",
                "&nbsp;&nbsp;&nbsp;&nbsp;2. User Management &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7. Personalized Learning",
                "&nbsp;&nbsp;&nbsp;&nbsp;3. Course Management &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8. Study Planner",
                "&nbsp;&nbsp;&nbsp;&nbsp;4. Learning Content Management &nbsp;&nbsp;&nbsp;&nbsp;9. Performance Prediction",
                "&nbsp;&nbsp;&nbsp;&nbsp;5. Assignment & Exam Management &nbsp;&nbsp;10. Analytics Dashboard & Reports",
                "Planned the project workflow and role permissions (Admin, Faculty, Student).",
                "Started designing the complete Database ER diagram."
            ]
        },
        {
            "date": "25 - 07 - 2026",
            "points": [
                "Completed Module 1: Authentication & Authorization.",
                "Implemented Student Registration, Login, JWT Authentication, and bcrypt password hashing.",
                "Implemented Forgot Password and Reset Password security token workflows.",
                "Created React ProtectedRoute and RoleGuard components for client-side route protection."
            ]
        },
        {
            "date": "27 - 07 - 2026",
            "points": [
                "Completed Module 2: User Management.",
                "Developed Administrative User Management interface (Manage Students, Manage Faculty, View, Search, Filter).",
                "Implemented User Activation / Deactivation status toggles and account deletion capabilities.",
                "Created centralized database seeding script to seed default Admin, Faculty, and Student accounts."
            ]
        },
        {
            "date": "29 - 07 - 2026",
            "points": [
                "Planned and designed Module 3: Course Management.",
                "Designed normalized Mongoose schemas for Course, Category, and Enrollment collections.",
                "Enforced strict public registration rules (Student self-registration only; Admin-controlled Faculty creation).",
                "Built clean Notion/Linear-inspired modern UI for Course Catalog, Course Detail, and Manage Courses views."
            ]
        }
    ]

    for log in logs:
        block_elements = []
        block_elements.append(Paragraph(f"• Date : {log['date']}", date_header))
        for pt in log["points"]:
            if pt.startswith("&nbsp;"):
                block_elements.append(Paragraph(pt, ParagraphStyle('SubIndented', parent=log_bullet, fontName='Helvetica-Oblique', textColor=MUTED)))
            else:
                block_elements.append(Paragraph(f"&bull; {pt}", log_bullet))
        block_elements.append(Spacer(1, 4))
        story.append(KeepTogether(block_elements))

    # Footer note
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceBefore=10, spaceAfter=15))
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=MUTED,
        alignment=1
    )
    story.append(Paragraph("MCA Mini Project Record — AI-Powered Learning Management System (AI-LMS)", footer_style))

    # Build Document
    doc.build(story)
    print(f"[PDF Generator] Successfully generated PDF at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    create_project_pdf()
