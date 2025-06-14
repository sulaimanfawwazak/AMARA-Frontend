from PyPDF2 import PdfReader
import re

# ------------------------------------------
# Functions to parse the data in the HEADER
# ------------------------------------------  
def parse_jenis_ujian(texts):
  pattern_jenis_ujian = r'KARTU UJIAN (TENGAH|AKHIR) SEMESTER'
  
  try:
    jenis_ujian = re.search(pattern_jenis_ujian, texts)
    jenis_ujian = "UTS" if jenis_ujian.group(1) == "TENGAH" else "UAS"
  except Exception as e:
    print(f"Error on parsing `jenis_ujian`: {e}")
    jenis_ujian = None

  return jenis_ujian

def parse_nama_lengkap(texts):
  pattern_nama_lengkap = r'\d{4}/\d{4}\s*Nama\s*:\s*(.*?)\s*NIM\s*:' # dddd/dddd Nama: <nama>

  try:
    nama_lengkap = re.search(pattern_nama_lengkap, texts)
    nama_lengkap = nama_lengkap.group(1)
  except Exception as e:
    print(f"Error on parsing `nama`: {e}")
    nama_lengkap = None

  return nama_lengkap

def parse_nim(texts):
  pattern_nim = r'NIM\s*:\s*(.{18})' # NIM: ss/ssssss/ss/sssss
  
  try:
    nim = re.search(pattern_nim, texts)
    nim = nim.group(1)
  except Exception as e:
    print(f"Error on parsing `nim`: {e}")
    nim = None

  return nim

def parse_prodi(texts):
  pattern_prodi = r'Prodi\s*:\s*(.*?)\s*No\s*' # Prodi: <prodi>
  
  try: 
    prodi = re.search(pattern_prodi, texts)
    prodi = prodi.group(1)
  except Exception as e:
    print(f"Error on parsing `prodi`: {e}")
    prodi = None

  return prodi

# ------------------------------------------
# Functions to parse the data in the TABLE
# ------------------------------------------  
def parse_rows(texts):
  pattern_rows = r'(\d{1,2}[A-Z]{2,4}\d{4,7}.*?(?=\d{1,2}[A-Z]{2,4}\d{4,7}|\Z))'
  rows = re.findall(pattern_rows, texts)

  return rows

def parse_mata_kuliah(texts):
  pattern_mata_kuliah = r'\d{1,2}[A-Z]{1,5}\d{4,7}[A-Z]?\s*\d{0,3}(.*?)\s*Kelas\s*:'

  try:
    mata_kuliah = re.search(pattern_mata_kuliah, texts)
    mata_kuliah = mata_kuliah.group(1)
  except Exception as e:
    print(f"Error on parsing `mata_kuliah`: {e}")
    mata_kuliah = None

  return mata_kuliah

def parse_tanggal(texts):
  pattern_tanggal = r'Kelas:\s*[A-Z]{1,3}\d{1,3}\s*(\d{2}-\d{2}-\d{4})\s*\d{2}:\d{2}-\d{2}:\d{2}'

  try:
    tanggal = re.search(pattern_tanggal, texts)
    tanggal = tanggal.group(1)
  except Exception as e:
    print(f"Error on parsing `parse_tanggal: {e}")
    tanggal = None

  return tanggal

def parse_jam(texts):
  pattern_jam = r'\d{2}-\d{2}-\d{4}\s*(\d{2}:\d{2}-\d{2}:\d{2})'

  try:
    jam = re.search(pattern_jam, texts)
    jam = jam.group(1)
  except Exception as e:
    print(f"Error on parsing `jam`: {e}")
    jam = None

  return jam

def parse_ruangan(texts):
  pattern_ruangan = r'\d{2}:\d{2}-\d{2}:\d{2}\s+(.*?)\s(?=\d+(?=\s|$))'

  try:
    ruangan = re.search(pattern_ruangan, texts)
    ruangan = ruangan.group(1)
  except Exception as e:
    print(f"Error on parsing `ruangan`: {e}")
    ruangan = None
  
  return ruangan

def parse_no_kursi(texts):
  pattern_no_kursi = r'\d{2}:\d{2}-\d{2}:\d{2}\s+.*?\s(?=\d+(?=\s|$))\s*(\d{1,2})'

  try:
    no_kursi = re.search(pattern_no_kursi, texts)
    no_kursi = no_kursi.group(1)

  except Exception as e:
    print(f"Error on parsing `no_kursi`: {e}")
    no_kursi = None

  return no_kursi

# ------------------------------------------
# Other Functions
# ------------------------------------------
def extract_texts(file_name):
  reader = PdfReader(file_name)
  pages = reader.pages
  texts = [page.extract_text() for page in pages]
  texts = texts[0] # Only return the first since the page is always 1

  return texts

def make_dict(mata_kuliah_arr, tanggal_arr, jam_arr, ruangan_arr, no_kursi_arr, jenis_ujian):
  if jenis_ujian == "UTS":
    mata_kuliah_arr = [f"[UTS] {mata_kuliah}" for mata_kuliah in mata_kuliah_arr]
  elif jenis_ujian == "UAS":
    mata_kuliah_arr = [f"[UAS] {mata_kuliah}" for mata_kuliah in mata_kuliah_arr]
  else:
    print(f"Error: `jenis_ujian` has wrong value`")
  
  events_arr = []

  for i in range(len(mata_kuliah_arr)):
    if tanggal_arr[i] is None:
      continue
    else:
      exam_dict = {
        "no": i,
        "mata_kuliah": mata_kuliah_arr[i],
        "tanggal": tanggal_arr[i],
        "jam": jam_arr[i],
        "ruangan": ruangan_arr[i],
        "no_kursi": no_kursi_arr[i]
      }
      events_arr.append(exam_dict)

  return events_arr