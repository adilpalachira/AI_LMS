import fitz  # PyMuPDF
import os

pdf_path = os.path.abspath("Project_Progress_Report_AI_LMS.pdf")
output_dir = r"C:\Users\ADIL\.gemini\antigravity-ide\brain\4c19b1e8-2b70-4ab0-be15-3c4aca01e71a"

doc = fitz.open(pdf_path)
print(f"Total Pages: {len(doc)}")

image_paths = []
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    img_name = f"page_{i+1}.png"
    img_path = os.path.join(output_dir, img_name)
    pix.save(img_path)
    image_paths.append(img_path)
    print(f"Rendered Page {i+1} -> {img_path}")
