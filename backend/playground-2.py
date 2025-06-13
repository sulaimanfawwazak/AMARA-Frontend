import re
from PyPDF2 import PdfReader

def parse_row(row):
    match = re.match(
        r'^\d+\s+([A-Z0-9]+[A-Z]?)\s+(.+?)\s+Kelas:\s+([A-Z]+\d+)(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}-\d{2}:\d{2})\s+([^\d]+)\s+(\d+)',
        row
    )
    if match:
        return {
            "code": match.group(1),
            "course_name": match.group(2).strip(),
            "class": match.group(3),
            "date": match.group(4),
            "time": match.group(5),
            "room": match.group(6).strip(),
            "credits": int(match.group(7))
        }
    else:
        return None  # or log the row for debugging


# ---------------------
# File Name
# ---------------------
file = "./_data/UAS-2425-Genap-Ara.pdf"
# file = "./_data/UAS-2425-Genap-Fawwaz.pdf"
# file = "./_data/UTS-2425-Genap-Fawwaz.pdf"

# ---------------------
# Extract the texts from pages
# ---------------------
reader = PdfReader(file)
pages = reader.pages
texts = [page.extract_text() for page in pages]
texts = texts[0]

# ---------------------
# Replace `\n` with ' '
# ---------------------
texts = texts.replace('\n', ' ')
texts = re.sub(r'(Kelas:\s*\S+)(\d{2}-\d{2}-\d{4})', r'\1 \2', texts)

# ---------------------
# Parse each rows
# ---------------------
pattern_rows = r'(\d{1,2}[A-Z]{2,4}\d{4,7}.*?(?=\d{1,2}[A-Z]{2,4}\d{4,7}|\Z))'
rows = re.findall(pattern_rows, texts)

parsed_data = []

for row in rows:
    parsed = parse_row(row)
    if parsed:
        parsed_data.append(parsed)
    else:
        print("Failed to parse:", row)

for item in parsed_data:
    print(item)
    print("------------")
    