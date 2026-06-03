import os
import sys
import json
import pickle
import logging

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# ══════════════════════════════════════════════════════════════
# Load ML Model & Artifacts dari folder ml_models
# ══════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, 'ml_models')

print("Loading ML model artifacts...")

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')

    _model = tf.keras.models.load_model(os.path.join(ML_DIR, 'healthy_posture_model.keras'))
    _scaler = pickle.load(open(os.path.join(ML_DIR, 'scaler.pkl'), 'rb'))
    _le_dict = pickle.load(open(os.path.join(ML_DIR, 'label_encoders.pkl'), 'rb'))
    _le_target = pickle.load(open(os.path.join(ML_DIR, 'label_encoder_target.pkl'), 'rb'))

    print(f"[OK] Model loaded: {_model.name}")
    print(f"[OK] Target classes: {list(_le_target.classes_)}")
    MODEL_READY = True
except Exception as e:
    print(f"[ERROR] Failed to load ML model: {e}")
    MODEL_READY = False

FEATURE_ORDER = [
    'total_sitting_minutes', 'number_of_breaks', 'avg_break_duration_minutes',
    'longest_sitting_streak_minutes', 'fatigue_level',
    'age', 'daily_work_hours', 'bmi', 'sleep_hours',
    'gender', 'work_type', 'fitness_level',
    'day_of_week', 'time_of_day_dominant', 'device_preference'
]

CAT_COLS = [
    'gender', 'work_type', 'fitness_level',
    'day_of_week', 'time_of_day_dominant', 'device_preference'
]

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


def predict_with_model(input_data):
    """Prediksi menggunakan model Keras yang sudah dilatih."""
    # 1. Encode kategorikal menggunakan LabelEncoder asli
    cat_encoded = {}
    for col in CAT_COLS:
        val = input_data.get(col, '')
        if val in _le_dict[col].classes_:
            cat_encoded[col] = int(_le_dict[col].transform([val])[0])
        else:
            # Fallback: gunakan value pertama (default)
            cat_encoded[col] = 0

    # 2. Susun feature array sesuai urutan training
    row = {
        'total_sitting_minutes': float(input_data.get('total_sitting_minutes', 0)),
        'number_of_breaks': float(input_data.get('number_of_breaks', 0)),
        'avg_break_duration_minutes': float(input_data.get('avg_break_duration_minutes', 0)),
        'longest_sitting_streak_minutes': float(input_data.get('longest_sitting_streak_minutes', 0)),
        'fatigue_level': float(input_data.get('fatigue_level', 3)),
        'age': float(input_data.get('age', 25)),
        'daily_work_hours': float(input_data.get('daily_work_hours', 8)),
        'bmi': float(input_data.get('bmi', 22)),
        'sleep_hours': float(input_data.get('sleep_hours', 7)),
        'gender': cat_encoded['gender'],
        'work_type': cat_encoded['work_type'],
        'fitness_level': cat_encoded['fitness_level'],
        'day_of_week': cat_encoded['day_of_week'],
        'time_of_day_dominant': cat_encoded['time_of_day_dominant'],
        'device_preference': cat_encoded['device_preference'],
    }

    feature_array = np.array([[row[col] for col in FEATURE_ORDER]])

    # 3. Scale menggunakan scaler yang sama dari training
    feature_scaled = _scaler.transform(feature_array)

    # 4. Prediksi
    proba = _model.predict(feature_scaled, verbose=0)[0]
    labels = list(_le_target.classes_)
    max_idx = int(np.argmax(proba))
    pred_label = labels[max_idx]
    confidence = float(np.max(proba))

    # 5. Normalisasi label → English (model dilatih dengan label Indonesia)
    LABEL_MAP = {'Tinggi': 'High', 'Rendah': 'Low', 'Sedang': 'Medium'}
    pred_label = LABEL_MAP.get(pred_label, pred_label)
    normalized_labels = {LABEL_MAP.get(l, l): float(p) for l, p in zip(labels, proba)}

    # Tentukan max_idx berdasarkan urutan standar [Low, Medium, High]
    STANDARD_ORDER = ['Low', 'Medium', 'High']
    max_idx = STANDARD_ORDER.index(pred_label) if pred_label in STANDARD_ORDER else max_idx

    return pred_label, max_idx, confidence, normalized_labels


def generate_gemini_insight(context_data, pred_label):
    """Gunakan Gemini HANYA untuk generate insight/motivasi (bukan untuk prediksi)."""
    if not GEMINI_API_KEY:
        return None

    prompt = f"""Kamu adalah asisten kesehatan ergonomi tubuh.
Seorang pengguna bernama {context_data.get('name', 'User')} (usia {context_data.get('age', '?')}, pekerjaan: {context_data.get('work_type', '?')}) telah duduk selama {context_data.get('total_sitting_minutes', 0)} menit hari ini dengan {context_data.get('number_of_breaks', 0)} kali istirahat.

Model AI kami mendeteksi risiko posturnya: **{pred_label}**.

Tulis 1 paragraf singkat (maksimal 2 kalimat) berupa motivasi atau saran praktis berdasarkan profesi dan pola duduknya. Gunakan bahasa Indonesia kasual dan suportif. Jangan sebutkan bahwa kamu AI.

Kembalikan jawabanmu HANYA dalam format JSON:
{{"insight": "..."}}"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=10)
        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text.strip()).get("insight", None)
    except Exception as e:
        print(f"Gemini insight error (non-fatal): {e}")

    return None


# ══════════════════════════════════════════════════════════════
# Flask App
# ══════════════════════════════════════════════════════════════
app = Flask(__name__)
CORS(app)

print("Starting Python Flask Model Server (Keras + Gemini Insight)...")
print("Python Flask Model Server running on http://127.0.0.1:5001")


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        if not MODEL_READY:
            return jsonify({"error": "ML model is not loaded"}), 500

        context_data = data.get("context", {})
        input_data = data.get("input", {})

        # Prediksi menggunakan model Keras asli
        pred_label, max_idx, confidence, probabilities = predict_with_model(input_data)

        print(f"[PREDICT] {pred_label} (conf={confidence:.1%}) | probs={probabilities}")

        # Generate insight menggunakan Gemini (opsional, non-blocking)
        insight = generate_gemini_insight(context_data, pred_label)
        if not insight:
            # Fallback insight berdasarkan level
            fallback_insights = {
                "Low": "Pola dudukmu sudah bagus hari ini! Tetap pertahankan kebiasaan istirahat rutinmu ya.",
                "Medium": "Jangan lupa luangkan waktu sejenak untuk berdiri dan peregangan agar tubuh tetap fit ya!",
                "High": "Kamu sudah duduk terlalu lama! Segera berdiri, lakukan peregangan leher dan punggung sekarang."
            }
            insight = fallback_insights.get(pred_label, fallback_insights["Medium"])

        result = {
            "max_idx": max_idx,
            "confidence": confidence,
            "pred_label": pred_label,
            "insight": insight,
            "probabilities": probabilities
        }

        return jsonify(result), 200

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
