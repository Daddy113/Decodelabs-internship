import os
from pypdf import PdfReader

pdf_files = [
    "Full Stack Project 1.pdf",
    "Full Stack P2.pdf",
    "Full Stack P3.pdf",
    "Full Stack  Project 4.pdf"
]

out_dir = "extracted_text"
os.makedirs(out_dir, exist_ok=True)

for pdf_file in pdf_files:
    path = pdf_file
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
    
    print(f"Processing {pdf_file}...")
    try:
        reader = PdfReader(path)
        num_pages = len(reader.pages)
        print(f"  Total pages: {num_pages}")
        
        # Read first 15 pages or all if less
        pages_to_read = min(num_pages, 15)
        extracted_text = []
        for i in range(pages_to_read):
            page = reader.pages[i]
            text = page.extract_text()
            extracted_text.append(f"--- PAGE {i+1} ---")
            extracted_text.append(text if text else "[No text found on this page]")
            
        out_path = os.path.join(out_dir, pdf_file.replace(".pdf", ".txt"))
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(extracted_text))
        print(f"  Wrote first {pages_to_read} pages to {out_path}")
        
    except Exception as e:
        print(f"  Error processing {pdf_file}: {e}")
