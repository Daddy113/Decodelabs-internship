import os
import io
import time
import fitz  # PyMuPDF
import screen_ocr
from PIL import Image

# List of PDF files to process
pdf_files = [
    "Full Stack Project 1.pdf",
    "Full Stack P2.pdf",
    "Full Stack P3.pdf",
    "Full Stack  Project 4.pdf"
]

out_dir = "ocr_extracted_text"
os.makedirs(out_dir, exist_ok=True)

print("Initializing screen_ocr Reader...")
try:
    reader = screen_ocr.Reader.create_quality_reader()
    print("Successfully initialized OCR reader.")
except Exception as e:
    print(f"Error initializing OCR reader: {e}")
    exit(1)

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        print(f"File not found: {pdf_file}")
        continue
    
    print(f"\nProcessing: {pdf_file}...")
    start_time = time.time()
    extracted_pages = []
    
    try:
        doc = fitz.open(pdf_file)
        total_pages = len(doc)
        print(f"Total pages: {total_pages}")
        
        for idx in range(total_pages):
            page_start = time.time()
            page = doc.load_page(idx)
            
            # Render page to Pixmap at 150 DPI for high quality OCR
            pix = page.get_pixmap(dpi=150)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Perform OCR
            result = reader.read_image(img)
            text = result.as_string()
            
            extracted_pages.append(f"=== PAGE {idx + 1} ===")
            extracted_pages.append(text)
            extracted_pages.append("\n")
            
            elapsed = time.time() - page_start
            print(f"  Page {idx + 1}/{total_pages} processed in {elapsed:.2f} seconds. Text chars: {len(text)}")
            
        out_name = pdf_file.replace(".pdf", ".txt")
        out_path = os.path.join(out_dir, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(extracted_pages))
            
        total_elapsed = time.time() - start_time
        print(f"Successfully processed {pdf_file} in {total_elapsed:.2f} seconds. Saved to {out_path}")
        
    except Exception as e:
        print(f"Error processing {pdf_file}: {e}")

print("\nAll PDFs processed successfully.")
