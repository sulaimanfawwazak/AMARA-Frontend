from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import re

app = Flask(__name__)
CORS(app)


@app.route("/upload", methods=["POST"])
def upload_pdf():
  if "file" not in request.files:
    return jsonify({"error": "No file uploaded"}), 400
  
  file = request.files["file"]
  if file.filename.endswith(".pdf"):
    reader = PdfReader()
    text = "\n".join(page.extract_text() for page in reader.pages)
    
    return jsonify(text)