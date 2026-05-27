import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR) 

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

#Inisialisasi Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

#inisialisasi Flask app
app = Flask(__name__)
CORS(app) 

print("Loading Model Keras")
model_path = os.path.join(os.path.dirname(__file__), 'ml_models/healthy_posture_model.keras')
model = tf.keras.models.load_model(model_path)
print("Python Flask Model Server running on http://127.0.0.1:5001")

#Mapping label
RISK_LABELS = ["Low", "Medium", "Tinggi"]

#Routing
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 40
        scaled_array = np.array(data, dtype=np.float32).reshape(1, -1)
        
        preds = model.predict(scaled_array, verbose=0)[0]
        max_idx = int(np.argmax(preds))
        conf = float(preds[max_idx])
        pred_label = RISK_LABELS[max_idx]

        #Membuat insight
        prompt = f"""
        Kamu adalah asisten kesehatan ergonomi tubuh yang ramah. 
        Sistem kami mendeteksi risiko kesehatan postur duduk pengguna saat ini berada pada tingkat: '{pred_label}'.
        
        Berikan 1 paragraf singkat (maksimal 2 kalimat) berupa motivasi atau saran praktis 
        agar user menjaga postur atau beristirahat. 
        Gunakan bahasa Indonesia yang kasual dan suportif. Jangan sebutkan bahwa kamu adalah AI.
        """
        
        #Generate insight
        try:
            response = gemini_model.generate_content(prompt)
            insight_text = response.text.strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            insight_text = "Jangan lupa luangkan waktu sejenak untuk berdiri dan peregangan agar tubuh tetap fit ya!"

        #Mengembalikan ke Node.JS
        return jsonify({
            "max_idx": max_idx, 
            "confidence": conf,
            "pred_label": pred_label,
            "insight": insight_text
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
