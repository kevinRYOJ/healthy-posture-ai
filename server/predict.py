import sys
import json
import tensorflow as tf
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

model_path = os.path.join(os.path.dirname(__file__), '../ml_models/healthy_posture_model.keras')
model = tf.keras.models.load_model(model_path)

def main():
    try:
        # Read JSON string from argument
        data = json.loads(sys.argv[1])
        import numpy as np
        
        # Data is already scaled by JS
        scaled_array = np.array(data, dtype=np.float32).reshape(1, -1)
        
        preds = model.predict(scaled_array, verbose=0)[0]
        max_idx = int(np.argmax(preds))
        conf = float(preds[max_idx])
        
        print(json.dumps({"max_idx": max_idx, "confidence": conf}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    main()
