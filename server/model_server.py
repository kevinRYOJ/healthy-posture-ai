import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)  # Sembunyikan HTTP log bawaan Flask agar rapi di terminal

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# 1. INISIALISASI FLASK APP
app = Flask(__name__)
CORS(app) # Mengizinkan Node.js mengakses Flask tanpa diblokir CORS

print("Loading Keras model (this takes ~20 seconds)...")
model_path = os.path.join(os.path.dirname(__file__), '../ml_models/healthy_posture_model.keras')
model = tf.keras.models.load_model(model_path)
print("Python Flask Model Server running on http://127.0.0.1:5001")

# 2. FLASK ROUTE UNTUK MENERIMA PERMINTAAN PREDIKSI
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Flask menangkap data JSON yang dikirim oleh Node.js
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        scaled_array = np.array(data, dtype=np.float32).reshape(1, -1)
        
        preds = model.predict(scaled_array, verbose=0)[0]
        max_idx = int(np.argmax(preds))
        conf = float(preds[max_idx])
        
        return jsonify({"max_idx": max_idx, "confidence": conf}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
