from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import re
from parse_data import (
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

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# POST Method to /upload endpoint
@app.route("/upload", methods=["POST"])
def upload_pdf():
  if "file" not in request.files:
    return jsonify({"error": "No file uploaded"}), 400
  
  file = request.files["file"]
  if file.filename == "":
    return jsonify({"error": "No selected file"}), 400
  if not file.filename.endswith(".pdf"):
    return jsonify({"error": "File must be a PDF"}), 400
  
  try:
    reader = PdfReader(file)
    if len(reader.pages) == 0:
      return jsonify({"error": "PDF contains no pages"}), 400
    
    texts = reader.pages[0].extract_text().replace('\n', ' ')
    # print(f'text:\n{texts}')

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
  
# app = app.wsgi_app

if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5000)