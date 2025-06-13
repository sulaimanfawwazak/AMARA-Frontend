from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import re
from playground import (
  parse_jenis_ujian,
  parse_nama_lengkap,
  parse_nim,
  parse_prodi,
  parse_rows,
  parse_mata_kuliah,
  parse_tanggal,
  parse_jam,
  parse_ruangan,
  parse_no_kursi,
  make_dict
)

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload_pdf():
  if "file" not in request.files:
    return jsonify({"error": "No file uploaded"}), 400
  
  file = request.files["file"]
  if not file.filename.endswith(".pdf"):
    return jsonify({"error": "File must be a PDF"}), 400
  
  try:
    reader = PdfReader(file)
    texts = reader.pages[0].extract_text().replace('\n', ' ')

    # HEADER
    jenis_ujian = parse_jenis_ujian(texts)
    nama_lengkap = parse_nama_lengkap(texts)
    nim = parse_nim(texts)
    prodi = parse_prodi(texts)

    # TABLE
    rows = parse_rows(texts)
    mata_kuliah_arr = [parse_mata_kuliah(row) for row in rows]
    tanggal_arr = [parse_tanggal(row) for row in rows]
    jam_arr = [parse_jam(row) for row in rows]
    ruangan_arr = [parse_ruangan(row) for row in rows]
    no_kursi_arr = [parse_no_kursi(row) for row in rows]

    events_arr = make_dict(
      mata_kuliah_arr,
      tanggal_arr,
      jam_arr,
      ruangan_arr,
      no_kursi_arr,
      jenis_ujian
    )

    result = {
      "jenis_ujian": jenis_ujian,
      "nama_lengkap": nama_lengkap,
      "nim": nim,
      "prodi": prodi,
      "jadwal": events_arr
    }

    return jsonify(result)
  
  except Exception as e:
    return jsonify({"error": f"Parsing failed: {str(e)}"}), 500