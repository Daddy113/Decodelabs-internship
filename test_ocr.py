import screen_ocr
try:
    reader = screen_ocr.Reader.create_quality_reader()
    print("Successfully created quality reader:", reader)
except Exception as e:
    print("Error:", e)
