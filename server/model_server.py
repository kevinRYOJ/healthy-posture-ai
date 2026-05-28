import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def generate_gemini_json(prompt):
    if not GEMINI_API_KEY:
        raise Exception("API Key is missing")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }
    response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
    if response.status_code == 200:
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")

app = Flask(__name__)
CORS(app)

print("Starting Python Flask Model Server (Powered by Gemini)...")
print("Python Flask Model Server running on http://127.0.0.1:5001")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        context_data = data.get("context", {})

        prompt = f"""Kamu adalah asisten kesehatan ergonomi tubuh dan sistem pakar deteksi postur duduk.
Tugasmu adalah menganalisis data pengguna berikut dan memprediksi Tingkat Risiko Postur (Low, Medium, atau Tinggi).

Data Pengguna:
- Nama: {context_data.get('name', 'User')}
- Usia: {context_data.get('age', 'Tidak diketahui')}
- Pekerjaan: {context_data.get('work_type', 'Tidak diketahui')}
- Total duduk hari ini: {context_data.get('total_sitting_minutes', 0)} menit
- Total jeda hari ini: {context_data.get('number_of_breaks', 0)} kali

Berdasarkan data di atas, tentukan:
1. "pred_label": (Low / Medium / Tinggi)
2. "max_idx": (0 untuk Low, 1 untuk Medium, 2 untuk Tinggi)
3. "confidence": (angka desimal antara 0.0 hingga 1.0 yang menunjukkan keyakinanmu)
4. "insight": (1 paragraf singkat maksimal 2 kalimat berupa motivasi atau saran praktis berdasarkan profesi/pola duduknya. Gunakan bahasa Indonesia kasual, suportif. Jangan sebutkan bahwa kamu AI.)

Kembalikan jawabanmu HANYA dalam format JSON yang valid persis seperti ini:
{{
  "max_idx": 1,
  "confidence": 0.85,
  "pred_label": "Medium",
  "insight": "..."
}}"""

        try:
            gemini_response = generate_gemini_json(prompt).strip()
            result = json.loads(gemini_response)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            result = {
                "max_idx": 1,
                "confidence": 0.5,
                "pred_label": "Medium",
                "insight": "Jangan lupa luangkan waktu sejenak untuk berdiri dan peregangan agar tubuh tetap fit ya!"
            }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
