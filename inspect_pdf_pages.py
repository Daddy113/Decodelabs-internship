import sys
import os
from pypdf import PdfReader

# Configure stdout to handle UTF-8
sys.stdout.reconfigure(encoding='utf-8')

pdf_files = [
    "Full Stack Project 1.pdf",
    "Full Stack P2.pdf",
    "Full Stack P3.pdf",
    "Full Stack  Project 4.pdf"
]

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        print(f"Not found: {pdf_file}")
        continue
    try:
        reader = PdfReader(pdf_file)
        print(f"\nFile: {pdf_file} (Pages: {len(reader.pages)})")
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            text_len = len(text.strip()) if text else 0
            if text_len > 0:
                snippet = text.strip().replace('\n', ' ')[:80]
                print(f"  Page {idx+1}: {text_len} chars -> {snippet}...")
            else:
                print(f"  Page {idx+1}: empty")
    except Exception as e:
        print(f"Error reading {pdf_file}: {e}")
