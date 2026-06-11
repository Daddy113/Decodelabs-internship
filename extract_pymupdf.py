import fitz # PyMuPDF
import os

pdf_files = [
    "Full Stack Project 1.pdf",
    "Full Stack P2.pdf",
    "Full Stack P3.pdf",
    "Full Stack  Project 4.pdf"
]

out_dir = "pymupdf_extracted_text"
os.makedirs(out_dir, exist_ok=True)

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        print(f"Not found: {pdf_file}")
        continue
    print(f"Processing {pdf_file} with PyMuPDF...")
    try:
        doc = fitz.open(pdf_file)
        print(f"  Pages: {len(doc)}")
        
        extracted = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            extracted.append(f"=== PAGE {page_num+1} ===")
            extracted.append(text if text.strip() else "[No text]")
            
        out_path = os.path.join(out_dir, pdf_file.replace(".pdf", ".txt"))
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(extracted))
        print(f"  Saved to {out_path}")
    except Exception as e:
        print(f"  Error: {e}")
